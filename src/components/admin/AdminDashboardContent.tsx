'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  ChevronDown,
  Crown,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import AdminStatsGrid from './AdminStatsGrid';
import AdminSidebar from './AdminSidebar';
import AdminWorkspaceSection from './AdminWorkspaceSection';
import NotificationBell from '../NotificationBell';

export default function AdminDashboardContent() {
  const { currentUser, logout, setCurrentPage, adminSection } = useAppStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const adminName = currentUser?.name || 'Super Admin';
  const sectionTitle = {
    overview: 'Platform Overview', users: 'Pengguna', vehicles: 'Verifikasi Kendaraan', bookings: 'Booking Platform',
    verification: 'Verifikasi Akun', payout: 'Pembayaran & Payout', dispute: 'Pusat Dispute', settings: 'Pengaturan Platform', gps: 'GPS & Realtime', 'ai-spin-payments': 'QRIS AI Spin',
  }[adminSection];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-0 overflow-y-auto min-h-screen pb-20 lg:pb-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="font-serif text-xl lg:text-2xl flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-400" />
                  {sectionTitle}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
                >
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm hidden sm:block">{adminName}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-12 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl p-2 shadow-xl"
                  >
                    <button
                      onClick={() => { logout(); setCurrentPage('home'); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-gray-300"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        {adminSection === 'overview' ? <div className="p-6 lg:p-8 space-y-6"><AdminStatsGrid /><AdminWorkspaceSection section="verification" /></div> : <div className="p-5 lg:p-8"><AdminWorkspaceSection section={adminSection} /></div>}
      </main>
    </div>
  );
}
