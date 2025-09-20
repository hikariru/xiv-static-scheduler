<script lang="ts">
    import {ArrowLeft, Calendar, Shield, Trophy, Users, CheckCircle,} from "lucide-svelte";
    import {enhance} from "$app/forms";
    import {page} from "$app/state";
    import type {ActionData, PageData} from "./$types";

    export let data: PageData;
    export let form: ActionData;

    const weekToken = page.params.week_token;

    // 日程確定関連
    let selectedDates: string[] = [];
    let showFinalizeDialog = false;
    let additionalMessage = "";
    let isFinalizing = false;

    // 曜日のラベル
    const dayLabels = ["火", "水", "木", "金", "土", "日", "月"];

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    function isOptimalDate(date: string): boolean {
        return data.optimalDates?.includes(date) || false;
    }

    // 日程確定関連の関数
    function toggleDateSelection(date: string) {
        if (selectedDates.includes(date)) {
            selectedDates = selectedDates.filter(d => d !== date);
        } else {
            selectedDates = [...selectedDates, date];
        }
    }

    function openFinalizeDialog() {
        if (selectedDates.length === 0) {
            alert("確定する日程を選択してください");
            return;
        }
        showFinalizeDialog = true;
    }

    function cancelFinalize() {
        showFinalizeDialog = false;
        additionalMessage = "";
    }

    function goToSummary() {
        window.location.href = `/schedule/${weekToken}/summary`;
    }
</script>

<svelte:head>
    <title>管理者画面 - スタティック日程調整</title>
</svelte:head>

