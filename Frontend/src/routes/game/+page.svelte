<!-- Game page content -->
<script lang="ts">
	import { afterUpdate, onDestroy } from 'svelte';
	import { GameSelector } from './scenes/SceneSelector';
	import './pongGame';

	let selectedGame: GameSelector | undefined; // Explicitly specify the type and initialize as undefined

	// Function cleanup
	function cleanup() {
		console.log('Game page cleanup');

		if (selectedGame) {
			selectedGame.gameCleanup(); // Call the cleanup function of the SceneSelector scene
		}
	}

	// Function afterUpdate - called after the component is updated
	afterUpdate(() => {
		console.log('Game page afterUpdate');

		// Initialize phaser game
		if (!selectedGame) {
			selectedGame = new GameSelector(); // Create an instance of the GameSelector scene
			selectedGame.scene.start(
				'selector', // Start the 'selector' scene
				{ container: 'game-container' } // specify the container element
			);
		}
	});

	// Function onDestroy - called when the component is destroyed
	onDestroy(() => {
		cleanup(); // Call the cleanup function when the page is destroyed
	});
</script>

<svelte:head>
	<title>Game</title>
	<meta name="description" content="Game Page" />
</svelte:head>

<div class="center">
	<div class="text-column">
		<h1>42 PONG</h1>
		<!-- Add a container for the game -->
		<div id="game-container" />
	</div>
</div>

<style>
	.center {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
