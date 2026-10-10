'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Car, Calendar, DollarSign,
  CheckCircle, AlertTriangle, Settings, Bell, LogOut,
  Menu, X, Crown
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

const adminMenu = [
  { icon: LayoutDashboard, label: 'Dashboard', href: 'dashboard', badge: null },
  { icon: Users, label: 'Users', href: 'users', badge: null },
  { icon: Car, label: 'Vehicles', href: 'vehicles', badge: null },
  { icon: Calendar, label: 'Bookings', href: 'bookings', badge: null },
  { icon: CheckCircle, label: 'Verifikasi', href: 'verification', badge: 12 },
  { icon: DollarSign, label: 'Payout', href: 'payout', badge: 3 },
  { icon: AlertTriangle, label: 'Dispute', href: 'dispute', badge: 5 },
  { icon: Settings, label: 'Settings', href: 'settings', badge: null },
];

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { currentPage, currentUser, setCurrentPage, logout } = useAppStore();

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close drawer on route change (mobile)
  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [currentPage, isMobile]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, isMobile]);

  const handleMenuClick = (href: string) => {
    setCurrentPage(href);
    if (isMobile) setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('home');
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
            <Crown className="w-4 h-4 text-black" />
          </div>
          <div>
            <h1 className="font-serif text-lg bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
              RENMOKU
            </h1>
            <p className="text-[10px] text-gray-500">Admin Control Panel</p>
          </div>
        </div>
        {isMobile && (
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-white/5 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {adminMenu.map((item, idx) => {
          const isActive = currentPage === item.href;
          return (
            <motion.button
              key={item.label}
              onClick={() => handleMenuClick(item.href)}
              initial={isMobile ? { opacity: 0, x: -20 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${
                isActive
                  ? 'bg-gradient-to-r from-yellow-400/20 to-transparent border border-yellow-400/30 text-yellow-400'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="adminActiveIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Admin Profile */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-purple-600 flex items-center justify-center">
            <Crown className="w-5 h-5 text-black" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{currentUser?.name || 'Admin'}</p>
            <p className="text-xs text-yellow-400">Super Admin</p>
          </div>
          <button onClick={handleLogout}>
            <LogOut className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer transition-colors" />
          </button>
        </div>
      </div>
    </>
  );

  // DESKTOP: Fixed sidebar
  if (!isMobile) {
    return (
      <aside className="w-64 bg-[#0f0f0f] border-r border-white/5 flex flex-col h-screen sticky top-0">
        {sidebarContent}
      </aside>
    );
  }

  // MOBILE: Drawer
  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-3 rounded-xl bg-[#141414] border border-white/10 backdrop-blur-xl shadow-lg lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-yellow-400" />
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-72 bg-[#0f0f0f] border-r border-white/5 flex flex-col z-50 lg:hidden shadow-2xl"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
