<script lang="ts">
	import { get } from 'svelte/store';
	import { setUser, user } from '../../../stores/user';
	import { onMount } from 'svelte';

    let friend = get(user);

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
				setUser(data);
				friend = get(user);
                // supposed to have friend info
                // console.log(friend);
			}
		}
		getUserInfo();
	});
</script>

<svelte:head>
	<title>Profile</title>
	<meta name="description" content="User profile" />
</svelte:head>
 

{#if friend.avatar}
    <img class="pp" id="avatar" src={friend.avatar} alt="avatar"/>
{:else}
    <img class="pp" id="avatar" src={$user.large_pic} alt={`Picture of ${$user.login}`}/>
{/if}

<style>
	.pp {
		display: flex;
		justify-content: center;
		margin-left: 70px;
		border-radius: 0 100px 0 100px;
		width: 450px;
		border: 2px solid rgb(88, 44, 231);
		padding: 5px;
		max-width: 500px;
		max-height: 500px;
		flex-grow: 1;
	}
</style>