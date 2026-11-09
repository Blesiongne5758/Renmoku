import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Car, User, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../stores/useAppStore';
import NotificationBell from './NotificationBell';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation();
  const { currentPage, setCurrentPage, isMenuOpen, setMenuOpen, currentUser, isAuthenticated, logout } = useAppStore();

  const navItems = [
    { id: 'home', label: t('nav.home') },
    { id: 'fleet', label: t('nav.fleet') },
    { id: 'dashboard', label: t('nav.dashboard'), requireAuth: true },
  ];

  const filteredNavItems = navItems.filter(item => !item.requireAuth || isAuthenticated);
  const isLanding = currentPage === 'home';

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed left-0 right-0 top-0 z-50 transition-colors duration-300 ${isLanding ? 'border-b border-[#e9e5dc] bg-white/95 shadow-[0_4px_18px_rgba(42,37,26,0.035)] backdrop-blur-xl' : 'glass-subtle'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="group flex cursor-pointer items-center gap-3"
            onClick={() => setCurrentPage('home')}
          >
            <motion.div
              whileHover={{ rotate: 5 }}
              className={`flex h-10 w-10 items-center justify-center rounded-full ${isLanding ? 'bg-[#f3f0e9]' : 'neu-gold'}`}
            >
              <Car className={`h-5 w-5 ${isLanding ? 'text-[#9a7740]' : 'text-gold-400'}`} />
            </motion.div>
            <span className={`font-[Playfair_Display] text-xl font-semibold tracking-tight ${isLanding ? 'text-[#29271f]' : 'text-gold-gradient-soft'}`}>
              RENMOKU
            </span>
          </motion.div>

          {/* Desktop Nav - Neumorphic */}
          <div className={`hidden items-center gap-1 md:flex ${isLanding ? '' : 'rounded-2xl p-1.5 neu-soft'}`}>
            {filteredNavItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentPage(item.id)}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  isLanding
                    ? currentPage === item.id ? 'text-[#8a6b38]' : 'text-stone-600 hover:text-[#29271f]'
                    : currentPage === item.id ? 'text-gold-300 neu-raised' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {item.label}
                {currentPage === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute ${isLanding ? 'bottom-0 left-4 right-4 h-0.5 rounded-full bg-[#9a7740]' : 'inset-0 rounded-xl border border-gold-500/20 bg-gradient-to-br from-gold-500/10 to-gold-600/5'}`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher light={isLanding} />
            
            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-2">
                {/* Real-time Notification Bell */}
                <NotificationBell />
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentPage('dashboard')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 ${isLanding ? 'border border-[#e9e5dc] bg-white' : 'neu-raised'}`}
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
                  className={`rounded-xl px-5 py-2 text-sm font-medium transition-colors ${isLanding ? 'text-stone-600 hover:text-[#8a6b38]' : 'text-gray-300 hover:text-gold-300'}`}
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
                  className={isLanding ? 'rounded-full bg-[#29271f] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9a7740]' : 'btn-luxury text-sm'}
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
            className={`rounded-xl p-2.5 md:hidden ${isLanding ? 'text-stone-700 hover:bg-stone-100' : 'neu-soft text-gray-300'}`}
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
            className={`md:hidden overflow-hidden border-t ${isLanding ? 'border-[#e9e5dc] bg-white' : 'glass border-white/[0.03]'}`}
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
                  className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                    isLanding
                      ? currentPage === item.id ? 'bg-[#f7f5f0] text-[#8a6b38]' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                      : currentPage === item.id ? 'neu-raised text-gold-300' : 'text-gray-400 hover:bg-white/[0.02] hover:text-gray-200'
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
              
              <div className={`mt-3 space-y-2 border-t pt-3 ${isLanding ? 'border-[#eeeae2]' : 'border-white/[0.03]'}`}>
                {isAuthenticated && currentUser ? (
                  <>
                    <div className={`rounded-xl px-4 py-3 ${isLanding ? 'bg-[#f8f7f4]' : 'neu-pressed'}`}>
                      <p className="text-xs text-gray-500 mb-1">Login sebagai</p>
                      <p className={`text-sm font-medium ${isLanding ? 'text-[#8a6b38]' : 'text-gold-300'}`}>{currentUser.name}</p>
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
                      className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-medium ${isLanding ? 'text-stone-700 hover:bg-stone-50' : 'text-gray-300 neu-soft'}`}
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
                      className={isLanding ? 'block w-full rounded-full bg-[#29271f] py-3 text-center text-sm font-medium text-white' : 'block w-full text-center btn-luxury py-3 text-sm'}
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
