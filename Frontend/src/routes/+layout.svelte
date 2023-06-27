<!-- Common layout for all pages -->
<script lang="ts">
	import Header from './Header.svelte';
	import './styles.css';

	import Particles from 'svelte-particles';
	import { loadFull } from 'tsparticles';

	import { particlesAmong, particlesConfig } from './particles';
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

	// Top stop particles on game page for ressources
	beforeUpdate(() => {
		if (!particlesContainer)
			return;
		if (window.location.pathname === '/game')
			particlesContainer.stop();
		else
			particlesContainer.start();
	});
</script>

<Particles
	id="tsparticles"
	options={particlesConfig}
	on:particlesLoaded={onParticlesLoaded}
	{particlesInit}
/>

<div class="app">
	<Header />
	<main>
		<slot />
	</main>

	<footer>
		<center>
			Made By <strong> ☁️ anggonza 🌟 ddupont 🌟 mmatthie 🌟 rahmed 🌟 tbrandt ☁️ </strong>
		</center>
		<pre>
    :::      ::::::::   :::::::::   ::::::::  ::::    :::  ::::::::
   :+:      :+:    :+:  :+:    :+: :+:    :+: :+:+:   :+: :+:    :+:
  +:+ +:+         +:+   +:+    +:+ +:+    +:+ :+:+:+  +:+ +:+
 +#+  +:+       +#+     +#++:++#+  +#+    +:+ +#+ +:+ +#+ :#:
+#+#+#+#+#+   +#+       +#+        +#+    +#+ +#+  +#+#+# +#+   +#+#
      #+#    #+#        #+#        #+#    #+# #+#   #+#+# #+#    #+#
      ###   ##########  ###         ########  ###    ####  ########
</pre>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		position: relative;
		background: transparent;
		color: white;
		overflow: auto;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 12px;
	}
</style>
