import { error, fail, redirect } from "@sveltejs/kit";
import { supabaseServer } from "$lib/server/supabase.js";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const { week_token } = params;

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

    // 参加者とスケジュールを取得
    const { data: entriesData, error: entriesError } = await supabaseServer
      .from("entries")
      .select(`
				id,
				participant_id,
				name,
				note,
				schedules (
					date,
					status
				)
			`)
      .eq("week_id", weekData.id)
      .order("name");

    if (entriesError) {
      throw error(500, "参加者データの取得に失敗しました");
    }

    // 参加者データを整形
    const participants = (entriesData || []).map((entry: any) => {
      const scheduleMap: Record<string, string | null> = {};

      // 全日付を初期化
      dates.forEach((date) => {
        scheduleMap[date] = null;
      });

      // スケジュールデータをマップに設定
      entry.schedules.forEach((schedule: any) => {
        scheduleMap[schedule.date] = schedule.status;
      });

      // 日付順でスケジュール配列を作成
      const schedules = dates.map((date) => ({
        date,
        status: scheduleMap[date],
      }));

      return {
        id: entry.id,
        participant_id: entry.participant_id,
        name: entry.name,
        note: entry.note,
        schedules,
      };
    });

    // 日別集計を計算
    const dailySummary = dates.map((date) => {
      const counts = { "○": 0, "△": 0, "×": 0 };
      let total = 0;

      participants.forEach((participant) => {
        const schedule = participant.schedules.find((s) => s.date === date);
        if (schedule?.status) {
          counts[schedule.status as "○" | "△" | "×"]++;
          total++;
        }
      });

      return { date, counts, total };
    });

    // 最適日を計算（○が最も多い日）
    const maxOptimalCount = Math.max(
      ...dailySummary.map((day) => day.counts["○"]),
    );
    const optimalDates = dailySummary
      .filter(
        (day) => day.counts["○"] === maxOptimalCount && maxOptimalCount > 0,
      )
      .map((day) => day.date);

    return {
      week: {
        id: weekData.id,
        startDate: weekData.start_date,
        endDate: weekData.end_date,
        dates,
      },
      participants,
      dailySummary,
      optimalDates,
    };
  } catch (err) {
    console.error("Summary data loading error:", err);
    throw error(500, "データの読み込みに失敗しました");
  }
};

export const actions: Actions = {
  deleteParticipant: async ({ request, params }) => {
    const { week_token } = params;
    const data = await request.formData();
    const participantId = data.get("participant_id")?.toString();

    if (!participantId) {
      return fail(400, { error: "参加者IDが指定されていません" });
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

      // エントリーを取得
      const { data: entryData, error: entryError } = await supabaseServer
        .from("entries")
        .select("id")
        .eq("week_id", weekData.id)
        .eq("participant_id", participantId)
        .single();

      if (entryError || !entryData) {
        return fail(404, { error: "指定された参加者が見つかりません" });
      }

      // スケジュールを削除
      const { error: scheduleDeleteError } = await supabaseServer
        .from("schedules")
        .delete()
        .eq("entry_id", entryData.id);

      if (scheduleDeleteError) {
        console.error("Schedule delete error:", scheduleDeleteError);
        return fail(500, { error: "スケジュールの削除に失敗しました" });
      }

      // エントリーを削除
      const { error: entryDeleteError } = await supabaseServer
        .from("entries")
        .delete()
        .eq("id", entryData.id);

      if (entryDeleteError) {
        console.error("Entry delete error:", entryDeleteError);
        return fail(500, { error: "エントリーの削除に失敗しました" });
      }

      return { success: true };
    } catch (err) {
      console.error("Delete action error:", err);
      return fail(500, { error: "削除中にエラーが発生しました" });
    }
  },
};
