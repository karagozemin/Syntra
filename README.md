<div align="center">
  <img src="agentx/packages/webapp/public/favicon.png" alt="Syntra Logo" width="200" />
  
  # 🤖 Syntra - AI-Powered NFT Marketplace
  
  > **A decentralized marketplace for AI-powered Intelligent NFTs, built on Polygon Amoy Testnet**
</div>

## 🎯 **What is this project?**

This is a comprehensive decentralized marketplace specifically designed for AI-powered Intelligent NFTs (INFTs). Unlike traditional NFT marketplaces that deal with static images, this platform creates a living ecosystem where each NFT contains an AI agent that users can interact with, trade, and monetize.

### 🌟 **Why this marketplace?**

- **🧠 Living Digital Assets**: Each INFT contains a functional AI agent with unique personality and capabilities
- **⚡ Polygon Power**: Leverages Polygon's high-performance, low-cost infrastructure
- **💰 Creator Economy**: Sustainable revenue streams for AI developers and digital artists
- **🌐 Decentralized**: No central authority, complete ownership and control
- **🔒 Transparent**: All transactions and agent behaviors are verifiable on-chain

## ✨ **Core Features**

### 🎨 **AI Agent Creation Studio**
- **Intelligent NFT Minting** - Create AI agents with unique personalities, skills, and capabilities
- **Visual Agent Designer** - Intuitive interface for defining agent characteristics
- **Category Selection** - Trading, Gaming, Art, Development, DeFi, and more specialized niches
- **Price Setting** - Flexible pricing models for different agent types
- **IPFS Storage** - Decentralized metadata storage via Pinata

### 💬 **AI Interactions**
- **Mock AI Responses** - Simulated AI chat for testing and demonstration
- **Persistent Conversations** - Chat history maintained across sessions
- **Agent Personalities** - Each AI has distinct behavior patterns and response styles
- **Usage Metrics** - Track interactions, popularity, and engagement analytics

### 🛒 **Advanced Marketplace**
- **Professional Trading Interface** - Enterprise-grade UI with smooth animations
- **Smart Contract Integration** - Secure, transparent, and instant transactions
- **Featured Collections** - Curated showcases of trending and high-quality agents
- **Advanced Filtering** - Search by category, price range, creator, popularity metrics
- **Cross-User Visibility** - Global marketplace where all users can discover and trade agents

### 🔗 **Technology Stack**
- **Polygon Amoy Testnet** - Fast, low-cost EVM-compatible blockchain
- **IPFS/Pinata** - Decentralized metadata storage
- **Supabase** - Database for agent listings and marketplace data
- **Next.js 15** - Modern React framework with App Router
- **RainbowKit** - Beautiful wallet connection UI
- **TypeScript** - Type-safe development

### 💰 **Creator Economy Features**
- **Automatic Royalties** - 90% of sales go directly to original creators
- **Auto-Listing** - Newly created INFTs are automatically listed on the marketplace
- **Engagement Tracking** - Views, likes, and interaction metrics for market insights
- **Revenue Analytics** - Comprehensive dashboards for creator earnings

## 🏗️ **Technical Architecture**

> 📖 **For comprehensive architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md)**

### ⛓️ **Blockchain Layer (Polygon)**
- **INFT Contract** - ERC-721 based intelligent NFTs with enhanced metadata
- **Marketplace Contract** - Decentralized trading platform with automated royalties
- **Agent Registry** - Central registry maintaining agent metadata
- **Fee Management** - Smart contract-based fee collection and distribution

### 💾 **Storage Layer (IPFS)**
- **Agent Metadata** - Decentralized storage using Pinata
- **AI Model Data** - Secure storage of agent parameters
- **Media Assets** - Profile images and promotional materials
- **Fallback System** - Mock storage for testing when Pinata is not configured

### 🗄️ **Database Layer (Supabase)**
- **Agent Registry** - Track all created agents
- **Marketplace Listings** - Active and historical listings
- **Transaction History** - Complete trading records
- **User Analytics** - Creator and collector insights

