import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
Deno.serve(async(request)=>{
  if(request.method==='OPTIONS')return new Response('ok',{headers:cors});
  if(request.method!=='POST')return Response.json({error:'Method not allowed'},{status:405,headers:cors});
  const url=Deno.env.get('SUPABASE_URL');const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');const serverKey=Deno.env.get('MIDTRANS_SERVER_KEY');
  if(!url||!key||!serverKey)return Response.json({error:'Server configuration missing'},{status:503,headers:cors});
  const authorization=request.headers.get('Authorization');if(!authorization)return Response.json({error:'Authentication required'},{status:401,headers:cors});
  const db=createClient(url,key,{auth:{persistSession:false}});const {data:{user}}=await db.auth.getUser(authorization.replace(/^Bearer\s+/i,''));if(!user)return Response.json({error:'Invalid session'},{status:401,headers:cors});
  const {data:profile}=await db.from('users').select('role').eq('id',user.id).single();if(profile?.role!=='ADMIN')return Response.json({error:'Admin access required'},{status:403,headers:cors});
  try{
    const {orderId,subscriptionId,confirmNoSubscription}=await request.json();
    if(typeof orderId!=='string')return Response.json({error:'orderId is required'},{status:400,headers:cors});
    const {data:order,error}=await db.from('ai_spin_orders').select('id,user_id,package_id,is_monthly,midtrans_order_id,amount_idr,status,payment_type,midtrans_subscription_id,subscription_creation_uncertain').eq('id',orderId).single();
    if(error||!order)return Response.json({error:'Order not found'},{status:404,headers:cors});
    if(order.status==='paid')return Response.json({resolved:true,status:'paid'},{headers:cors});
    if(order.status!=='processing'||!order.subscription_creation_uncertain||!order.is_monthly)return Response.json({error:'Order is not in the uncertain recurring state'},{status:409,headers:cors});
    const production=Deno.env.get('MIDTRANS_IS_PRODUCTION')==='true';const base=production?'https://api.midtrans.com':'https://api.sandbox.midtrans.com';const auth=`Basic ${btoa(`${serverKey}:`)}`;
    if(typeof subscriptionId==='string'&&subscriptionId){
      const response=await fetch(`${base}/v1/subscriptions/${encodeURIComponent(subscriptionId)}`,{headers:{Authorization:auth,Accept:'application/json'}});const sub=await response.json();
      if(!response.ok||sub.id!==subscriptionId)return Response.json({error:'Subscription not found in Midtrans'},{status:404,headers:cors});
      if(sub.status!=='active'||sub.currency!=='IDR'||sub.payment_type!==order.payment_type||sub.metadata?.order_id!==order.midtrans_order_id||sub.metadata?.user_id!==order.user_id||sub.metadata?.package_id!==order.package_id||Number(sub.amount)!==Number(order.amount_idr))return Response.json({error:'Subscription status, currency, payment type, metadata, or amount does not match this order'},{status:409,headers:cors});
      const periodEnd=sub.schedule?.next_execution_at?new Date(sub.schedule.next_execution_at).toISOString():null;
      const {data:saved,error:saveError}=await db.from('ai_spin_orders').update({midtrans_subscription_id:sub.id,subscription_period_end:periodEnd,subscription_creation_uncertain:false}).eq('id',order.id).eq('status','processing').eq('subscription_creation_uncertain',true).is('midtrans_subscription_id',null).select('id').maybeSingle();
      if(saveError)throw saveError;
      if(!saved)return Response.json({error:'Order was already reconciled by another action. Refresh the order status.'},{status:409,headers:cors});
      const {error:creditError}=await db.rpc('apply_ai_spin_payment',{p_order_id:order.id,p_subscription_id:sub.id,p_period_end:periodEnd});if(creditError)throw creditError;
      return Response.json({resolved:true,status:'paid',subscriptionId:sub.id},{headers:cors});
    }
    if(confirmNoSubscription===true){
      const {data:reset,error:resetError}=await db.from('ai_spin_orders').update({subscription_creation_uncertain:false,subscription_creation_started_at:null,processing_started_at:null,status:'pending'}).eq('id',order.id).eq('status','processing').eq('subscription_creation_uncertain',true).is('midtrans_subscription_id',null).select('id').maybeSingle();
      if(resetError)throw resetError;
      if(!reset)return Response.json({error:'Order was already reconciled by another action. Refresh the order status.'},{status:409,headers:cors});
      return Response.json({resolved:true,status:'pending',message:'Guard dilepas. Kirim ulang notifikasi pembayaran Midtrans untuk melanjutkan pembuatan langganan.'},{headers:cors});
    }
    return Response.json({error:'Provide a verified subscriptionId or confirmNoSubscription after checking the Midtrans dashboard.'},{status:400,headers:cors});
  }catch(error){return Response.json({error:error instanceof Error?error.message:'Reconciliation failed'},{status:500,headers:cors});}
});
