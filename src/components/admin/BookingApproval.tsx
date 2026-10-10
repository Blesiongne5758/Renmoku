import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { apiClient } from '../../api/client';

interface BookingApprovalProps {
  bookingId: string;
  onApprove?: () => void;
  onReject?: () => void;
}

export default function BookingApproval({ bookingId, onApprove, onReject }: BookingApprovalProps) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading('approve');
    setError(null);
    setSuccess(null);

    try {
      await apiClient.post(`/bookings/${bookingId}/approve`, {
        action: 'approve',
      });

      setSuccess('Booking berhasil disetujui!');
      onApprove?.();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyetujui booking');
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    if (!confirm('Apakah Anda yakin ingin menolak booking ini?')) {
      return;
    }

    setLoading('reject');
    setError(null);
    setSuccess(null);

    try {
      await apiClient.post(`/bookings/${bookingId}/approve`, {
        action: 'reject',
      });

      setSuccess('Booking berhasil ditolak.');
      onReject?.();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menolak booking');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Action Buttons */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
          onClick={handleApprove}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'approve' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Approve</span>
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: loading ? 1 : 1.05 }}
          whileTap={{ scale: loading ? 1 : 0.95 }}
          onClick={handleReject}
          disabled={loading !== null}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'reject' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4" />
              <span>Reject</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm"
        >
          ✓ {success}
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          ✗ {error}
        </motion.div>
      )}
    </div>
  );
}
