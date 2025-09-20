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

    // 詳細な集計データを取得（エントリーとスケジュールを結合）
    const { data: detailData, error: detailError } = await supabaseServer
      .from('entries')
      .select(`
        id,
        name,
        note,
        schedules (
          date,
          status
        )
      `)
      .eq('week_id', week.id)
      .order('name', { ascending: true });

    if (detailError) {
      console.error('Error fetching detail data:', detailError);
      return json({ error: 'Failed to fetch summary data' }, { status: 500 });
    }

    // 日付別集計を計算
    const startDate = new Date(week.start_date);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    // 日付ごとの集計
    const dailySummary = dates.map(date => {
      const daySchedules = detailData
        .flatMap(entry => entry.schedules || [])
        .filter(schedule => schedule.date === date);

      const counts = {
        '○': daySchedules.filter(s => s.status === '○').length,
        '△': daySchedules.filter(s => s.status === '△').length,
        '×': daySchedules.filter(s => s.status === '×').length
      };

      return {
        date,
        counts,
        total: counts['○'] + counts['△'] + counts['×']
      };
    });

    // 最適日を特定（○が最多の日）
    const maxCount = Math.max(...dailySummary.map(day => day.counts['○']));
    const optimalDates = dailySummary
      .filter(day => day.counts['○'] === maxCount && maxCount > 0)
      .map(day => day.date);

    // 参加者別の詳細データを整形
    const participants = detailData.map(entry => {
      const scheduleMap = new Map(
        (entry.schedules || []).map(s => [s.date, s.status])
      );

      const schedules = dates.map(date => ({
        date,
        status: scheduleMap.get(date) || null
      }));

      return {
        name: entry.name,
        note: entry.note,
        schedules
      };
    });

    return json({
      week: {
        id: week.id,
        startDate: week.start_date,
        endDate: week.end_date,
        dates
      },
      dailySummary,
      optimalDates,
      participants,
      totalParticipants: detailData.length
    });

  } catch (error) {
    console.error('Error in summary API:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};