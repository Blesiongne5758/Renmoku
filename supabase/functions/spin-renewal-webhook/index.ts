import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (request) => {
  if(request.method!=='POST') return new Response('Method not allowed',{status:405});
  const url=Deno.env.get('SUPABASE_URL'); const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); const serverKey=Deno.env.get('MIDTRANS_SERVER_KEY');
  if(!url||!key||!serverKey) return new Response('Server configuration missing',{status:503});
  try {
    const payload=await request.json(); const subscription=payload.subscription; const transaction=payload.transaction;
    if(payload.event_name!=='subscription.charge' || !subscription?.id) return new Response('Ignored',{status:200});
    const production=Deno.env.get('MIDTRANS_IS_PRODUCTION')==='true'; const base=production?'https://api.midtrans.com':'https://api.sandbox.midtrans.com';
    const auth=`Basic ${btoa(`${serverKey}:`)}`;
    const verification=await fetch(`${base}/v1/subscriptions/${encodeURIComponent(subscription.id)}`,{headers:{Authorization:auth,Accept:'application/json'}});
    const verified=await verification.json();
    if(!verification.ok || verified.id!==subscription.id) return new Response('Subscription could not be verified',{status:401});
    let succeeded=false;
    if(transaction?.transaction_id && ['200','201'].includes(String(transaction.status_code))){
      const paymentResponse=await fetch(`${base}/v2/${encodeURIComponent(transaction.transaction_id)}/status`,{headers:{Authorization:auth,Accept:'application/json'}});
      const verifiedPayment=await paymentResponse.json();
      succeeded=paymentResponse.ok && ['capture','settlement'].includes(verifiedPayment.transaction_status) && Number(verifiedPayment.gross_amount)===Number(verified.amount);
    }
    const db=createClient(url,key,{auth:{persistSession:false}});
    const {data:wallet}=await db.from('owner_ai_spin_wallets').select('user_id,package_id').eq('midtrans_subscription_id',subscription.id).single();
    if(!wallet || verified.metadata?.user_id!==wallet.user_id || verified.metadata?.package_id!==wallet.package_id) return new Response('Subscription metadata mismatch',{status:401});
    const periodEnd=verified.schedule?.next_execution_at ? new Date(verified.schedule.next_execution_at).toISOString() : null;
    const failedEventId=transaction?.transaction_id??`failed-${subscription.id}-${verified.schedule?.current_interval??'retry'}-${transaction?.status_code??'error'}`;
    const {error}=await db.rpc('apply_ai_spin_renewal',{p_subscription_id:subscription.id,p_transaction_id:failedEventId,p_succeeded:succeeded,p_subscription_active:verified.status==='active',p_period_end:periodEnd});
    if(error) throw error;
    return new Response('OK',{status:200});
  } catch(error) { return new Response(error instanceof Error?error.message:'Webhook error',{status:500}); }
});