### 🧠 **AI Layer (Mock/Simulation)**
- **Simulated AI Responses** - Realistic conversational AI for testing
- **Context-Aware** - Responses tailored to agent category and user input
- **Performance** - Fast response times without external dependencies
- **Extensible** - Easy to integrate real AI services in the future

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- MetaMask or compatible Web3 wallet
- Test MATIC from [Polygon Faucet](https://faucet.polygon.technology/)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd 0Gents-Marketplace

# Install contract dependencies
cd agentx/packages/contracts
npm install

# Install webapp dependencies
cd ../webapp
npm install
```

### Configuration

1. **Copy environment templates:**

```bash
# For contracts
cp agentx/.env.example agentx/.env

# For webapp
cp agentx/packages/webapp/.env.local.example agentx/packages/webapp/.env.local
```

2. **Fill in your values** - See [SETUP.md](./SETUP.md) for detailed instructions

### Deploy Contracts

```bash
cd agentx/packages/contracts
npm run build
npm run deploy
```

### Run Development Server

```bash
cd agentx/packages/webapp
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
0Gents-Marketplace/
├── agentx/
│   ├── .env                    # Contract environment variables
│   └── packages/
│       ├── contracts/          # Smart contracts
│       │   ├── contracts/      # Solidity files
│       │   ├── scripts/        # Deployment scripts
│       │   ├── hardhat.config.ts
│       │   └── package.json
│       └── webapp/             # Next.js frontend
│           ├── src/
│           │   ├── app/        # App Router pages
│           │   ├── components/ # React components
│           │   └── lib/        # Utilities & integrations
│           ├── .env.local      # Webapp environment variables
│           └── package.json
├── SETUP.md                    # Detailed setup guide
└── README.md                   # This file
```

## 🔧 Configuration

See [SETUP.md](./SETUP.md) for complete configuration guide including:

- WalletConnect Project ID setup
- Pinata (IPFS) configuration
- Supabase database setup
- Polygonscan API key
- MetaMask network configuration

## 💡 **How It Works**

### 🎨 **1. AI Agent Creation**

1. **Agent Design** - Define name, description, category, price, and capabilities
2. **Payment** - Pay creation fee to platform
3. **IPFS Upload** - Agent metadata stored on IPFS via Pinata
4. **NFT Minting** - Smart contract creates your unique intelligent NFT
5. **Database Entry** - Agent registered in Supabase for marketplace visibility
6. **Auto-Listing** - Agent automatically appears on marketplace

### 🤖 **2. AI Agent Interactions**

- **Chat Interface** - Interact with AI agents via chat
- **Mock Responses** - Simulated AI provides contextual responses
- **Conversation History** - Messages stored for context
- **Agent Personality** - Each agent has unique response patterns

### 🛒 **3. Marketplace Trading**

1. **Browse** - Explore agents by category, price, creator
2. **View Details** - See agent capabilities, stats, creator info
3. **Connect Wallet** - Connect MetaMask to Polygon Amoy
4. **Purchase** - Buy agent with MATIC
5. **Transfer** - NFT ownership transferred instantly
6. **Royalties** - 90% goes to creator, 10% platform fee

## 💰 Fee Structure

| Operation | Fee | Recipient |
|-----------|-----|-----------|
| Creation Fee | 0.005 MATIC | Platform |
| Platform Fee | 10% of sale | Platform |
| Creator Earnings | 90% of sale | Original Creator |
| Network Fees | ~0.001 MATIC | Polygon Network |

## 🛠️ Tech Stack Details

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Wagmi** - React hooks for Ethereum
- **RainbowKit** - Wallet connection UI
- **Framer Motion** - Smooth animations

### Blockchain
- **Polygon Amoy Testnet** - Layer 2 scaling solution
- **Solidity 0.8.24** - Smart contract development
- **Hardhat** - Development framework
- **OpenZeppelin** - Security standards
- **Ethers.js** - Blockchain interactions

### Storage & Database
- **IPFS/Pinata** - Decentralized storage
- **Supabase** - PostgreSQL database
- **Mock Storage** - Fallback for development

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### 🔒 **Security Notice**
- Smart contracts should be audited before mainnet deployment
- Use testnet for experimentation
- Never commit private keys or secrets
- Keep dependencies updated

## 🎓 **Learning Resources**

- [Polygon Documentation](https://docs.polygon.technology/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Supabase Documentation](https://supabase.com/docs)

## 🌟 **Features Roadmap**

### ✅ **Completed**
- ✅ Core INFT minting and trading
- ✅ Polygon Amoy integration
- ✅ IPFS metadata storage
- ✅ Supabase database integration
- ✅ Mock AI chat system
- ✅ Professional UI/UX
- ✅ Wallet integration (RainbowKit)

### 📋 **Planned**
- [ ] Real AI integration (OpenAI/Anthropic)
- [ ] Advanced agent training
- [ ] Mobile application
- [ ] Multi-chain support
- [ ] DAO governance
- [ ] Staking mechanisms

## 🙏 **Acknowledgments**

- **OpenZeppelin** - Security standards and contracts
- **Polygon** - High-performance blockchain infrastructure
- **Pinata** - IPFS pinning service
- **Supabase** - Backend-as-a-service platform
- **Vercel** - Deployment platform
- **Web3 Community** - Tools and best practices

---

**⭐ Star this repository if you find it useful!**  
**🔄 Share with the Web3 and AI communities**  
**🤝 Contribute to the future of intelligent digital assets**

Built with ❤️ for the decentralized future
