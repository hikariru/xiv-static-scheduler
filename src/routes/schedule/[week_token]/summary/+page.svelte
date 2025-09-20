<script lang="ts">
    import {ArrowLeft, Calendar, Edit3, Trash2, Trophy, UserPlus, Users,} from "lucide-svelte";
    import {enhance} from "$app/forms";
    import {page} from "$app/state";
    import {generateUrlToken} from "$lib/utils/token.js";
    import type {ActionData, PageData} from "./$types";

    export let data: PageData;
    export let form: ActionData;

    const weekToken = page.params.week_token;

    let showDeleteDialog = false;
    let participantToDelete: any = null;
    let isDeleting = false;

    // 曜日のラベル
    const dayLabels = ["火", "水", "木", "金", "土", "日", "月"];

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    function isOptimalDate(date: string): boolean {
        return data.optimalDates?.includes(date) || false;
    }

    function goToSchedule() {
        const generatedId = generateUrlToken();
        window.location.href = `/schedule/${weekToken}/${generatedId}`;
    }

    function confirmDelete(participant: any) {
        participantToDelete = participant;
        showDeleteDialog = true;
    }

    function cancelDelete() {
        showDeleteDialog = false;
        participantToDelete = null;
    }

    // 削除フォームの拡張
    function deleteForm(form: HTMLFormElement) {
        return enhance(form, () => {
            isDeleting = true;
            return async ({result, update}: any) => {
                isDeleting = false;
                if (result.type === "success") {
                    showDeleteDialog = false;
                    participantToDelete = null;
                }
                await update();
            };
        });
    }
</script>

<svelte:head>
    <title>集計結果 - FF14 調整ちゃん</title>
</svelte:head>

<div class="container mx-auto p-4 max-w-6xl">
    <!-- エラー表示 -->
    {#if form?.error}
        <div class="alert alert-error mb-6">
            <span>{form.error}</span>
        </div>
    {/if}

    <!-- 成功メッセージ -->
    {#if form?.success}
        <div class="alert alert-success mb-6">
            <span>削除しました！</span>
        </div>
    {/if}

    <!-- ヘッダー -->
    <div class="card bg-base-100 shadow-xl mb-6">
        <div class="card-body">
            <h1 class="card-title text-2xl">
                <Calendar class="w-8 h-8"/>
                集計結果
            </h1>
            <p class="text-base-content/70">
                {formatDate(data.week.startDate)} 〜 {formatDate(data.week.endDate)}
            </p>
        </div>
    </div>

    <!-- 日別集計 -->
    <div class="card bg-base-100 shadow-xl mb-6">
        <div class="card-body">
            <h2 class="card-title mb-4">日別集計</h2>

            <div class="overflow-x-auto">
                <table class="table table-zebra w-full">
                    <thead>
                    <tr>
                        <th>曜日</th>
                        <th>日付</th>
                        <th class="text-success">○</th>
                        <th class="text-warning">△</th>
                        <th class="text-error">×</th>
                        <th>合計</th>
                    </tr>
                    </thead>
                    <tbody>
                    {#each data.dailySummary as day, index}
                        <tr class={isOptimalDate(day.date) ? 'bg-success/20' : ''}>
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
                        </tr>
                    {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- 参加者別詳細 -->
    <div class="card bg-base-100 shadow-xl mb-6">
        <div class="card-body">
            <h2 class="card-title mb-4">参加者別詳細</h2>

            <div class="overflow-x-auto">
                <table class="table table-zebra w-full">
                    <thead>
                    <tr>
                        <th>名前</th>
                        {#each data.week.dates as date, index}
                            <th class="text-center min-w-16">
                                <div>{dayLabels[index]}</div>
                                <div class="text-xs text-base-content/60">{formatDate(date)}</div>
                            </th>
                        {/each}
                        <th>メモ</th>
                        <th class="text-center">削除</th>
                    </tr>
                    </thead>
                    <tbody>
                    {#each data.participants as participant}
                        <tr>
                            <td class="font-medium">
                                <a href="/schedule/{weekToken}/{participant.participant_id}"
                                   class="link link-hover text-primary flex items-center gap-2 hover:bg-base-200 rounded p-1 -m-1 transition-colors">
                                    {participant.name}
                                    <Edit3 class="w-4 h-4 opacity-60"/>
                                </a>
                            </td>
                            {#each participant.schedules as schedule}
                                <td class="text-center">
                                    {#if schedule.status}
                                        <span class="badge"
                                              class:badge-success={schedule.status === '○'}
                                              class:badge-warning={schedule.status === '△'}
                                              class:badge-error={schedule.status === '×'}>
                                         {schedule.status}
                                        </span>
                                    {:else}
                                        <span class="text-base-content/30">-</span>
                                    {/if}
                                </td>
                            {/each}
                            <td class="text-sm text-base-content/70 max-w-xs truncate">
                                {participant.note || ''}
                            </td>
                            <td class="text-center">
                                <button
                                        class="btn btn-ghost btn-sm text-error hover:bg-error hover:text-error-content"
                                        title="参加者を削除"
                                        on:click={() => confirmDelete(participant)}
                                >
                                    <Trash2 class="w-4 h-4"/>
                                </button>
                            </td>
                        </tr>
                    {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- 予定入力へのリンク -->
    <div class="card bg-base-100 shadow-xl mb-6">
        <div class="card-body">
            <h2 class="card-title mb-4">予定を入力する</h2>
            <button class="btn btn-primary btn-lg"
                    on:click={goToSchedule}>
                <UserPlus class="w-6 h-6"/>
                予定を入力する
            </button>
        </div>
    </div>

    <!-- 戻るボタン -->
    <div class="flex justify-center">
        <button class="btn btn-primary" on:click={() => history.back()}>
            <ArrowLeft class="w-4 h-4"/>
            戻る
        </button>
    </div>
</div>

<!-- 削除確認ダイアログ -->
{#if showDeleteDialog && participantToDelete}
    <div class="modal modal-open">
        <div class="modal-box">
            <h3 class="font-bold text-lg text-error">参加者の削除</h3>
            <p class="py-4">
                「<span class="font-semibold">{participantToDelete.name}</span>」さんをリストから削除しますか？
                <br>
                <span class="text-sm text-base-content/70">この操作を行うと、{participantToDelete.name}
                    さんのすべてのスケジュール情報が失われ、元に戻すことはできません。</span>
            </p>
            <div class="modal-action">
                <button
                        class="btn btn-ghost"
                        on:click={cancelDelete}
                        disabled={isDeleting}
                >
                    キャンセル
                </button>
                <form method="POST" action="?/deleteParticipant" use:deleteForm>
                    <input type="hidden" name="participant_id" value={participantToDelete.participant_id}/>
                    <button
                            type="submit"
                            class="btn btn-error"
                            class:loading={isDeleting}
                            disabled={isDeleting}
                    >
                        {#if isDeleting}
                            削除中...
                        {:else}
                            削除する
                        {/if}
                    </button>
                </form>
            </div>
        </div>
    </div>
{/if}
