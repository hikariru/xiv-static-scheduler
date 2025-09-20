<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Calendar, Users, Save, BarChart3 } from 'lucide-svelte';
	
	// URL パラメータから取得
	const weekToken = $page.params.week_token;
	const participantId = $page.params.participant_id;
	
	// ステータス定義
	const statusOptions = ['○', '△', '×'] as const;
	type Status = typeof statusOptions[number];
	
	// 状態管理
	let weekData: any = null;
	let entry: any = null;
	let schedules: Record<string, Status | null> = {};
	let name = '';
	let note = '';
	let isLoading = true;
	let isSaving = false;
	let errorMessage = '';
	
	// 曜日のラベル
	const dayLabels = ['火', '水', '木', '金', '土', '日', '月'];
	
	onMount(async () => {
		await loadData();
		loadFromLocalStorage();
	});
	
	async function loadData() {
		try {
			// 週情報を取得
			const weekResponse = await fetch(`/api/weeks/${weekToken}`);
			if (!weekResponse.ok) {
				throw new Error('週情報の取得に失敗しました');
			}
			weekData = await weekResponse.json();
			
			// 既存エントリーを取得
			const entryResponse = await fetch(`/api/entries?weekId=${weekData.week.id}&participantId=${participantId}`);
			if (entryResponse.ok) {
				const entryData = await entryResponse.json();
				if (entryData.entry) {
					entry = entryData.entry;
					name = entry.name || '';
					note = entry.note || '';
					
					// スケジュールを取得
					const schedulesResponse = await fetch(`/api/schedules?entryId=${entry.id}`);
					if (schedulesResponse.ok) {
						const schedulesData = await schedulesResponse.json();
						schedules = {};
						schedulesData.schedules.forEach((schedule: any) => {
							schedules[schedule.date] = schedule.status;
						});
					}
				}
			}
			
			// スケジュールの初期化（未設定の日付は null）
			weekData.week.dates.forEach((date: string) => {
				if (!(date in schedules)) {
					schedules[date] = null;
				}
			});
			
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
		} finally {
			isLoading = false;
		}
	}
	
	function loadFromLocalStorage() {
		const stored = localStorage.getItem('participantName');
		if (stored && !name) {
			name = stored;
		}
	}
	
	function saveToLocalStorage() {
		if (name) {
			localStorage.setItem('participantName', name);
		}
	}
	
	async function saveEntry() {
		if (!name.trim()) {
			alert('名前を入力してください');
			return;
		}
		
		try {
			isSaving = true;
			
			// エントリーを保存
			const entryResponse = await fetch('/api/entries', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					weekId: weekData.week.id,
					participantId,
					name: name.trim(),
					note: note.trim()
				})
			});
			
			if (!entryResponse.ok) {
				throw new Error('エントリーの保存に失敗しました');
			}
			
			const entryData = await entryResponse.json();
			entry = entryData.entry;
			
			// スケジュールを保存
			const scheduleArray = weekData.week.dates
				.filter((date: string) => schedules[date] !== null)
				.map((date: string) => ({
					date,
					status: schedules[date]
				}));
			
			if (scheduleArray.length > 0) {
				const schedulesResponse = await fetch('/api/schedules', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						entryId: entry.id,
						schedules: scheduleArray
					})
				});
				
				if (!schedulesResponse.ok) {
					throw new Error('スケジュールの保存に失敗しました');
				}
			}
			
			saveToLocalStorage();
			
		} catch (error) {
			alert(error instanceof Error ? error.message : '保存に失敗しました');
		} finally {
			isSaving = false;
		}
	}
	
	function toggleStatus(date: string) {
		const currentStatus = schedules[date];
		const currentIndex = statusOptions.indexOf(currentStatus as Status);
		const nextIndex = (currentIndex + 1) % statusOptions.length;
		schedules[date] = statusOptions[nextIndex];
		
		// 自動保存（デバウンス）
		if (name.trim()) {
			setTimeout(saveEntry, 500);
		}
	}
	
	function getStatusColor(status: Status | null): string {
		switch (status) {
			case '○': return 'btn-success';
			case '△': return 'btn-warning';
			case '×': return 'btn-error';
			default: return 'btn-ghost';
		}
	}
	
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return `${date.getMonth() + 1}/${date.getDate()}`;
	}
</script>

<svelte:head>
	<title>予定入力 - CWLS 調整さん</title>
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
{:else if weekData}
	<div class="container mx-auto p-4 max-w-4xl">
		<!-- ヘッダー -->
		<div class="card bg-base-100 shadow-xl mb-6">
			<div class="card-body">
				<h1 class="card-title text-2xl">
					<Calendar class="w-8 h-8" />
					予定入力
				</h1>
				<p class="text-base-content/70">
					{formatDate(weekData.week.startDate)} 〜 {formatDate(weekData.week.endDate)} の予定を入力してください
				</p>
			</div>
		</div>

		<!-- 入力フォーム -->
		<div class="card bg-base-100 shadow-xl mb-6">
			<div class="card-body">
				<div class="form-control w-full max-w-xs mb-4">
					<label class="label" for="name">
						<span class="label-text">名前 *</span>
					</label>
					<input 
						id="name"
						type="text" 
						placeholder="お名前を入力" 
						class="input input-bordered w-full max-w-xs"
						bind:value={name}
						maxlength="50"
					/>
				</div>
				
				<div class="form-control w-full max-w-md">
					<label class="label" for="note">
						<span class="label-text">メモ（任意）</span>
					</label>
					<textarea 
						id="note"
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
							{#each weekData.week.dates as date, index}
								<tr>
									<td class="font-bold">{dayLabels[index]}</td>
									<td>{formatDate(date)}</td>
									<td>
										<button
											class="btn {getStatusColor(schedules[date])} btn-sm"
											on:click={() => toggleStatus(date)}
										>
											{schedules[date] || '未選択'}
										</button>
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
				class="btn btn-primary"
				class:loading={isSaving}
				on:click={saveEntry}
				disabled={!name.trim() || isSaving}
			>
				<Save class="w-4 h-4" />
				{isSaving ? '保存中...' : '保存'}
			</button>
			
			<a href="/schedule/{weekToken}/summary" class="btn btn-secondary">
				<BarChart3 class="w-4 h-4" />
				集計を見る
			</a>
		</div>
	</div>
{/if}