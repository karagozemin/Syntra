// API route for AI Compute chat requests
import { NextRequest, NextResponse } from 'next/server';
import { callRealCompute, type ComputeRequest } from '@/lib/realCompute';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const computeRequest: ComputeRequest = body;
    
    if (!computeRequest.messages || computeRequest.messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing messages in request body' },
        { status: 400 }
      );
    }
    
    console.log('📡 API: Received compute request for agent:', computeRequest.agentId);
    
    // Call real AI Compute
    const result = await callRealCompute(computeRequest);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ API: Compute request failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
