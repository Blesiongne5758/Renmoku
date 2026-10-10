import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Car, User, LogOut } from 'lucide-react';
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
      className="fixed top-0 left-0 right-0 z-50 glass-subtle"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentPage('home')}
          >
            <motion.div
              whileHover={{ rotate: 5 }}
              className="w-10 h-10 rounded-xl neu-gold flex items-center justify-center"
            >
              <Car className="w-5 h-5 text-gold-400" />
            </motion.div>
            <span className="font-[Playfair_Display] text-xl font-semibold text-gold-gradient-soft tracking-tight">
              RENMOKU
            </span>
          </motion.div>

          {/* Desktop Nav - Neumorphic */}
          <div className="hidden md:flex items-center gap-2 p-1.5 rounded-2xl neu-soft">
            {filteredNavItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentPage(item.id)}
                className={`relative px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  currentPage === item.id
                    ? 'text-gold-300 neu-raised'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {item.label}
                {currentPage === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold-500/10 to-gold-600/5 border border-gold-500/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentPage('dashboard')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl neu-raised"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-luxury-900" />
                  </div>
                  <span className="text-sm text-gray-200 font-medium max-w-[120px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { logout(); setCurrentPage('home'); }}
                  className="p-2.5 rounded-xl neu-soft text-gray-400 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    useAppStore.getState().setAuthMode('login');
                    setCurrentPage('auth');
                  }}
                  className="px-5 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-gold-300 transition-colors"
                >
                  Masuk
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
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
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="md:hidden p-2.5 rounded-xl neu-soft text-gray-300"
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden glass border-t border-white/[0.03] overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {filteredNavItems.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    currentPage === item.id
                      ? 'neu-raised text-gold-300'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]'
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
              
              <div className="pt-3 mt-3 border-t border-white/[0.03] space-y-2">
                {isAuthenticated && currentUser ? (
                  <>
                    <div className="px-4 py-3 rounded-xl neu-pressed">
                      <p className="text-xs text-gray-500 mb-1">Login sebagai</p>
                      <p className="text-sm text-gold-300 font-medium">{currentUser.name}</p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { logout(); setCurrentPage('home'); setMenuOpen(false); }}
                      className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/5 transition-colors"
                    >
                      Keluar
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        useAppStore.getState().setAuthMode('login');
                        setCurrentPage('auth');
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-gray-300 neu-soft"
                    >
                      Masuk
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        useAppStore.getState().setAuthMode('register');
                        setCurrentPage('auth');
                        setMenuOpen(false);
                      }}
                      className="block w-full text-center btn-luxury py-3 text-sm"
                    >
                      Daftar Sekarang
                    </motion.button>
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
