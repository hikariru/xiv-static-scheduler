import {error, fail} from "@sveltejs/kit";
import {supabaseServer} from "$lib/server/supabase.js";
import {DISCORD_WEBHOOK_URL} from "$env/static/private";
import type {Actions, PageServerLoad} from "./$types";

export const load: PageServerLoad = async ({params}) => {
  const {week_token} = params;

  try {
    // 週情報を取得
    const {data: weekData, error: weekError} = await supabaseServer
      .from("weeks")
      .select("id, start_date, end_date, url_token")
      .eq("url_token", week_token)
      .eq("is_active", true)
      .single();

    if (weekError || !weekData) {
      throw error(404, "指定された週が見つかりません");
    }

    // 確定済み日程を取得
    const {data: finalizedSchedules, error: finalizedError} = await supabaseServer
      .from("finalized_schedules")
      .select("finalized_date")
      .eq("week_id", weekData.id)
      .order("finalized_date");

    const finalizedDates = finalizedSchedules?.map(schedule => schedule.finalized_date) || [];

    // 週の日付配列を生成
    const startDate = new Date(weekData.start_date);
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }

    // 参加者とスケジュールを取得
    const {data: entriesData, error: entriesError} = await supabaseServer
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
      const counts = {"○": 0, "△": 0, "×": 0};
      let total = 0;

      participants.forEach((participant) => {
        const schedule = participant.schedules.find((s) => s.date === date);
        if (schedule?.status) {
          counts[schedule.status as "○" | "△" | "×"]++;
          total++;
        }
      });

      return {date, counts, total};
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
      finalizedDates,
      isFinalized: finalizedDates.length > 0,
    };
  } catch (err) {
    console.error("Admin data loading error:", err);
    throw error(500, "データの読み込みに失敗しました");
  }
};

export const actions: Actions = {
  finalizeDates: async ({request, params}) => {
    console.log("finalizeDates action started");
    const {week_token} = params;
    const data = await request.formData();
    const selectedDates = data.getAll("dates[]");
    const message = data.get("message")?.toString() || "";

    console.log("selectedDates:", selectedDates);
    console.log("message:", message);

    if (!selectedDates || selectedDates.length === 0) {
      console.log("No dates selected, returning error");
      return fail(400, {error: "確定する日付が選択されていません"});
    }

    try {
      // 週情報を取得
      const {data: weekData, error: weekError} = await supabaseServer
        .from("weeks")
        .select("id, start_date, end_date")
        .eq("url_token", week_token)
        .eq("is_active", true)
        .single();

      if (weekError || !weekData) {
        return fail(404, {error: "指定された週が見つかりません"});
      }

      // 既に確定済みの日程があるかチェック
      const {data: existingSchedules, error: existingError} = await supabaseServer
        .from("finalized_schedules")
        .select("finalized_date")
        .eq("week_id", weekData.id);

      if (existingError) {
        console.error("Existing schedules check error:", existingError);
        return fail(500, {error: "確定済み日程の確認に失敗しました"});
      }

      if (existingSchedules && existingSchedules.length > 0) {
        return fail(400, {error: "この週は既に日程が確定済みです"});
      }

      // 確定日程を一括挿入
      const finalizedSchedules = selectedDates.map((date) => ({
        week_id: weekData.id,
        finalized_date: date,
      }));

      const {error: insertError} = await supabaseServer
        .from("finalized_schedules")
        .insert(finalizedSchedules);

      if (insertError) {
        console.error("Finalized schedules insert error:", insertError);
        return fail(500, {error: "日程の確定に失敗しました"});
      }

      // 各確定日の参加者情報を取得
      const participantsByDate = await Promise.all(
        selectedDates.map(async (date) => {
          const {data: entriesData, error: entriesError} = await supabaseServer
            .from("entries")
            .select(`
							name,
							schedules!inner (
								date,
								status
							)
						`)
            .eq("week_id", weekData.id)
            .eq("schedules.date", date)
            .in("schedules.status", ["○", "△"]);

          return {
            date: date as string,
            participants: entriesData || [],
          };
        }),
      );

      // Discord通知を送信
      console.log("Sending Discord notification...");
      await sendDiscordNotification(participantsByDate, message);
      console.log("Discord notification sent");

      console.log("Action completed successfully");
      return {
        success: true,
        finalizedDates: selectedDates,
        message: `${selectedDates.length}件の日程を確定しました`
      };
    } catch (err) {
      console.error("Finalize dates action error:", err);
      return fail(500, {error: "確定処理中にエラーが発生しました"});
    }
  },
};

// Discord通知を送信する関数
async function sendDiscordNotification(
  participantsByDate: Array<{ date: string; participants: any[] }>,
  additionalMessage: string,
) {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn("Discord Webhook URL が設定されていません");
    return;
  }

  try {
    // 日付を日本語形式にフォーマット
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekday = weekdays[date.getDay()];
      return `${month}月${day}日（${weekday}）`;
    };

    // Discord メッセージを構築
    let message = "<@1399857881003589632> 🗓️ **【今週の活動日確定】**\n\n";
    message += "今週の活動日が確定しました！\n\n";

    participantsByDate.forEach(({date, participants}) => {
      message += `📅 **${formatDate(date)}**\n`;

      const availableParticipants = participants.filter(p => p.schedules[0]?.status === "○");
      const conditionalParticipants = participants.filter(p => p.schedules[0]?.status === "△");

      if (availableParticipants.length > 0) {
        message += `　○：${availableParticipants.map(p => p.name).join("、")}\n`;
      }
      if (conditionalParticipants.length > 0) {
        message += `　△：${conditionalParticipants.map(p => p.name).join("、")}\n`;
      }
      message += "\n";
    });

    if (additionalMessage.trim()) {
      message += `💬 **メッセージ**\n${additionalMessage}\n\n`;
    }

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`Discord通知の送信に失敗: ${response.statusText}`);
    }

    console.log("Discord通知を送信しました");
  } catch (error) {
    console.error("Discord通知の送信に失敗:", error);
    // Discord通知の失敗は全体の処理を止めない
  }
}
