// API route to test IPFS/Pinata connection and configuration
import { NextResponse } from 'next/server';
import { testStorageConnectionServer } from '@/lib/serverStorage';

export async function GET() {
  try {
    console.log('🔍 Testing IPFS/Pinata connection...');
    
    // Test basic configuration
    const config = {
      networkName: 'IPFS via Pinata',
      gateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud',
      hasPinataJWT: !!process.env.PINATA_JWT,
      network: 'Polygon Amoy Testnet',
      chainId: 80002
    };
    
    console.log('📋 Configuration check:', config);
    
    // Test server-side storage connection
    const serverTest = await testStorageConnectionServer();
    
    return NextResponse.json({
      success: true,
      message: 'Storage test completed',
      config,
      serverTest,
      recommendations: [
        'Set PINATA_JWT environment variable for real IPFS uploads',
        'Mock storage will be used if Pinata is not configured',
        'Check Pinata dashboard for upload status',
        'Ensure you have sufficient Pinata storage quota'
      ]
    });
    
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Test failed',
        message: 'Storage connection test failed'
      },
      { status: 500 }
    );
  }
}
