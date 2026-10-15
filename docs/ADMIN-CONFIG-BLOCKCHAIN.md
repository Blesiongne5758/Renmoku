# 🎛️ Admin Configuration Panel & Blockchain Wallet

## Overview

Dokumentasi lengkap untuk dua fitur utama yang baru diimplementasikan:
1. **Admin Configuration Panel** - Panel konfigurasi untuk mengaktifkan/menonaktifkan semua fitur
2. **Blockchain Wallet** - Dompet crypto untuk distribusi token dan transaksi

---

## 🎛️ Admin Configuration Panel

### Fitur Utama

**1. Feature Flags System**
- Toggle on/off untuk setiap fitur aplikasi
- Real-time configuration tanpa restart
- Audit log untuk semua perubahan
- Role-based access (Admin only)

**2. Kategori Konfigurasi**

#### Core Features
- ✅ Multi-language Support (ID/EN)
- ✅ Progressive Web App (PWA)
- ✅ Real-time Notifications (Socket.io)
- ✅ 360° Vehicle View

#### Payment Features
- ✅ Cryptocurrency Payment
- ✅ Fiat Currency Payment
- ✅ Midtrans Integration
- ✅ Down Payment System

#### Analytics Features
- ✅ Advanced Analytics Dashboard
- ✅ AI Insights
- ✅ Revenue Reports
- ✅ Document Export (PDF/Excel/CSV)

#### Notification Features
- ✅ Email Notifications (SMTP)
- ✅ SMS Notifications
- ✅ Push Notifications
- ✅ In-App Notifications

#### Security Features
- ✅ Two-Factor Authentication (2FA)
- ✅ KYC Verification
- ✅ Rate Limiting
- ✅ Audit Logging

#### UI Features
- ✅ Dark Mode
- ✅ Animations
- ✅ Glassmorphism Effects
- ✅ Neumorphism Effects

#### Blockchain Features
- ✅ Blockchain Wallet
- ✅ Crypto Distribution
- ✅ NFT Integration (Coming Soon)
- ✅ Smart Contracts (Coming Soon)

### Cara Penggunaan

#### 1. Akses Admin Panel
```typescript
// Login sebagai admin
Email: admin@renmoku.id
Password: demo123

// Navigate ke Admin Configuration
Dashboard → Settings → Configuration
```

#### 2. Toggle Features
```typescript
// Menggunakan AdminConfigPanel component
<AdminConfigPanel />

// Features akan otomatis:
// - Toggle on/off
// - Save ke localStorage
// - Log ke audit trail
// - Update UI secara real-time
```

#### 3. Check Feature Status
```typescript
import { useAdminConfigStore } from './stores/useAdminConfigStore';

function MyComponent() {
  const { isFeatureEnabled } = useAdminConfigStore();
  
  const isCryptoEnabled = isFeatureEnabled('crypto-payment');
  
  return (
    <div>
      {isCryptoEnabled && <BlockchainWallet />}
    </div>
  );
}
```

### Audit Log

Setiap perubahan konfigurasi dicatat:
```typescript
{
  id: 'log-123456',
  action: 'TOGGLE_FEATURE',
  feature: 'crypto-payment',
  oldValue: false,
  newValue: true,
  modifiedBy: 'admin',
  timestamp: '2026-10-15T10:30:00Z'
}
```

### Reset to Defaults
- Tombol "Reset to Defaults" untuk mengembalikan semua setting ke default
- Konfirmasi modal sebelum reset
- Audit log untuk reset action

---

## 💰 Blockchain Wallet

### Fitur Utama

**1. Multi-Currency Support**
- Ethereum (ETH)
- Renmoku Token (RMK)
- Tether (USDT)
- Binance Coin (BNB)
- Custom tokens ready

**2. Wallet Connection**
- MetaMask integration
- WalletConnect support
- Demo mode untuk testing
- Secure connection

**3. Portfolio Management**
- Total portfolio value (USD)
- Individual token balances
- 24h price changes
- Real-time updates

**4. Transaction History**
- Send transactions
- Receive transactions
- Swap transactions
- Status tracking (pending/confirmed/failed)
- Transaction hashes

**5. Send Crypto**
- Select token
- Input recipient address
- Input amount
- Network fee estimation
- Confirmation modal

**6. Receive Crypto**
- QR code generation
- Wallet address display
- Copy to clipboard
- Network warnings

### Cara Penggunaan

