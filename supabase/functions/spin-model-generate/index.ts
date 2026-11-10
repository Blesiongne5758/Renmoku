import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const meshyKey = Deno.env.get('MESHY_API_KEY');
  if (!supabaseUrl || !serviceKey || !meshyKey) return json({ error: 'Server belum dikonfigurasi: SUPABASE atau MESHY_API_KEY.' }, 503);

  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Autentikasi diperlukan.' }, 401);
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return json({ error: 'Sesi pengguna tidak valid.' }, 401);
  const { data: featureFlags } = await supabase.from('app_runtime_settings').select('spin360_studio_enabled,ai_spin_credits_enabled').eq('id', 1).maybeSingle();
  if (!featureFlags?.spin360_studio_enabled || !featureFlags?.ai_spin_credits_enabled) return json({ error: 'Studio Spin 360° atau kredit AI sedang dinonaktifkan.' }, 403);

  let jobId: string | undefined;
  try {
    const { submissionId } = await request.json();
    if (typeof submissionId !== 'string') return json({ error: 'submissionId wajib diisi.' }, 400);
    const { data: submission, error: submissionError } = await supabase.from('owner_vehicle_submissions')
      .select('id,user_id,brand,model,vehicle_photos').eq('id', submissionId).eq('user_id', user.id).single();
    if (submissionError || !submission) return json({ error: 'Pengajuan kendaraan tidak ditemukan.' }, 404);
    const photos = submission.vehicle_photos as Record<string, string>;
    const ordered = ['front', 'right', 'rear', 'left'].map((key) => photos?.[key]).filter((value): value is string => typeof value === 'string' && value.length > 0).slice(0, 4);
    if (ordered.length < 2) return json({ error: 'Unggah minimal dua foto eksterior dari sudut berbeda.' }, 400);
    if (ordered.some((path) => !path.startsWith(`${user.id}/`) || path.split('/').includes('..'))) return json({ error: 'Foto kendaraan mengacu ke lokasi berkas yang tidak dimiliki akun ini.' }, 403);
    const { data: signed, error: signedError } = await supabase.storage.from('owner-private').createSignedUrls(ordered, 900);
    if (signedError || !signed || signed.some((item) => !item.signedUrl)) throw new Error('Foto kendaraan tidak dapat dibaca dari penyimpanan privat.');

    const { data: reservation, error: reserveError } = await supabase.rpc('reserve_ai_spin_generation', { p_user_id: user.id, p_submission_id: submission.id }).single();
    if (reserveError || !reservation) return json({ error: reserveError?.message ?? 'Saldo generasi tidak tersedia.' }, 402);
    jobId = reservation.job_id;

    const providerResponse = await fetch('https://api.meshy.ai/openapi/v1/multi-image-to-3d', {
      method: 'POST',
      headers: { Authorization: `Bearer ${meshyKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_urls: signed.map((item) => item.signedUrl), ai_model: 'meshy-7.1', geometry_resolution: 'standard', texture_resolution: '2k', should_texture: true, enable_pbr: true, target_formats: ['glb'] }),
    });
    const providerResult = await providerResponse.json();
    if (!providerResponse.ok || typeof providerResult.result !== 'string') throw new Error(providerResult.message ?? `Meshy menolak permintaan (${providerResponse.status}).`);
    const taskUpdate={provider_task_id:providerResult.result,status:'processing',updated_at:new Date().toISOString()};
    let persistTask=await supabase.from('ai_spin_jobs').update(taskUpdate).eq('id',jobId);
    if(persistTask.error){
      await new Promise((resolve)=>setTimeout(resolve,300));
      persistTask=await supabase.from('ai_spin_jobs').update(taskUpdate).eq('id',jobId);
    }
    if(persistTask.error){
      await supabase.rpc('refund_ai_spin_generation',{p_job_id:jobId,p_error:'Tidak dapat menyimpan ID tugas AI ke database.'});
      return json({error:'Model dibuat oleh AI tetapi status tugas gagal disimpan. Kredit dikembalikan; silakan coba lagi.'},503);
    }
    return json({ jobId, taskId: providerResult.result, status: 'processing' }, 202);
  } catch (error) {
    if (jobId) await supabase.rpc('refund_ai_spin_generation', { p_job_id: jobId, p_error: error instanceof Error ? error.message : 'AI generation failed' });
    return json({ error: error instanceof Error ? error.message : 'Pembuatan model gagal.' }, 502);
  }
});
