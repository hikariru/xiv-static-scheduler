import { json } from '@sveltejs/kit';
import { supabaseServer } from '$lib/server/supabase.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { entryId, schedules } = await request.json();

    // バリデーション
    if (!entryId || !Array.isArray(schedules)) {
      return json({ 
        error: 'entryId and schedules array are required' 
      }, { status: 400 });
    }

    // スケジュールデータのバリデーション
    for (const schedule of schedules) {
      if (!schedule.date || !['○', '△', '×'].includes(schedule.status)) {
        return json({ 
          error: 'Invalid schedule data. Status must be ○, △, or ×' 
        }, { status: 400 });
      }
    }

    // 既存スケジュールを削除
    const { error: deleteError } = await supabaseServer
      .from('schedules')
      .delete()
      .eq('entry_id', entryId);

    if (deleteError) {
      console.error('Error deleting existing schedules:', deleteError);
      return json({ error: 'Failed to update schedules' }, { status: 500 });
    }

    // 新しいスケジュールを挿入
    const scheduleData = schedules.map(schedule => ({
      entry_id: entryId,
      date: schedule.date,
      status: schedule.status,
      updated_at: new Date().toISOString()
    }));

    const { data: newSchedules, error: insertError } = await supabaseServer
      .from('schedules')
      .insert(scheduleData)
      .select();

    if (insertError) {
      console.error('Error inserting schedules:', insertError);
      return json({ error: 'Failed to save schedules' }, { status: 500 });
    }

    return json({ schedules: newSchedules });

  } catch (error) {
    console.error('Error in schedules API:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const GET: RequestHandler = async ({ url }) => {
  try {
    const entryId = url.searchParams.get('entryId');

    if (!entryId) {
      return json({ error: 'entryId is required' }, { status: 400 });
    }

    // スケジュールを取得
    const { data: schedules, error } = await supabaseServer
      .from('schedules')
      .select('*')
      .eq('entry_id', entryId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching schedules:', error);
      return json({ error: 'Failed to fetch schedules' }, { status: 500 });
    }

    return json({ schedules: schedules || [] });

  } catch (error) {
    console.error('Error in schedules GET API:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};