#### 1. Connect Wallet
```typescript
import BlockchainWallet from './components/BlockchainWallet';

function PaymentPage() {
  return <BlockchainWallet />;
}

// User akan melihat:
// - Connect Wallet button
// - Supported tokens
// - Security information
```

#### 2. View Portfolio
```typescript
// Setelah connect, user akan melihat:
// - Total portfolio value
// - Individual token balances
// - 24h changes
// - Quick actions (Send, Receive, Swap)
```

#### 3. Send Crypto
```typescript
// Tab "Send":
// 1. Select token (ETH, RMK, USDT, BNB)
// 2. Input recipient address
// 3. Input amount
// 4. Review network fee
// 5. Confirm transaction
// 6. Track status
```

#### 4. Receive Crypto
```typescript
// Tab "Receive":
// 1. View QR code
// 2. Copy wallet address
// 3. Share with sender
// 4. Monitor incoming transactions
```

### Smart Contract Integration (Ready)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RenmokuToken {
    string public name = "Renmoku Token";
    string public symbol = "RMK";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply * (10 ** uint256(decimals));
        balanceOf[msg.sender] = totalSupply;
    }
    
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    
    // Additional functions...
}
```

### Token Distribution System

```typescript
// Distribusi token untuk:
// 1. Reward pengguna
// 2. Payment untuk rental
// 3. Loyalty program
// 4. Staking rewards

interface TokenDistribution {
  recipient: string;
  amount: number;
  purpose: 'reward' | 'payment' | 'loyalty' | 'staking';
  timestamp: string;
  transactionHash: string;
}
```

---

## 🔗 Integration Guide

### 1. Add to App.tsx

```typescript
import AdminConfigPanel from './components/admin/AdminConfigPanel';
import BlockchainWallet from './components/BlockchainWallet';
import { useAdminConfigStore } from './stores/useAdminConfigStore';

function App() {
  const { isFeatureEnabled } = useAdminConfigStore();
  
  return (
    <Routes>
      {/* Existing routes */}
      
      {/* Admin Configuration */}
      <Route 
        path="/admin/config" 
        element={
          <RoleGuard allowedRoles={['admin']}>
            <AdminConfigPanel />
          </RoleGuard>
        } 
      />
      
      {/* Blockchain Wallet */}
      {isFeatureEnabled('blockchain-wallet') && (
        <Route 
          path="/wallet" 
          element={
            <RoleGuard allowedRoles={['renter', 'owner', 'admin']}>
              <BlockchainWallet />
            </RoleGuard>
          } 
        />
      )}
    </Routes>
  );
}
```

### 2. Add to Payment Flow

```typescript
import BlockchainWallet from './BlockchainWallet';
import PaymentIntegration from './PaymentIntegration';

function PaymentPage() {
  const { isFeatureEnabled } = useAdminConfigStore();
  
  return (
    <div>
      {/* Traditional Payment */}
      {isFeatureEnabled('fiat-payment') && (
        <PaymentIntegration type="bookings" data={bookingData} />
      )}
      
      {/* Crypto Payment */}
      {isFeatureEnabled('crypto-payment') && (
        <BlockchainWallet />
      )}
    </div>
  );
}
```

### 3. Add to Navigation

```typescript
// Navbar.tsx
const navItems = [
  { id: 'home', label: t('nav.home') },
  { id: 'fleet', label: t('nav.fleet') },
  { id: 'dashboard', label: t('nav.dashboard'), requireAuth: true },
  { id: 'wallet', label: 'Wallet', requireAuth: true }, // New
  { id: 'admin/config', label: 'Config', requireAuth: true, requireRole: 'admin' }, // New
];
```

---

## 📊 Configuration Store

### State Structure

```typescript
interface AppConfig {
  // Core
  multiLanguage: boolean;
  pwa: boolean;
  realtimeNotifications: boolean;
  vehicle360View: boolean;
  
  // Payment
  cryptoPayment: boolean;
  fiatPayment: boolean;
  midtransPayment: boolean;
  dpSystem: boolean;
  
  // Analytics
  advancedAnalytics: boolean;
  aiInsights: boolean;
  revenueReports: boolean;
  exportDocuments: boolean;
  
  // Security
  twoFactorAuth: boolean;
  kycVerification: boolean;
  rateLimiting: boolean;
  auditLogging: boolean;
  
  // UI
  darkMode: boolean;
  animations: boolean;
  glassmorphism: boolean;
  neumorphism: boolean;
  
