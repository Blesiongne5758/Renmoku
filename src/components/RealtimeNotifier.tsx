'use client';

import { useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { toast } from 'sonner';
import { useAppStore } from '../stores/useAppStore';

export default function RealtimeNotifier() {
  const { currentUser } = useAppStore();
  const userId = currentUser?.id;

  const { isConnected } = useSocket({
    userId,
    onNewBooking: (data) => {
      toast.success(`🎉 Booking Baru!`, {
        description: `${data.renterName} memesan ${data.vehicleName} - Rp ${data.totalPrice.toLocaleString('id-ID')}`,
        duration: 5000,
      });
    },
    onBookingUpdate: (data) => {
      const statusText = data.status === 'CONFIRMED' ? '✅ Disetujui' : '❌ Ditolak';
      toast.info(`Booking ${statusText}`, {
        description: `${data.vehicleName} - ${statusText} oleh pemilik`,
      });
    },
    onPaymentUpdate: (data) => {
      toast.success(`💰 Pembayaran Diterima`, {
        description: `Pembayaran ${data.type} sebesar Rp ${data.amount.toLocaleString('id-ID')}`,
      });
    },
  });

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs backdrop-blur-xl border ${
        isConnected 
          ? 'bg-green-500/20 border-green-500/30 text-green-400' 
          : 'bg-red-500/20 border-red-500/30 text-red-400'
      }`}>
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
        {isConnected ? 'Live' : 'Offline'}
      </div>
    </div>
  );
}
