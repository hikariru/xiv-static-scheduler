import {json} from "@sveltejs/kit";
import {CRON_SECRET, DISCORD_WEBHOOK_URL} from "$env/static/private";
import {supabaseServer} from "$lib/server/supabase";
import {generateUrlToken} from "$lib/utils/token";

export const GET = async ({request}) => {
  // Vercel Cronからのリクエスト認証
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response("Unauthorized", {status: 401});
  }

  try {
    console.log("週次スケジュール作成を開始します...");

    // 火曜日から次週月曜日の期間を計算
    const nextTuesday = getNextTuesday();
    const nextMonday = new Date(nextTuesday);
    nextMonday.setDate(nextMonday.getDate() + 6); // 6日後が月曜日

    // 新しい週データを作成
    const urlToken = generateUrlToken();
    const {data: weekData, error: weekError} = await supabaseServer
      .from("weeks")
      .insert({
        start_date: nextTuesday.toISOString().split("T")[0],
        end_date: nextMonday.toISOString().split("T")[0],
        url_token: urlToken,
        is_active: true,
      })
      .select()
      .single();

    if (weekError) {
      throw new Error(`週データの作成に失敗: ${weekError.message}`);
    }

    console.log(`新しい週を作成しました: ${weekData.start_date} - ${weekData.end_date}`);

    // Discord通知を送信
    if (DISCORD_WEBHOOK_URL) {
      await sendDiscordNotification(weekData, urlToken);
    }

    return json({
      success: true,
      message: "週次スケジュールの作成が完了しました",
      week: weekData,
    });
  } catch (error) {
    console.error("週次スケジュール作成中にエラーが発生:", error);
    return json(
      {
        success: false,
        message: "週次スケジュールの作成に失敗しました",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {status: 500},
    );
  }
};

// 次の火曜日の日付を取得
function getNextTuesday(): Date {
  const now = new Date();
  const daysUntilTuesday = (2 - now.getDay() + 7) % 7 || 7; // 火曜日は2
  const nextTuesday = new Date(now);
  nextTuesday.setDate(now.getDate() + daysUntilTuesday);
  nextTuesday.setHours(0, 0, 0, 0);
  return nextTuesday;
}

// Discord通知を送信
async function sendDiscordNotification(weekData: any, urlToken: string) {
  try {
    const scheduleUrl = `${process.env.ORIGIN || "https://xiv-scheduler.vercel.app"}/schedule/${urlToken}/summary`;

    const message = {
      content: `<@1399857881003589632> 🗓️ **スケジュール**\n\n📅 **対象期間**: ${weekData.start_date} ～ ${weekData.end_date}\n🔗 **参加登録**: ${scheduleUrl}\n\n皆さんの参加可能日時を入力してください！`,
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
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
