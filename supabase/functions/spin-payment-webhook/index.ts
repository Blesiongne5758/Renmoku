import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type':'application/json' } });
const hex = (bytes: Uint8Array) => [...bytes].map((byte) => byte.toString(16).padStart(2,'0')).join('');
const digest = async (value: string) => hex(new Uint8Array(await crypto.subtle.digest('SHA-512', new TextEncoder().encode(value))));

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error:'Method not allowed' },405);
  const url=Deno.env.get('SUPABASE_URL'); const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); const serverKey=Deno.env.get('MIDTRANS_SERVER_KEY');
  if(!url || !serviceKey || !serverKey) return json({ error:'Server configuration missing' },503);
  try {
    const notification=await request.json();
    const expected=await digest(`${notification.order_id}${notification.status_code}${notification.gross_amount}${serverKey}`);
    if(typeof notification.signature_key!=='string' || expected!==notification.signature_key.toLowerCase()) return json({error:'Invalid signature'},401);
    const db=createClient(url,serviceKey,{auth:{persistSession:false}});
    const {data:order,error}=await db.from('ai_spin_orders').select('id,user_id,package_id,amount_idr,status,payment_type,midtrans_subscription_id,subscription_period_end,subscription_creation_uncertain').eq('midtrans_order_id',notification.order_id).single();
    if(error || !order) return json({error:'Unknown order'},404);
    if(order.status==='paid') return json({received:true,duplicate:true});
    if(Number(notification.gross_amount)!==Number(order.amount_idr)) return json({error:'Amount mismatch'},400);
    const {data:claimed,error:claimError}=await db.rpc('claim_ai_spin_order',{p_order_id:order.id});
    if(claimError) throw claimError;
    if(!claimed) return json({error:'Order is being processed; retry shortly'},503);
    const production=Deno.env.get('MIDTRANS_IS_PRODUCTION')==='true';
    const base=production?'https://api.midtrans.com':'https://api.sandbox.midtrans.com';
    const auth=`Basic ${btoa(`${serverKey}:`)}`;
    const statusResponse=await fetch(`${base}/v2/${encodeURIComponent(notification.order_id)}/status`,{headers:{Authorization:auth,Accept:'application/json'}});
    const payment=await statusResponse.json();
    if(!statusResponse.ok) throw new Error('Midtrans status verification failed.');
    const paid=payment.transaction_status==='settlement' || (payment.transaction_status==='capture' && payment.fraud_status==='accept');
    if(!paid) {
      const terminal=['expire','cancel','deny'].includes(payment.transaction_status);
      await db.from('ai_spin_orders').update({status:terminal?(payment.transaction_status==='expire'?'expired':'failed'):'pending',processing_started_at:null}).eq('id',order.id).eq('status','processing');
      return json({received:true,paid:false});
    }
    const {data:pkg,error:pkgError}=await db.from('ai_spin_packages').select('package_type').eq('id',order.package_id).single();
    if(pkgError || !pkg) throw new Error('Package not found.');
    let subscriptionId: string|null=order.midtrans_subscription_id; let periodEnd: string|null=order.subscription_period_end;
    if(pkg.package_type==='monthly'&&order.subscription_creation_uncertain&&!subscriptionId) return json({error:'Hasil pembuatan langganan perlu direkonsiliasi dengan Midtrans sebelum dicoba ulang.'},503);
    if(pkg.package_type==='monthly') {
      if(!subscriptionId) {
      let token=payment.saved_token_id as string|undefined;
      let gopayAccountId=payment.account_id as string|undefined;
      if(order.payment_type==='gopay' && !gopayAccountId) throw new Error('Midtrans did not return GoPay account id; subscription cannot be activated yet.');
      if(order.payment_type==='gopay') {
        const account=await fetch(`${base}/v2/pay/account/${encodeURIComponent(gopayAccountId!)}`,{headers:{Authorization:auth,Accept:'application/json'}});
        const accountInfo=await account.json();
        token=accountInfo.metadata?.payment_options?.find((item:{active:boolean;token:string})=>item.active)?.token;
      }
      if(!token) throw new Error('Midtrans token for recurring charge is unavailable.');
      const start=new Date(); start.setMonth(start.getMonth()+1);
      const localStart=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(start).replace(' ','T').replace('T',' ');
      const subscriptionPayload={name:`RENMOKU_${order.id.replaceAll('-','').slice(0,24)}`,amount:String(order.amount_idr),currency:'IDR',payment_type:order.payment_type,token,
        schedule:{interval:1,interval_unit:'month',max_interval:120,start_time:`${localStart} +0700`},retry_schedule:{interval:1,interval_unit:'hour',max_interval:3},
        metadata:{user_id:order.user_id,package_id:order.package_id,order_id:notification.order_id},...(order.payment_type==='gopay'?{gopay:{account_id:gopayAccountId}}:{})};
      const {error:markStartedError}=await db.from('ai_spin_orders').update({subscription_creation_started_at:new Date().toISOString(),subscription_creation_uncertain:true}).eq('id',order.id).eq('status','processing');
      if(markStartedError)throw markStartedError;
      const subscriptionResponse=await fetch(`${base}/v1/subscriptions`,{method:'POST',headers:{Authorization:auth,'Content-Type':'application/json',Accept:'application/json','Idempotency-Key':order.id},body:JSON.stringify(subscriptionPayload)});
      const subscription=await subscriptionResponse.json();
      if(!subscriptionResponse.ok || !subscription.id) {
        if(subscriptionResponse.status<500) await db.from('ai_spin_orders').update({subscription_creation_uncertain:false,subscription_creation_started_at:null,processing_started_at:null,status:'pending'}).eq('id',order.id).eq('status','processing');
        throw new Error(subscription.validation_messages?.join(' ')??subscription.status_message??'Midtrans recurring subscription could not be created.');
      }
      subscriptionId=subscription.id; periodEnd=start.toISOString();
      const {error:saveSubscriptionError}=await db.from('ai_spin_orders').update({midtrans_subscription_id:subscriptionId,subscription_period_end:periodEnd,subscription_creation_uncertain:false}).eq('id',order.id);
      if(saveSubscriptionError)throw saveSubscriptionError;
      }
    }
    const {error:applyError}=await db.rpc('apply_ai_spin_payment',{p_order_id:order.id,p_subscription_id:subscriptionId,p_period_end:periodEnd});
    if(applyError) throw applyError;
    return json({received:true,paid:true});
  } catch(error) { return json({error:error instanceof Error?error.message:'Webhook processing failed'},500); }
});
