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
				myUser = get(user);  // Here you get the updated user

				// Now that you have the updated user, get the login from there
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

<div class="container">
    <div class="profile">
        <div class="button-row">
            <button class="btn" on:click={() => fileInput.click()}>Upload Picture</button>
            <button class="btn" on:click={active_2_fa_auth}>
                {#if !checked}
                    {active_message}
                {:else}
                    {desactive_message}
                {/if}
            </button>
            <button class="btn" on:click={openModal}>Update Username</button>
        </div>

        {#if myUser.avatar}
            <img class="pp" id="avatar" src={myUser.avatar} alt="avatar"/>
        {:else}
            <img class="pp" id="avatar" src={$user.large_pic} alt={`Picture of ${$user.login}`}/>
        {/if}

        {#if modalOpen}
            <div class="modal">
                <div class="modal-content">
                    <input bind:value={username} type="username" placeholder="Enter your username"/>
                    <button class="username_btn" on:click={() => update_username(username)}>OK</button>
                    <button on:click={closeModal}>Cancel</button>
                </div>
            </div>
        {/if}
        <input class="hidden" id="file-to-upload" type="file" accept=".png,.jpg" bind:files bind:this={fileInput} on:change={() => getBase64(files[0])}/>
    </div>
    
    <div class="profile-details">
        <hr class="section-divider" />
        <div class="section-heading-container">
            <h2 class="section-heading">Stats</h2>
        </div>
        <div class="stats-card">
            {#if stats}
                <div class="stat-item">
                    <img src={winIcon} alt="Wins Icon">
                    <h3>{stats.wins}</h3>
                    <p>Wins</p>
                </div>
                <div class="stat-item">
                    <img src={lossIcon} alt="Losses Icon">
                    <h3>{stats.losses}</h3>
                    <p>Losses</p>
                </div>
                <div class="stat-item">
                    <img src={ladderIcon} alt="Ladder Icon">
                    <h3>{stats.ladderLevel}</h3>
                    <p>Ladder Level</p>
                </div>
            {:else}
                <p>No stats available</p>
            {/if}
        </div>
        <hr class="section-divider" />
        <div class="section-heading-container">
            <h2 class="section-heading">Match History</h2>
        </div>
        {#if matchHistory.length > 0}
            <table class="match-history-table">
                <thead>
                    <tr>
                        <th>Game Type</th>
                        <th>Score</th>
                        <th>Result</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {#each matchHistory as match (match.id)}
                        <tr>
                            <td>{match.gameType}</td>
                            <td>{match.myScore} - {match.opponentScore} (vs. {match.opponentName})</td>
                            <td>{match.result}</td>
                            <td>{formatDate(match.timestamp)}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {:else}
            <p>No match history available</p>
        {/if}
		<hr class="section-divider2" />
    </div>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .profile {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 0px;
    }
	.title {
		color: rgb(212, 203, 29);
		margin-left: center;
		margin-right: center;
	}
	.hidden {
        display: none;
    }
    .pp {
        display: flex;
        justify-content: center;
        border-radius: 0 100px 0 100px;
        width: 300px;
        border: 2px solid rgb(88, 44, 231);
        padding: 5px;
        max-width: 500px;
        max-height: 500px;
        flex-grow: 1;
    }
    .button-row {
        display: flex;
        flex-direction: column;
        margin-right: 20px;
    }
	.btn {
		font-family:"Comic Sans MS";
		font-size: 1.2rem;
		color: #fff;
		background-color: #007fff;
		border: none;
		border-radius: 75px;
		transition: background-color 0.2s ease;
		cursor: pointer;
		margin-bottom: 10px;
		width: 150px;
	}
	button:hover {
		background-color: #0f6402;
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
    .section-divider2 {
        border: 0;
        border-top: 1px solid white;
        margin: 2em 0;
    }
	.section-heading {
		font-weight: bold;
		font-size: 24px;
        color: #ddd;

	}
    .title {
		color: #eeeeee;
		text-align: center;
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
    .stat-item h3, .stat-item p {
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
</style>
