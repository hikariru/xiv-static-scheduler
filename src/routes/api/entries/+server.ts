import { json } from '@sveltejs/kit';
import { supabaseServer } from '$lib/server/supabase.js';
import { requireAdminAuth } from '$lib/server/auth.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    // 管理認証チェック
    requireAdminAuth(request);
    
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

export const PUT: RequestHandler = async ({ request }) => {
  try {
    // 管理認証チェック
    requireAdminAuth(request);
    
    const { weekId, participantId, name } = await request.json();

    // バリデーション
    if (!weekId || !participantId || !name) {
      return json({ 
        error: 'weekId, participantId, and name are required' 
      }, { status: 400 });
    }

    if (name.length > 50) {
      return json({ error: 'Name must be 50 characters or less' }, { status: 400 });
    }

    // 参加者名の更新
    const { data: entry, error: updateError } = await supabaseServer
      .from('entries')
      .update({
        name: name.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('week_id', weekId)
      .eq('participant_id', participantId)
      .select()
      .single();

    if (updateError) {
      console.error('Entry update error:', updateError);
      return json({ error: 'Failed to update entry' }, { status: 500 });
    }

    return json({ entry });

  } catch (error) {
    console.error('Error in entries PUT API:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ request }) => {
  try {
    // 管理認証チェック
    requireAdminAuth(request);
    
    const { weekId, participantId } = await request.json();

    // バリデーション
    if (!weekId || !participantId) {
      return json({ 
        error: 'weekId and participantId are required' 
      }, { status: 400 });
    }

    // まず該当するエントリーIDを取得
    const { data: entries, error: entryFetchError } = await supabaseServer
      .from('entries')
      .select('id')
      .eq('week_id', weekId)
      .eq('participant_id', participantId);

    if (entryFetchError) {
      console.error('Entry fetch error:', entryFetchError);
      return json({ error: 'Failed to fetch entry' }, { status: 500 });
    }

    if (!entries || entries.length === 0) {
      return json({ error: 'Entry not found' }, { status: 404 });
    }

    // 関連するスケジュールを削除
    const entryIds = entries.map(entry => entry.id);
    const { error: scheduleError } = await supabaseServer
      .from('schedules')
      .delete()
      .in('entry_id', entryIds);

    if (scheduleError) {
      console.error('Schedule delete error:', scheduleError);
      return json({ error: 'Failed to delete schedules' }, { status: 500 });
    }

    // 次に参加者エントリを削除
    const { error: entryError } = await supabaseServer
      .from('entries')
      .delete()
      .eq('week_id', weekId)
      .eq('participant_id', participantId);

    if (entryError) {
      console.error('Entry delete error:', entryError);
      return json({ error: 'Failed to delete entry' }, { status: 500 });
    }

    return json({ success: true });

  } catch (error) {
    console.error('Error in entries DELETE API:', error);
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