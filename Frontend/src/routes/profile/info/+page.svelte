<script lang="ts">
	import { get, writable } from 'svelte/store';
	import { setUser, user } from '../../../stores/user';
	import { onMount } from 'svelte';

    const friend = writable({});  // Local state for friend
    let stats = null;
    let matchHistory = [];

    const friend_username = new URLSearchParams(window.location.search).get('login');

	onMount(async () => {
		async function getUserInfo() {
			const response = await fetch('http://localhost:3333/profil/friends?login=' + friend_username, {
				method: 'GET',
				credentials: 'include',
			});
			const contentType = response.headers.get('Content-Type');
			if (contentType && contentType.includes('application/json')) {
				const data = await response.json();
				friend.set(data);
			}

            const statsResponse = await fetch('http://localhost:3333/social/stats/' + friend_username);
            if (statsResponse.ok) {
                stats = await statsResponse.json();
            }
            const matchHistoryResponse = await fetch('http://localhost:3333/social/match-history/' + friend_username);
            if (matchHistoryResponse.ok) {
                matchHistory = await matchHistoryResponse.json();
            }
		}
		getUserInfo();
	});
</script>

<svelte:head>
	<title>Profile</title>
	<meta name="description" content="User profile" />
</svelte:head>
 
<h1 class="title"><strong>{$friend.login}</strong>'s Profil Page</h1>

{#if $friend.avatar}
    <img class="pp" id="avatar" src={$friend.avatar} alt="avatar"/>
{:else}
    <img class="pp" id="avatar" src={$friend.large_pic} alt={`Picture of ${$friend.login}`}/>
{/if}

<h2>Stats</h2>
{#if stats}
    <ul>
        <li>Wins: {stats.wins}</li>
        <li>Losses: {stats.losses}</li>
        <li>Ladder Level: {stats.ladderLevel}</li>
    </ul>
{:else}
    <p>No stats available</p>
{/if}

<h2>Match History</h2>
{#if matchHistory.length > 0}
    <ul>
        {#each matchHistory as match (match.id)}
            <li>{match.gameType}: {match.result} - {match.timestamp}</li>
        {/each}
    </ul>
{:else}
    <p>No match history available</p>
{/if}

<style>
    .pp {
        display: block;
        margin-left: auto;
        margin-right: auto;
        border-radius: 0 100px 0 100px;
        width: 450px;
        border: 2px solid rgb(88, 44, 231);
        padding: 5px;
        max-width: 250px;
        max-height: 250px;
    }
	.title {
		color: rgb(212, 203, 29);
		margin-left: center;
		margin-right: center;
	}
</style>