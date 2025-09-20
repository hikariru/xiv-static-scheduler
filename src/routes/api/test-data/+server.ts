import { json } from '@sveltejs/kit';
import { supabaseServer } from '$lib/server/supabase.js';
import { generateUrlToken } from '$lib/utils/token.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { action } = await request.json();

    if (action === 'create_test_week') {
      // テスト用の週データを作成
      const testToken = generateUrlToken();
      const { data: week, error } = await supabaseServer
        .from('weeks')
        .insert({
          start_date: '2025-01-14', // 火曜日
          end_date: '2025-01-20',   // 月曜日
          url_token: testToken
        })
        .select()
        .single();

      if (error) {
        return json({ error: error.message }, { status: 500 });
      }

      return json({ week, testToken });
    }

    return json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Test data API error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};