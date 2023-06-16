<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	// import Phaser from 'phaser';
	import { GameSelector } from './scenes/SceneSelector';
	import { Part1Scene } from './scenes/Part1Scene';
	import { Part2Scene } from './scenes/Part2Scene';

	/**
	 * TODO : Have to disconnect on change page/patch reload on game page
	 */

	 let game: any;

	// Fonction afterUpdate - appelée après la mise à jour du composant
	onMount(async () => {
		// SSR server side rendering
		if (typeof window === 'undefined') return;
		// console.log('Entering Game', GameSelector, Part1Scene, Part2Scene);

		// Execute on client side only if not server side rendering
		if (!import.meta.env.SSR) {
			// SSR info : https://vitejs.dev/guide/ssr.html
			//Init Phaser and start the game
			const Phaser = await import('phaser');
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
			game.scene.start('selector');
		}
	});

	// Fonction onDestroy - appelée lorsque le composant est détruit
	onDestroy(() => {

		console.log('Leaving Game');
		// destroy game instance
		if (game) {
			console.log('Destroying Game');
			game.destroy(true);
			game = null;
		}
	});
</script>

<svelte:head>
	<title>Game</title>
	<meta name="description" content="Game Page" />
</svelte:head>

<div class="center">
	<div class="text-column">
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