<div class="container mx-auto p-4 max-w-6xl">
    <!-- ヘッダー -->
    <div class="mb-6">
        <div class="flex items-center gap-3 mb-2">
            <Shield class="w-8 h-8 text-warning"/>
            <h1 class="text-3xl font-bold">管理者画面</h1>
        </div>
        <p class="text-base-content/70">
            日程を確定してDiscordに通知できます
        </p>
    </div>

    <!-- 成功メッセージ -->
    {#if form?.success}
        <div class="alert alert-success mb-6">
            <CheckCircle class="w-6 h-6"/>
            <span>{form.message || '日程を確定しました'}</span>
        </div>
    {/if}

    <!-- エラーメッセージ -->
    {#if form?.error}
        <div class="alert alert-error mb-6">
            <span>{form.error}</span>
        </div>
    {/if}

    <!-- 週情報 -->
    <div class="card bg-base-100 shadow-xl mb-6">
        <div class="card-body">
            <h2 class="card-title">
                <Calendar class="w-6 h-6"/>
                対象週間
            </h2>
            <p class="text-lg">
                <span class="font-semibold">{data.week.startDate}</span>
                から
                <span class="font-semibold">{data.week.endDate}</span>
            </p>
        </div>
    </div>

    <!-- 日別集計と確定機能 -->
    <div class="card bg-base-100 shadow-xl mb-6">
        <div class="card-body">
            <h2 class="card-title mb-4">
                <Users class="w-6 h-6"/>
                日別集計と日程確定
            </h2>

            <div class="overflow-x-auto">
                <table class="table table-zebra w-full">
                    <thead>
                    <tr>
                        {#if !data.isFinalized}
                            <th>選択</th>
                        {/if}
                        <th>曜日</th>
                        <th>日付</th>
                        <th class="text-success">○</th>
                        <th class="text-warning">△</th>
                        <th class="text-error">×</th>
                        <th>合計</th>
                        <th>状態</th>
                    </tr>
                    </thead>
                    <tbody>
                    {#each data.dailySummary as day, index}
                        <tr class={isOptimalDate(day.date) ? 'bg-success/20' : data.finalizedDates.includes(day.date) ? 'bg-primary/20' : ''}>
                            {#if !data.isFinalized}
                                <td>
                                    <input
                                        type="checkbox"
                                        class="checkbox checkbox-primary"
                                        checked={selectedDates.includes(day.date)}
                                        on:change={() => toggleDateSelection(day.date)}
                                    />
                                </td>
                            {/if}
                            <td class="font-bold">
                                {dayLabels[index]}
                                {#if isOptimalDate(day.date)}
                                    <Trophy class="w-4 h-4 inline text-yellow-500 ml-1"/>
                                {/if}
                            </td>
                            <td>{formatDate(day.date)}</td>
                            <td class="text-success font-bold">{day.counts['○']}</td>
                            <td class="text-warning font-bold">{day.counts['△']}</td>
                            <td class="text-error font-bold">{day.counts['×']}</td>
                            <td class="font-bold">{day.total}</td>
                            <td>
                                {#if data.finalizedDates.includes(day.date)}
                                    <span class="badge badge-primary">確定済み</span>
                                {:else if isOptimalDate(day.date)}
                                    <span class="badge badge-success">推奨</span>
                                {:else}
                                    <span class="text-base-content/50">-</span>
                                {/if}
                            </td>
                        </tr>
                    {/each}
                    </tbody>
                </table>
            </div>
            
            <!-- 日程確定セクション -->
            {#if data.isFinalized}
                <div class="mt-6 p-4 bg-primary/10 rounded-lg">
                    <h3 class="text-lg font-bold text-primary mb-2">📅 確定した活動日</h3>
                    <div class="flex flex-wrap gap-2">
                        {#each data.finalizedDates as date}
                            {@const dayIndex = data.week.dates.indexOf(date)}
                            <span class="badge badge-primary badge-lg">
                                {dayLabels[dayIndex]} {formatDate(date)}
                            </span>
                        {/each}
                    </div>
                    <p class="mt-3 text-sm text-base-content/70">
                        日程は既に確定されています。Discord通知も送信済みです。
                    </p>
                </div>
            {:else}
                <div class="mt-6 flex flex-col gap-4">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="text-sm text-base-content/70">
                                複数の日程を選択して確定できます
                            </p>
                            <p class="text-xs text-warning mt-1">
                                ⚠️ 確定後は変更できません
                            </p>
                        </div>
                        <button
                            class="btn btn-primary btn-lg"
                            disabled={selectedDates.length === 0}
                            on:click={openFinalizeDialog}
                        >
                            選択した日程を確定
                            {#if selectedDates.length > 0}
                                <span class="badge badge-neutral">{selectedDates.length}</span>
                            {/if}
                        </button>
                    </div>
                    
                    {#if selectedDates.length > 0}
                        <div class="p-3 bg-info/10 rounded-lg">
                            <p class="text-sm font-medium text-info mb-2">選択中の日程:</p>
                            <div class="flex flex-wrap gap-2">
                                {#each selectedDates as date}
                                    {@const dayIndex = data.week.dates.indexOf(date)}
                                    <span class="badge badge-info">
                                        {dayLabels[dayIndex]} {formatDate(date)}
                                    </span>
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </div>

    <!-- 参加者別詳細（簡略版） -->
    <div class="card bg-base-100 shadow-xl mb-6">
        <div class="card-body">
            <h2 class="card-title mb-4">参加者一覧</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each data.participants as participant}
                    <div class="p-3 bg-base-200 rounded-lg">
                        <h3 class="font-semibold mb-2">{participant.name}</h3>
                        <div class="flex gap-1">
                            {#each participant.schedules as schedule, index}
                                <div class="tooltip" data-tip="{dayLabels[index]} {formatDate(schedule.date)}">
                                    {#if schedule.status}
                                        <span class="badge badge-sm"
                                              class:badge-success={schedule.status === '○'}
                                              class:badge-warning={schedule.status === '△'}
                                              class:badge-error={schedule.status === '×'}>
                                         {schedule.status}
                                        </span>
                                    {:else}
                                        <span class="badge badge-sm badge-ghost">-</span>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                        {#if participant.note}
                            <p class="text-xs text-base-content/60 mt-2 truncate">{participant.note}</p>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    </div>

    <!-- ナビゲーション -->
    <div class="flex justify-between">
        <button class="btn btn-ghost" on:click={() => history.back()}>
            <ArrowLeft class="w-4 h-4"/>
            戻る
        </button>
        <button class="btn btn-outline" on:click={goToSummary}>
            詳細画面を見る
        </button>
    </div>
</div>

<!-- 日程確定ダイアログ -->
{#if showFinalizeDialog}
    <div class="modal modal-open">
        <div class="modal-box max-w-lg">
            <h3 class="font-bold text-lg text-primary">日程の確定</h3>
            <div class="py-4">
                <p class="mb-4">以下の日程を確定し、Discordに通知しますか？</p>
                <div class="bg-base-200 p-3 rounded-lg mb-4">
                    <div class="flex flex-wrap gap-2">
                        {#each selectedDates as date}
                            {@const dayIndex = data.week.dates.indexOf(date)}
                            <span class="badge badge-primary">
                                {dayLabels[dayIndex]} {formatDate(date)}
                            </span>
                        {/each}
                    </div>
                </div>
                
                <div class="form-control">
                    <label class="label" for="additional-message">
                        <span class="label-text">追加メッセージ（任意）</span>
                    </label>
                    <textarea
                        id="additional-message"
                        class="textarea textarea-bordered"
                        placeholder="メンバーへの追加メッセージがあれば入力してください"
                        bind:value={additionalMessage}
                        rows="3"
                    ></textarea>
                </div>

                <div class="alert alert-warning mt-4">
                    <span class="text-sm">⚠️ 確定後は変更できません。よろしいですか？</span>
                </div>
            </div>
            
            <div class="modal-action">
                <button
                    class="btn btn-ghost"
                    on:click={cancelFinalize}
                    disabled={isFinalizing}
                >
                    キャンセル
                </button>
                <form method="POST" action="?/finalizeDates" use:enhance={() => {
                    isFinalizing = true;
                    return async ({ result, update }) => {
                        await update();
                        isFinalizing = false;
                        if (result.type === 'success') {
                            showFinalizeDialog = false;
                            additionalMessage = "";
                        }
                    };
                }}>
                    {#each selectedDates as date}
                        <input type="hidden" name="dates[]" value={date} />
                    {/each}
                    <input type="hidden" name="message" value={additionalMessage} />
                    <button
                        type="submit"
                        class="btn btn-primary"
                        class:loading={isFinalizing}
                        disabled={isFinalizing}
                    >
                        {#if isFinalizing}
                            確定中...
                        {:else}
                            確定してDiscordに通知
                        {/if}
                    </button>
                </form>
            </div>
        </div>
    </div>
{/if}