import { json } from '@sveltejs/kit';
import { supabaseServer } from '$lib/server/supabase.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const { token } = params;

    if (!token) {
      return json({ error: 'Token is required' }, { status: 400 });
    }

    // 週情報を取得
    const { data: week, error: weekError } = await supabaseServer
      .from('weeks')
      .select('*')
      .eq('url_token', token)
      .eq('is_active', true)
      .single();

    if (weekError || !week) {
      return json({ error: 'Week not found' }, { status: 404 });
    }

    // 日付配列を生成（火曜〜月曜）
    const startDate = new Date(week.start_date);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return json({
      week: {
        id: week.id,
        startDate: week.start_date,
        endDate: week.end_date,
        urlToken: week.url_token,
        dates
      }
    });

  } catch (error) {
    console.error('Error fetching week:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};