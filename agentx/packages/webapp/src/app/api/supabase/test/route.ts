// Supabase test endpoint to keep it active
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test 1: Create a test entry (using correct snake_case field names)
    const testData = {
      id: `test-${Date.now()}`,
      token_id: 'test-token',
      agent_contract_address: '0x0000000000000000000000000000000000000000',
      name: 'Supabase Keep-Alive Test',
      description: 'Test entry to keep Supabase active',
      image: 'https://images.unsplash.com/photo-1677442136019-1d7fd3f2aa3b?w=400',
      category: 'Test',
      price: '0.001',
      price_wei: '1000000000000000',
      creator: '0x0000000000000000000000000000000000000000',
      current_owner: '0x0000000000000000000000000000000000000000',
      tx_hash: 'test-tx',
      storage_uri: 'test://storage',
      listing_id: 0,
      active: false, // Mark as test so it doesn't appear in real listings
      capabilities: ['test'],
      compute_model: 'test-model',
      views: 0,
      likes: 0,
      trending: false
    };

    const { data: insertData, error: insertError } = await supabase
      .from('agents')
      .insert(testData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
    } else {
      console.log('✅ Test entry created:', insertData.id);
    }

    // Test 2: Query recent entries
    const { data: queryData, error: queryError } = await supabase
      .from('agents')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (queryError) {
      console.error('❌ Query test failed:', queryError);
    } else {
      console.log('✅ Query successful, found entries:', queryData?.length || 0);
    }

    // Test 3: Update the test entry
    if (insertData) {
      const { error: updateError } = await supabase
        .from('agents')
        .update({ description: 'Updated test entry - keep alive successful' })
        .eq('id', insertData.id);

      if (updateError) {
        console.error('❌ Update test failed:', updateError);
      } else {
        console.log('✅ Update test successful');
      }
    }

    // Test 4: Clean up - delete old test entries (keep only last 3)
    const { data: oldTests } = await supabase
      .from('agents')
      .select('id, created_at')
      .like('name', '%Keep-Alive Test%')
      .order('created_at', { ascending: false })
      .range(3, 100); // Skip first 3, get rest

    if (oldTests && oldTests.length > 0) {
      const idsToDelete = oldTests.map(test => test.id);
      const { error: deleteError } = await supabase
        .from('agents')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        console.error('❌ Cleanup failed:', deleteError);
      } else {
        console.log('✅ Cleaned up old test entries:', idsToDelete.length);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase keep-alive test completed successfully',
      operations: {
        insert: !insertError,
        query: !queryError,
        update: insertData ? true : false,
        cleanup: true
      },
      entriesFound: queryData?.length || 0,
      testId: insertData?.id
    });

  } catch (error) {
    console.error('❌ Supabase test failed:', error);
    return NextResponse.json({
      success: false,
      message: `Supabase test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error
    }, { status: 500 });
  }
}
