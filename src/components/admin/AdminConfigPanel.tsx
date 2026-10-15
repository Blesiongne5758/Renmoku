import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, ToggleLeft, ToggleRight, Save, RotateCcw, 
  Shield, CreditCard, BarChart3, Bell, Palette, Lock,
  CheckCircle, AlertCircle, History
} from 'lucide-react';
import { useAdminConfigStore } from '../../stores/useAdminConfigStore';

export default function AdminConfigPanel() {
  const { config, updateConfig, resetToDefaults } = useAdminConfigStore();
  const [activeCategory, setActiveCategory] = useState('core');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const categories = [
    { id: 'core', label: 'Core Features', icon: Settings, color: 'gold' },
    { id: 'payment', label: 'Payment', icon: CreditCard, color: 'green' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'blue' },
    { id: 'notification', label: 'Notifications', icon: Bell, color: 'purple' },
    { id: 'security', label: 'Security', icon: Shield, color: 'red' },
    { id: 'ui', label: 'UI/UX', icon: Palette, color: 'pink' },
    { id: 'blockchain', label: 'Blockchain', icon: Lock, color: 'orange' },
  ];

  const featureGroups = {
    core: [
      { key: 'multiLanguage', label: 'Multi-language Support', desc: 'Enable Indonesian & English' },
      { key: 'pwa', label: 'Progressive Web App', desc: 'Enable PWA features' },
      { key: 'realtimeNotifications', label: 'Real-time Notifications', desc: 'Socket.io integration' },
      { key: 'vehicle360View', label: '360° Vehicle View', desc: 'Virtual vehicle showcase' },
    ],
    payment: [
      { key: 'cryptoPayment', label: 'Cryptocurrency Payment', desc: 'Enable crypto wallet' },
      { key: 'fiatPayment', label: 'Fiat Currency Payment', desc: 'Bank transfer, CC, e-wallet' },
      { key: 'midtransPayment', label: 'Midtrans Integration', desc: 'Payment gateway' },
      { key: 'dpSystem', label: 'Down Payment System', desc: 'DP 30-50% structure' },
    ],
    analytics: [
      { key: 'advancedAnalytics', label: 'Advanced Analytics', desc: 'AI-powered insights' },
      { key: 'aiInsights', label: 'AI Insights', desc: 'Business recommendations' },
      { key: 'revenueReports', label: 'Revenue Reports', desc: 'Financial reporting' },
      { key: 'exportDocuments', label: 'Document Export', desc: 'PDF, Excel, CSV' },
    ],
    notification: [
      { key: 'emailNotifications', label: 'Email Notifications', desc: 'SMTP integration' },
      { key: 'smsNotifications', label: 'SMS Notifications', desc: 'SMS gateway' },
      { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push' },
      { key: 'inAppNotifications', label: 'In-App Notifications', desc: 'Real-time alerts' },
    ],
    security: [
      { key: 'twoFactorAuth', label: 'Two-Factor Auth', desc: '2FA security' },
      { key: 'kycVerification', label: 'KYC Verification', desc: 'Identity verification' },
      { key: 'rateLimiting', label: 'Rate Limiting', desc: 'API protection' },
      { key: 'auditLogging', label: 'Audit Logging', desc: 'Activity tracking' },
    ],
    ui: [
      { key: 'darkMode', label: 'Dark Mode', desc: 'Dark theme' },
      { key: 'animations', label: 'Animations', desc: 'UI animations' },
      { key: 'glassmorphism', label: 'Glassmorphism', desc: 'Glass effects' },
      { key: 'neumorphism', label: 'Neumorphism', desc: 'Soft UI effects' },
    ],
    blockchain: [
      { key: 'blockchainWallet', label: 'Blockchain Wallet', desc: 'Crypto wallet integration' },
      { key: 'cryptoDistribution', label: 'Crypto Distribution', desc: 'Token distribution' },
      { key: 'nftIntegration', label: 'NFT Integration', desc: 'NFT vehicle ownership' },
      { key: 'smartContracts', label: 'Smart Contracts', desc: 'Automated contracts' },
    ],
  };

  const handleToggle = (key: string) => {
    updateConfig(key as keyof typeof config, !config[key as keyof typeof config]);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleReset = () => {
    resetToDefaults();
    setShowResetConfirm(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const currentFeatures = featureGroups[activeCategory as keyof typeof featureGroups];

  return (
    <div className="min-h-screen bg-luxury-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Settings className="w-8 h-8 text-gold-400" />
                Admin Configuration
              </h1>
              <p className="text-gray-400 mt-2">
                Kelola semua fitur dan pengaturan aplikasi
              </p>
            </div>
            <div className="flex items-center gap-3">
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">Saved!</span>
                </motion.div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Defaults
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeCategory === category.id
                  ? 'neu-gold text-gold-300'
                  : 'neu-soft text-gray-400 hover:text-white'
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{category.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentFeatures.map((feature, idx) => {
            const isEnabled = config[feature.key as keyof typeof config];
            
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card-luxury p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{feature.label}</h3>
                    <p className="text-sm text-gray-400">{feature.desc}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleToggle(feature.key)}
                    className={`flex-shrink-0 ${
                      isEnabled ? 'text-emerald-400' : 'text-gray-500'
                    }`}
                  >
                    {isEnabled ? (
                      <ToggleRight className="w-12 h-12" />
                    ) : (
                      <ToggleLeft className="w-12 h-12" />
                    )}
                  </motion.button>
                </div>
                
                {/* Status Indicator */}
                <div className="mt-4 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    isEnabled ? 'bg-emerald-400' : 'bg-gray-500'
                  }`} />
                  <span className={`text-xs ${
                    isEnabled ? 'text-emerald-400' : 'text-gray-500'
                  }`}>
                    {isEnabled ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Audit Log Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-luxury p-6 mt-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <History className="w-5 h-5 text-gold-400" />
            <h2 className="text-xl font-semibold text-white">Recent Changes</h2>
          </div>
          
          <div className="space-y-2">
            {useAdminConfigStore.getState().auditLog.slice(0, 5).map((log, idx) => (
              <div
                key={log.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
              >
                <div className={`w-2 h-2 rounded-full ${
                  log.newValue ? 'bg-emerald-400' : 'bg-red-400'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-white">
                    {log.action}: <span className="text-gold-400">{log.feature}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {log.oldValue ? 'Enabled' : 'Disabled'} → {log.newValue ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="card-luxury p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <h3 className="text-xl font-semibold text-white">Reset Configuration?</h3>
              </div>
              <p className="text-gray-400 mb-6">
                This will reset all settings to default values. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 btn-ghost py-3"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 btn-luxury py-3"
                >
                  Reset All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
