// API route for IPFS downloads
import { NextRequest, NextResponse } from 'next/server';
import { downloadFromIPFS } from '@/lib/serverStorage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ipfsHash } = body;
    
    if (!ipfsHash) {
      return NextResponse.json(
        { success: false, error: 'Missing ipfsHash in request body' },
        { status: 400 }
      );
    }
    
    console.log('📥 API: Received download request for:', ipfsHash);
    
    // Download from IPFS
    const metadata = await downloadFromIPFS(ipfsHash);
    
    if (!metadata) {
      return NextResponse.json(
        { success: false, error: 'Failed to download from IPFS' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: metadata
    });
    
  } catch (error) {
    console.error('❌ API: Download failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
