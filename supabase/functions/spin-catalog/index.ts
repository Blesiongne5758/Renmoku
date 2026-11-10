import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const cors={ 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'GET, OPTIONS' };
Deno.serve(async(request)=>{
  if(request.method==='OPTIONS') return new Response('ok',{headers:cors});
  const url=Deno.env.get('SUPABASE_URL');const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');const unitCost=Number(Deno.env.get('MESHY_CREDIT_COST_IDR'));
  if(!url||!key)return Response.json({error:'Supabase belum dikonfigurasi.'},{status:503,headers:cors});
  const authorization=request.headers.get('Authorization');if(!authorization)return Response.json({error:'Autentikasi diperlukan.'},{status:401,headers:cors});
  const db=createClient(url,key,{auth:{persistSession:false}});const {data:{user}}=await db.auth.getUser(authorization.replace(/^Bearer\s+/i,''));if(!user)return Response.json({error:'Sesi tidak valid.'},{status:401,headers:cors});
  const [{data:packages},{data:settings},{data:wallet},{data:jobs},{data:orders}]=await Promise.all([
    db.from('ai_spin_packages').select('id,name,package_type,generations').eq('active',true).order('sort_order'),
    db.from('ai_spin_settings').select('meshy_credits_per_model,renmoku_markup_percent,qris_image_path,qris_instructions').eq('id',true).single(),
    db.from('owner_ai_spin_wallets').select('monthly_credits,topup_credits,package_id,subscription_status,period_end,payment_type').eq('user_id',user.id).maybeSingle(),
    db.from('ai_spin_jobs').select('id,submission_id,status,provider_task_id,model_path,error_message,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(12),
    db.from('ai_spin_orders').select('id,package_id,status,subscription_creation_uncertain,midtrans_order_id,payment_type,payment_proof_path,payment_review_note,amount_idr,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(5),
  ]);
  const jobsWithPreview=await Promise.all((jobs??[]).map(async (job)=>{
    let previewUrl=job.model_path;
    if(['review','published'].includes(job.status)&&job.model_path&&!job.model_path.startsWith('https://')){
      const {data:signed}=await db.storage.from('vehicle-models-private').createSignedUrl(job.model_path,1800);
      previewUrl=signed?.signedUrl??null;
    }
    return {...job,model_path:previewUrl};
  }));
  const creditRateReady=Number.isFinite(unitCost)&&unitCost>0;
  const credits=settings?.meshy_credits_per_model??30;const markup=settings?.renmoku_markup_percent??50;
  const pricedPackages=(packages??[]).map((pkg)=>{const providerCost=creditRateReady?Math.ceil(pkg.generations*credits*unitCost):null;const price=providerCost===null?null:providerCost+Math.ceil(providerCost*markup/100);return {...pkg,price_idr:price,provider_cost_idr:providerCost,renmoku_share_idr:providerCost===null?null:Math.ceil(providerCost*markup/100),purchasable:price!==null&&price>=10000}});
  const qrisImageUrl=settings?.qris_image_path?db.storage.from('ai-spin-qris').getPublicUrl(settings.qris_image_path).data.publicUrl:null;
  return Response.json({packages:pricedPackages,wallet:wallet??{monthly_credits:0,topup_credits:0,subscription_status:'inactive'},jobs:jobsWithPreview,orders:orders??[],creditRateReady,qrisImageUrl,qrisInstructions:settings?.qris_instructions??'Transfer melalui QRIS ini, lalu unggah bukti pembayaran yang jelas.'},{headers:cors});
});
