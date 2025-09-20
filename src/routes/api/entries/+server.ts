import { json } from '@sveltejs/kit';
import { supabaseServer } from '$lib/server/supabase.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { weekId, participantId, name, note } = await request.json();

    // バリデーション
    if (!weekId || !participantId || !name) {
      return json({ 
        error: 'weekId, participantId, and name are required' 
      }, { status: 400 });
    }

    if (name.length > 50) {
      return json({ error: 'Name must be 50 characters or less' }, { status: 400 });
    }

    if (note && note.length > 200) {
      return json({ error: 'Note must be 200 characters or less' }, { status: 400 });
    }

    // エントリーの作成または更新（UPSERT）
    const { data: entry, error: entryError } = await supabaseServer
      .from('entries')
      .upsert({
        week_id: weekId,
        participant_id: participantId,
        name: name.trim(),
        note: note?.trim() || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'week_id,participant_id'
      })
      .select()
      .single();

    if (entryError) {
      console.error('Entry upsert error:', entryError);
      return json({ error: 'Failed to save entry' }, { status: 500 });
    }

    return json({ entry });

  } catch (error) {
    console.error('Error in entries API:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const GET: RequestHandler = async ({ url }) => {
  try {
    const weekId = url.searchParams.get('weekId');
    const participantId = url.searchParams.get('participantId');

    if (!weekId || !participantId) {
      return json({ 
        error: 'weekId and participantId are required' 
      }, { status: 400 });
    }

    // 既存エントリーを取得
    const { data: entry, error } = await supabaseServer
      .from('entries')
      .select('*')
      .eq('week_id', weekId)
      .eq('participant_id', participantId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = No rows returned
      console.error('Error fetching entry:', error);
      return json({ error: 'Failed to fetch entry' }, { status: 500 });
    }

    return json({ entry: entry || null });

  } catch (error) {
    console.error('Error in entries GET API:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};