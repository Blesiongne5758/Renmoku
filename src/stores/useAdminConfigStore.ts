import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FeatureConfig {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'payment' | 'analytics' | 'notification' | 'security' | 'ui';
  enabled: boolean;
  requiresRestart: boolean;
  lastModified: string;
  modifiedBy: string;
}

export interface AppConfig {
  // Core Features
  multiLanguage: boolean;
  pwa: boolean;
  realtimeNotifications: boolean;
  vehicle360View: boolean;
  
  // Payment Features
  cryptoPayment: boolean;
  fiatPayment: boolean;
  midtransPayment: boolean;
  dpSystem: boolean;
  
  // Analytics Features
  advancedAnalytics: boolean;
  aiInsights: boolean;
  revenueReports: boolean;
  exportDocuments: boolean;
  
  // Security Features
  twoFactorAuth: boolean;
  kycVerification: boolean;
  rateLimiting: boolean;
  auditLogging: boolean;
  
  // UI Features
  darkMode: boolean;
  animations: boolean;
  glassmorphism: boolean;
  neumorphism: boolean;
  
  // Notification Features
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  
  // Blockchain Features
  blockchainWallet: boolean;
  cryptoDistribution: boolean;
  nftIntegration: boolean;
  smartContracts: boolean;
}

interface AdminConfigState {
  config: AppConfig;
  featureFlags: FeatureConfig[];
  auditLog: Array<{
    id: string;
    action: string;
    feature: string;
    oldValue: boolean;
    newValue: boolean;
    modifiedBy: string;
    timestamp: string;
  }>;
  
  // Actions
  updateConfig: (key: keyof AppConfig, value: boolean) => void;
  toggleFeature: (featureId: string) => void;
  resetToDefaults: () => void;
  addAuditLog: (action: string, feature: string, oldValue: boolean, newValue: boolean, modifiedBy: string) => void;
  isFeatureEnabled: (featureId: string) => boolean;
}

const defaultConfig: AppConfig = {
  // Core
  multiLanguage: true,
  pwa: true,
  realtimeNotifications: true,
  vehicle360View: true,
  
  // Payment
  cryptoPayment: true,
  fiatPayment: true,
  midtransPayment: true,
  dpSystem: true,
  
  // Analytics
  advancedAnalytics: true,
  aiInsights: true,
  revenueReports: true,
  exportDocuments: true,
  
  // Security
  twoFactorAuth: false,
  kycVerification: true,
  rateLimiting: true,
  auditLogging: true,
  
  // UI
  darkMode: true,
  animations: true,
  glassmorphism: true,
  neumorphism: true,
  
  // Notifications
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  inAppNotifications: true,
  
  // Blockchain
  blockchainWallet: true,
  cryptoDistribution: true,
  nftIntegration: false,
  smartContracts: false,
};

