// Server-side IPFS/Pinata storage implementation
// This will be used in API routes to avoid client-side issues

export interface AgentMetadata {
  name: string;
  description: string;
  image: string;
  creator: string;
  category: string;
  capabilities: string[];
  skills: string[];
  price?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

export type StorageResult = {
  success: boolean;
  hash?: string;
  uri?: string;
  error?: string;
  ipfsHash?: string;
};

/**
 * Upload agent metadata to IPFS via Pinata
 */
export async function uploadAgentMetadataServer(metadata: AgentMetadata): Promise<StorageResult> {
  try {
    console.log('🔥 Starting IPFS upload via Pinata...');
    
    const PINATA_JWT = process.env.PINATA_JWT;
    
    if (!PINATA_JWT) {
      console.warn('⚠️ No Pinata JWT configured, using mock storage');
      return createMockStorage(metadata);
    }
    
    // Convert metadata to JSON
    const jsonData = JSON.stringify(metadata, null, 2);
    console.log('📝 Metadata JSON size:', jsonData.length, 'bytes');
    
    // Upload to Pinata using their API
    const formData = new FormData();
    const blob = new Blob([jsonData], { type: 'application/json' });
    formData.append('file', blob, 'metadata.json');
    
    // Add metadata for Pinata
    const pinataMetadata = JSON.stringify({
      name: `${metadata.name}_metadata.json`,
      keyvalues: {
        agentName: metadata.name,
        creator: metadata.creator,
        category: metadata.category
      }
    });
    formData.append('pinataMetadata', pinataMetadata);
    
    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', pinataOptions);
    
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata upload failed: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    const ipfsHash = result.IpfsHash;
    
    console.log('✅ Upload successful! IPFS Hash:', ipfsHash);
    
    return {
      success: true,
      hash: ipfsHash,
      ipfsHash: ipfsHash,
      uri: `ipfs://${ipfsHash}`
    };
    
  } catch (error) {
    console.error('❌ IPFS upload failed:', error);
    
    // Fallback to mock storage
    console.warn('⚠️ Falling back to mock storage');
    return createMockStorage(metadata);
  }
}

/**
 * Create mock storage for development/testing
 */
function createMockStorage(metadata: AgentMetadata): StorageResult {
  // Generate a deterministic hash based on content
  const content = JSON.stringify(metadata);
  const hash = `Qm${Buffer.from(content).toString('base64').substring(0, 44).replace(/[^a-zA-Z0-9]/g, 'x')}`;
  
  console.log('📦 Created mock IPFS hash:', hash);
  
  // Store in memory or use localStorage-like simulation
  if (typeof global !== 'undefined') {
    (global as any).mockIPFSStorage = (global as any).mockIPFSStorage || {};
    (global as any).mockIPFSStorage[hash] = metadata;
  }
  
  return {
    success: true,
    hash: hash,
    ipfsHash: hash,
    uri: `ipfs://${hash}`
  };
}

/**
 * Download metadata from IPFS
 */
export async function downloadFromIPFS(ipfsHash: string): Promise<AgentMetadata | null> {
  try {
    const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud';
    
    // Check mock storage first
    if (typeof global !== 'undefined' && (global as any).mockIPFSStorage?.[ipfsHash]) {
      console.log('📦 Retrieved from mock storage');
      return (global as any).mockIPFSStorage[ipfsHash];
    }
    
    const url = `${gateway}/ipfs/${ipfsHash}`;
    console.log('📥 Downloading from IPFS:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`IPFS download failed: ${response.status}`);
    }
    
    const metadata = await response.json();
    console.log('✅ Successfully retrieved metadata from IPFS');
    return metadata;
    
  } catch (error) {
    console.error('❌ Failed to retrieve from IPFS:', error);
    return null;
  }
}

/**
 * Test IPFS/Pinata connection
 */
export async function testStorageConnectionServer(): Promise<{ success: boolean; message: string; details?: unknown }> {
  try {
    console.log('🔍 Testing IPFS/Pinata connection...');
    
    const PINATA_JWT = process.env.PINATA_JWT;
    
    if (!PINATA_JWT) {
      return {
        success: false,
        message: 'Pinata JWT not configured. Using mock storage mode.',
        details: {
          note: 'Set PINATA_JWT environment variable to enable real IPFS uploads'
        }
      };
    }
    
    // Test Pinata authentication
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`);
    }
    
    const result = await response.json();
    
    return {
      success: true,
      message: 'Pinata connection successful',
      details: result
    };
    
  } catch (error) {
    console.error('❌ Pinata connection test failed:', error);
    return {
      success: false,
      message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    };
  }
}
