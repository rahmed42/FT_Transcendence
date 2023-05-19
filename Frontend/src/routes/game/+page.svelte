<script lang="ts">
	import { afterUpdate, onDestroy } from 'svelte';
	import { GameSelector } from './scenes/SceneSelector';
	import Phaser from 'phaser';

	let selectedGame: GameSelector | null = null;
	let game: Phaser.Game | null = null;

	function initializePhaserGame(): void {
		const config: Phaser.Types.Core.GameConfig = {
			type: Phaser.AUTO,
			width: 800,
			height: 600,
			scene: [GameSelector]
		};

		// Create the game
		game = new Phaser.Game(config);
	}

	// Fonction afterUpdate - appelée après la mise à jour du composant
	afterUpdate(() => {
		// console.log('Game page afterUpdate');

		if (!selectedGame && !game) {
			// console.log('Game page afterUpdate INIT');
			// Call the function to initialize the game
			initializePhaserGame();
			selectedGame = new GameSelector();
			game.scene.start('selector'); // Démarrez la scène 'selector' du jeu
		}
	});

	// Fonction onDestroy - appelée lorsque le composant est détruit
	onDestroy(() => {
		// console.log('Game page onDestroy');
				if (selectedGame) {
			// console.log('Game page cleanup selectedGame');
			game.destroy(true); // Détruisez la mémoire allouée pour le jeu
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
		<h1>42 PONG</h1>
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
