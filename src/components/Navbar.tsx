import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Car, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

export default function Navbar() {
  const { currentPage, setCurrentPage, isMenuOpen, setMenuOpen, currentUser, isAuthenticated, logout } = useAppStore();

  const navItems = [
    { id: 'home', label: 'Beranda' },
    { id: 'fleet', label: 'Armada' },
    { id: 'dashboard', label: 'Dashboard', requireAuth: true },
    { id: 'database', label: 'Database' },
  ];

  const filteredNavItems = navItems.filter(item => !item.requireAuth || isAuthenticated);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setCurrentPage('home')}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center">
              <Car className="w-6 h-6 text-luxury-900" />
            </div>
            <span className="font-[Playfair_Display] text-xl font-bold text-gold-gradient">
              RENMOKU
            </span>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {filteredNavItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentPage === item.id
                    ? 'bg-gold-500/10 text-gold-400 border border-gold-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </motion.button>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setCurrentPage('dashboard')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500/10 border border-gold-500/20"
                >
                  <User className="w-4 h-4 text-gold-400" />
                  <span className="text-sm text-gold-300 max-w-[120px] truncate">{currentUser.name}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => { logout(); setCurrentPage('home'); }}
                  className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-500/20 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    useAppStore.getState().setAuthMode('login');
                    setCurrentPage('auth');
                  }}
                  className="px-4 py-2 rounded-lg border border-gold-500/30 text-gold-300 text-sm font-medium hover:bg-gold-500/5 transition-all"
                >
                  Masuk
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    useAppStore.getState().setAuthMode('register');
                    setCurrentPage('auth');
                  }}
                  className="btn-luxury text-sm"
                >
                  Daftar
                </motion.button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-gold-500/10"
          >
            <div className="px-4 py-4 space-y-2">
              {filteredNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    currentPage === item.id
                      ? 'bg-gold-500/10 text-gold-400'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {/* Auth buttons for mobile */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                {isAuthenticated && currentUser ? (
                  <>
                    <div className="px-4 py-2 rounded-lg bg-gold-500/10 border border-gold-500/20">
                      <p className="text-xs text-gray-500">Login sebagai</p>
                      <p className="text-sm text-gold-300 font-medium">{currentUser.name}</p>
                    </div>
                    <button
                      onClick={() => { logout(); setCurrentPage('home'); setMenuOpen(false); }}
                      className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/5"
                    >
                      Keluar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        useAppStore.getState().setAuthMode('login');
                        setCurrentPage('auth');
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gold-300 border border-gold-500/30 hover:bg-gold-500/5"
                    >
                      Masuk
                    </button>
                    <button
                      onClick={() => {
                        useAppStore.getState().setAuthMode('register');
                        setCurrentPage('auth');
                        setMenuOpen(false);
                      }}
                      className="block w-full text-center btn-luxury py-3 text-sm"
                    >
                      Daftar Sekarang
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
