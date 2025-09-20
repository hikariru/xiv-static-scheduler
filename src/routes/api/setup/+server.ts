import { json } from '@sveltejs/kit';
import { supabaseServer } from '$lib/server/supabase.js';
import { requireDevelopmentOnly } from '$lib/server/auth.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async () => {
  try {
    // 開発環境のみ許可
    requireDevelopmentOnly();
    
    // テーブル作成SQL
    const createTablesSQL = `
      -- weeksテーブル
      CREATE TABLE IF NOT EXISTS weeks (
        id SERIAL PRIMARY KEY,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        url_token TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_active BOOLEAN DEFAULT true
      );

      -- entriesテーブル
      CREATE TABLE IF NOT EXISTS entries (
        id SERIAL PRIMARY KEY,
        week_id INTEGER NOT NULL REFERENCES weeks(id) ON DELETE CASCADE,
        participant_id TEXT NOT NULL,
        name TEXT NOT NULL,
        note TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(week_id, participant_id)
      );

      -- schedulesテーブル
      CREATE TABLE IF NOT EXISTS schedules (
        id SERIAL PRIMARY KEY,
        entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('○', '△', '×')),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(entry_id, date)
      );

      -- インデックス作成
      CREATE INDEX IF NOT EXISTS idx_weeks_url_token ON weeks(url_token);
      CREATE INDEX IF NOT EXISTS idx_weeks_is_active ON weeks(is_active);
      CREATE INDEX IF NOT EXISTS idx_entries_week_id ON entries(week_id);
      CREATE INDEX IF NOT EXISTS idx_entries_participant_id ON entries(participant_id);
      CREATE INDEX IF NOT EXISTS idx_schedules_entry_id ON schedules(entry_id);
      CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
    `;

    const { error } = await supabaseServer.rpc('sql', { query: createTablesSQL });

    if (error) {
      return json({
        success: false,
        error: 'Failed to create tables',
        details: error.message
      }, { status: 500 });
    }

    return json({
      success: true,
      message: 'Database tables created successfully!'
    });

  } catch (error) {
    return json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};