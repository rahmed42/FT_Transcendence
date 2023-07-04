<script>
	const link = import.meta.env.VITE_API_LINK;
	async function redir_42() {
		window.location.href = link;
	}
</script>

<svelte:head>
	<title>Login</title>
	<meta name="description" content="Login Page" />
</svelte:head>

<main>
	<div class="center">
		<div class="text-column">
			<h1>Please LOGIN <br /> with your intra42</h1>
			<br />
			<button class="button-styled" on:click={redir_42}>LOGIN</button> <br /> <br />
		</div>
	</div>
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
