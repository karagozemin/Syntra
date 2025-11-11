# 🏗️ Syntra Architecture Documentation

> **Comprehensive technical architecture documentation for Syntra - AI-Powered Intelligent NFT Marketplace**

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [Layered Architecture](#layered-architecture)
4. [Smart Contract Architecture](#smart-contract-architecture)
5. [Frontend Architecture](#frontend-architecture)
6. [Backend & API Architecture](#backend--api-architecture)
7. [Data Flow Architecture](#data-flow-architecture)
8. [Storage Architecture](#storage-architecture)
9. [Security Architecture](#security-architecture)
10. [Deployment Architecture](#deployment-architecture)
11. [Scalability & Performance](#scalability--performance)

---

## 🎯 System Overview

Syntra is a decentralized marketplace for AI-powered Intelligent NFTs (INFTs) built on Polygon blockchain. The system follows a **layered, modular architecture** that separates concerns and enables independent scaling of components.

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
│              (Next.js 15 + React + TypeScript)               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│         (API Routes + Business Logic + State Management)     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Integration Layer                         │
│    (Blockchain + IPFS + Supabase + AI Compute Services)      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                      │
│         (Polygon Network + IPFS Network + Database)          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏛️ Architecture Principles

### 1. **Separation of Concerns**
- **Frontend**: UI/UX, user interactions, state management
- **Backend**: Business logic, data validation, API endpoints
- **Smart Contracts**: On-chain logic, ownership, transactions
- **Storage**: Decentralized metadata (IPFS) + centralized indexing (Supabase)

### 2. **Decentralization First**
- Critical data stored on-chain (ownership, transactions)
- Metadata stored on IPFS (decentralized, immutable)
- Centralized services only for indexing and performance

### 3. **Type Safety**
- TypeScript throughout the codebase
- Type-safe contract interactions via TypeChain
- Strict type checking for all API responses

### 4. **Modularity**
- Reusable React components
- Independent smart contracts
- Pluggable storage backends
- Extensible AI compute layer

### 5. **Security by Design**
- Input validation at every layer
- Smart contract security patterns (OpenZeppelin)
- Environment variable management
- Rate limiting and error handling

---

## 📦 Layered Architecture

### Layer 1: Presentation Layer (Frontend)

**Technology Stack:**
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + Wagmi
- **Animations**: Framer Motion
- **Wallet Integration**: RainbowKit + Wagmi

**Key Responsibilities:**
- User interface rendering
- User interaction handling
- Wallet connection management
- Form validation (client-side)
- Real-time UI updates

**Directory Structure:**
```
src/
├── app/                    # Next.js App Router pages
│   ├── (market)/          # Market route group
│   ├── create/            # Agent creation page
│   ├── agent/[id]/        # Agent detail page
│   ├── my-collections/    # User's NFTs
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   └── [Feature].tsx      # Feature-specific components
└── lib/                   # Utilities & integrations
    ├── contracts.ts       # Contract ABIs & addresses
    ├── storage.ts         # IPFS integration
    ├── unifiedAgents.ts   # Supabase integration
    └── utils.ts           # Helper functions
```

### Layer 2: Application Layer (Business Logic)

**Technology Stack:**
- **Runtime**: Node.js (Next.js API Routes)
- **Language**: TypeScript
- **Validation**: Runtime type checking

**Key Responsibilities:**
- Business logic orchestration
- Data validation and sanitization
- Error handling and logging
- Transaction coordination
- State synchronization

**API Routes:**
```
/api/
├── agents/                # Agent CRUD operations
│   ├── route.ts          # GET, POST agents
│   └── [id]/route.ts     # GET, PUT, DELETE agent
├── listings/             # Marketplace listings
├── storage/              # IPFS operations
├── compute/              # AI compute requests
└── supabase/             # Supabase health checks
```

### Layer 3: Integration Layer

**Components:**

#### 3.1 Blockchain Integration
- **Library**: Viem + Wagmi
- **Network**: Polygon Amoy Testnet
- **Contracts**: 
  - `AgentNFTFactory` - Creates agent NFT contracts
  - `AgentNFT` - Individual agent NFT (ERC-721)
  - `Marketplace` - Trading platform
  - `AgentRegistry` - Agent metadata registry

#### 3.2 Storage Integration
- **IPFS**: Pinata for pinning
- **Fallback**: Mock storage for development
- **Metadata Format**: JSON-LD standard

#### 3.3 Database Integration
- **Provider**: Supabase (PostgreSQL)
- **Purpose**: Fast indexing and querying
- **Tables**: `agents`, `listings`, `transactions`

#### 3.4 AI Compute Integration
- **Current**: Mock/simulated responses
- **Future**: OpenAI, Anthropic, or custom models
- **Interface**: Standardized compute request/response

### Layer 4: Infrastructure Layer

**Components:**
- **Blockchain**: Polygon Amoy Testnet
- **Storage Network**: IPFS (via Pinata)
- **Database**: Supabase PostgreSQL
- **CDN**: Vercel Edge Network

---

## ⛓️ Smart Contract Architecture

### Contract Hierarchy

```
AgentNFTFactory (Factory Pattern)
    │
    ├── Creates → AgentNFT (ERC-721)
    │               │
    │               ├── Stores: Agent metadata
    │               ├── Manages: Token ownership
    │               └── Implements: INFT interface
    │
    └── Registers → AgentRegistry
                    │
                    └── Tracks: All agent contracts

Marketplace (Separate Contract)
    │
    ├── Manages: Listings
    ├── Handles: Purchases
    ├── Distributes: Royalties (90% creator, 10% platform)
    └── Integrates: With AgentNFT contracts
```

### Key Contracts

#### 1. AgentNFTFactory.sol
**Purpose**: Factory contract for creating agent NFT contracts

**Key Functions:**
- `createAgent()` - Creates new agent NFT contract
- `getTotalAgents()` - Returns total number of agents
- `getAgentAddress(uint256)` - Gets agent contract address

**Gas Optimization:**
- Uses minimal proxy pattern (optional)
- Batch operations support
- Event emission for indexing

#### 2. AgentNFT.sol (ERC-721)
**Purpose**: Individual agent NFT contract

**Key Functions:**
- `mint(address, string)` - Mints NFT with metadata URI
- `agentDescription()` - Returns agent description
- `agentCategory()` - Returns agent category
- `price()` - Returns agent price
- `creator()` - Returns original creator

**Standards:**
- ERC-721 (NFT standard)
- ERC-165 (Interface detection)
- ERC-4906 (Metadata update events)

#### 3. Marketplace.sol
**Purpose**: Decentralized marketplace for trading INFTs

**Key Functions:**
- `list(address, uint256, uint256)` - Lists NFT for sale
- `buy(uint256)` - Purchases listed NFT
- `cancelListing(uint256)` - Cancels listing
- `getListing(uint256)` - Gets listing details

**Royalty System:**
- 90% to original creator
- 10% to platform
- Automatic distribution on purchase

#### 4. AgentRegistry.sol
**Purpose**: Central registry for agent metadata

**Key Functions:**
- `registerAgent(address, string)` - Registers agent
- `getAgentInfo(address)` - Gets agent information
- `getAllAgents()` - Returns all registered agents

### Contract Interaction Flow

```
User Action: Create Agent
    │
    ├── 1. Frontend calls AgentNFTFactory.createAgent()
    │       ├── Validates inputs
    │       ├── Charges creation fee (0.0001 POL)
    │       └── Deploys new AgentNFT contract
    │
    ├── 2. AgentNFT contract deployed
    │       ├── Stores agent metadata
    │       └── Emits AgentCreated event
    │
    ├── 3. Frontend mints NFT
    │       └── Calls AgentNFT.mint() with IPFS URI
    │
    ├── 4. Frontend approves marketplace
    │       └── Calls AgentNFT.approve(Marketplace)
    │
    └── 5. Frontend lists on marketplace
            └── Calls Marketplace.list()
```

---

## 🎨 Frontend Architecture

### Component Architecture

```
App Layout
    │
    ├── Providers (Wagmi + RainbowKit)
    │
    ├── Navbar
    │
    ├── Page Components
    │   ├── HomePage (Marketplace)
    │   ├── CreatePage
    │   ├── AgentDetailPage
    │   ├── MyCollectionsPage
    │   └── ExplorePage
    │
    └── Footer

Component Hierarchy (Example: AgentCard)
    │
    ├── Card (UI Component)
    │   ├── Image Section
    │   ├── Content Section
    │   │   ├── Title & Price
    │   │   └── Action Buttons
    │   └── Stats Overlay (on hover)
```

### State Management

**Client-Side State:**
- React `useState` for component state
- React `useEffect` for side effects
- Wagmi hooks for blockchain state
- Custom hooks for data fetching

**Server-Side State:**
- Next.js API routes for data fetching
- Supabase client for database queries
- Server components for static data

**State Flow:**
```
User Action
    │
    ├── → Local State Update (Optimistic UI)
    │
    ├── → API Call / Blockchain Transaction
    │
    └── → State Sync (Success/Error)
```

### Routing Architecture

**Next.js App Router Structure:**
```
app/
├── layout.tsx              # Root layout
├── page.tsx                # Homepage (redirects to /market)
├── (market)/
│   ├── layout.tsx          # Market layout
│   └── page.tsx            # Marketplace homepage
├── create/
│   └── page.tsx            # Agent creation
├── agent/
│   └── [id]/
│       └── page.tsx        # Agent detail (dynamic)
├── my-collections/
│   └── page.tsx            # User's NFTs
└── api/                    # API routes
    └── [endpoint]/
        └── route.ts        # API handlers
```

---

## 🔌 Backend & API Architecture

### API Route Structure

**RESTful API Design:**
```
GET    /api/agents              # List all agents
POST   /api/agents              # Create agent
GET    /api/agents/[id]         # Get agent details
PUT    /api/agents/[id]         # Update agent
DELETE /api/agents/[id]         # Delete agent

GET    /api/listings            # List all listings
POST   /api/listings/create     # Create listing
GET    /api/listings/[id]       # Get listing details

POST   /api/storage/upload      # Upload to IPFS
GET    /api/storage/download    # Download from IPFS

POST   /api/compute/chat        # AI compute request
```

### Data Flow

```
Client Request
    │
    ├── → API Route Handler
    │       ├── Validates input
    │       ├── Authenticates (if needed)
    │       └── Calls service layer
    │
    ├── → Service Layer
    │       ├── Business logic
    │       ├── Database operations
    │       └── External API calls
    │
    └── → Response
            ├── Success: Data + Status 200
            └── Error: Error message + Status 4xx/5xx
```

### Error Handling

**Error Types:**
- **Validation Errors** (400): Invalid input
- **Authentication Errors** (401): Unauthorized
- **Not Found Errors** (404): Resource not found
- **Server Errors** (500): Internal server error

**Error Response Format:**
```typescript
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human-readable message",
    details?: any
  }
}
```

---

## 🔄 Data Flow Architecture

### Agent Creation Flow

```
1. User fills form (Frontend)
    │
    ├── Client-side validation
    │
2. Upload metadata to IPFS
    │
    ├── POST /api/storage/upload
    │   └── Returns: IPFS hash
    │
3. Create agent contract
    │
    ├── Call AgentNFTFactory.createAgent()
    │   ├── Deploys AgentNFT contract
    │   └── Returns: Contract address
    │
4. Mint NFT
    │
    ├── Call AgentNFT.mint(IPFS_URI)
    │   └── Mints token ID 1
    │
5. Approve marketplace
    │
    ├── Call AgentNFT.approve(Marketplace)
    │
6. List on marketplace
    │
    ├── Call Marketplace.list(contract, tokenId, price)
    │   └── Returns: Listing ID
    │
7. Save to database
    │
    ├── POST /api/agents
    │   └── Saves to Supabase
    │
8. Update UI
    │
    └── Show success message
```

### Purchase Flow

```
1. User clicks "Buy Now" (Frontend)
    │
2. Check wallet connection
    │
3. Validate listing
    │
    ├── Call Marketplace.getListing(listingId)
    │   └── Verifies listing exists and is active
    │
4. Execute purchase
    │
    ├── Call Marketplace.buy(listingId)
    │   ├── Transfers NFT ownership
    │   ├── Transfers payment
    │   └── Distributes royalties
    │
5. Update database
    │
    ├── PUT /api/agents/[id]
    │   └── Updates owner in Supabase
    │
6. Update UI
    │
    └── Show success + refresh listings
```

---

## 💾 Storage Architecture

### Multi-Tier Storage Strategy

```
┌─────────────────────────────────────────┐
│         On-Chain Storage                 │
│  (Polygon Blockchain - Immutable)       │
│  - NFT ownership                         │
│  - Transaction history                   │
│  - Contract addresses                    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Decentralized Storage (IPFS)       │
│  (Pinata - Pinned, Permanent)           │
│  - Agent metadata (JSON)                │
│  - Agent images                          │
│  - Agent configuration                   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Centralized Storage (Supabase)     │
│  (PostgreSQL - Fast, Queryable)         │
│  - Agent listings (indexed)              │
│  - User data                             │
│  - Analytics                             │
│  - Search indexes                        │
└─────────────────────────────────────────┘
```

### Metadata Structure

**IPFS Metadata Format:**
```json
{
  "name": "Agent Name",
  "description": "Agent description",
  "image": "ipfs://...",
  "attributes": [
    {
      "trait_type": "Category",
      "value": "Trading"
    },
    {
      "trait_type": "AI Model",
      "value": "gpt-4"
    },
    {
      "trait_type": "Capabilities",
      "value": ["nlp", "automation"]
    }
  ],
  "properties": {
    "creator": "0x...",
    "price": "0.075",
    "category": "Trading",
    "aiModel": "gpt-4",
    "capabilities": ["nlp", "automation"]
  }
}
```

### Database Schema

**Supabase Tables:**

```sql
-- Agents table
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  category TEXT,
  price TEXT,
  creator TEXT NOT NULL,
  agent_contract_address TEXT,
  token_id TEXT,
  listing_id INTEGER,
  storage_uri TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Listings table
CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  agent_id TEXT REFERENCES agents(id),
  listing_id INTEGER UNIQUE,
  price TEXT NOT NULL,
  seller TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  agent_id TEXT REFERENCES agents(id),
  tx_hash TEXT UNIQUE NOT NULL,
  from_address TEXT,
  to_address TEXT,
  type TEXT, -- 'create', 'mint', 'list', 'buy'
  block_number BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔒 Security Architecture

### Security Layers

#### 1. Smart Contract Security
- **OpenZeppelin Standards**: Battle-tested contracts
- **Access Control**: Role-based permissions
- **Reentrancy Protection**: Guard modifiers
- **Input Validation**: All inputs validated
- **Gas Optimization**: Efficient operations

#### 2. Frontend Security
- **Input Sanitization**: All user inputs sanitized
- **XSS Prevention**: React's built-in escaping
- **CSRF Protection**: SameSite cookies
- **Environment Variables**: Secrets in .env.local
- **Type Safety**: TypeScript prevents type errors

#### 3. API Security
- **Input Validation**: Runtime type checking
- **Rate Limiting**: Prevent abuse
- **Error Handling**: No sensitive data in errors
- **CORS**: Configured for specific origins
- **Authentication**: Wallet signature verification (future)

#### 4. Infrastructure Security
- **HTTPS Only**: All traffic encrypted
- **Environment Secrets**: Never committed
- **Database Security**: Row Level Security (RLS)
- **IPFS Security**: Content addressing (immutable)

### Security Best Practices

1. **Never commit secrets** to version control
2. **Validate all inputs** at every layer
3. **Use prepared statements** for database queries
4. **Implement rate limiting** on API routes
5. **Audit smart contracts** before mainnet
6. **Monitor for suspicious activity**
7. **Keep dependencies updated**

---

## 🚀 Deployment Architecture

### Production Deployment

```
┌─────────────────────────────────────────┐
│         Vercel (Frontend)               │
│  - Next.js application                  │
│  - Edge functions                       │
│  - Automatic SSL                        │
│  - Global CDN                           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Polygon Mainnet (Blockchain)       │
│  - Deployed contracts                  │
│  - Network: Polygon PoS                 │
│  - RPC: Public or dedicated            │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Supabase (Database)                │
│  - PostgreSQL database                  │
│  - Real-time subscriptions              │
│  - Row Level Security                   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      Pinata (IPFS)                      │
│  - IPFS pinning service                 │
│  - Dedicated gateway                    │
│  - API access                           │
└─────────────────────────────────────────┘
```

### Environment Configuration

**Production Environment Variables:**
```env
# Blockchain
NEXT_PUBLIC_CHAIN_ID=137
NEXT_PUBLIC_RPC_URL=https://polygon-rpc.com
NEXT_PUBLIC_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...

# Storage
PINATA_JWT=...
PINATA_GATEWAY_URL=https://gateway.pinata.cloud

# Database
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Wallet
NEXT_PUBLIC_WC_PROJECT_ID=...
```

---

## 📈 Scalability & Performance

### Performance Optimizations

1. **Frontend:**
   - Next.js Image optimization
   - Code splitting
   - Lazy loading
   - Memoization
   - Server-side rendering (SSR)

2. **Backend:**
   - Database indexing
   - Query optimization
   - Caching strategies
   - API response compression

3. **Blockchain:**
   - Gas optimization
   - Batch operations
   - Event indexing
   - RPC connection pooling

### Scalability Strategies

1. **Horizontal Scaling:**
   - Multiple API instances
   - Load balancing
   - Database read replicas

2. **Caching:**
   - Redis for session data
   - CDN for static assets
   - Database query caching

3. **Database:**
   - Indexed queries
   - Connection pooling
   - Read replicas
   - Partitioning (if needed)

### Monitoring & Observability

- **Error Tracking**: Sentry or similar
- **Analytics**: Custom event tracking
- **Performance**: Web Vitals monitoring
- **Blockchain**: Transaction monitoring
- **Database**: Query performance monitoring

---

## 📚 Additional Resources

### Documentation
- [Smart Contract Documentation](./agentx/packages/contracts/README.md)
- [Frontend Documentation](./agentx/packages/webapp/README.md)
- [Setup Guide](./SETUP.md)

### External Documentation
- [Polygon Documentation](https://docs.polygon.technology/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Viem Documentation](https://viem.sh/)
- [Supabase Documentation](https://supabase.com/docs)

---

**Last Updated**: 2025-01-11  
**Version**: 1.0.0  
**Maintainer**: Syntra Development Team

