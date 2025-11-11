// Endpoint to create fake agents to keep Supabase active
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const SAMPLE_AGENTS = [
  {
    name: 'AI Analyst Pro',
    description: 'Advanced financial analysis and market predictions',
    category: 'Finance',
    capabilities: ['analysis', 'prediction', 'reporting'],
    compute_model: 'llama-3.3-70b-instruct'
  },
  {
    name: 'Code Assistant',
    description: 'Intelligent code review and optimization suggestions',
    category: 'Development',
    capabilities: ['coding', 'review', 'optimization'],
    compute_model: 'deepseek-r1-70b'
  },
  {
    name: 'Content Creator',
    description: 'Creative writing and content generation specialist',
    category: 'Creative',
    capabilities: ['writing', 'creativity', 'content'],
    compute_model: 'llama-3.3-70b-instruct'
  },
  {
    name: 'Research Bot',
    description: 'Academic research and data analysis expert',
    category: 'Research',
    capabilities: ['research', 'analysis', 'summarization'],
    compute_model: 'deepseek-r1-70b'
  }
];

export async function POST() {
  try {
    console.log('🚀 Creating sample agents to keep Supabase active...');
    
    const results = [];
    
    for (let i = 0; i < SAMPLE_AGENTS.length; i++) {
      const agent = SAMPLE_AGENTS[i];
      const timestamp = Date.now() + i; // Ensure unique IDs
      
      const agentData = {
        id: `keep-alive-${timestamp}`,
        token_id: `token-${timestamp}`,
        agent_contract_address: '0x0000000000000000000000000000000000000001',
        name: `${agent.name} #${timestamp.toString().slice(-4)}`,
        description: agent.description,
        image: 'https://images.unsplash.com/photo-1677442136019-1d7fd3f2aa3b?w=400',
        category: agent.category,
        price: (Math.random() * 0.1 + 0.01).toFixed(4), // Random price 0.01-0.11
        price_wei: '10000000000000000', // 0.01 ETH in wei
        creator: '0x0000000000000000000000000000000000000001',
        current_owner: '0x0000000000000000000000000000000000000001',
        tx_hash: `keep-alive-tx-${timestamp}`,
        storage_uri: `0g://storage/keep-alive-${timestamp}`,
        listing_id: 0,
        active: false, // Mark as inactive so they don't appear in real marketplace
        capabilities: agent.capabilities,
        compute_model: agent.compute_model,
        views: Math.floor(Math.random() * 100),
        likes: Math.floor(Math.random() * 50),
        trending: false
      };

      const { data, error } = await supabase
        .from('agents')
        .insert(agentData)
        .select()
        .single();

      if (error) {
        console.error(`❌ Failed to create agent ${i + 1}:`, error);
        results.push({ success: false, agent: agent.name, error: error.message });
      } else {
        console.log(`✅ Created agent ${i + 1}: ${data.name}`);
        results.push({ success: true, agent: data.name, id: data.id });
      }

      // Small delay between inserts
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Get total count
    const { count } = await supabase
      .from('agents')
      .select('id', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      message: 'Sample agents created successfully',
      results,
      totalAgentsInDB: count,
      successfulCreations: results.filter(r => r.success).length
    });

  } catch (error) {
    console.error('❌ Keep-alive operation failed:', error);
    return NextResponse.json({
      success: false,
      message: `Keep-alive failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Simple query to keep Supabase active
    const { data, error, count } = await supabase
      .from('agents')
      .select('id, name, category, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase query successful',
      totalEntries: count,
      recentEntries: data?.length || 0,
      entries: data?.map(entry => ({
        id: entry.id,
        name: entry.name,
        category: entry.category,
        created: entry.created_at
      }))
    });

  } catch (error) {
    console.error('❌ Supabase query failed:', error);
    return NextResponse.json({
      success: false,
      message: `Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}
