<script lang="ts">
    import {BarChart3, Calendar, Save} from "lucide-svelte";
    import {onMount} from "svelte";
    import {enhance} from "$app/forms";
    import {page} from "$app/state";
    import type {ActionData, PageData} from "./$types";

    export let data: PageData;
    export let form: ActionData;

    // URL パラメータから取得
    const weekToken = page.params.week_token;
    const participantId = page.params.participant_id;

    // ステータス定義
    const statusOptions = ["○", "△", "×"] as const;
    type Status = (typeof statusOptions)[number];

    // 状態管理
    let schedules: Record<string, Status | null> = data.schedules as Record<string, Status | null>;
    let name = data.entry?.name || "";
    let note = data.entry?.note || "";
    let isSaving = false;
    let hasUnsavedChanges = false;

    // 曜日のラベル
    const dayLabels = ["火", "水", "木", "金", "土", "日", "月"];

    onMount(() => {
        loadFromLocalStorage();
    });

    function loadFromLocalStorage() {
        const stored = localStorage.getItem("participantName");
        if (stored && !name) {
            name = stored;
        }
    }

    function saveToLocalStorage() {
        if (name) {
            localStorage.setItem("participantName", name);
        }
    }

    function setStatus(date: string, status: Status | null) {
        schedules[date] = status;
        hasUnsavedChanges = true;
    }

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    // フォーム送信の拡張
    function submitForm(form: HTMLFormElement) {
        return enhance(form, () => {
            isSaving = true;
            return async ({result, update}: any) => {
                isSaving = false;
                if (result.type === "success") {
                    hasUnsavedChanges = false;
                    saveToLocalStorage();
                }
                await update();
            };
        });
    }
</script>

<svelte:head>
    <title>予定入力 - FF14 調整ちゃん</title>
</svelte:head>

<div class="container mx-auto p-4 max-w-4xl">
    <!-- ヘッダー -->
    <div class="card bg-base-100 shadow-xl mb-6">
        <div class="card-body">
            <h1 class="card-title text-2xl">
                <Calendar class="w-8 h-8"/>
                予定入力
            </h1>
            <p class="text-base-content/70">
                {formatDate(data.week.startDate)} 〜 {formatDate(data.week.endDate)} の予定を入力してください
            </p>
        </div>
    </div>

    <!-- エラー表示 -->
    {#if form?.error}
        <div class="alert alert-error mb-6">
            <span>{form.error}</span>
        </div>
    {/if}

    <!-- 成功メッセージ -->
    {#if form?.success}
        <div class="alert alert-success mb-6">
            <span>保存しました！</span>
        </div>
    {/if}

    <!-- 入力フォーム -->
    <form method="POST" action="?/save" use:submitForm>
        <div class="card bg-base-100 shadow-xl mb-6">
            <div class="card-body">
                <div class="form-control w-full max-w-xs mb-4">
                    <label class="label" for="name">
                        <span class="label-text">名前 *</span>
                    </label>
                    <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="お名前を入力"
                            class="input input-bordered w-full max-w-xs"
                            bind:value={name}
                            maxlength="50"
                            required
                    />
                </div>

                <div class="form-control w-full max-w-md">
                    <label class="label" for="note">
                        <span class="label-text">メモ（任意）</span>
                    </label>
                    <textarea
                            id="note"
                            name="note"
                            class="textarea textarea-bordered"
                            placeholder="メモがあれば入力してください"
                            bind:value={note}
                            maxlength="200"
                    ></textarea>
                </div>
            </div>
        </div>

        <!-- スケジュールテーブル -->
        <div class="card bg-base-100 shadow-xl mb-6">
            <div class="card-body">
                <h2 class="card-title mb-4">予定選択</h2>

                <div class="overflow-x-auto">
                    <table class="table table-zebra w-full">
                        <thead>
                        <tr>
                            <th class="w-20">曜日</th>
                            <th class="w-24">日付</th>
                            <th>予定</th>
                        </tr>
                        </thead>
                        <tbody>
                        {#each data.week.dates as date, index}
                            <tr>
                                <td class="font-bold">{dayLabels[index]}</td>
                                <td>{formatDate(date)}</td>
                                <td>
                                    <div class="flex gap-2">
                                        <!-- 隠しフィールドでスケジュール情報を送信 -->
                                        <input type="hidden" name="schedule_{date}" value={schedules[date] || ''}/>

                                        <!-- ○ボタン -->
                                        <button
                                                type="button"
                                                class="btn btn-sm min-w-[50px] {schedules[date] === '○' ? 'btn-success' : 'btn-outline btn-success'}"
                                                on:click={() => setStatus(date, '○')}
                                        >
                                            ○
                                        </button>
                                        <!-- △ボタン -->
                                        <button
                                                type="button"
                                                class="btn btn-sm min-w-[50px] {schedules[date] === '△' ? 'btn-warning' : 'btn-outline btn-warning'}"
                                                on:click={() => setStatus(date, '△')}
                                        >
                                            △
                                        </button>
                                        <!-- ×ボタン -->
                                        <button
                                                type="button"
                                                class="btn btn-sm min-w-[50px] {schedules[date] === '×' ? 'btn-error' : 'btn-outline btn-error'}"
                                                on:click={() => setStatus(date, '×')}
                                        >
                                            ×
                                        </button>
                                        <!-- クリアボタン -->
                                        <button
                                                type="button"
                                                class="btn btn-sm btn-ghost text-xs"
                                                on:click={() => setStatus(date, null)}
                                        >
                                            クリア
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/each}
                        </tbody>
                    </table>
                </div>

                <div class="alert alert-info mt-4">
                    <span>○ = 参加可能、△ = 調整次第、× = 参加不可</span>
                </div>
            </div>
        </div>

        <!-- アクションボタン -->
        <div class="flex gap-4 justify-center">
            <button
                    type="submit"
                    class="btn btn-primary"
                    class:loading={isSaving}
                    disabled={!name.trim() || isSaving}
            >
                <Save class="w-4 h-4"/>
                {isSaving ? '保存中...' : '保存'}
            </button>

            <a href="/schedule/{weekToken}/summary" class="btn btn-secondary">
                <BarChart3 class="w-4 h-4"/>
                集計を見る
            </a>
        </div>
    </form>
</div>
