// API route for checking NFT ownership
import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { INFT_ABI } from '@/lib/contracts';

export async function POST(request: NextRequest) {
  try {
    const { contractAddress, tokenId, userAddress } = await request.json();
    
    if (!contractAddress || !tokenId || !userAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    console.log(`🔍 Checking ownership: Token ${tokenId} for user ${userAddress}`);
    
    // Connect to 0G Network
    const OG_RPC_URL = process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc-testnet.0g.ai';
    const publicClient = createPublicClient({
      transport: http(OG_RPC_URL),
    });
    
    try {
      // Check ownership
      const owner = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: INFT_ABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      });
      
      const isOwner = owner.toLowerCase() === userAddress.toLowerCase();
      
      let tokenURI = "";
      if (isOwner) {
        try {
          tokenURI = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: INFT_ABI,
            functionName: 'tokenURI',
            args: [BigInt(tokenId)],
          });
        } catch (uriError) {
          console.log(`Token ${tokenId} has no URI:`, uriError);
        }
      }
      
      console.log(`✅ Token ${tokenId}: Owner=${owner}, IsOwner=${isOwner}`);
      
      return NextResponse.json({
        success: true,
        isOwner,
        owner,
        tokenURI
      });
      
    } catch (contractError: any) {
      // Token doesn't exist or other contract error
      if (contractError.message?.includes('ERC721: invalid token ID') || 
          contractError.message?.includes('owner query for nonexistent token') ||
          contractError.message?.includes('nonexistent token')) {
        return NextResponse.json({
          success: true,
          isOwner: false,
          error: 'Token does not exist'
        });
      }
      
      throw contractError;
    }
    
  } catch (error) {
    console.error('❌ Ownership check failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
