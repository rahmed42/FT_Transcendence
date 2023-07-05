<script lang="ts">
	import { get, writable } from 'svelte/store';
	import { setUser, user } from '../../../stores/user';
	import { onMount } from 'svelte';
	import winIcon from '../../../lib/images/win-icon.png';
	import lossIcon from '../../../lib/images/loss-icon.png';
	import { goto } from '$app/navigation';
	import bronzeIcon from '../../../lib/images/bronze.png';
    import silverIcon from '../../../lib/images/silver.png';
    import goldIcon from '../../../lib/images/gold.png';

	const friend = writable({}); // Local state for friend
	let stats = null;
	let matchHistory = [];
	let ladderIcon = bronzeIcon;
	const serverIP = import.meta.env.VITE_SERVER_IP;

	function formatDate(isoDateString) {
		const date = new Date(isoDateString);
		return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
	}
	let myCookie : string | undefined = '';
	onMount(async () => {
		function getCookie(name: string) {
			const value = `; ${document.cookie}`;
			const parts = value.split(`; ${name}=`);
			if (parts.length === 2) {
				return parts.pop()?.split(';').shift();
			}
		}
		myCookie = getCookie('jwt')
		if (!myCookie)
			goto('/')


        const friend_username = new URLSearchParams(window.location.search).get('login');

		async function getUserInfo() {
			// console.log(myCookie)
			const response = await fetch(
				'http://' + serverIP + ':3333/profil/friends?login=' + friend_username,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: 'Bearer ' + myCookie
					},
					credentials: 'include'
				}
			);
			const contentType = response.headers.get('Content-Type');
			if (contentType && contentType.includes('application/json')) {
				const data = await response.json();
				friend.set(data);
			}
			const statsResponse = await fetch(
				'http://' + serverIP + ':3333/social/stats/' + friend_username, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: 'Bearer ' + myCookie
					},
					credentials: 'include'
				}
			);
			if (statsResponse.ok) {
				stats = await statsResponse.json();
				const winLossRatio = stats.losses ? stats.wins / stats.losses : stats.wins;
				stats.ladderLevel = calculateLadderLevel(winLossRatio);
				ladderIcon = getladderIcon(stats.ladderLevel);
			}
			const matchHistoryResponse = await fetch(
				'http://' + serverIP + ':3333/social/match-history/' + friend_username, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						Authorization: 'Bearer ' + myCookie
					},
					credentials: 'include'
				}
			);
			if (matchHistoryResponse.ok) {
				matchHistory = await matchHistoryResponse.json();
			}
		}
		getUserInfo();
	});
	function calculateLadderLevel(ratio: number) {
        if (ratio > 3) return 'Gold';
        if (ratio > 2) return 'Silver';
        return 'Bronze';
    }
	function getladderIcon(level: string) {
        switch(level) {
            case 'Gold': return goldIcon;
            case 'Silver': return silverIcon;
            default: return bronzeIcon;
        }
    }
</script>

<svelte:head>
	<title>Profile</title>
	<meta name="description" content="User profile" />
</svelte:head>

{#if myCookie}
	<div class="profile">
		<a href={`/social`} class="button-styled">Back</a>
		<h1 class="title">
			<span class="username"><strong>{$friend.login}</strong></span>'s Profile Page
		</h1>

		{#if $friend.avatar}
			<img class="pp" id="avatar" src={$friend.avatar} alt="avatar" />
		{:else}
			<img class="pp" id="avatar" src={$friend.large_pic} alt={`Picture of ${$friend.login}`} />
		{/if}
		<hr class="section-divider" />
		<h2 class="section-heading">Stats</h2>
		<div class="stats-card">
			{#if stats}
				<div class="stat-item">
					<img src={winIcon} alt="Wins Icon" />
					<h3>{stats.wins}</h3>
					<p>Wins</p>
				</div>
				<div class="stat-item">
					<img src={lossIcon} alt="Losses Icon" />
					<h3>{stats.losses}</h3>
					<p>Losses</p>
				</div>
				<div class="stat-item">
					<img src={ladderIcon} alt="Ladder Icon" />
					<h3>{stats ? stats.ladderLevel : 'Bronze'}</h3>
					<p>Ladder Level</p>
				</div>
			{:else}
				<p>No stats available</p>
			{/if}
		</div>
		<hr class="section-divider" />
		<h2 class="section-heading">Match History</h2>
		{#if matchHistory.length > 0}
			<table class="match-history-table">
				<thead>
					<tr>
						<th>Game Type</th>
						<th>Result</th>
						<th>Score</th>
						<th>Date</th>
					</tr>
				</thead>
				<tbody>
					{#each matchHistory as match (match.id)}
						<tr>
							<td>{match.gameType}</td>
							<td>{match.result}</td>
							<td>{match.myScore} - {match.opponentScore} (vs. {match.opponentName})</td>
							<td>{formatDate(match.timestamp)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<p>No match history available</p>
		{/if}
	</div>
{/if}
<style>
	.section-divider {
		border: 0;
		border-top: 1px solid white;
		margin: 2em 0;
	}
	.profile {
		width: 80%;
		margin: 0 auto;
		padding: 20px;
		background: rgba(0, 0, 0, 0.6);
		border-radius: 15px;
		color: #fff;
	}
	.section-heading {
		font-weight: bold;
		font-size: 24px;
		color: #ddd;
	}
	.pp {
		display: block;
		margin: 0 auto 20px;
		border-radius: 50%;
		width: 150px;
		height: 150px;
		object-fit: cover;
		border: 2px solid rgb(88, 44, 231);
	}
	.title {
		color: #eeeeee;
		text-align: center;
	}
	.username {
		color: rgb(212, 203, 29);
	}
	.stats-card {
		display: flex;
		justify-content: space-around;
	}
	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
	}
	.stat-item img {
		width: 40px;
		height: 40px;
	}
	.stat-item h3,
	.stat-item p {
		margin: 0;
	}
	.match-history-table {
		width: 100%;
		border-collapse: collapse;
		color: #eee;
	}
	.match-history-table th,
	.match-history-table td {
		border: 1px solid #ddd;
		padding: 8px;
		text-align: center;
	}
	.match-history-table tr:nth-child(even) {
		background-color: rgba(255, 255, 255, 0.1);
	}
	.match-history-table tr:hover {
		background-color: rgba(255, 255, 255, 0.2);
	}
	.match-history-table th {
		padding-top: 12px;
		padding-bottom: 12px;
		text-align: center;
		background-color: rgba(0, 0, 0, 0.8);
		color: #fff;
	}

	a {
		width: 100px
	}
</style>
