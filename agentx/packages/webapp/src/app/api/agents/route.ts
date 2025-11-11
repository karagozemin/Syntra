import { NextRequest, NextResponse } from 'next/server';
import { supabase, transformDBToUnifiedAgent, transformUnifiedAgentToDB } from '@/lib/supabase';

// 🎯 UNIFIED AGENT INTERFACE - Central agent storage
export interface UnifiedAgent {
  id: string;                    // Unique agent ID
  tokenId: string;              // NFT token ID  
  agentContractAddress: string; // Agent contract address
  name: string;
  description: string;
  image: string;
  category: string;
  price: string;                // Display price (e.g., "0.01")
  priceWei: string;            // Price in wei for contract calls
  creator: string;              // Original creator address (owner)
  currentOwner: string;         // Current NFT owner (creator initially, buyer after purchase)
  txHash: string;               // Creation transaction hash
  storageUri: string;           // IPFS Storage URI
  listingId: number;           // Real marketplace listing ID
  active: boolean;             // Available for purchase
  createdAt: string;           // ISO timestamp
  social?: {                   // Optional social links
    x?: string;
    website?: string;
  };
  // Additional metadata
  capabilities?: string[];      // Agent capabilities
  computeModel?: string;       // AI model used
  views?: number;              // View count
  likes?: number;              // Like count
  trending?: boolean;          // Trending status
}

// 🏪 HYBRID STORAGE - Memory + Supabase for reliability
// Memory-based storage (fallback + fast access)
let unifiedAgents: UnifiedAgent[] = [];

/**
 * POST /api/agents - Create new agent
 * Body: Partial<UnifiedAgent> (id will be auto-generated)
 */
export async function POST(request: NextRequest) {
  try {
    const agentData = await request.json();
    
    console.log('Creating unified INFT:', agentData.name);
    
    // Generate unique ID
    const timestamp = Date.now();
    const uniqueId = agentData.id || `agent-${timestamp}`;
    
    // Create unified agent
    const newAgent: UnifiedAgent = {
      id: uniqueId,
      tokenId: agentData.tokenId || timestamp.toString(),
      agentContractAddress: agentData.agentContractAddress || '',
      name: agentData.name || 'Unnamed Agent',
      description: agentData.description || '',
      image: agentData.image || 'https://images.unsplash.com/photo-1677442136019-1d7fd3f2aa3b?w=400',
      category: agentData.category || 'General',
      price: agentData.price || '0.01',
      priceWei: agentData.priceWei || '10000000000000000', // 0.01 ETH in wei
      creator: agentData.creator || '',
      currentOwner: agentData.currentOwner || agentData.creator || '',
      txHash: agentData.txHash || '',
      storageUri: agentData.storageUri || '',
      listingId: agentData.listingId || 0,
      active: agentData.active !== undefined ? agentData.active : true,
      createdAt: new Date().toISOString(),
      social: agentData.social || {},
      capabilities: agentData.capabilities || [],
      computeModel: agentData.computeModel || '',
      views: 0,
      likes: 0,
      trending: false
    };
    
    // 🚀 PRIORITY 1: Save to Supabase (persistent storage)
    try {
      const dbData = transformUnifiedAgentToDB(newAgent);
      console.log('📤 Sending to Supabase:', {
        id: dbData.id,
        name: dbData.name,
        creator: dbData.creator,
        agent_contract_address: dbData.agent_contract_address
      });
      
      const { data, error } = await supabase
        .from('agents')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase save failed:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error details:', error.details);
        // Continue with memory storage as fallback
      } else {
        console.log('✅ INFT saved to Supabase:', data.name);
        console.log('✅ Supabase ID:', data.id);
      }
    } catch (supabaseError) {
      console.error('❌ Supabase connection failed:', supabaseError);
      // Continue with memory storage as fallback
    }
    
    // 🔄 FALLBACK: Add to memory storage (for immediate access)
    unifiedAgents.unshift(newAgent);
    
    console.log(`Unified INFT created: ${newAgent.name}`);
    console.log(`Total unified INFTs: ${unifiedAgents.length}`);
    
    return NextResponse.json({ 
      success: true, 
      agent: newAgent,
      total: unifiedAgents.length 
    });
    
  } catch (error) {
    console.error('Failed to create unified INFT:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create agent' 
    }, { status: 500 });
  }
}

