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
import AdminVehicleReviewPage from './pages/admin/AdminVehicleReviewPage';
import SingleVehicleLiveMapPage from './pages/owner/SingleVehicleLiveMapPage';

import { useEffect, useState } from 'react';
import { useAppStore } from './stores/useAppStore';
import { canAccessRoute } from './lib/auth';

function App() {
  const { currentPage, currentUser, restoreSession } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const isDashboardShell = currentPage === 'dashboard' || currentPage === 'admin-gps-settings' || currentPage === 'admin-vehicle-review' || currentPage === 'vehicle-monitoring' || currentPage === 'vehicle-live-map';

  useEffect(() => {
    void restoreSession();
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const pageParam = urlParams.get('page');
      if (pageParam === 'vehicle-live-map') {
        useAppStore.getState().setCurrentPage('vehicle-live-map');
      }
    } catch {
      // ignore
    }
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
      case 'admin-vehicle-review':
        return <AdminVehicleReviewPage />;
      case 'vehicle-live-map': {
        const urlParams = new URLSearchParams(window.location.search);
        const targetVehicleId = urlParams.get('id') || urlParams.get('vehicleId') || useAppStore.getState().selectedVehicle?.id || 'vehicle-1';
        const targetVehicleName = useAppStore.getState().selectedVehicle?.name || 'Kendaraan Armada';
        return (
          <SingleVehicleLiveMapPage
            vehicleId={targetVehicleId}
            vehicleName={targetVehicleName}
            onBack={() => {
              useAppStore.getState().setCurrentPage('dashboard');
              useAppStore.getState().setOwnerSection('gps');
            }}
          />
        );
      }
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
      <div className="min-h-screen overflow-x-hidden bg-luxury-900 text-white">
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

        {!isLoading && (
          <>
            {!isDashboardShell && <Navbar />}
            {renderPage()}
            
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
