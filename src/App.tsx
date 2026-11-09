import { Toaster } from 'sonner';
import { SocketProvider } from './components/SocketProvider';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import RealtimeNotifier from './components/RealtimeNotifier';

// Pages
import LandingPage from './pages/LandingPage';
import FleetPage from './pages/FleetPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import BookingFlow from './components/BookingFlow';
import SuccessPage from './pages/SuccessPage';
import DashboardPage from './pages/DashboardPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AuthPage from './pages/AuthPage';
import DatabaseSchemaPage from './pages/DatabaseSchemaPage';
import TermsPage from './pages/TermsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailedPage from './pages/PaymentFailedPage';
import AdminGPSSettings from './pages/admin/AdminGPSSettings';
import VehicleMonitoring from './pages/owner/VehicleMonitoring';

import { useEffect, useState } from 'react';
import { useAppStore } from './stores/useAppStore';
import { canAccessRoute } from './lib/auth';

function App() {
  const { currentPage, currentUser, restoreSession } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const isPublicHome = currentPage === 'home';

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

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
        // Route to appropriate dashboard based on user role
        if (currentUser?.role === 'admin') {
          return <AdminDashboardPage />;
        }
        if (currentUser?.role === 'owner') {
          return <OwnerDashboardPage />;
        }
        return <DashboardPage />;
      case 'auth':
        return <AuthPage />;
      case 'database':
        return <DatabaseSchemaPage />;
      case 'terms':
        return <TermsPage />;
      case 'unauthorized':
        return <UnauthorizedPage />;
      case 'payment-success':
        return <PaymentSuccessPage />;
      case 'payment-failed':
        return <PaymentFailedPage />;
      case 'admin-gps-settings':
        return <AdminGPSSettings />;
      case 'vehicle-monitoring':
        // Get vehicle info from store or use default
        const vehicleId = useAppStore.getState().selectedVehicle?.id || 'vehicle-1';
        const vehicleName = useAppStore.getState().selectedVehicle?.name || 'Toyota Alphard';
        return <VehicleMonitoring vehicleId={vehicleId} vehicleName={vehicleName} />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <SocketProvider>
      <div className={`min-h-screen overflow-x-hidden ${isPublicHome ? 'bg-[#fbfaf8] text-[#29271f]' : 'bg-luxury-900 text-white'}`}>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

        {!isLoading && (
          <>
            <Navbar />
            {renderPage()}
            
            {/* Real-time Notification System */}
            <RealtimeNotifier />
            
            {/* Toast Notifications */}
            <Toaster 
              position="top-right" 
              theme={isPublicHome ? 'light' : 'dark'}
              toastOptions={{
                style: {
                  background: isPublicHome ? '#fff' : '#1a1a1a',
                  border: isPublicHome ? '1px solid #e9e5dc' : '1px solid rgba(212, 175, 55, 0.2)',
                  color: isPublicHome ? '#29271f' : '#fff',
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
