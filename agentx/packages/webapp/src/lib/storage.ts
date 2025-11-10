// Client-side IPFS/Pinata storage wrapper
import type { ChatMessage } from "./compute";

export type ChatLog = {
  agentId: string;
  createdAt: string;
  messages: ChatMessage[];
};

export type AgentMetadata = {
  name: string;
  description: string;
  image?: string;
  category: string;
  creator: string;
  price: string;
  capabilities: string[];
  model?: {
    type: string;
    version: string;
    parameters?: Record<string, unknown>;
  };
  skills: string[];
  social?: {
    x?: string;
    website?: string;
  };
  created: string;
  updated: string;
};

export type StorageResult = {
  success: boolean;
  hash?: string;
  uri?: string;
  error?: string;
  ipfsHash?: string;
};

// IPFS Gateway configuration
const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud';

/**
 * Upload agent metadata to IPFS via API route
 */
export async function uploadAgentMetadata(metadata: AgentMetadata): Promise<StorageResult> {
  try {
    console.log("🔥 Uploading to IPFS Network:", {
      name: metadata.name,
      category: metadata.category
    });
    
    // Call server-side API route for Pinata upload
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout
    
    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metadata }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }
    
    console.log(`✅ Metadata uploaded to IPFS successfully!`);
    console.log(`📦 IPFS Hash: ${result.hash}`);
    
    return result;
    
  } catch (error) {
    console.error("❌ Failed to upload to IPFS:", error);
    
    // Return error
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Retrieve agent metadata from IPFS
 */
export async function retrieveAgentMetadata(uri: string): Promise<AgentMetadata | null> {
  try {
    console.log("📥 Retrieving from IPFS:", uri);
    
    // Extract IPFS hash from URI (supports ipfs://, ipfs:/storage/, or raw hash)
    let ipfsHash = uri;
    if (uri.startsWith('ipfs://')) {
      ipfsHash = uri.replace('ipfs://', '').replace('storage/', '');
    }
    
    // Try IPFS gateway
    const url = `${IPFS_GATEWAY}/ipfs/${ipfsHash}`;
    console.log("🌐 Fetching from:", url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`IPFS fetch failed: ${response.status}`);
    }
    
    const metadata = await response.json();
    console.log("✅ Successfully retrieved metadata from IPFS");
    return metadata;
    
  } catch (error) {
    console.error("❌ Failed to retrieve from IPFS:", error);
    return null;
  }
}

/**
 * Upload file to IPFS (for images, models, etc.)
 */
export async function uploadFileToIPFS(file: File): Promise<StorageResult> {
  try {
    console.log(`📁 Uploading file to IPFS: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    
    const formData = new FormData();
    formData.append('file', file);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s for files
    
    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'File upload failed');
    }
    
    console.log(`✅ File uploaded to IPFS successfully!`);
    
    return {
      success: true,
      hash: result.hash,
      ipfsHash: result.hash,
      uri: `ipfs://${result.hash}`
    };
    
  } catch (error) {
    console.error("❌ File upload failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Persist chat log to IPFS (optional feature)
 */
export async function persistChatLog(log: ChatLog): Promise<StorageResult> {
  try {
    console.log("💬 Persisting chat log to IPFS:", log.agentId);
    
    const metadata = {
      name: `Chat Log - ${log.agentId}`,
      description: `Conversation history for agent ${log.agentId}`,
      image: '',
      creator: 'System',
      category: 'ChatLog',
      capabilities: ['chat-history'],
      skills: ['conversation'],
      price: '0',
      created: log.createdAt,
      updated: new Date().toISOString(),
      chatData: log
    };
    
    const result = await uploadAgentMetadata(metadata as any);
    
    if (result.success) {
      console.log("✅ Chat log persisted to IPFS:", result.uri);
    }
    
    return result;
    
  } catch (error) {
    console.error("❌ Failed to persist chat log:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get IPFS storage statistics (for dashboard)
 */
export async function getStorageStats(): Promise<{
  network: string;
  gateway: string;
  available: boolean;
}> {
  return {
    network: "IPFS",
    gateway: IPFS_GATEWAY,
    available: true
  };
}

/**
 * Test IPFS connection
 */
export async function testStorageConnection(): Promise<{ 
  success: boolean; 
  message: string; 
  network?: string;
  gateway?: string;
}> {
  try {
    // Call server-side test
    const response = await fetch('/api/storage/test');
    const result = await response.json();
    
    return {
      ...result,
      network: "IPFS via Pinata",
      gateway: IPFS_GATEWAY
    };
    
  } catch (error) {
    console.error("❌ Storage connection test failed:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Connection test failed'
    };
  }
}

/**
 * Convert URI to gateway URL for display
 */
export function getIPFSGatewayUrl(uri: string): string {
  let ipfsHash = uri;
  if (uri.startsWith('ipfs://')) {
    ipfsHash = uri.replace('ipfs://', '').replace('storage/', '');
  }
  return `${IPFS_GATEWAY}/ipfs/${ipfsHash}`;
}
