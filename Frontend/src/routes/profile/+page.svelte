<script lang="ts">
	import { get } from 'svelte/store';
	import { setUser, user } from '../../stores/user';
	import { onMount } from 'svelte';
	import winIcon from '../../lib/images/icons8-reward-80.png';
	import lossIcon from '../../lib/images/loss-icon.png';
	import ladderIcon from '../../lib/images/icons8-rank-64.png';
	import { goto } from '$app/navigation';

	let myUser = get(user);
	let checked = myUser.two_fa;
	let active_message = 'Enable Google Authenticator';
	let desactive_message = 'Disable Google Authenticator';
	let fileInput: HTMLInputElement;
	let files: FileList;
	let avatar: string;
	let username: string;
	let modalOpen: boolean;
	let stats = null;
	let matchHistory = [];

	const serverIP = import.meta.env.VITE_SERVER_IP;
	let myCookie: String | undefined = '';

	function formatDate(isoDateString) {
		const date = new Date(isoDateString);
		return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
	}

	onMount(async () => {
		function getCookie(name: string) {
			const value = `; ${document.cookie}`;
			const parts = value.split(`; ${name}=`);
			if (parts.length === 2) {
				return parts.pop()?.split(';').shift();
			}
		}
		myCookie = getCookie('jwt');
		if (!myCookie)
			goto('/')
		async function getUserInfo() {
			const response = await fetch('http://' + serverIP + ':3333/profil/me', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + myCookie,
				},
				credentials: 'include'
			});
			const contentType = response.headers.get('Content-Type');
			if (contentType && contentType.includes('application/json')) {
				const data = await response.json();
				setUser(data);
				myUser = get(user);
			}
			const userLogin = myUser.login;
			const statsResponse = await fetch('http://' + serverIP + ':3333/social/stats/' + userLogin);
			if (statsResponse.ok) {
				stats = await statsResponse.json();
			}
			const matchHistoryResponse = await fetch(
				'http://' + serverIP + ':3333/social/match-history/' + userLogin
			);
			if (matchHistoryResponse.ok) {
				matchHistory = await matchHistoryResponse.json();
			}
		}
		getUserInfo();
	});
	async function active_2_fa_auth() {
		if (checked) checked = false;
		else checked = true;
		const response = await fetch('http://' + serverIP + ':3333/auth/settings', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				check: checked
			})
		});
	}
	function getBase64(image: File) {
		const reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (e) => {
			avatar = e.target!.result as string;
			if (avatar) upload_profile_picture(avatar);
		};
	}
	async function upload_profile_picture(avatar: string) {
		const imgData = avatar.split(',');
		const picture = imgData[1];
		if (picture) {
			const response = await fetch('http://' + serverIP + ':3333/profil/picture', {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					Authorization: 'Bearer ' + myCookie,
				},
				body: JSON.stringify({ data: avatar })
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
		username = '';
	}

	async function update_username(username: string) {
		let value = username.trim();
		if (value.length > 10) {
			alert('Username should not exceed 10 characters');
			return;
		}
		if (!value) {
			alert('Username should not only contain whitespace');
			return;
		}
		const response = await fetch('http://' + serverIP + ':3333/profil/username', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				Authorization: 'Bearer ' + myCookie,
			},
			body: JSON.stringify({ data: value })
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

{#if myCookie}
	<h1 class="title"><strong>{$user.login}'s profile</strong></h1>

	<div>
		{#if myUser.avatar}
			<img class="picture" id="avatar" src={myUser.avatar} alt="avatar" />
		{:else}
			<img class="picture" id="avatar" src={$user.large_pic} alt={`Picture of ${$user.login}`} />
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
		<input
			class="hidden"
			id="file-to-upload"
			type="file"
			accept=".png,.jpg"
			bind:files
			bind:this={fileInput}
			on:change={() => getBase64(files[0])}
		/>
	</div>

	{#if modalOpen}
		<div class="modal">
			<div class="modal-content">
				<input
					class="username_input"
					bind:value={username}
					type="text"
					placeholder="Enter your username"
				/>
				<button class="username_btn" on:click={() => update_username(username)}>OK</button>
				<button class="username_btn" on:click={closeModal}>Cancel</button>
			</div>
		</div>
	{/if}

	<div class="profile-details">
		<hr class="section-divider" />
		<div class="stats-card">
			{#if stats}
				<div class="stat-item">
					<img src={winIcon} alt="Wins Icon" />
					<h3 class="user_stats">{stats.wins}</h3>
					<p class="stats_string">Victory</p>
				</div>
				<div class="stat-item">
					<img src={lossIcon} alt="Losses Icon" />
					<h3 class="user_stats">{stats.losses}</h3>
					<p class="stats_string">Losses</p>
				</div>
				<div class="stat-item">
					<img src={ladderIcon} alt="Ladder Icon" />
					<h3 class="user_stats">{stats.ladderLevel}</h3>
					<p class="stats_string">Rank</p>
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
						<th>Result</th>
						<th>Score</th>
						<th>Date</th>
					</tr>
				</thead>
				<tbody>
					{#each matchHistory as match (match.id)}
						<tr>
							<td>{match.gameType}</td>
							<td>
								{#if match.result === 'Victory'}
									<p class="result_victory">Victory</p>
								{:else}
									<p class="result_defeat">Defeat</p>
								{/if}
							</td>
							<td>
								{myUser.login} | {match.myScore} - {match.opponentScore} | {match.opponentName}
							</td>
							<td>{formatDate(match.timestamp)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
{/if}
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
		display: block;
		margin-left: auto;
		margin-right: auto;
		border-radius: 0 100px 0 100px;
		width: 500px;
		border: 4px solid rgb(88, 44, 231);
		padding: 5px;
		flex-grow: 1;
	}
	.buttons {
		display: flex;
		justify-content: center;
		margin-bottom: 20px;
		margin-top: 20px;
	}
	.button {
		display: flex;
		justify-content: center;
		color: #333333;
		background-color: #eca45c;
		font-weight: bold;
		font-size: 20px;
		flex-direction: column;
		align-items: center;
		width: 66%;
		height: 40px;
		border: 2px solid #000000;
		border-radius: 18px;
		margin-top: 30px;
		margin-bottom: 20px;
		margin-right: 10px;
	}
	button:hover {
		background-color: #cf8235;
	}
	.modal {
		position: fixed;
		top: 0px;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.modal-content {
		background-color: #eca45c;
		padding: 10px;
		border-radius: 8px;
	}
	.username_input {
		font-weight: bold;
		color: #a25c5c;
	}
	.username_btn {
		font-size: medium;
		font-weight: lighter;
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
		/* margin-right:; */
	}
	.stat-item img {
		width: 80px;
		height: 80px;
	}
	.stat-item h3,
	.stat-item p {
		margin: 0;
	}
	/* Match History Section */
	.match-history-table {
		background-color: #ffd7af;
		font-size: 20px;
		font-weight: bold;
		width: 100%;
		border-collapse: collapse;
		border: none;
		color: #333333;
		margin-top: 40px;
	}
	.match-history-table th,
	.match-history-table td {
		border: 1px solid #000000;
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
	.result_victory {
		color: rgb(25, 99, 25);
		font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
		font-weight: bold;
		font-size: 25px;
		margin-top: 0px;
		margin-bottom: 0px;
	}
	.result_defeat {
		color: rgb(147, 46, 21);
		font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
		font-weight: bold;
		font-size: 25px;
		margin-top: 0px;
		margin-bottom: 0px;
	}
	.user_stats {
		font-size: 40px;
	}
	.stats_string {
		font-size: 30px;
	}
</style>
