import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const creditCost = Number(Deno.env.get('MESHY_CREDIT_COST_IDR'));
  if (!url || !serviceKey || !Number.isFinite(creditCost) || creditCost <= 0) return json({ error: 'Konfigurasi harga AI Spin belum lengkap.' }, 503);
  const authorization = request.headers.get('Authorization');
  if (!authorization) return json({ error: 'Autentikasi diperlukan.' }, 401);
  const db = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: { user } } = await db.auth.getUser(authorization.replace(/^Bearer\s+/i, ''));
  if (!user) return json({ error: 'Sesi pengguna tidak valid.' }, 401);

  try {
    const body = await request.json();
    const packageId = body.packageId;
    const orderUuid = body.orderUuid;
    const proofPath = body.proofPath;
    if (typeof orderUuid !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderUuid)) return json({ error: 'Nomor pesanan tidak valid.' }, 400);
    if (typeof proofPath !== 'string' || !new RegExp(`^${user.id}/${orderUuid}\\.(jpg|jpeg|png|webp)$`, 'i').test(proofPath)) return json({ error: 'Lokasi bukti bayar tidak valid.' }, 400);

    const [{ data: pkg }, { data: settings }] = await Promise.all([
      db.from('ai_spin_packages').select('id,name,package_type,generations').eq('id', packageId).eq('active', true).single(),
      db.from('ai_spin_settings').select('meshy_credits_per_model,renmoku_markup_percent,qris_image_path').eq('id', true).single(),
    ]);
    if (!pkg) return json({ error: 'Paket tidak tersedia.' }, 404);
    if (!settings?.qris_image_path) return json({ error: 'Pembayaran QRIS belum dikonfigurasi admin.' }, 503);

    const proof = await db.storage.from('ai-spin-payment-proofs').download(proofPath);
    if (proof.error || !proof.data || proof.data.size <= 0 || proof.data.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(proof.data.type)) return json({ error: 'Bukti bayar tidak ditemukan, format tidak didukung, atau melebihi 5 MB.' }, 400);

    const providerCost = Math.ceil(pkg.generations * (settings.meshy_credits_per_model ?? 30) * creditCost);
    const fee = Math.ceil(providerCost * (settings.renmoku_markup_percent ?? 50) / 100);
    const amount = providerCost + fee;
    const { data: order, error } = await db.from('ai_spin_orders').insert({
      id: orderUuid,
      user_id: user.id,
      package_id: pkg.id,
      is_monthly: pkg.package_type === 'monthly',
      amount_idr: amount,
      provider_cost_idr: providerCost,
      renmoku_share_idr: fee,
      status: 'pending',
      midtrans_order_id: `manual-spin-${orderUuid}`,
      payment_type: 'manual_qris',
      payment_proof_path: proofPath,
    }).select('id,amount_idr').single();
    if (error?.code === '23505') return json({ error: 'Masih ada pembayaran QRIS paket bulanan yang menunggu verifikasi.' }, 409);
    if (error) throw error;
    return json({ orderId: order.id, amount: Number(order.amount_idr), status: 'pending' });
  } catch (error) {
    console.error('spin-manual-order failed', error);
    return json({ error: error instanceof Error ? error.message : 'Pesanan QRIS gagal dibuat.' }, 400);
  }
});
