<!-- Home page content -->

<script lang="ts">
	import pongAnim from '$lib/images/pongAnim.png';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte pong app" />
</svelte:head>

<section>
	<h1>
		Welcome to<br /><strong>Ft_Trancendance</strong><br /><br />
		<span class="pongAnim">
			<picture>
				<img src={pongAnim} alt="pongAnim" style="height: 300px; width: auto;" />
			</picture>
		</span>
	</h1>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.pongAnim img {
		position: static;
		/* width: 100%;
		height: 100%; */
		top: 1;
		display: inside;
	}
</style>
