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

import { useState } from 'react';
import { useAppStore } from './stores/useAppStore';
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
      default:
        return <LandingPage />;
    }
  };

  return (
    <SocketProvider>
      <div className="min-h-screen bg-luxury-900 text-white overflow-x-hidden">
        <LoadingScreen onComplete={() => setIsLoading(false)} />

        {!isLoading && (
          <>
            <Navbar />
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
