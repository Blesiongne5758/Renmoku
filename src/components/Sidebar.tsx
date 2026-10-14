'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Car, Calendar, DollarSign, 
  CheckCircle, TrendingUp, Settings, Bell, LogOut,
  Menu, X, ChevronRight
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

const ownerMenu = [
  { icon: LayoutDashboard, label: 'Overview', href: 'dashboard', subpage: 'overview' },
  { icon: Car, label: 'Fleet', href: 'dashboard', subpage: 'fleet' },
  { icon: Calendar, label: 'Bookings', href: 'dashboard', subpage: 'bookings' },
  { icon: DollarSign, label: 'Revenue', href: 'dashboard', subpage: 'revenue' },
  { icon: CheckCircle, label: 'Check-in/out', href: 'dashboard', subpage: 'check' },
  { icon: TrendingUp, label: 'Analytics', href: 'dashboard', subpage: 'analytics' },
  { icon: Settings, label: 'Settings', href: 'dashboard', subpage: 'settings' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { currentPage, currentUser, setCurrentPage, logout } = useAppStore();

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
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
        <div>
          <h1 className="font-serif text-2xl bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
            RENMOKU
          </h1>
          <p className="text-xs text-gray-500 mt-1">Owner Portal</p>
        </div>
        {isMobile && (
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {ownerMenu.map((item, idx) => {
          const isActive = currentPage === item.href;
          return (
            <motion.button
              key={item.label}
              onClick={() => handleMenuClick(item.href)}
              initial={isMobile ? { opacity: 0, x: -20 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-yellow-400/20 to-transparent border border-yellow-400/30 text-yellow-400'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-purple-600 flex items-center justify-center font-bold flex-shrink-0 text-black">
            {currentUser?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {currentUser?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500">Verified Partner</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-white/10 transition"
          >
            <LogOut className="w-4 h-4 text-gray-500 hover:text-white" />
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
