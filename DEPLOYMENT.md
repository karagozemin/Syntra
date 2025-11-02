# 0Gents Mainnet Deployment Guide

## 🚀 Overview

This guide covers the complete deployment process for 0Gents AI Agent NFT Marketplace on 0G Mainnet (Aristotle).

---

## 📋 Prerequisites

### Required
- **Node.js**: 18+ installed
- **0G Mainnet Tokens**: ~0.02 0G for contract deployment + testing
- **Private Key**: With sufficient mainnet balance
- **Git**: For code management

### Network Details
- **Chain ID**: 16661 (0G Mainnet)
- **RPC URL**: https://evmrpc.0g.ai
- **Explorer**: https://chainscan.0g.ai
- **Storage Indexer**: https://indexer-storage-turbo.0g.ai

---

## 🏗️ Deployment Steps

### Step 1: Environment Setup

Create/update `.env` files in both `contracts` and `webapp` packages:

#### Contracts Package (`agentx/packages/contracts/.env`)
```bash
# 0G Mainnet Configuration
OG_MAINNET_RPC_URL=https://evmrpc.0g.ai
PRIVATE_KEY=your_private_key_here
```

#### Web App Package (`agentx/packages/webapp/.env`)
```bash
# Enable Mainnet
NEXT_PUBLIC_USE_MAINNET=true

# Deployed Contract Addresses (from deployment output)
NEXT_PUBLIC_FACTORY_ADDRESS=0x9834a0B8B3789646408Cf4C3DCC41Dd580F50785
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x1320CB9AE8fB7D30f834AB5553C60dDeF0362dBB

# Private Key (for server-side storage operations)
PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_0G_PRIVATE_KEY=your_private_key_here

# Optional: WalletConnect Project ID
NEXT_PUBLIC_WC_PROJECT_ID=your_project_id
```

---

### Step 2: Install Dependencies

```bash
# Root directory
cd /Users/eminkaragoz/Desktop/projects/0Gents

# Install contract dependencies
cd agentx/packages/contracts
npm install

# Install webapp dependencies  
cd ../webapp
npm install
```

---

### Step 3: Deploy Smart Contracts to Mainnet

```bash
cd agentx/packages/contracts

# Deploy Factory and Marketplace
npx hardhat run scripts/deploy-factory.js --network og_mainnet
```

**Expected Output:**
```
✅ Marketplace deployed at: 0x...
✅ AgentNFTFactory deployed at: 0x...
```

**⚠️ Important**: Save these addresses! Update your `.env` files immediately.

---

### Step 4: Verify Contracts (Optional but Recommended)

Check deployed contracts on the explorer:
- Factory: https://chainscan.0g.ai/address/0x9834a0B8B3789646408Cf4C3DCC41Dd580F50785
- Marketplace: https://chainscan.0g.ai/address/0x1320CB9AE8fB7D30f834AB5553C60dDeF0362dBB

---

### Step 5: Build and Test Frontend

```bash
cd agentx/packages/webapp

# Build the application
npm run build

# Test locally
npm run start
```

Visit `http://localhost:3000` and:
1. Connect MetaMask to 0G Mainnet
2. Create a test agent
3. Verify marketplace listing
4. Test buy functionality

---

### Step 6: Deploy to Production (Vercel)

#### Option A: Automatic Deploy (Recommended)
```bash
# Push to main branch
git add .
git commit -m "feat: mainnet deployment"
git push origin main
```

