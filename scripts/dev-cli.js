#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { ulid } from "ulid";

// URLトークン生成関数
function generateUrlToken() {
  return ulid().toLowerCase();
}

// 環境変数を読み込み
config({ path: ".env.local" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ 環境変数が設定されていません");
  console.error(
    "SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を .env.local に設定してください",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const commands = {
  "db-init": dbInit,
  test: testConnection,
  data: createTestData,
  help: showHelp,
};

async function main() {
  const command = process.argv[2];

  if (!command || command === "help") {
    showHelp();
    return;
  }

  if (!commands[command]) {
    console.error(`❌ 不明なコマンド: ${command}`);
    showHelp();
    process.exit(1);
  }

  try {
    await commands[command]();
  } catch (error) {
    console.error("❌ エラーが発生しました:", error.message);
    process.exit(1);
  }
}

async function dbInit() {
  console.log("🔧 データベースを初期化しています...");

  try {
    // 既存データを削除
    await supabase.from("schedules").delete().neq("id", 0);
    await supabase.from("entries").delete().neq("id", 0);
    await supabase.from("weeks").delete().neq("id", 0);

    console.log("✅ データベース初期化完了");
  } catch (error) {
    throw new Error(`データベース初期化に失敗: ${error.message}`);
  }
}

async function testConnection() {
  console.log("🔍 データベース接続をテストしています...");

  try {
    const { data, error, count } = await supabase
      .from("weeks")
      .select("*", { count: "exact", head: true });

    if (error) {
      throw error;
    }

    console.log("✅ データベース接続成功");
    console.log(`📊 現在の週数: ${count || 0}`);
  } catch (error) {
    throw new Error(`接続テストに失敗: ${error.message}`);
  }
}

async function createTestData() {
  console.log("🎯 テストデータを作成しています...");

  try {
    // まずデータベースを初期化
    await dbInit();

    // 今日を基準に火曜日から始まる週を作成
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=日曜日, 1=月曜日, ..., 6=土曜日
    const daysToTuesday = dayOfWeek === 0 ? 2 : (2 - dayOfWeek + 7) % 7; // 次の火曜日までの日数

    const startDate = new Date(today);
    startDate.setDate(today.getDate() + daysToTuesday);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // 火曜日から月曜日まで

    const weekToken = generateUrlToken();

    // 週データを作成
    const { data: weekData, error: weekError } = await supabase
      .from("weeks")
      .insert({
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        url_token: weekToken,
        is_active: true,
      })
      .select("id")
      .single();

    if (weekError) {
      throw weekError;
    }

    console.log(
      `✅ テスト週作成完了 (${startDate.toISOString().split("T")[0]} ~ ${endDate.toISOString().split("T")[0]})`,
    );

    // サンプル参加者データを作成
    const participants = [
      { name: "テスト太郎", note: "サンプルユーザー1" },
      { name: "サンプル花子", note: "サンプルユーザー2" },
      { name: "デモ次郎", note: "サンプルユーザー3" },
    ];

    const participantUrls = [];

    for (const participant of participants) {
      const participantId = generateUrlToken();

      // エントリーを作成
      const { data: entryData, error: entryError } = await supabase
        .from("entries")
        .insert({
          week_id: weekData.id,
          participant_id: participantId,
          name: participant.name,
          note: participant.note,
        })
        .select("id")
        .single();

      if (entryError) {
        throw entryError;
      }

      // ランダムなスケジュールを作成
      const schedules = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateString = date.toISOString().split("T")[0];

        // ランダムに○、△、×、null を設定
        const statuses = ["○", "△", "×", null];
        const randomStatus =
          statuses[Math.floor(Math.random() * statuses.length)];

        if (randomStatus) {
          schedules.push({
            entry_id: entryData.id,
            date: dateString,
            status: randomStatus,
          });
        }
      }

      if (schedules.length > 0) {
        const { error: scheduleError } = await supabase
          .from("schedules")
          .insert(schedules);

        if (scheduleError) {
          throw scheduleError;
        }
      }

      participantUrls.push({
        name: participant.name,
        url: `http://localhost:5173/schedule/${weekToken}/${participantId}`,
      });
    }

    console.log("✅ 3名の参加者とサンプルスケジュールを追加");

    // URLを出力
    console.log("\n🔗 生成されたURL:");
    console.log(
      `  集計画面: http://localhost:5173/schedule/${weekToken}/summary`,
    );

    participantUrls.forEach((participant, index) => {
      console.log(
        `  参加者${index + 1}(${participant.name}): ${participant.url}`,
      );
    });

    console.log("\n🎉 テストデータの作成が完了しました！");
  } catch (error) {
    throw new Error(`テストデータ作成に失敗: ${error.message}`);
  }
}

function showHelp() {
  console.log(`
CWLS Schedule CLI - Development Tools

USAGE:
  npm run dev:<command>

COMMANDS:
  db-init     Initialize database tables
  test        Test database connection
  data        Create complete test data set with URLs
  help        Show this help

EXAMPLES:
  npm run dev:db-init
  npm run dev:data
  npm run dev:test

For more information: npm run dev:help
`);
}

main();
