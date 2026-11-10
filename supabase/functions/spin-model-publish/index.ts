import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const cors={ 'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS' };
Deno.serve(async(request)=>{
  if(request.method==='OPTIONS') return new Response('ok',{headers:cors});
  if(request.method!=='POST') return new Response('Method not allowed',{status:405,headers:cors});
  const url=Deno.env.get('SUPABASE_URL');const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');if(!url||!key)return Response.json({error:'Server configuration missing'},{status:503,headers:cors});
  const authorization=request.headers.get('Authorization');if(!authorization)return Response.json({error:'Authentication required'},{status:401,headers:cors});
  const db=createClient(url,key,{auth:{persistSession:false}});const {data:{user}}=await db.auth.getUser(authorization.replace(/^Bearer\s+/i,''));if(!user)return Response.json({error:'Invalid session'},{status:401,headers:cors});
  try {
    const {jobId,makePublic}=await request.json();
    if(typeof jobId!=='string'||typeof makePublic!=='boolean')return Response.json({error:'Invalid request'},{status:400,headers:cors});
    const {data:job,error:jobError}=await db.from('ai_spin_jobs').select('id,user_id,submission_id,status,model_path').eq('id',jobId).eq('user_id',user.id).single();
    if(jobError||!job||!['review','published'].includes(job.status)||!job.model_path)return Response.json({error:'Model is not awaiting review'},{status:409,headers:cors});
    const {data:submission,error:submissionError}=await db.from('owner_vehicle_submissions').select('id,status,spin_model_url').eq('id',job.submission_id).eq('user_id',user.id).single();
    if(submissionError||!submission)return Response.json({error:'Vehicle submission not found'},{status:404,headers:cors});
    if(makePublic&&submission.status!=='APPROVED')return Response.json({error:'Admin harus menyetujui pengajuan kendaraan sebelum model ditayangkan.'},{status:409,headers:cors});
    let modelUrl:string|null=null;
    if(makePublic){
      if(job.model_path.startsWith('https://')) modelUrl=job.model_path;
      else {
        const {data:file,error:fileError}=await db.storage.from('vehicle-models-private').download(job.model_path);
        if(fileError||!file)return Response.json({error:'Berkas model privat tidak ditemukan.'},{status:404,headers:cors});
        const publicPath=`${user.id}/${job.id}.glb`;
        const {error:uploadError}=await db.storage.from('vehicle-models').upload(publicPath,file,{contentType:'model/gltf-binary',upsert:true});
        if(uploadError)return Response.json({error:`Publikasi model gagal: ${uploadError.message}`},{status:502,headers:cors});
        modelUrl=db.storage.from('vehicle-models').getPublicUrl(publicPath).data.publicUrl;
      }
    } else if(submission.spin_model_url){
      const prefix='/storage/v1/object/public/vehicle-models/';
      const marker=submission.spin_model_url.indexOf(prefix);
      if(marker>=0){const objectPath=decodeURIComponent(submission.spin_model_url.slice(marker+prefix.length));await db.storage.from('vehicle-models').remove([objectPath]);}
    }
    const {error:submissionUpdateError}=await db.from('owner_vehicle_submissions').update({spin_model_public:makePublic,spin_model_url:modelUrl}).eq('id',submission.id).eq('user_id',user.id);
    if(submissionUpdateError)throw submissionUpdateError;
    const {error:jobUpdateError}=await db.from('ai_spin_jobs').update({status:makePublic?'published':'review',updated_at:new Date().toISOString()}).eq('id',job.id);
    if(jobUpdateError)throw jobUpdateError;
    return Response.json({saved:true,public:makePublic,listingApproved:submission.status==='APPROVED'},{headers:cors});
  }catch(error){return Response.json({error:error instanceof Error?error.message:'Could not save model review'},{status:500,headers:cors});}
});
