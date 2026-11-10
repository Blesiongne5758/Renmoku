import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const url = Deno.env.get('SUPABASE_URL'); const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); const midtransKey = Deno.env.get('MIDTRANS_SERVER_KEY');
  const costPerCredit = Number(Deno.env.get('MESHY_CREDIT_COST_IDR'));
  if (!url || !serviceKey || !midtransKey || !Number.isFinite(costPerCredit) || costPerCredit <= 0) return json({ error: 'Konfigurasi pembayaran belum lengkap. Atur MIDTRANS_SERVER_KEY dan MESHY_CREDIT_COST_IDR di Supabase.' }, 503);
  const authorization = request.headers.get('Authorization'); if (!authorization) return json({ error: 'Autentikasi diperlukan.' }, 401);
  const db = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: { user } } = await db.auth.getUser(authorization.replace(/^Bearer\s+/i, ''));
  if (!user) return json({ error: 'Sesi pengguna tidak valid.' }, 401);
  try {
    const { packageId, paymentType } = await request.json();
    if (!['credit_card','gopay'].includes(paymentType)) return json({ error: 'Pilih Kartu atau GoPay.' }, 400);
    const { data: pkg, error: packageError } = await db.from('ai_spin_packages').select('id,name,package_type,generations').eq('id',packageId).eq('active',true).single();
    if (packageError || !pkg) return json({ error: 'Paket tidak ditemukan.' }, 404);
    if (pkg.package_type==='monthly') {
      const {data:wallet}=await db.from('owner_ai_spin_wallets').select('subscription_status,period_end').eq('user_id',user.id).maybeSingle();
      if(wallet && ['active','past_due'].includes(wallet.subscription_status)) return json({error:'Langganan bulanan Anda masih aktif atau menunggu pembayaran. Gunakan refill untuk menambah kredit; paket kedua dinonaktifkan untuk mencegah tagihan ganda.'},409);
    }
    const { data: settings } = await db.from('ai_spin_settings').select('meshy_credits_per_model,renmoku_markup_percent').eq('id',true).single();
    const providerCost = Math.ceil(pkg.generations * (settings?.meshy_credits_per_model ?? 30) * costPerCredit);
    const fee = Math.ceil(providerCost * (settings?.renmoku_markup_percent ?? 50) / 100);
    const amount = providerCost + fee;
    if (amount < 10000) return json({ error: 'Harga paket di bawah minimum transaksi Midtrans. Sesuaikan nilai MESHY_CREDIT_COST_IDR atau kuota paket.' }, 400);
    const orderId = `spin-${crypto.randomUUID()}`;
    const { error: insertError } = await db.from('ai_spin_orders').insert({ user_id:user.id, package_id:pkg.id, is_monthly:pkg.package_type==='monthly', amount_idr:amount, provider_cost_idr:providerCost, renmoku_share_idr:fee, midtrans_order_id:orderId, payment_type:paymentType });
    if (insertError?.code==='23505') return json({error:'Pembayaran paket bulanan sedang menunggu konfirmasi. Selesaikan atau tunggu transaksi tersebut terlebih dahulu.'},409);
    if (insertError) throw insertError;
    const production = Deno.env.get('MIDTRANS_IS_PRODUCTION') === 'true';
    const endpoint = production ? 'https://app.midtrans.com/snap/v1/transactions' : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
    const basic = btoa(`${midtransKey}:`);
    const snap = await fetch(endpoint, { method:'POST', headers:{ Authorization:`Basic ${basic}`, 'Content-Type':'application/json', Accept:'application/json' }, body:JSON.stringify({
      transaction_details:{ order_id:orderId, gross_amount:amount },
      item_details:[{ id:pkg.id, price:amount, quantity:1, name:`Renmoku AI Spin ${pkg.name}` }],
      customer_details:{ email:user.email },
      user_id:user.id,
      enabled_payments: paymentType==='gopay' ? ['gopay'] : ['credit_card'],
      ...(pkg.package_type==='monthly' ? { recurring:{ required:true, interval_unit:'month' } } : {}),
      callbacks:{ finish:`${Deno.env.get('PUBLIC_SITE_URL') ?? 'https://renmoku.biz.id'}/dashboard/owner?section=spin360&payment=finish` },
    }) });
    const result = await snap.json();
    if (!snap.ok || !result.token) {
      await db.from('ai_spin_orders').update({ status:'failed' }).eq('midtrans_order_id',orderId);
      throw new Error(result.error_messages?.join(' ') ?? 'Midtrans gagal membuat pembayaran.');
    }
    return json({ token:result.token, orderId, amount, packageType:pkg.package_type });
  } catch (error) { return json({ error:error instanceof Error ? error.message:'Pembayaran gagal disiapkan.' }, 400); }
});
