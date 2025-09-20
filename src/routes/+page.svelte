<script lang="ts">
	import { Calendar, Users, Clock, Plus } from 'lucide-svelte';
</script>

<svelte:head>
	<title>CWLS 調整ちゃん自動化</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">CWLS 調整ちゃん</h1>
			<p class="py-6 text-lg">週次の予定調整を自動化して、運営の負担を軽減します</p>

			<div class="stats shadow mb-6">
				<div class="stat">
					<div class="stat-figure text-primary">
						<Calendar size={32} />
					</div>
					<div class="stat-title">自動生成</div>
					<div class="stat-value text-primary">毎週金曜</div>
					<div class="stat-desc">7:00に自動作成します</div>
				</div>

				<div class="stat">
					<div class="stat-figure text-secondary">
						<Users size={32} />
					</div>
					<div class="stat-title">対象メンバー</div>
					<div class="stat-value text-secondary">8名</div>
				</div>

				<div class="stat">
					<div class="stat-figure text-accent">
						<Clock size={32} />
					</div>
					<div class="stat-title">期間</div>
					<div class="stat-value text-accent">火〜月</div>
					<div class="stat-desc">7日間の予定</div>
				</div>
			</div>
		</div>
	</div>
</div>