const defaultFeatureFlags: FeatureConfig[] = [
  // Core Features
  {
    id: 'multi-language',
    name: 'Multi-language Support',
    description: 'Enable Indonesian and English language support',
    category: 'core',
    enabled: true,
    requiresRestart: false,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  {
    id: 'pwa',
    name: 'Progressive Web App',
    description: 'Enable PWA features (offline, installable)',
    category: 'core',
    enabled: true,
    requiresRestart: true,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  {
    id: 'realtime-notifications',
    name: 'Real-time Notifications',
    description: 'Enable Socket.io for live updates',
    category: 'notification',
    enabled: true,
    requiresRestart: true,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  {
    id: 'vehicle-360',
    name: '360° Vehicle View',
    description: 'Enable 360° vehicle showcase',
    category: 'ui',
    enabled: true,
    requiresRestart: false,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  
  // Payment Features
  {
    id: 'crypto-payment',
    name: 'Cryptocurrency Payment',
    description: 'Enable crypto wallet payments',
    category: 'payment',
    enabled: true,
    requiresRestart: false,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  {
    id: 'fiat-payment',
    name: 'Fiat Currency Payment',
    description: 'Enable traditional payment methods',
    category: 'payment',
    enabled: true,
    requiresRestart: false,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  {
    id: 'midtrans',
    name: 'Midtrans Integration',
    description: 'Enable Midtrans payment gateway',
    category: 'payment',
    enabled: true,
    requiresRestart: false,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  {
    id: 'dp-system',
    name: 'Down Payment System',
    description: 'Enable DP payment structure',
    category: 'payment',
    enabled: true,
    requiresRestart: false,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  
  // Analytics Features
  {
    id: 'advanced-analytics',
    name: 'Advanced Analytics',
    description: 'Enable advanced analytics dashboard',
    category: 'analytics',
    enabled: true,
    requiresRestart: false,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  {
    id: 'ai-insights',
    name: 'AI Insights',
    description: 'Enable AI-powered business insights',
    category: 'analytics',
    enabled: true,
    requiresRestart: false,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  {
    id: 'revenue-reports',
    name: 'Revenue Reports',
    description: 'Enable revenue reporting',
    category: 'analytics',
    enabled: true,
    requiresRestart: false,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  {
    id: 'export-documents',
    name: 'Document Export',
    description: 'Enable PDF/Excel/CSV export',
    category: 'analytics',
    enabled: true,
    requiresRestart: false,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  
  // Security Features
  {
    id: '2fa',
    name: 'Two-Factor Authentication',
    description: 'Enable 2FA for enhanced security',
    category: 'security',
    enabled: false,
    requiresRestart: false,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  {
    id: 'kyc',
    name: 'KYC Verification',
    description: 'Enable Know Your Customer verification',
    category: 'security',
    enabled: true,
    requiresRestart: false,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  {
    id: 'rate-limiting',
    name: 'Rate Limiting',
    description: 'Enable API rate limiting',
    category: 'security',
    enabled: true,
    requiresRestart: true,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  {
    id: 'audit-logging',
    name: 'Audit Logging',
    description: 'Enable comprehensive audit logs',
    category: 'security',
    enabled: true,
    requiresRestart: false,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  
  // UI Features
  {
    id: 'dark-mode',
    name: 'Dark Mode',
    description: 'Enable dark theme',
    category: 'ui',
    enabled: true,
    requiresRestart: false,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  {
    id: 'animations',
    name: 'Animations',
    description: 'Enable UI animations',
    category: 'ui',
    enabled: true,
    requiresRestart: false,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    description: 'Enable glassmorphism effects',
    category: 'ui',
    enabled: true,
    requiresRestart: false,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  {
    id: 'neumorphism',
    name: 'Neumorphism',
    description: 'Enable neumorphism effects',
    category: 'ui',
    enabled: true,
    requiresRestart: false,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  
  // Blockchain Features
  {
    id: 'blockchain-wallet',
    name: 'Blockchain Wallet',
    description: 'Enable crypto wallet integration',
    category: 'core',
    enabled: true,
    requiresRestart: true,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  {
    id: 'crypto-distribution',
    name: 'Crypto Distribution',
    description: 'Enable token distribution system',
    category: 'core',
    enabled: true,
    requiresRestart: false,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  {
    id: 'nft-integration',
    name: 'NFT Integration',
    description: 'Enable NFT vehicle ownership',
    category: 'core',
    enabled: false,
    requiresRestart: true,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
  {
    id: 'smart-contracts',
    name: 'Smart Contracts',
    description: 'Enable smart contract automation',
    category: 'core',
    enabled: false,
    requiresRestart: true,
    lastModified: new Date().toISOString(),
    modifiedBy: 'system',
  },
];

export const useAdminConfigStore = create<AdminConfigState>()(
  persist(
    (set, get) => ({
      config: defaultConfig,
      featureFlags: defaultFeatureFlags,
      auditLog: [],
      
      updateConfig: (key, value) => {
        const oldConfig = get().config;
        set((state) => ({
          config: { ...state.config, [key]: value },
        }));
        
        // Add audit log
        get().addAuditLog(
          'UPDATE_CONFIG',
          key,
          oldConfig[key],
          value,
          'admin'
        );
      },
      
      toggleFeature: (featureId) => {
        const feature = get().featureFlags.find(f => f.id === featureId);
        if (!feature) return;
        
        const oldValue = feature.enabled;
        const newValue = !oldValue;
        
        set((state) => ({
          featureFlags: state.featureFlags.map(f =>
            f.id === featureId
              ? {
                  ...f,
                  enabled: newValue,
                  lastModified: new Date().toISOString(),
                  modifiedBy: 'admin',
                }
              : f
          ),
        }));
        
        // Add audit log
        get().addAuditLog(
          'TOGGLE_FEATURE',
          featureId,
          oldValue,
          newValue,
          'admin'
        );
        
        // Update config if feature matches
        const configKey = featureId.replace(/-/g, '') as keyof AppConfig;
        if (configKey in get().config) {
          get().updateConfig(configKey, newValue);
        }
      },
      
      resetToDefaults: () => {
        set({
          config: defaultConfig,
          featureFlags: defaultFeatureFlags,
        });
        
        get().addAuditLog(
          'RESET_CONFIG',
          'all',
          true,
          true,
          'admin'
        );
      },
      
      addAuditLog: (action, feature, oldValue, newValue, modifiedBy) => {
        const logEntry = {
          id: `log-${Date.now()}`,
          action,
          feature,
          oldValue,
          newValue,
          modifiedBy,
          timestamp: new Date().toISOString(),
        };
        
        set((state) => ({
          auditLog: [logEntry, ...state.auditLog].slice(0, 100), // Keep last 100 entries
        }));
      },
      
      isFeatureEnabled: (featureId) => {
        const feature = get().featureFlags.find(f => f.id === featureId);
        return feature?.enabled ?? false;
      },
    }),
    {
      name: 'renmoku-admin-config',
    }
  )
);
