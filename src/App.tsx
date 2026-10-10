import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAppStore } from './stores/useAppStore';
import { SocketProvider } from './components/SocketProvider';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
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

function App() {
  const { currentPage, currentUser } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  const renderPage = () => {
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
        // Check user role for appropriate dashboard
        if (currentUser?.role === 'owner') {
          return <OwnerDashboardNew />;
        }
        if (currentUser?.role === 'admin') {
          return <AdminDashboard />;
        }
        return <DashboardPage />;
      case 'auth':
        return <AuthPage />;
      case 'database':
        return <DatabaseSchemaPage />;
      case 'terms':
        return <TermsPage />;
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
          </>
        )}
      </div>
    </SocketProvider>
  );
}

export default App;
