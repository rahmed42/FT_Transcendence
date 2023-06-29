<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	let game: any | undefined = undefined;

	// Fonction afterUpdate - appelée après la mise à jour du composant
	onMount(() => {
		// SSR server side rendering
		// https://vitejs.dev/guide/ssr.html
		setTimeout(() => {
			if (typeof window === 'undefined') return;
			if (!game) createPhaserGame();
		}, 500);
	});

	async function createPhaserGame() {
		const Phaser = await import('phaser');
		const { GameSelector } = await import('./scenes/SceneSelector');
		const { Part1Scene } = await import('./scenes/Part1Scene');
		const { Part2Scene } = await import('./scenes/Part2Scene');

		game = new Phaser.Game({
			// CANVAS Rendering to be faster
			type: Phaser.CANVAS,
			// Set the fps
			fps: {
				target: 60,
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
	}

	// Fonction onDestroy - appelée lorsque le composant est détruit
	onDestroy(() => {
		if (game) {
			game.destroy(true);
		}
	});

	async function inviteFriend() {
		// add from DB to get the part of the game

		console.log('Original Seeker Launched');
		game.scene.switch('menu', 'Part1');

		console.log('Modern Seeker Launched');
		game.scene.switch('menu', 'Part2');

		// ADD send request to friend logic
	}
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
		background-image: url('$lib/images/backArcade.jpg');
		background-size: 100% 100%;
	}
</style>
