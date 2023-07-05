<script>
	import { onMount } from "svelte";

	const link = import.meta.env.VITE_API_LINK;
	async function redir_42() {
		window.location.href = link;
	}
	let user = '';
	onMount(async () => {
		user = document.cookie.split(';').find(cookie => cookie.startsWith('jwt='));
	});
</script>

<svelte:head>
	<title>Login</title>
	<meta name="description" content="Login Page" />
</svelte:head>

<main>
	{#if !user}
	<div class="center">
		<div class="text-column">
			<h1>Please LOGIN <br /> with your intra42</h1>
			<br />
			<button class="button-styled" on:click={redir_42}>LOGIN</button> <br /> <br />
		</div>
	</div>
	{/if}
</main>

<style>
	.center {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	button {
		width: 200px;
		margin-left: auto;
		margin-right: auto;
	}
</style>
