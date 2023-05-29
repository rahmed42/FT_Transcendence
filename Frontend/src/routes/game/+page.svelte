<script lang="ts">
	import { afterUpdate, onDestroy, onMount } from 'svelte';
	import Phaser from 'phaser';
	import { GameSelector } from './scenes/SceneSelector';
	import { Part1Scene } from './scenes/Part1Scene';
	import { Part2Scene } from './scenes/Part2Scene';

	let selectedGame: GameSelector | null = null;
	let game: Phaser.Game | null = null;

	// Fonction afterUpdate - appelée après la mise à jour du composant
	onMount(() => {
		// At first render, selectedGame and game are null
		if (!selectedGame || !game) {
			//Init Phaser and start the game
			game = new Phaser.Game({
				// CANVAS Rendering to be faster
				type: Phaser.CANVAS,
				// Set the fps to 60
				fps: {
					target: 30,
					forceSetTimeOut: true,
					smoothStep: true
				},
				backgroundColor: '#000000',
				physics: {
					default: 'arcade'
				},
				pixelArt: true,

				// Set the size of the game
				width: 800,
				height: 600,
				// Set parent id of the div where the game will be
				parent: 'game-container',
				// Set the scenes of the game
				scene: [GameSelector, Part1Scene, Part2Scene]
			});

			// Get the selected game
			selectedGame = new GameSelector();

			//Begin the game
			game.scene.start('selector');
		}
	});

	// Fonction onDestroy - appelée lorsque le composant est détruit
	onDestroy(() => {
		console.log('Leaving Game');
		if (selectedGame) {
			selectedGame = null; // Remettez selectedGame à null après le nettoyage
		}

		if (game) {
			game.destroy(true);
			game = null; // Remettez game à null après le nettoyage
		}
	});
</script>

<svelte:head>
	<title>Game</title>
	<meta name="description" content="Game Page" />
</svelte:head>

<div class="center">
	<div class="text-column">
		<!-- <h1>42 PONG</h1> -->
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
