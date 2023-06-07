<script lang="ts">
	import { get } from 'svelte/store';
	import { user } from '../../stores/user';

	let myUser = get(user);
	let checked = myUser.two_fa;
	let active_message = "Activate Google Authenticator";
	let desactive_message = "Desactivate Google Authenticator";

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
		const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (data.valide)
            {
                sessionStorage.setItem('isLogged', JSON.stringify(true));
                window.location.href = '/home';
                return;
            }
        }
	}
</script>

<svelte:head>
	<title>Profile</title>
	<meta name="description" content="User profile" />
</svelte:head>

<div>
	<h1 class="title">Welcome <strong>{$user.first_name} {$user.last_name}</strong></h1>
	<img class="pp" src={$user.large_pic} alt={`Picture of ${$user.login}`} />
	<div class = "authenticator">
		<button on:click={active_2_fa_auth}>
			{#if !checked}
				{active_message}
			{:else}
				{desactive_message}
			{/if}
		</button>
	</div>
</div>

 <style>
	.title {
		color: rgb(212, 203, 29);
		margin-left: center;
		margin-right: center;
	}
	.authenticator {
		font-family:"Comic Sans MS";
		position: relative;
		top: -350px;
		left: -40px;
	}
	.authenticator button {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #007fff;
		color: #fff;
		font-size: 1.2rem;
		padding: 1rem 2rem;
		border: none;
		transition: background-color 0.2s ease;
		border-radius: 75px;
		cursor: pointer;
		width: 200px;
		height: 100px;
	}
	.pp {
		border-radius: 0 100px 0 100px;
		width: 450px;
		border: 2px solid rgb(88, 44, 231);
		padding: 5px;
		margin-left: 250px;
	}
	button:hover {
		background-color: #0f6402;
		/* border-radius: 75px; */
	}
</style>
