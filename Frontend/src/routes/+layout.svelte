<!-- Common layout for all pages -->
<script lang="ts">
	import Header from './Header.svelte';
	import './styles.css';

	import Particles from 'svelte-particles';
	import { loadFull } from 'tsparticles';

	import { particlesConfig2 } from './particles';
	import { beforeUpdate } from 'svelte';

	let particlesContainer: any;

	let onParticlesLoaded = (event: CustomEvent) => {
		particlesContainer = event.detail.particles;

		// you can use particlesContainer to call all the Container class
		// (from the core library) methods like play, pause, refresh, start, stop
		// the tsParticles instance is stored in the particlesContainer object
		if (window.location.pathname === '/game')
			particlesContainer.stop();
		else
			particlesContainer.start();
	};

	let particlesInit = async (main: any) => {
		// you can use main to customize the tsParticles instance adding presets or custom shapes
		// this loads the tsparticles package bundle, it's the easiest method for getting everything ready
		// starting from v2 you can add only the features you need reducing the bundle size
		await loadFull(main);
	};

	// To stop particles on game/chat page
	beforeUpdate(() => {
		if (!particlesContainer)
			return;
		if (window.location.pathname === '/game' || window.location.pathname === '/chat')
			particlesContainer.stop();
		else
			particlesContainer.start();
	});
</script>

<!-- <Particles
	id="tsparticles"
	options={particlesConfig2}
	on:particlesLoaded={onParticlesLoaded}
	{particlesInit}
/> -->

<div>
	<Header />
	<main>
		<slot />
	</main>
</div>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
		color: white;
	}
</style>
