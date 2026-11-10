import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, QrCode, RefreshCw, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

type ManualOrder = { id:string; user_id:string; package_id:string; amount_idr:number; status:string; payment_proof_path:string|null; payment_review_note:string|null; created_at:string; email?:string; full_name?:string|null; proof_url?:string|null };
const panel='rounded-2xl border border-white/10 bg-[#141414] p-5';
const money=(amount:number)=>`Rp ${Number(amount||0).toLocaleString('id-ID')}`;

export default function AdminAiSpinPayments() {
  const [qrisPath,setQrisPath]=useState('');
  const [instructions,setInstructions]=useState('Transfer melalui QRIS ini, lalu unggah bukti pembayaran yang jelas.');
  const [qrisFile,setQrisFile]=useState<File|null>(null);
  const [orders,setOrders]=useState<ManualOrder[]>([]);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [workingId,setWorkingId]=useState('');
  const [notes,setNotes]=useState<Record<string,string>>({});
  const [error,setError]=useState('');

  const load=useCallback(async()=>{
    setLoading(true);setError('');
    const [{data:settings,error:settingsError},{data:rows,error:ordersError}]=await Promise.all([
      supabase.from('ai_spin_settings').select('qris_image_path,qris_instructions').eq('id',true).single(),
      supabase.from('ai_spin_orders').select('id,user_id,package_id,amount_idr,status,payment_proof_path,payment_review_note,created_at').eq('payment_type','manual_qris').order('created_at',{ascending:false}).limit(60),
    ]);
    if(settingsError||ordersError){setError('Data QRIS atau pembayaran tidak dapat dimuat. Pastikan migrasi ai_spin_manual_qris.sql sudah diterapkan dan sesi Anda admin.');setLoading(false);return;}
    setQrisPath(settings?.qris_image_path??'');setInstructions(settings?.qris_instructions??'');
    const userIds=[...new Set((rows??[]).map((row)=>row.user_id))];
    const {data:users}=userIds.length?await supabase.from('users').select('id,email,full_name').in('id',userIds):{data:[]};
    const userMap=new Map((users??[]).map((user)=>[user.id,user]));
    const ordersWithProof=await Promise.all((rows??[]).map(async(row)=>{
      const profile=userMap.get(row.user_id);
      const {data:signed}=row.payment_proof_path?await supabase.storage.from('ai-spin-payment-proofs').createSignedUrl(row.payment_proof_path,1800):{data:null};
      return {...row,email:profile?.email,full_name:profile?.full_name,proof_url:signed?.signedUrl??null};
    }));
    setOrders(ordersWithProof as ManualOrder[]);setLoading(false);
  },[]);
  useEffect(()=>{void load();},[load]);

  const saveInstructions=async()=>{
    setSaving(true);
    const {error:saveError}=await supabase.from('ai_spin_settings').update({qris_instructions:instructions.trim()}).eq('id',true);
    setSaving(false);
    if(saveError)return toast.error('Instruksi QRIS gagal disimpan.');
    toast.success('Instruksi pembayaran tersimpan.');
  };

  const uploadQris=async()=>{
    if(!qrisFile)return toast.error('Pilih gambar QRIS terlebih dahulu.');
    if(!['image/jpeg','image/png','image/webp'].includes(qrisFile.type)||qrisFile.size>5*1024*1024)return toast.error('Pilih JPG, PNG, atau WebP dengan ukuran maksimal 5 MB.');
    setSaving(true);
    const extension=qrisFile.type==='image/jpeg'?'jpg':qrisFile.type==='image/png'?'png':'webp';
    const path=`current/${crypto.randomUUID()}.${extension}`;
    const {error:uploadError}=await supabase.storage.from('ai-spin-qris').upload(path,qrisFile,{contentType:qrisFile.type,upsert:false});
    if(uploadError){setSaving(false);return toast.error('Gambar QRIS gagal diunggah.');}
    const {error:saveError}=await supabase.from('ai_spin_settings').update({qris_image_path:path,qris_instructions:instructions.trim()}).eq('id',true);
    if(saveError){await supabase.storage.from('ai-spin-qris').remove([path]);setSaving(false);return toast.error('QRIS terunggah tetapi gagal dijadikan QRIS aktif.');}
    setQrisPath(path);setQrisFile(null);setSaving(false);toast.success('QRIS statis berhasil diperbarui.');
  };

  const review=async(order:ManualOrder,approve:boolean)=>{
    const note=notes[order.id]?.trim()??'';
    if(!approve&&!note)return toast.error('Tulis alasan penolakan agar pemilik mengetahui apa yang perlu diperbaiki.');
    setWorkingId(order.id);
    const {error:reviewError}=await supabase.rpc('review_ai_spin_manual_payment',{p_order_id:order.id,p_approve:approve,p_note:note||null});
    setWorkingId('');
    if(reviewError)return toast.error('Status pembayaran gagal diperbarui.');
    toast.success(approve?'Pembayaran disetujui dan kredit sudah ditambahkan.':'Bukti pembayaran ditolak.');
    await load();
  };

  const qrisUrl=qrisPath?supabase.storage.from('ai-spin-qris').getPublicUrl(qrisPath).data.publicUrl:null;
  return <div className="space-y-5">
    <section className={panel}>
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 text-xl font-semibold"><QrCode className="h-5 w-5 text-yellow-300"/>Pembayaran AI Spin · QRIS statis</h2><p className="mt-1 text-sm text-gray-400">Unggah QRIS tujuan dan instruksi. Pemilik rental akan membayar, mengunggah bukti, lalu menunggu persetujuan admin.</p></div></header>
      <div className="grid gap-5 md:grid-cols-[220px_1fr]">
        <div className="flex min-h-52 items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/20 p-4">{qrisUrl?<img src={qrisUrl} alt="QRIS aktif AI Spin" className="max-h-52 max-w-full rounded-lg bg-white object-contain p-2"/>:<p className="text-center text-sm text-gray-500">Belum ada gambar QRIS.</p>}</div>
        <div><label className="block text-sm font-medium text-gray-200">Gambar QRIS <span className="font-normal text-gray-500">(JPG, PNG, WebP · maksimal 5 MB)</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event)=>setQrisFile(event.target.files?.[0]??null)} className="mt-2 block w-full rounded-lg border border-white/10 bg-white/[.03] p-2 text-xs text-gray-300 file:mr-3 file:rounded-md file:border-0 file:bg-yellow-300 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-stone-900"/></label><label className="mt-4 block text-sm font-medium text-gray-200">Instruksi pembayaran<textarea value={instructions} onChange={(event)=>setInstructions(event.target.value)} rows={4} maxLength={1000} className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white" placeholder="Nama pemilik rekening, langkah pembayaran, dan informasi yang harus dicantumkan…"/></label><div className="mt-3 flex flex-wrap gap-2"><button disabled={saving||!qrisFile} onClick={()=>void uploadQris()} className="inline-flex items-center gap-2 rounded-lg bg-yellow-300 px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-40"><Upload className="h-4 w-4"/>{saving?'Menyimpan…':'Unggah & aktifkan QRIS'}</button><button disabled={saving} onClick={()=>void saveInstructions()} className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-gray-200 disabled:opacity-40">Simpan instruksi</button></div></div>
      </div>
    </section>
    <section className={panel}>
      <header className="mb-5 flex items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Bukti pembayaran masuk</h2><p className="mt-1 text-sm text-gray-400">Setujui hanya setelah jumlah, status transfer, dan tujuan QRIS cocok.</p></div><button onClick={()=>void load()} className="rounded-lg border border-white/10 p-2 text-gray-300" aria-label="Muat ulang"><RefreshCw className="h-4 w-4"/></button></header>
      {error&&<p role="alert" className="mb-4 rounded-lg bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
      {loading?<div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-400"><Loader2 className="h-4 w-4 animate-spin"/>Memuat pembayaran…</div>:orders.length===0?<p className="py-10 text-center text-sm text-gray-500">Belum ada bukti pembayaran AI Spin.</p>:<div className="space-y-3">{orders.map((order)=><article key={order.id} className="grid gap-4 rounded-xl border border-white/10 bg-black/20 p-4 md:grid-cols-[150px_1fr]"><div>{order.proof_url?<a href={order.proof_url} target="_blank" rel="noreferrer"><img src={order.proof_url} alt="Bukti pembayaran" className="aspect-square w-full rounded-lg bg-white/5 object-contain"/></a>:<div className="flex aspect-square items-center justify-center rounded-lg bg-white/5 text-xs text-gray-500">Bukti tidak tersedia</div>}</div><div><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-medium text-white">{order.full_name||order.email||`Pengguna ${order.user_id.slice(0,8)}`}</h3><p className="mt-1 text-xs text-gray-500">{order.email||order.user_id} · Paket {order.package_id} · {new Date(order.created_at).toLocaleString('id-ID')}</p></div><div className="text-right"><p className="font-semibold text-amber-200">{money(order.amount_idr)}</p><span className={`text-xs ${order.status==='paid'?'text-emerald-300':order.status==='rejected'?'text-red-300':'text-amber-200'}`}>{order.status==='paid'?'Disetujui':order.status==='rejected'?'Ditolak':'Menunggu verifikasi'}</span></div></div>
        {order.status==='pending'?<><textarea value={notes[order.id]??''} onChange={(event)=>setNotes((current)=>({...current,[order.id]:event.target.value}))} maxLength={500} rows={2} className="mt-3 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white" placeholder="Catatan admin atau alasan jika ditolak"/><div className="mt-2 flex gap-2"><button disabled={Boolean(workingId)||!order.proof_url} onClick={()=>void review(order,true)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-400/15 px-3 py-2 text-xs font-medium text-emerald-200 disabled:opacity-40">{workingId===order.id?<Loader2 className="h-3.5 w-3.5 animate-spin"/>:<Check className="h-3.5 w-3.5"/>}Setujui & tambahkan kredit</button><button disabled={Boolean(workingId)} onClick={()=>void review(order,false)} className="inline-flex items-center gap-2 rounded-lg bg-red-400/10 px-3 py-2 text-xs text-red-200 disabled:opacity-40"><X className="h-3.5 w-3.5"/>Tolak</button></div></>:order.payment_review_note&&<p className="mt-3 rounded-lg bg-white/5 p-3 text-sm text-gray-300">Catatan: {order.payment_review_note}</p>}</div></article>)}</div>}
    </section>
  </div>;
}
