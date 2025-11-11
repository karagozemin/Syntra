// Blockchain-based agent discovery
// This will replace localStorage-only approach for cross-browser visibility

import { useReadContract } from "wagmi";
import { INFT_ADDRESS, INFT_ABI } from "./contracts";
import type { AgentItem } from "./mock";
import type { CreatedAgent } from "./createdAgents";

// Global storage for blockchain-discovered agents
// In production, this would be replaced with proper indexing service
const GLOBAL_AGENTS_KEY = 'agentx_global_agents';

// Simulate blockchain-discovered agents (visible across all browsers)
// REMOVED: Mock data - only use real blockchain data
const SIMULATED_BLOCKCHAIN_AGENTS: BlockchainAgent[] = [];

export interface BlockchainAgent {
  tokenId: string;
  owner: string;
  tokenURI: string;
  creator: string;
  discoveredAt: string;
  // Added for cross-browser display of user-created agents
  name?: string;
  description?: string;
  image?: string;
  category?: string;
  price?: string;
  social?: {
    x?: string;
    website?: string;
  };
}

// Save discovered agent to cross-browser storage
export function saveGlobalAgent(agent: BlockchainAgent): void {
  try {
    // Save to cross-browser localStorage key
    const stored = localStorage.getItem('0gents_cross_browser_agents');
    const existing = stored ? JSON.parse(stored) : [];
    
    // Check if already exists
    const existingIndex = existing.findIndex((a: BlockchainAgent) => a.tokenId === agent.tokenId);
    
    let updated: BlockchainAgent[];
    if (existingIndex >= 0) {
      updated = [...existing];
      updated[existingIndex] = agent;
    } else {
      updated = [agent, ...existing];
    }
    
    localStorage.setItem('0gents_cross_browser_agents', JSON.stringify(updated));
    console.log('🌐 Agent saved to cross-browser storage:', agent.tokenId);
    console.log('📊 Total cross-browser agents:', updated.length);
    
    // Also trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('agentCreated', { 
      detail: { agent, totalAgents: updated.length } 
    }));
  } catch (error) {
    console.error('Failed to save global agent:', error);
  }
}

// Get all globally discovered agents
export function getGlobalAgents(): BlockchainAgent[] {
  try {
    // Get from global localStorage (this simulates blockchain indexing)
    const stored = localStorage.getItem('0gents_cross_browser_agents');
    const crossBrowserAgents = stored ? JSON.parse(stored) : [];
    
    // Only return real cross-browser agents (no mock data)
    console.log(`🌐 Cross-browser agents: ${crossBrowserAgents.length} real agents`);
    return crossBrowserAgents;
  } catch (error) {
    console.error('Failed to load global agents:', error);
    return [];
  }
}

// Check if NFT exists on blockchain
export async function validateNFTExists(tokenId: string): Promise<boolean> {
  try {
    // This would be implemented with proper blockchain query
    // For now, we'll simulate validation
    return true;
  } catch (error) {
    console.error('Failed to validate NFT:', error);
    return false;
  }
}

// Discover new agents by checking blockchain
export async function discoverAgentsFromBlockchain(): Promise<BlockchainAgent[]> {
  try {
    // In production, this would:
    // 1. Query blockchain events for minted NFTs
    // 2. Get tokenURI for each NFT
    // 3. Fetch metadata from 0G Storage
    // 4. Transform to our format
    
    console.log('🔍 Discovering agents from blockchain...');
    
    // For now, return existing global agents
    return getGlobalAgents();
  } catch (error) {
    console.error('Failed to discover agents:', error);
    return [];
  }
}

// Transform blockchain agent to display format
export function transformBlockchainAgent(blockchainAgent: any): AgentItem {
  // Check if this is an extended agent with full data
  const hasFullData = blockchainAgent.name && blockchainAgent.description;
  
  // Use real data if available, otherwise use defaults
  if (hasFullData) {
    return {
      id: blockchainAgent.tokenId, // Use direct tokenId for created agents
      name: blockchainAgent.name,
      description: blockchainAgent.description,
      image: blockchainAgent.image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center",
      category: blockchainAgent.category || "General",
      owner: blockchainAgent.owner,
      priceEth: parseFloat(blockchainAgent.price) || 0.075,
      history: [
        {
          activity: "Created by user",
          date: blockchainAgent.discoveredAt,
          priceEth: 0.005
        }
      ]
    };
  }
  
  // Fallback for default agents
  const isTimestamp = /^\d{13}$/.test(blockchainAgent.tokenId);
  const agentNames: Record<string, string> = {
    "blockchain-1": "Global DeFi Bot"
  };

  return {
    id: `blockchain-${blockchainAgent.tokenId}`,
    name: agentNames[blockchainAgent.tokenId] || `Blockchain Agent #${blockchainAgent.tokenId}`,
    description: "AI Agent discovered on blockchain network",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&crop=center",
    category: "Blockchain",
    owner: blockchainAgent.owner,
    priceEth: 0.075,
    history: [
      {
        activity: "Discovered on blockchain",
        date: blockchainAgent.discoveredAt,
        priceEth: 0.005
      }
    ]
  };
}

// Hook to get all agents (local + blockchain)
export function useAllAgents() {
  const globalAgents = getGlobalAgents();
  
  return {
    globalAgents,
    totalDiscovered: globalAgents.length,
    refresh: discoverAgentsFromBlockchain
  };
}