/**
 * GET /api/agents - Get all agents with optional filtering
 * Query params:
 * - creator=address : Get agents created by specific address
 * - owner=address : Get agents owned by specific address  
 * - active=true/false : Filter by active status
 * - category=string : Filter by category
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get('creator');
    const owner = searchParams.get('owner');
    const active = searchParams.get('active');
    const category = searchParams.get('category');
    
    let filteredAgents: UnifiedAgent[] = [];

    // 🚀 PRIORITY 1: Try to load from Supabase
    try {
      let query = supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (creator) {
        query = query.eq('creator', creator);
      }
      if (owner) {
        query = query.eq('current_owner', owner);
      }
      // Note: 'active' column may not exist in agents table, skip filter if not available
      // if (active !== null) {
      //   query = query.eq('active', active === 'true');
      // }
      if (category) {
        query = query.ilike('category', category);
      }

      const { data, error } = await query;

      if (!error && data) {
        // Transform Supabase data to UnifiedAgent format
        filteredAgents = data.map(transformDBToUnifiedAgent);

        console.log(`Loaded ${filteredAgents.length} INFTs from Supabase`);
        
        // Update memory cache with fresh data
        unifiedAgents = [...filteredAgents];
        
      } else {
        console.error('❌ Supabase query failed:', error);
        throw new Error('Supabase failed, using fallback');
      }
    } catch (supabaseError) {
      console.error('❌ Supabase connection failed, using memory fallback:', supabaseError);
      
      // 🔄 FALLBACK: Use memory storage
      filteredAgents = [...unifiedAgents];
      
      // Apply filters to memory data
      if (creator) {
        filteredAgents = filteredAgents.filter(agent => 
          agent.creator.toLowerCase() === creator.toLowerCase()
        );
      }
      if (owner) {
        filteredAgents = filteredAgents.filter(agent => 
          agent.currentOwner.toLowerCase() === owner.toLowerCase()
        );
      }
      if (active !== null) {
        const isActive = active === 'true';
        filteredAgents = filteredAgents.filter(agent => agent.active === isActive);
      }
      if (category) {
        filteredAgents = filteredAgents.filter(agent => 
          agent.category.toLowerCase() === category.toLowerCase()
        );
      }
    }
    
    console.log(`Returning ${filteredAgents.length} unified INFTs`);
    
    return NextResponse.json({ 
      success: true, 
      agents: filteredAgents,
      total: filteredAgents.length,
      totalAll: unifiedAgents.length
    });
    
  } catch (error) {
    console.error('Failed to get unified INFTs:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get agents' 
    }, { status: 500 });
  }
}

/**
 * PUT /api/agents - Update agent (only creator can update)
 * Body: { id: string, updates: Partial<UnifiedAgent>, userAddress: string }
 */
export async function PUT(request: NextRequest) {
  try {
    const { id, updates, userAddress } = await request.json();
    
    if (!id || !userAddress) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing id or userAddress' 
      }, { status: 400 });
    }
    
    // 🚀 PRIORITY 1: Update in Supabase
    try {
      const { data, error } = await supabase
        .from('agents')
        .update({
          name: updates.name,
          description: updates.description,
          image: updates.image,
          category: updates.category,
          price: updates.price,
          active: updates.active,
          social: updates.social,
          capabilities: updates.capabilities,
          // Don't allow updating critical fields
        })
        .eq('id', id)
        .eq('creator', userAddress) // Only creator can update
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase update failed:', error);
        return NextResponse.json({ 
          success: false, 
          error: 'Only creator can edit this agent or agent not found' 
        }, { status: 403 });
      }

      // Transform back to UnifiedAgent
      const updatedAgent = transformDBToUnifiedAgent(data);

      // Update memory cache
      const agentIndex = unifiedAgents.findIndex(agent => agent.id === id);
      if (agentIndex !== -1) {
        unifiedAgents[agentIndex] = updatedAgent;
      }

      console.log(`INFT updated in Supabase: ${updatedAgent.name}`);
      
      return NextResponse.json({ 
        success: true, 
        agent: updatedAgent 
      });

    } catch (supabaseError) {
      console.error('❌ Supabase update failed:', supabaseError);
      
      // 🔄 FALLBACK: Update in memory
      const agentIndex = unifiedAgents.findIndex(agent => agent.id === id);
      if (agentIndex === -1) {
        return NextResponse.json({ 
          success: false, 
          error: 'Agent not found' 
        }, { status: 404 });
      }
      
      const agent = unifiedAgents[agentIndex];
      
      // Check permission - only creator can edit
      if (agent.creator.toLowerCase() !== userAddress.toLowerCase()) {
        return NextResponse.json({ 
          success: false, 
          error: 'Only creator can edit this agent' 
        }, { status: 403 });
      }
      
      // Update agent
      const updatedAgent = {
        ...agent,
        ...updates,
        // Protect critical fields
        id: agent.id,
        creator: agent.creator,
        tokenId: agent.tokenId,
        agentContractAddress: agent.agentContractAddress,
        txHash: agent.txHash,
        createdAt: agent.createdAt
      };
      
      unifiedAgents[agentIndex] = updatedAgent;
      
      console.log(`INFT updated in memory (fallback): ${updatedAgent.name}`);
      
      return NextResponse.json({ 
        success: true, 
        agent: updatedAgent 
      });
    }
    
  } catch (error) {
    console.error('Failed to update unified INFT:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update agent' 
    }, { status: 500 });
  }
}

/**
 * DELETE /api/agents - Mark agent as sold (set active=false)
 * Body: { agentId: string, buyerAddress: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const { agentId, buyerAddress } = await request.json();
    
    if (!agentId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing agentId' 
      }, { status: 400 });
    }

    // 🚀 PRIORITY 1: Update in Supabase (mark as sold)
    try {
      const { data, error } = await supabase
        .from('agents')
        .update({
          active: false,
          current_owner: buyerAddress || 'sold'
        })
        .eq('id', agentId)
        .select()
        .single();

      if (error) {
        console.error('Supabase delete/sold failed:', error);
      } else {
        console.log(`INFT marked as sold in Supabase: ${data.name}`);
      }
    } catch (supabaseError) {
      console.error('Supabase connection failed:', supabaseError);
    }

    // 🔄 FALLBACK: Update in memory
    const agentIndex = unifiedAgents.findIndex(agent => agent.id === agentId);
    if (agentIndex !== -1) {
      unifiedAgents[agentIndex].active = false;
      unifiedAgents[agentIndex].currentOwner = buyerAddress || 'sold';
      console.log(`INFT marked as sold in memory: ${unifiedAgents[agentIndex].name}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Agent marked as sold' 
    });
    
  } catch (error) {
    console.error('Failed to mark INFT as sold:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to mark agent as sold' 
    }, { status: 500 });
  }
}