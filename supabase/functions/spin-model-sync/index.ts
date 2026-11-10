import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const url = Deno.env.get('SUPABASE_URL'); const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); const meshyKey = Deno.env.get('MESHY_API_KEY');
  if (!url || !key || !meshyKey) return json({ error: 'Server belum dikonfigurasi.' }, 503);
  const authHeader = request.headers.get('Authorization'); if (!authHeader) return json({ error: 'Autentikasi diperlukan.' }, 401);
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data: { user } } = await db.auth.getUser(authHeader.replace(/^Bearer\s+/i, ''));
  if (!user) return json({ error: 'Sesi pengguna tidak valid.' }, 401);
  try {
    const { jobId } = await request.json();
    const { data: job, error } = await db.from('ai_spin_jobs').select('*').eq('id', jobId).eq('user_id', user.id).single();
    if (error || !job) return json({ error: 'Pekerjaan tidak ditemukan.' }, 404);
    if (job.status === 'review' || job.status === 'published') return json({ jobId, status: job.status, modelUrl: job.model_path });
    if (!job.provider_task_id) return json({ error: 'Tugas AI belum mulai.' }, 409);
    const poll = await fetch(`https://api.meshy.ai/openapi/v1/multi-image-to-3d/${encodeURIComponent(job.provider_task_id)}`, { headers: { Authorization: `Bearer ${meshyKey}` } });
    const result = await poll.json();
    if (!poll.ok) throw new Error(result.message ?? 'Status Meshy gagal dibaca.');
    if (result.status === 'FAILED' || result.status === 'CANCELED') {
      if(Number.isFinite(Number(result.consumed_credits))) await db.from('ai_spin_jobs').update({ provider_credits:Number(result.consumed_credits) }).eq('id',job.id);
      await db.rpc('refund_ai_spin_generation', { p_job_id: job.id, p_error: result.task_error?.message ?? `Meshy ${result.status}` });
      return json({ jobId, status: 'failed', error: result.task_error?.message ?? 'Generasi model gagal; kredit telah dikembalikan.' });
    }
    if (result.status !== 'SUCCEEDED') return json({ jobId, status: 'processing', progress: Number(result.progress ?? 0) });
    const glbUrl = result.model_urls?.glb;
    if (typeof glbUrl !== 'string') throw new Error('Meshy menyelesaikan model tanpa berkas GLB.');
    const glbResponse = await fetch(glbUrl);
    if (!glbResponse.ok) throw new Error('Model GLB tidak dapat diunduh dari Meshy.');
    const bytes = new Uint8Array(await glbResponse.arrayBuffer());
    if (bytes.length < 20 || bytes.length > 50 * 1024 * 1024) throw new Error('Ukuran GLB di luar batas 50 MB.');
    const path = `${user.id}/${job.id}.glb`;
    const { error: uploadError } = await db.storage.from('vehicle-models-private').upload(path, bytes, { contentType: 'model/gltf-binary', upsert: true });
    if (uploadError) throw new Error(`Penyimpanan GLB gagal: ${uploadError.message}`);
    const { data: signedModel, error: signedModelError } = await db.storage.from('vehicle-models-private').createSignedUrl(path, 3600);
    if (signedModelError || !signedModel) throw new Error('GLB tersimpan tetapi link pratinjau gagal dibuat.');
    const { error: updateError } = await db.from('ai_spin_jobs').update({ status: 'review', model_path: path, provider_credits:Number.isFinite(Number(result.consumed_credits))?Number(result.consumed_credits):job.provider_credits, updated_at: new Date().toISOString() }).eq('id', job.id);
    if (updateError) throw updateError;
    return json({ jobId, status: 'review', modelUrl: signedModel.signedUrl, progress: 100 });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Sinkronisasi model gagal.' }, 502);
  }
});
