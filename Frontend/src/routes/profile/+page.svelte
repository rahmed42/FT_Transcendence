<script lang="ts">
	import { get } from 'svelte/store';
	import { setUser, user } from '../../stores/user';
	import { onMount } from 'svelte';
	import winIcon from '../../lib/images/win-icon.png';
    import lossIcon from '../../lib/images/loss-icon.png';
    import ladderIcon from '../../lib/images/ladder-icon.png';

	let myUser = get(user);
	let checked = myUser.two_fa;
	let active_message = "Enable Google Authenticator";
	let desactive_message = "Disable Google Authenticator";
	let fileInput: HTMLInputElement;
	let files: FileList;
	let avatar: string;
	let username: string;
	let modalOpen: boolean;
    let stats = null;
    let matchHistory = [];

    function formatDate(isoDateString) {
        const date = new Date(isoDateString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }

	onMount(async () => {
		async function getUserInfo() {
			const response = await fetch('http://localhost:3333/profil/me', {
				method: 'GET',
				credentials: 'include',
			});
			const contentType = response.headers.get('Content-Type');
			if (contentType && contentType.includes('application/json')) {
				const data = await response.json();
				setUser(data);
				myUser = get(user);
			}
			const userLogin = myUser.login;
			const statsResponse = await fetch('http://localhost:3333/social/stats/' + userLogin);
			if (statsResponse.ok) {
				stats = await statsResponse.json();
			}
			const matchHistoryResponse = await fetch('http://localhost:3333/social/match-history/' + userLogin);
			if (matchHistoryResponse.ok) {
				matchHistory = await matchHistoryResponse.json();
			}
		}
		getUserInfo();
	});
	async function active_2_fa_auth() {
		if (checked)
			checked = false;
		else
			checked = true;
		const response = await fetch('http://localhost:3333/auth/settings', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				check: checked,
			}),
		});
	}
	function getBase64(image: File) {
		const reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = e => {
			avatar = e.target!.result as string;
			if (avatar)
				upload_profile_picture(avatar);
		}
	}
	async function upload_profile_picture(avatar: string) {
		const imgData = avatar.split(',');
		const picture = imgData[1];
		if (picture)
		{
			const response = await fetch('http://localhost:3333/profil/picture', {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				body: JSON.stringify({ data: avatar }),
			});
			const contentType = response.headers.get('Content-Type');
			if (contentType && contentType.includes('application/json')) {
				const data = await response.json();
				setUser(data);
				myUser = get(user);
			}
		}
	}
	function openModal() {
		modalOpen = true;
	}
	function closeModal() {
		modalOpen = false;
		username = "";
	}
	async function update_username(username: string) {
		const response = await fetch('http://localhost:3333/profil/username', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({ data: username }),
		});
		const contentType = response.headers.get('Content-Type');
		if (contentType && contentType.includes('application/json')) {
			const data = await response.json();
			setUser(data);
			myUser = get(user);
		}
		closeModal();
	}
</script>

<svelte:head>
	<title>Profile</title>
	<meta name="description" content="User profile" />
</svelte:head>

<h1 class="title">Welcome <strong>{$user.login}</strong></h1>

<div>
    {#if myUser.avatar}
        <img class="picture" id="avatar" src={myUser.avatar} alt="avatar"/>
    {:else}
        <img class="picture" id="avatar" src={$user.large_pic} alt={`Picture of ${$user.login}`}/>
    {/if}
</div>

<div class="buttons">
    <button class="button" on:click={() => fileInput.click()}>Upload Picture</button>
    <button class="button" on:click={active_2_fa_auth}>
        {#if !checked}
            {active_message}
        {:else}
            {desactive_message}
        {/if}
    </button>
    <button class="button" on:click={openModal}>Update Username</button>
    <input class="hidden" id="file-to-upload" type="file" accept=".png,.jpg" bind:files bind:this={fileInput} on:change={() => getBase64(files[0])}/>
</div>

{#if modalOpen}
    <div class="modal">
        <div class="modal-content">
            <input bind:value={username} type="username" placeholder="Enter your username"/>
            <button class="username_btn" on:click={() => update_username(username)}>OK</button>
            <button on:click={closeModal}>Cancel</button>
        </div>
    </div>
    {/if}

<div class="profile-details">
    <hr class="section-divider" />
    <div class="stats-card">
        {#if stats}
            <div class="stat-item">
                <img src={winIcon} alt="Wins Icon">
                <h3>{stats.wins}</h3>
                <p>Victory</p>
            </div>
            <div class="stat-item">
                <img src={lossIcon} alt="Losses Icon">
                <h3>{stats.losses}</h3>
                <p>Losses</p>
            </div>
            <div class="stat-item">
                <img src={ladderIcon} alt="Ladder Icon">
                <h3>{stats.ladderLevel}</h3>
                <p>Rank</p>
            </div>
        {:else}
            <p>No stats available</p>
        {/if}
    </div>
    <hr class="section-divider" />
    {#if matchHistory.length > 0}
        <table class="match-history-table">
            <thead>
                <tr>
                    <th>Game Type</th>
                    <th>Score</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                {#each matchHistory as match (match.id)}
                    <tr>
                        <td>{match.gameType}</td>
                        <td>{myUser.login} | {match.myScore} - {match.opponentScore} |  {match.opponentName}</td>
                        <td>{formatDate(match.timestamp)}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {:else}
        <p>No match history available</p>
    {/if}
</div>

<style>
	.title {
		color: #eca45c;
		margin-left: center;
		margin-right: center;
	}
	.hidden {
        display: none;
    }
    .picture {
        margin-left: 200px;
        width: 600px;
        max-width: 100%;
    }
    .buttons {
        margin-left: 120px;
        margin-right: auto;
    }
	.button {
        display: inline;
        color: #333333;
        background-color: #eca45c;
        font-weight: bold;
        font-size: 20px;
        height: 50px;
        border: 2px solid  #000000;
        border-radius: 18px;
        margin-top: 30px;
        margin-bottom: 20px;
        margin-right: 30px;
        padding-top: 10px;
        padding-bottom: 10px;
        padding-left: 16px;
        padding-right: 16px;
	}
	button:hover {
		background-color: #cf8235;
	}
	.modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.modal-content {
		background-color: #5446da;
		padding: 20px;
		border-radius: 4px;
	}
    .section-divider {
        border: 0;
        border-top: 1px solid white;
        margin: 1em 0;
    }
/* Stats Section */
    .stats-card {
        display: flex;
        justify-content: space-around;
        margin-bottom: 20px;
        margin-top: 20px;
    }
    .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        width: 66%;
    }
    .stat-item img {
        width: 80px;
        height: 80px;
    }
    .stat-item h3, .stat-item p {
        margin: 0;
    }
/* Match History Section */
    .match-history-table {
        background-color: #eca45c;
        font-size: 20px;
        font-weight: bold;
        width: 100%;
        border-collapse: collapse;
        border: none;
        color: #333333;
        margin-top: 40px;
        border: none;
    }
    .match-history-table th, .match-history-table td {
        border: 1px solid   #000000;
        padding: 8px;
        text-align: center;
    }
    .match-history-table tr:nth-child(even) {
        background-color: rgba(255, 255, 255, 0.1);
    }
    .match-history-table tr:hover {
        background-color: rgba(115, 41, 41, 0.2);
    }
    .match-history-table th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: center;
        background-color: #4a76a5;
        color: #ffffff;
    }
</style>