<script lang="ts">
	import { user } from '../../stores/user';

	let checked = false;

	function handleChange () {
		// console.log('Valeure de checked -> ', checked);
	}
	async function save_settings() {
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
</script>

<svelte:head>
	<title>Profile</title>
	<meta name="description" content="User profile" />
</svelte:head>

<div class="center">
	<div class="text-column">
		<h1>Welcome <strong>{$user.first_name} {$user.last_name}</strong></h1>
		<img src={$user.large_pic} alt={`Picture of ${$user.login}`} />
		<p>
			Login : {$user.login}<br />
			Email : {$user.email}
		</p>
		<label for="checkbox" class="checkbox-label">
		<input type="checkbox" id="checkbox" bind:checked={checked} on:change={handleChange}/>
		Active 2FA Authentication <br /> <br />
		</label>
	<button on:click={save_settings}>Save settings</button>
	</div>
</div>

<style>
	.center {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	button {
		background-color: #007fff;
		color: #fff;
		font-size: 1.2rem;
		padding: 1rem 2rem;
		border: none;
		border-radius: 15px;
		cursor: pointer;
	}

	button:hover {
		background-color: #0055ff;
	}
</style>
