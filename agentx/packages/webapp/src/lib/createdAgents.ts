// Created Agents Storage - Local storage for demo purposes
// In production, this would be fetched from IPFS Storage or indexed from blockchain events

import type { AgentItem } from './mock';

export interface CreatedAgent {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  image: string;
  category: string;
  creator: string;
  price: string;
  txHash: string;
  storageUri: string;
  listingId?: number; // Marketplace listing ID
  social?: {
    x?: string;
    website?: string;
  };
  createdAt: string;
  isPurchased?: boolean; // Flag for purchased NFTs
}

const STORAGE_KEY = 'agentx_created_agents';

export function saveCreatedAgent(agent: CreatedAgent): void {
  try {
    const existing = getCreatedAgents();
    const existingIndex = existing.findIndex(a => a.id === agent.id);
    
    let updated: CreatedAgent[];
    if (existingIndex >= 0) {
      // Update existing agent
      updated = [...existing];
      updated[existingIndex] = agent;
      console.log('✅ Agent updated in local storage:', agent.name);
    } else {
      // Add new agent to beginning
      updated = [agent, ...existing];
      console.log('✅ New agent saved to local storage:', agent.name);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save created agent:', error);
  }
}

export function getCreatedAgents(): CreatedAgent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load created agents:', error);
    return [];
  }
}

export function getCreatedAgentById(id: string): CreatedAgent | null {
  const agents = getCreatedAgents();
  return agents.find(agent => agent.id === id) || null;
}

export function clearCreatedAgents(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ Cleared all created agents from local storage');
}

// Transform created agent to mock agent format for display
export function transformToMockAgent(createdAgent: CreatedAgent): AgentItem {
  return {
    id: createdAgent.id,
    name: createdAgent.name,
    owner: `${createdAgent.creator.slice(0, 6)}...${createdAgent.creator.slice(-4)}`,
    image: createdAgent.image,
    priceEth: parseFloat(createdAgent.price) || 0.01,
    description: createdAgent.description,
    category: createdAgent.category,
    listingId: createdAgent.listingId || Math.floor(Math.random() * 1000) + 1, // Fake listing ID for demo
    tokenId: createdAgent.tokenId,
    history: [
      { activity: "Created", date: new Date(createdAgent.createdAt).toISOString().split('T')[0] },
      { activity: "Minted", date: new Date(createdAgent.createdAt).toISOString().split('T')[0], priceEth: parseFloat(createdAgent.price) || 0.01 },
    ],
  };
}
