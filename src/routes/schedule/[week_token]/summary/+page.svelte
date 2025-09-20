<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Calendar, Users, ArrowLeft, Trophy } from 'lucide-svelte';
	
	const weekToken = $page.params.week_token;
	
	let summaryData: any = null;
	let isLoading = true;
	let errorMessage = '';
	
	// 曜日のラベル
	const dayLabels = ['火', '水', '木', '金', '土', '日', '月'];
	
	onMount(async () => {
		await loadSummaryData();
	});
	
	async function loadSummaryData() {
		try {
			const response = await fetch(`/api/summary/${weekToken}`);
			if (!response.ok) {
				throw new Error('集計データの取得に失敗しました');
			}
			summaryData = await response.json();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
		} finally {
			isLoading = false;
		}
	}
	
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return `${date.getMonth() + 1}/${date.getDate()}`;
	}
	
	function isOptimalDate(date: string): boolean {
		return summaryData?.optimalDates?.includes(date) || false;
	}
</script>

<svelte:head>
	<title>集計結果 - CWLS 調整さん</title>
</svelte:head>

{#if isLoading}
	<div class="flex justify-center items-center min-h-screen">
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{:else if errorMessage}
	<div class="container mx-auto p-4">
		<div class="alert alert-error">
			<span>{errorMessage}</span>
		</div>
	</div>
{:else if summaryData}
	<div class="container mx-auto p-4 max-w-6xl">
		<!-- ヘッダー -->
		<div class="card bg-base-100 shadow-xl mb-6">
			<div class="card-body">
				<h1 class="card-title text-2xl">
					<Calendar class="w-8 h-8" />
					集計結果
				</h1>
				<p class="text-base-content/70">
					{formatDate(summaryData.week.startDate)} 〜 {formatDate(summaryData.week.endDate)}
				</p>
				<div class="stats stats-horizontal shadow mt-4">
					<div class="stat">
						<div class="stat-figure text-primary">
							<Users class="w-8 h-8" />
						</div>
						<div class="stat-title">参加者数</div>
						<div class="stat-value text-primary">{summaryData.totalParticipants}名</div>
					</div>
				</div>
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
							{#each summaryData.dailySummary as day, index}
								<tr class={isOptimalDate(day.date) ? 'bg-success/20' : ''}>
									<td class="font-bold">
										{dayLabels[index]}
										{#if isOptimalDate(day.date)}
							        		<Trophy class="w-4 h-4 inline text-yellow-500 ml-1" />
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

				{#if summaryData.optimalDates.length > 0}
					<div class="alert alert-success mt-4">
						<Trophy class="w-6 h-6" />
						<span>
							最適日: {summaryData.optimalDates.map(date => {
								const index = summaryData.week.dates.indexOf(date);
								return `${dayLabels[index]}曜日(${formatDate(date)})`;
							}).join(', ')}
						</span>
					</div>
				{/if}
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
								{#each summaryData.week.dates as date, index}
									<th class="text-center min-w-16">
										<div>{dayLabels[index]}</div>
										<div class="text-xs text-base-content/60">{formatDate(date)}</div>
									</th>
								{/each}
								<th>メモ</th>
							</tr>
						</thead>
						<tbody>
							{#each summaryData.participants as participant}
								<tr>
									<td class="font-medium">{participant.name}</td>
									{#each participant.schedules as schedule}
										<td class="text-center">
											{#if schedule.status}
												<span class="badge" class:badge-success={schedule.status === '○'} class:badge-warning={schedule.status === '△'} class:badge-error={schedule.status === '×'}>
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
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- 戻るボタン -->
		<div class="flex justify-center">
			<button class="btn btn-primary" on:click={() => history.back()}>
				<ArrowLeft class="w-4 h-4" />
				戻る
			</button>
		</div>
	</div>
{/if}