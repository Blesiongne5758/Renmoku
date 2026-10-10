import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAppStore } from './stores/useAppStore';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import LandingPage from './pages/LandingPage';
import FleetPage from './pages/FleetPage';
import BookingFlow from './components/BookingFlow';
import DashboardPage from './pages/DashboardPage';
import AuthPage from './pages/AuthPage';
import DatabaseSchemaPage from './pages/DatabaseSchemaPage';

function App() {
  const { currentPage } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <LandingPage />;
      case 'fleet':
        return <FleetPage />;
      case 'booking':
        return <BookingFlow />;
      case 'dashboard':
        return <DashboardPage />;
      case 'auth':
        return <AuthPage />;
      case 'database':
        return <DatabaseSchemaPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
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
  );
}

export default App;
