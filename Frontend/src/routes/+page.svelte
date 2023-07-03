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
			<br /> <br />
			<button on:click={redir_42}>LOGIN</button> <br /> <br />
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