#### Option B: Manual Vercel Deploy
```bash
cd agentx/packages/webapp

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Set Environment Variables in Vercel Dashboard
Navigate to: `Project Settings → Environment Variables`

Add:
```
NEXT_PUBLIC_USE_MAINNET=true
NEXT_PUBLIC_FACTORY_ADDRESS=0x9834a0B8B3789646408Cf4C3DCC41Dd580F50785
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x1320CB9AE8fB7D30f834AB5553C60dDeF0362dBB
PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_0G_PRIVATE_KEY=your_private_key_here
```

---

## 📊 Deployed Contract Information

### Mainnet Contracts (Chain ID: 16661)

| Contract | Address | Explorer |
|----------|---------|----------|
| **AgentNFTFactory** | `0x9834a0B8B3789646408Cf4C3DCC41Dd580F50785` | [View](https://chainscan.0g.ai/address/0x9834a0B8B3789646408Cf4C3DCC41Dd580F50785) |
| **Marketplace** | `0x1320CB9AE8fB7D30f834AB5553C60dDeF0362dBB` | [View](https://chainscan.0g.ai/address/0x1320CB9AE8fB7D30f834AB5553C60dDeF0362dBB) |
| **Fee Recipient** | `0x644619B14d4Ef817f205AFb9c57f241f3DBDAfA4` | [View](https://chainscan.0g.ai/address/0x644619B14d4Ef817f205AFb9c57f241f3DBDAfA4) |

### 0G Storage Contracts (Mainnet)

| Contract | Address |
|----------|---------|
| **Flow** | `0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526` |
| **Mine** | `0xCd01c5Cd953971CE4C2c9bFb95610236a7F414fe` |
| **Reward** | `0x457aC76B58ffcDc118AABD6DbC63ff9072880870` |

---

## 🧪 Testing Checklist

### Pre-Production Tests
- [ ] Contract deployment successful
- [ ] Factory creation fee: 0.01 0G
- [ ] Marketplace platform fee: configured
- [ ] Explorer links working

### Production Tests
- [ ] Wallet connection to mainnet
- [ ] Create agent → mints NFT
- [ ] Agent listed on marketplace
- [ ] Buy transaction successful
- [ ] NFT ownership transferred
- [ ] 0G Storage upload working
- [ ] Agent metadata retrievable

---

## 🔧 Troubleshooting

### Issue: "insufficient funds for gas"
**Solution**: Ensure deployer wallet has at least 0.02 0G on mainnet.

### Issue: "network request failed"
**Solution**: Check RPC URL is correct: `https://evmrpc.0g.ai`

### Issue: "transaction reverted"
**Solution**: 
1. Check contract addresses are correct
2. Verify wallet is on Chain ID 16661
3. Check sufficient balance for transaction

### Issue: "0G Storage upload timeout"
**Solution**: 
1. Storage indexer is responding (mainnet: `https://indexer-storage-turbo.0g.ai`)
2. Private key is configured
3. Retry mechanism will fallback to simulation if needed

---

## 📱 Adding 0G Mainnet to MetaMask

### Automatic (Recommended)
Visit: https://chainlist.org/ and search for "0G"

### Manual
1. Open MetaMask → Networks → Add Network
2. Enter details:
   - **Network Name**: 0G Mainnet
   - **RPC URL**: https://evmrpc.0g.ai
   - **Chain ID**: 16661
   - **Currency Symbol**: 0G
   - **Block Explorer**: https://chainscan.0g.ai

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use separate wallets** for development and production
3. **Verify all contract addresses** on explorer before use
4. **Test thoroughly on testnet** before mainnet
5. **Monitor transactions** via explorer
6. **Keep private keys secure** - Use hardware wallets for production

---

## 📚 Additional Resources

- **0G Documentation**: https://docs.0g.ai
- **0G Explorer**: https://chainscan.0g.ai
- **0G Discord**: https://discord.gg/0glabs
- **0G GitHub**: https://github.com/0glabs
- **Project Repository**: https://github.com/yourusername/0Gents

---

## 🎯 Production URLs

- **Live Application**: https://www.0gents.shop
- **Mainnet Factory**: https://chainscan.0g.ai/address/0x9834a0B8B3789646408Cf4C3DCC41Dd580F50785
- **Mainnet Marketplace**: https://chainscan.0g.ai/address/0x1320CB9AE8fB7D30f834AB5553C60dDeF0362dBB

---

## ✅ Deployment Verification

After deployment, verify:
- ✅ Contracts deployed on Chain ID 16661
- ✅ Explorer links working
- ✅ Frontend connected to mainnet
- ✅ Agent creation working
- ✅ Marketplace listing working
- ✅ Buy functionality working
- ✅ 0G Storage integration active
- ✅ Transaction confirmations visible on explorer

---

**Last Updated**: November 2025  
**Deployed By**: 0Gents Team  
**Network**: 0G Mainnet (Aristotle) - Chain ID 16661

