import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { useAppStore } from './stores/useAppStore';
import { SocketProvider } from './components/SocketProvider';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import RealtimeNotifier from './components/RealtimeNotifier';
import LandingPage from './pages/LandingPage';
import FleetPage from './pages/FleetPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import BookingFlow from './components/BookingFlow';
import SuccessPage from './pages/SuccessPage';
import DashboardPage from './pages/DashboardPage';
import OwnerDashboardNew from './components/OwnerDashboardNew';
import AdminDashboard from './components/admin/AdminDashboard';
import AuthPage from './pages/AuthPage';
import DatabaseSchemaPage from './pages/DatabaseSchemaPage';
import TermsPage from './pages/TermsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import RoleGuard from './components/RoleGuard';
import { canAccessRoute } from './lib/auth';

function App() {
  const { currentPage, currentUser } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  const renderPage = () => {
    // Route protection - check access before rendering
    if (currentPage !== 'auth' && currentPage !== 'unauthorized' && currentPage !== 'home' && currentPage !== 'fleet' && currentPage !== 'terms' && currentPage !== 'database') {
      if (!canAccessRoute(`/${currentPage}`)) {
        return <UnauthorizedPage />;
      }
    }

    switch (currentPage) {
      case 'home':
        return <LandingPage />;
      case 'fleet':
        return <FleetPage />;
      case 'vehicle-detail':
        return <VehicleDetailPage />;
      case 'booking':
        return <BookingFlow />;
      case 'success':
        return <SuccessPage />;
      case 'dashboard':
        // Use RoleGuard for role-based access
        if (currentUser?.role === 'admin') {
          return (
            <RoleGuard allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleGuard>
          );
        }
        if (currentUser?.role === 'owner') {
          return (
            <RoleGuard allowedRoles={['owner', 'admin']}>
              <OwnerDashboardNew />
            </RoleGuard>
          );
        }
        return (
          <RoleGuard allowedRoles={['individual', 'corporate', 'owner', 'admin']}>
            <DashboardPage />
          </RoleGuard>
        );
      case 'auth':
        return <AuthPage />;
      case 'database':
        return <DatabaseSchemaPage />;
      case 'terms':
        return <TermsPage />;
      case 'unauthorized':
        return <UnauthorizedPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <SocketProvider>
      <div className="min-h-screen bg-luxury-900 text-white overflow-x-hidden">
        <AnimatePresence>
          {isLoading && (
            <LoadingScreen onComplete={() => setIsLoading(false)} />
          )}
        </AnimatePresence>

        {!isLoading && (
          <>
            <Navbar />
            <AnimatePresence mode="wait">
              <motion.main
                key={currentPage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {renderPage()}
              </motion.main>
            </AnimatePresence>
            
            {/* Real-time Notification System */}
            <RealtimeNotifier />
            
            {/* Toast Notifications */}
            <Toaster 
              position="top-right" 
              theme="dark"
              toastOptions={{
                style: {
                  background: '#1a1a1a',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  color: '#fff',
                },
              }}
            />
          </>
        )}
      </div>
    </SocketProvider>
  );
}

export default App;
