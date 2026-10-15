import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, Send, Download, RefreshCw, Copy, Check, 
  TrendingUp, TrendingDown, AlertCircle, Shield,
  ExternalLink, QrCode, ArrowRightLeft
} from 'lucide-react';
import { ethers } from 'ethers';

interface CryptoBalance {
  symbol: string;
  name: string;
  balance: string;
  usdValue: string;
  icon: string;
  change24h: number;
}

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap';
  amount: string;
  symbol: string;
  from: string;
  to: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
  hash: string;
}

export default function BlockchainWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balances, setBalances] = useState<CryptoBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'assets' | 'transactions' | 'send' | 'receive'>('assets');
  const [copied, setCopied] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [selectedToken, setSelectedToken] = useState('ETH');

  // Mock data - In production, connect to real blockchain
  useEffect(() => {
    if (isConnected) {
      // Mock balances
      setBalances([
        {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: '2.4583',
          usdValue: '8,234.52',
          icon: '⟠',
          change24h: 5.2,
        },
        {
          symbol: 'RMK',
          name: 'Renmoku Token',
          balance: '15,420.00',
          usdValue: '3,084.00',
          icon: '🚗',
          change24h: 12.8,
        },
        {
          symbol: 'USDT',
          name: 'Tether',
          balance: '5,000.00',
          usdValue: '5,000.00',
          icon: '💵',
          change24h: 0.01,
        },
        {
          symbol: 'BNB',
          name: 'Binance Coin',
          balance: '8.234',
          usdValue: '4,123.45',
          icon: '🔶',
          change24h: -2.3,
        },
      ]);

      // Mock transactions
      setTransactions([
        {
          id: 'tx1',
          type: 'receive',
          amount: '1.5',
          symbol: 'ETH',
          from: '0x1234...5678',
          to: walletAddress || '0xabcd...efgh',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'confirmed',
          hash: '0x1234567890abcdef',
        },
        {
          id: 'tx2',
          type: 'send',
          amount: '500',
          symbol: 'RMK',
          from: walletAddress || '0xabcd...efgh',
          to: '0x9876...5432',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'confirmed',
          hash: '0xfedcba0987654321',
        },
        {
          id: 'tx3',
          type: 'swap',
          amount: '0.5',
          symbol: 'ETH',
          from: 'ETH',
          to: 'RMK',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: 'confirmed',
          hash: '0xabcdef1234567890',
        },
      ]);
    }
  }, [isConnected, walletAddress]);

  const connectWallet = async () => {
    try {
      // Mock wallet connection - In production, use Web3Modal/Wagmi
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      } else {
        // Demo mode
        setWalletAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
    setBalances([]);
    setTransactions([]);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    if (!sendAmount || !sendAddress) return;
    
    // Mock transaction - In production, use ethers.js
    const newTx: Transaction = {
      id: `tx${Date.now()}`,
      type: 'send',
      amount: sendAmount,
      symbol: selectedToken,
      from: walletAddress,
      to: sendAddress,
      timestamp: new Date().toISOString(),
      status: 'pending',
      hash: `0x${Math.random().toString(16).slice(2)}`,
    };
    
    setTransactions([newTx, ...transactions]);
    setSendAmount('');
    setSendAddress('');
    
    // Simulate confirmation
    setTimeout(() => {
      setTransactions(transactions.map(tx => 
        tx.id === newTx.id ? { ...tx, status: 'confirmed' } : tx
      ));
    }, 3000);
  };

  const totalPortfolioValue = balances.reduce((sum, b) => {
    return sum + parseFloat(b.usdValue.replace(/,/g, ''));
  }, 0);

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-luxury-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-luxury p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-luxury-900" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            Blockchain Wallet
          </h2>
          <p className="text-gray-400 mb-6">
            Connect your wallet to manage crypto assets and transactions
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={connectWallet}
            className="w-full btn-luxury py-4 flex items-center justify-center gap-2"
          >
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </motion.button>

          <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm text-blue-300 font-medium mb-1">Secure Connection</p>
                <p className="text-xs text-gray-400">
                  Your wallet is secured with industry-standard encryption. We never store your private keys.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { icon: '⟠', label: 'ETH' },
              { icon: '🚗', label: 'RMK' },
              { icon: '💵', label: 'USDT' },
            ].map((token) => (
              <div key={token.label} className="p-3 rounded-xl neu-soft text-center">
                <div className="text-2xl mb-1">{token.icon}</div>
                <div className="text-xs text-gray-400">{token.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Wallet className="w-8 h-8 text-gold-400" />
                Blockchain Wallet
              </h1>
              <p className="text-gray-400 mt-2">
                Manage your crypto assets and transactions
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl neu-soft">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-white font-mono">
                  {shortenAddress(walletAddress)}
                </span>
                <button
                  onClick={copyAddress}
                  className="p-1 hover:bg-white/5 rounded transition"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={disconnectWallet}
                className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition"
              >
                Disconnect
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Portfolio Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-luxury p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Portfolio Value</p>
              <p className="text-4xl font-bold text-gold-gradient">
                ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">+8.5%</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveTab('send')}
              className="flex items-center justify-center gap-2 p-3 rounded-xl neu-soft hover:neu-gold transition"
            >
              <Send className="w-5 h-5 text-gold-400" />
              <span className="text-sm text-white">Send</span>
            </button>
            <button
              onClick={() => setActiveTab('receive')}
              className="flex items-center justify-center gap-2 p-3 rounded-xl neu-soft hover:neu-gold transition"
            >
              <Download className="w-5 h-5 text-gold-400" />
              <span className="text-sm text-white">Receive</span>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className="flex items-center justify-center gap-2 p-3 rounded-xl neu-soft hover:neu-gold transition"
            >
              <ArrowRightLeft className="w-5 h-5 text-gold-400" />
              <span className="text-sm text-white">Swap</span>
            </button>
            <button
              className="flex items-center justify-center gap-2 p-3 rounded-xl neu-soft hover:neu-gold transition"
            >
              <RefreshCw className="w-5 h-5 text-gold-400" />
              <span className="text-sm text-white">Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'assets', label: 'Assets', icon: Wallet },
            { id: 'transactions', label: 'Transactions', icon: ArrowRightLeft },
            { id: 'send', label: 'Send', icon: Send },
            { id: 'receive', label: 'Receive', icon: Download },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'neu-gold text-gold-300'
                  : 'neu-soft text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Assets Tab */}
          {activeTab === 'assets' && (
            <motion.div
              key="assets"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {balances.map((balance, idx) => (
                <motion.div
                  key={balance.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="card-luxury p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400/20 to-gold-600/20 flex items-center justify-center text-2xl">
                        {balance.icon}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{balance.name}</h3>
                        <p className="text-sm text-gray-400">{balance.symbol}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">{balance.balance}</p>
                      <p className="text-sm text-gray-400">${balance.usdValue}</p>
                      <div className={`flex items-center gap-1 justify-end mt-1 ${
                        balance.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {balance.change24h >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span className="text-xs">{Math.abs(balance.change24h)}%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {transactions.map((tx, idx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="card-luxury p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'receive' ? 'bg-emerald-500/20' :
                      tx.type === 'send' ? 'bg-red-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      {tx.type === 'receive' ? (
                        <Download className="w-5 h-5 text-emerald-400" />
                      ) : tx.type === 'send' ? (
                        <Send className="w-5 h-5 text-red-400" />
                      ) : (
                        <ArrowRightLeft className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-medium capitalize">{tx.type}</p>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          tx.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                          tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {tx.type === 'swap' ? (
                          <>{tx.from} → {tx.to}</>
                        ) : (
                          <>
                            {tx.type === 'send' ? 'To: ' : 'From: '}
                            {shortenAddress(tx.type === 'send' ? tx.to : tx.from)}
                          </>
                        )}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-bold ${
                        tx.type === 'receive' ? 'text-emerald-400' :
                        tx.type === 'send' ? 'text-red-400' :
                        'text-blue-400'
                      }`}>
                        {tx.type === 'receive' ? '+' : tx.type === 'send' ? '-' : ''}
                        {tx.amount} {tx.symbol}
                      </p>
                      <p className="text-xs text-gray-500">{formatTimestamp(tx.timestamp)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Send Tab */}
          {activeTab === 'send' && (
            <motion.div
              key="send"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card-luxury p-6"
            >
              <h3 className="text-xl font-bold text-white mb-6">Send Crypto</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Select Token</label>
                  <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="input-luxury"
                  >
                    {balances.map((b) => (
                      <option key={b.symbol} value={b.symbol}>
                        {b.symbol} - {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Recipient Address</label>
                  <input
                    type="text"
                    value={sendAddress}
                    onChange={(e) => setSendAddress(e.target.value)}
                    placeholder="0x..."
                    className="input-luxury"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Amount</label>
                  <input
                    type="number"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-luxury"
                  />
                </div>
                
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-300 font-medium mb-1">Network Fee</p>
                      <p className="text-xs text-gray-400">
                        Estimated gas fee: ~0.002 ETH ($6.50). Transaction will be processed on Ethereum mainnet.
                      </p>
                    </div>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSend}
                  disabled={!sendAmount || !sendAddress}
                  className="w-full btn-luxury py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send {selectedToken}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Receive Tab */}
          {activeTab === 'receive' && (
            <motion.div
              key="receive"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card-luxury p-6 text-center"
            >
              <h3 className="text-xl font-bold text-white mb-6">Receive Crypto</h3>
              
              <div className="w-48 h-48 mx-auto mb-6 p-4 rounded-2xl bg-white">
                <QrCode className="w-full h-full text-luxury-900" />
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-2">Your Wallet Address</p>
                <div className="flex items-center gap-2 p-3 rounded-xl neu-soft">
                  <p className="text-sm text-white font-mono flex-1 truncate">
                    {walletAddress}
                  </p>
                  <button
                    onClick={copyAddress}
                    className="p-2 hover:bg-white/5 rounded transition"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm text-blue-300 font-medium mb-1">Important</p>
                    <p className="text-xs text-gray-400">
                      Only send Ethereum and ERC-20 tokens to this address. Sending other assets may result in permanent loss.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
