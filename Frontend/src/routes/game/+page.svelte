<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { GameSelector } from './scenes/SceneSelector';
	import { Part1Scene } from './scenes/Part1Scene';
	import { Part2Scene } from './scenes/Part2Scene';
	import Phaser from 'phaser';

	let game: any;

	// Fonction afterUpdate - appelée après la mise à jour du composant
	onMount(() => {
		// SSR server side rendering
		// https://vitejs.dev/guide/ssr.html
		if (typeof window === 'undefined') return;

		game = new Phaser.Game({
			// CANVAS Rendering to be faster
			type: Phaser.CANVAS,
			// Set the fps
			fps: {
				target: 30,
				forceSetTimeOut: true,
				smoothStep: true
			},
			backgroundColor: '#000000',
			physics: {
				default: 'arcade'
			},
			pixelArt: false,
			// Set the size of the game
			width: 800,
			height: 600,
			// Set parent id of the div where the game will be
			parent: 'game-container',
			// Set the scenes of the game
			scene: [GameSelector, Part1Scene, Part2Scene]
		});

		//Begin the game
		game.scene.start('menu');
		// }
	});

	// Fonction onDestroy - appelée lorsque le composant est détruit
	onDestroy(() => {
		if (game) {
			game.destroy(true);
		}
	});
</script>

<svelte:head>
	<title>Game</title>
	<meta name="description" content="Game Page" />
</svelte:head>

<div class="center">
	<div class="text-column">
		<div class="game" id="game-container" />
	</div>
</div>

<style>
	.center {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.game {
		width: 800px;
		height: 600px;
		border: 2px solid rgb(88, 44, 231);
		border-radius: 25px;
	}
</style>
