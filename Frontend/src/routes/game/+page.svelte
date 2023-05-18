<!-- Game page content -->
<script>
	import { onDestroy } from 'svelte';
	// import { sceneSelector } from './scenes/SceneSelector.ts';

	// let sceneSelector: SceneSelector; // Explicitly specify the type

	// Function cleanup
	function cleanup() {
		console.log('Game page cleanup');

		// if (sceneSelector) {
		// 	sceneSelector.cleanup(); // Call the cleanup function of the SceneSelector scene
		// }
	}

	onDestroy(() => {
		cleanup(); // Call the cleanup function when the page is destroyed
	});
</script>

<svelte:head>
	<title>Game</title>
	<meta name="description" content="Game Page" />
</svelte:head>

<!-- {#if $page.url.pathname === '/game'} -->
<div class="center">
	<div class="text-column">
		<h1>GAME PAGE</h1>
	</div>
</div>

<!-- {/if} -->

<style>
	.center {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
