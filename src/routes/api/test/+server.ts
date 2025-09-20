import { json } from '@sveltejs/kit';
import { supabaseServer } from '$lib/server/supabase.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  try {
    // 1. 基本的な接続テスト
    const { data: connectionTest, error: connectionError } = await supabaseServer
      .from('weeks')
      .select('*')
      .limit(1);

    if (connectionError) {
      return json({
        success: false,
        error: 'Database connection failed',
        details: connectionError.message
      }, { status: 500 });
    }

    // 2. テストデータの挿入
    const testToken = `test-${Date.now()}`;
    const { data: insertData, error: insertError } = await supabaseServer
      .from('weeks')
      .insert({
        start_date: '2025-01-14',
        end_date: '2025-01-20',
        url_token: testToken
      })
      .select()
      .single();

    if (insertError) {
      return json({
        success: false,
        error: 'Insert test failed',
        details: insertError.message
      }, { status: 500 });
    }

    // 3. テストデータの削除
    const { error: deleteError } = await supabaseServer
      .from('weeks')
      .delete()
      .eq('url_token', testToken);

    if (deleteError) {
      console.warn('Failed to cleanup test data:', deleteError);
    }

    return json({
      success: true,
      message: 'Supabase connection test successful!',
      testData: insertData
    });

  } catch (error) {
    return json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};