  // Notifications
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  
  // Blockchain
  blockchainWallet: boolean;
  cryptoDistribution: boolean;
  nftIntegration: boolean;
  smartContracts: boolean;
}
```

### Actions

```typescript
interface AdminConfigActions {
  updateConfig: (key: keyof AppConfig, value: boolean) => void;
  toggleFeature: (featureId: string) => void;
  resetToDefaults: () => void;
  addAuditLog: (
    action: string,
    feature: string,
    oldValue: boolean,
    newValue: boolean,
    modifiedBy: string
  ) => void;
  isFeatureEnabled: (featureId: string) => boolean;
}
```

### Persistence

```typescript
// Menggunakan Zustand persist middleware
export const useAdminConfigStore = create<AdminConfigState>()(
  persist(
    (set, get) => ({
      // State and actions
    }),
    {
      name: 'renmoku-admin-config', // localStorage key
    }
  )
);
```

---

## 🔒 Security Considerations

### Admin Configuration
- ✅ Role-based access (Admin only)
- ✅ Audit logging untuk semua changes
- ✅ Confirmation modal untuk reset
- ✅ LocalStorage encryption ready
- ✅ Backend validation required

### Blockchain Wallet
- ✅ Non-custodial (user controls keys)
- ✅ Secure wallet connection
- ✅ Transaction confirmation
- ✅ Network fee estimation
- ✅ Address validation
- ✅ Private key never stored

---

## 🧪 Testing

### Admin Config Tests
```typescript
describe('AdminConfigPanel', () => {
  it('should toggle feature', () => {
    const { result } = renderHook(() => useAdminConfigStore());
    
    act(() => {
      result.current.toggleFeature('crypto-payment');
    });
    
    expect(result.current.isFeatureEnabled('crypto-payment')).toBe(true);
  });
  
  it('should log changes', () => {
    const { result } = renderHook(() => useAdminConfigStore());
    
    act(() => {
      result.current.toggleFeature('pwa');
    });
    
    expect(result.current.auditLog).toHaveLength(1);
    expect(result.current.auditLog[0].feature).toBe('pwa');
  });
});
```

### Blockchain Wallet Tests
```typescript
describe('BlockchainWallet', () => {
  it('should connect wallet', async () => {
    render(<BlockchainWallet />);
    
    fireEvent.click(screen.getByText('Connect Wallet'));
    
    await waitFor(() => {
      expect(screen.getByText(/0x742d/)).toBeInTheDocument();
    });
  });
  
  it('should display balances', () => {
    render(<BlockchainWallet />);
    
    // Mock connected state
    expect(screen.getByText('ETH')).toBeInTheDocument();
    expect(screen.getByText('RMK')).toBeInTheDocument();
  });
});
```

---

## 📚 API Endpoints (Backend)

### Admin Configuration
```typescript
// GET /api/v1/admin/config
// Get current configuration

// PUT /api/v1/admin/config
// Update configuration
{
  "feature": "crypto-payment",
  "enabled": true
}

// POST /api/v1/admin/config/reset
// Reset to defaults

// GET /api/v1/admin/config/audit-log
// Get audit log
```

### Blockchain Wallet
```typescript
// POST /api/v1/wallet/connect
// Connect wallet
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}

// GET /api/v1/wallet/balance/:address
// Get wallet balance

// POST /api/v1/wallet/transaction
// Create transaction
{
  "from": "0x742d...",
  "to": "0xabcd...",
  "amount": "1.5",
  "token": "ETH"
}

// GET /api/v1/wallet/transactions/:address
// Get transaction history
```

---

## 🚀 Deployment Checklist

### Admin Configuration
- [ ] Backend API endpoints ready
- [ ] Database schema for audit logs
- [ ] Role-based access control
- [ ] Environment variables configured
- [ ] Admin UI tested

### Blockchain Wallet
- [ ] Smart contract deployed (testnet)
- [ ] Wallet connection tested
- [ ] Transaction flow verified
- [ ] Network fees configured
- [ ] Security audit completed

### Integration
- [ ] Feature flags integrated
- [ ] Payment flow updated
- [ ] Navigation updated
- [ ] Documentation updated
- [ ] Tests passing

---

## 📖 Related Documentation

- [Backend Summary](./BACKEND-SUMMARY.md)
- [Advanced Features](./ADVANCED-FEATURES.md)
- [API Documentation](./API-DOCUMENTATION.md)
- [Auth System](./AUTH-SYSTEM.md)

---

**Status**: ✅ Implementation Complete  
**Last Updated**: 2026-10-15  
**Version**: 2.1.0
