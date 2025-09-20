import { error, fail } from "@sveltejs/kit";
import { supabaseServer } from "$lib/server/supabase.js";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const { week_token, participant_id } = params;

  try {
    // 週情報を取得
    const { data: weekData, error: weekError } = await supabaseServer
      .from("weeks")
      .select("id, start_date, end_date, url_token")
      .eq("url_token", week_token)
      .eq("is_active", true)
      .single();

    if (weekError || !weekData) {
      throw error(404, "指定された週が見つかりません");
    }

    // 週の日付配列を生成
    const startDate = new Date(weekData.start_date);
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }

    // 既存エントリーを取得
    const { data: entryData, error: entryError } = await supabaseServer
      .from("entries")
      .select("id, name, note")
      .eq("week_id", weekData.id)
      .eq("participant_id", participant_id)
      .maybeSingle();

    const schedules: Record<string, string | null> = {};

    // エントリーが存在する場合、スケジュールを取得
    if (entryData) {
      const { data: schedulesData, error: schedulesError } =
        await supabaseServer
          .from("schedules")
          .select("date, status")
          .eq("entry_id", entryData.id);

      if (!schedulesError && schedulesData) {
        schedulesData.forEach((schedule) => {
          schedules[schedule.date] = schedule.status;
        });
      }
    }

    // 全日付をスケジュールに初期化
    dates.forEach((date) => {
      if (!(date in schedules)) {
        schedules[date] = null;
      }
    });

    return {
      week: {
        id: weekData.id,
        startDate: weekData.start_date,
        endDate: weekData.end_date,
        dates,
      },
      entry: entryData,
      schedules,
      participantId: participant_id,
    };
  } catch (err) {
    console.error("Data loading error:", err);
    throw error(500, "データの読み込みに失敗しました");
  }
};

export const actions: Actions = {
  save: async ({ request, params }) => {
    const { week_token, participant_id } = params;
    const data = await request.formData();

    const name = data.get("name")?.toString()?.trim();
    const note = data.get("note")?.toString()?.trim() || "";

    if (!name) {
      return fail(400, { error: "名前を入力してください" });
    }

    try {
      // 週情報を取得
      const { data: weekData, error: weekError } = await supabaseServer
        .from("weeks")
        .select("id")
        .eq("url_token", week_token)
        .eq("is_active", true)
        .single();

      if (weekError || !weekData) {
        return fail(404, { error: "指定された週が見つかりません" });
      }

      // エントリーをUPSERT
      const { data: entryData, error: entryError } = await supabaseServer
        .from("entries")
        .upsert(
          {
            week_id: weekData.id,
            participant_id,
            name,
            note,
          },
          {
            onConflict: "week_id,participant_id",
          },
        )
        .select("id")
        .single();

      if (entryError || !entryData) {
        console.error("Entry upsert error:", entryError);
        return fail(500, { error: "エントリーの保存に失敗しました" });
      }

      // スケジュールデータを処理
      const scheduleEntries: Array<{ date: string; status: string }> = [];

      // フォームデータからスケジュールを抽出
      for (const [key, value] of data.entries()) {
        if (key.startsWith("schedule_") && value) {
          const date = key.replace("schedule_", "");
          const status = value.toString();
          if (["○", "△", "×"].includes(status)) {
            scheduleEntries.push({ date, status });
          }
        }
      }

      // 既存スケジュールを削除
      const { error: deleteError } = await supabaseServer
        .from("schedules")
        .delete()
        .eq("entry_id", entryData.id);

      if (deleteError) {
        console.error("Schedule delete error:", deleteError);
        return fail(500, { error: "スケジュールの更新に失敗しました" });
      }

      // 新しいスケジュールを挿入
      if (scheduleEntries.length > 0) {
        const { error: insertError } = await supabaseServer
          .from("schedules")
          .insert(
            scheduleEntries.map((schedule) => ({
              entry_id: entryData.id,
              date: schedule.date,
              status: schedule.status,
            })),
          );

        if (insertError) {
          console.error("Schedule insert error:", insertError);
          return fail(500, { error: "スケジュールの保存に失敗しました" });
        }
      }

      return { success: true };
    } catch (err) {
      console.error("Save action error:", err);
      return fail(500, { error: "保存中にエラーが発生しました" });
    }
  },
};
