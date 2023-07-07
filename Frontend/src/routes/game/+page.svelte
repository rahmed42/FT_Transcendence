<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';

	const serverIP = import.meta.env.VITE_SERVER_IP;
	let game: any | undefined = undefined;
	let myCookie: String | undefined = '';
	let myGameCheck: any;

	function getCookie(name: string) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) {
			return parts.pop()?.split(';').shift();
		}
	}

	function deleteGame() {
		if (game) {
			game.destroy(true);
			game = undefined;
		}
	}

	function startGameTimeout() {
		clearTimeout(myGameCheck);
		myGameCheck = setTimeout(() => {
			// SSR server side rendering
			// https://vitejs.dev/guide/ssr.html
			if (typeof window === 'undefined') return;
			if (window.location.pathname !== '/game') deleteGame();

			if (!game && window.location.pathname === '/game') {
				clearTimeout(myGameCheck);
				createPhaserGame();
				return;
			}
		}, 500);
	}
	// Fonction afterUpdate - appelée après la mise à jour du composant
	onMount(() => {
		deleteGame();
		myCookie = getCookie('jwt');

		if (!myCookie) goto('/');
		else startGameTimeout();
	});

	async function createPhaserGame() {
		const Phaser = await import('phaser');
		const { GameSelector } = await import('./scenes/SceneSelector');
		const { Part1Scene } = await import('./scenes/Part1Scene');
		const { Part2Scene } = await import('./scenes/Part2Scene');
		const { Part3Scene } = await import('./scenes/Part3Scene');
		const { Part4Scene } = await import('./scenes/Part4Scene');

		deleteGame();
		setTimeout(() => {
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
				scene: [GameSelector, Part1Scene, Part2Scene, Part3Scene, Part4Scene]
			});
			// check if invited to a game
			checkInvite();
		}, 50);
	}

	// Fonction onDestroy - appelée lorsque le composant est détruit
	onDestroy(() => {
		clearTimeout(myGameCheck);
		deleteGame();

		//for lower pc at school send a second delete request
		setTimeout(() => {
			deleteGame();
		}, 300);
	});

	async function checkInvite() {
		// ADD check if the user has an invite
		const response = await fetch('http://' + serverIP + ':3333/profil/me', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + myCookie
			},
			credentials: 'include'
		});
		if (response.ok) {
			const data = await response.json();
			if (data.gameTypeInvitation === 'Original') {
				game.scene.start('Part3');
			} else if (data.gameTypeInvitation === 'Modern') {
				game.scene.start('Part4');
			}
		}
		const deleteGameRequest = await fetch('http://' + serverIP + ':3333/profil/resetGameStatus', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + myCookie
			},
			credentials: 'include'
		});
	}
</script>

<svelte:head>
	<title>Game</title>
	<meta name="description" content="Game Page" />
</svelte:head>
{#if myCookie}
	<div class="center">
		<div class="text-column">
			<div class="game" id="game-container" />
		</div>
	</div>
{/if}

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
