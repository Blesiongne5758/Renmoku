'use client';

import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { currentUser, isAuthenticated, setCurrentPage } = useAppStore();

  useEffect(() => {
    if (isAuthenticated && currentUser?.role) {
      if (!allowedRoles.includes(currentUser.role)) {
        setCurrentPage('unauthorized');
      }
    }
  }, [isAuthenticated, currentUser, allowedRoles, setCurrentPage]);

  // Loading state
  if (!isAuthenticated && !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
      </div>
    );
  }

  // Unauthenticated state
  if (!isAuthenticated) {
    setCurrentPage('auth');
    return null;
  }

  // Role check
  if (currentUser?.role && !allowedRoles.includes(currentUser.role)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-red-400 mb-4">⛔ Akses Ditolak</h1>
          <p className="text-gray-400">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
