<script lang="ts">
	import backgroundHome from '$lib/images/backgroundHome.png';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte pong app" />
</svelte:head>

<span class="backgroundHome">
	<picture>
		<img src={backgroundHome} alt="backgroundHome" />
	</picture>
</span>

<style>
	span.backgroundHome {
		position: fixed;
		top: 1em;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		z-index: -1;
	}

	img {
		min-width: 100%;
		min-height: 100%;
		object-fit: cover;
	}
</style>
