import { FormEvent, useEffect, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../stores/useAppStore';

type ChatMessage = { id: string; booking_id: string; sender_id: string; body: string; created_at: string };

export default function BookingChat({ bookingId, status }: { bookingId: string; status: string }) {
  const user = useAppStore((state) => state.currentUser);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const enabled = ['PENDING', 'CONFIRMED', 'ACTIVE'].includes(status);

  useEffect(() => {
    if (!open || !enabled) return;
    let alive = true;
    setLoading(true);
    void supabase.from('booking_messages').select('id,booking_id,sender_id,body,created_at').eq('booking_id', bookingId).order('created_at')
      .then(({ data, error: queryError }) => {
        if (!alive) return;
        setLoading(false);
        if (queryError) setError('Pesan belum dapat dimuat.'); else setMessages((data ?? []) as ChatMessage[]);
      });
    const channel = supabase.channel(`booking-chat-${bookingId}`).on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'booking_messages', filter: `booking_id=eq.${bookingId}`,
    }, (payload) => setMessages((current) => current.some((message) => message.id === (payload.new as ChatMessage).id) ? current : [...current, payload.new as ChatMessage]))
      .subscribe();
    return () => { alive = false; void supabase.removeChannel(channel); };
  }, [bookingId, enabled, open]);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const text = body.trim();
    if (!text || !user?.id || !enabled) return;
    const { error: sendError } = await supabase.from('booking_messages').insert({ booking_id: bookingId, sender_id: user.id, body: text });
    if (sendError) return setError('Pesan gagal dikirim. Coba lagi.');
    setBody(''); setError('');
  };

  if (!enabled) return null;
  return <>
    <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gold-200 hover:bg-white/5"><MessageCircle className="h-4 w-4"/>Chat</button>
    {open && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Chat pemesanan">
      <section className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#171717] shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 p-4"><div><h2 className="font-semibold text-white">Chat pemesanan</h2><p className="text-xs text-gray-500">#{bookingId.slice(0, 8)}</p></div><button onClick={() => setOpen(false)} aria-label="Tutup chat" className="rounded-lg p-2 hover:bg-white/5"><X className="h-4 w-4"/></button></header>
        <div className="min-h-48 flex-1 space-y-3 overflow-y-auto p-4">{loading && <p className="text-sm text-gray-400">Memuat pesan…</p>}{!loading && !messages.length && <p className="text-center text-sm text-gray-500">Mulai percakapan mengenai pemesanan ini.</p>}{messages.map((message) => <div key={message.id} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${message.sender_id === user?.id ? 'ml-auto bg-yellow-500/15 text-yellow-50' : 'bg-white/5 text-gray-200'}`}><p className="whitespace-pre-wrap break-words">{message.body}</p><time className="mt-1 block text-right text-[10px] text-gray-500">{new Date(message.created_at).toLocaleString('id-ID')}</time></div>)}</div>
        {error && <p className="px-4 text-xs text-red-300">{error}</p>}
        <form onSubmit={(event) => void send(event)} className="flex gap-2 border-t border-white/10 p-3"><input value={body} onChange={(event) => setBody(event.target.value)} maxLength={4000} placeholder="Tulis pesan…" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-yellow-400/50"/><button aria-label="Kirim pesan" disabled={!body.trim()} className="rounded-xl bg-yellow-400 px-3 text-black disabled:opacity-50"><Send className="h-4 w-4"/></button></form>
      </section>
    </div>}
  </>;
}
