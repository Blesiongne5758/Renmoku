'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, Car, Calendar, User } from 'lucide-react';
import { OwnerSection, useAppStore } from '../stores/useAppStore';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', section: 'overview' as OwnerSection },
  { icon: Car, label: 'Fleet', section: 'fleet' as OwnerSection },
  { icon: Calendar, label: 'Bookings', section: 'bookings' as OwnerSection },
  { icon: User, label: 'Settings', section: 'settings' as OwnerSection },
];

export default function MobileBottomNav() {
  const { currentPage, ownerSection, setCurrentPage, setOwnerSection } = useAppStore();

  const handleNavigation = (section: OwnerSection) => {
    setOwnerSection(section);
    setCurrentPage('dashboard');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div className="bg-[#0f0f0f]/95 backdrop-blur-xl border-t border-white/10">
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {menuItems.map((item) => {
            const isActive = currentPage === 'dashboard' && ownerSection === item.section;
            return (
              <button
                key={item.label}
                onClick={() => handleNavigation(item.section)}
                className="relative flex flex-col items-center gap-1 py-2 rounded-xl transition"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-xl border border-yellow-400/30"
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  />
                )}
                <item.icon 
                  className={`w-5 h-5 relative z-10 ${
                    isActive ? 'text-yellow-400' : 'text-gray-500'
                  }`} 
                />
                <span 
                  className={`text-[10px] relative z-10 ${
                    isActive ? 'text-yellow-400 font-semibold' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* Safe area for iOS */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </nav>
  );
}
