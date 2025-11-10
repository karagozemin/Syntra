// API route for IPFS/Pinata uploads
import { NextRequest, NextResponse } from 'next/server';
import { uploadAgentMetadataServer, type AgentMetadata } from '@/lib/serverStorage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const metadata: AgentMetadata = body.metadata;
    
    if (!metadata) {
      return NextResponse.json(
        { success: false, error: 'Missing metadata in request body' },
        { status: 400 }
      );
    }
    
    console.log('📡 API: Received IPFS upload request for:', metadata.name);
    
    // Upload using server-side Pinata SDK
    const result = await uploadAgentMetadataServer(metadata);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ API: Upload failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
