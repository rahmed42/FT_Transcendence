<!-- Common layout for all pages -->
<script lang="ts">
	import Header from './Header.svelte';
	import './styles.css';
	// import { page } from '$app/stores';

	// import Particles from "svelte-particles";
	// import { loadFull } from "tsparticles-engine";

	// let particlesUrl = "./particles.json";

	// let particlesConfig = {
	//   particles: {
	// 	color: {
	// 	  value: "#000",
	// 	},
	// 	links: {
	// 	  enable: true,
	// 	  color: "#000",
	// 	},
	// 	move: {
	// 	  enable: true,
	// 	},
	//   },
	// };

	// let onParticlesLoaded = (event) => {
	//   const particlesContainer = event.detail.particles;
	//   // you can use particlesContainer to call all the Container class
	//   // (from the core library) methods like play, pause, refresh, start, stop
	// };

	// let particlesInit = async (engine) => {
	//   // you can use main to customize the tsParticles instance adding presets or custom shapes
	//   // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
	//   // starting from v2 you can add only the features you need reducing the bundle size
	//   await loadFull(engine);
	// };
</script>

<div class="app" id="app">
	<Header />
	<main>
		<!-- <Particles
		id="tsparticles"
		url="{particlesUrl}"
		options="{particlesConfig}"
		on:particlesLoaded="{onParticlesLoaded}"
		particlesInit="{particlesInit}"
	  /> -->
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
	/* .app {
	  display: flex;
	  flex-direction: column;
	  min-height: 100vh;
	} */

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
		justify-content: center;
		align-items: center;
		padding: 12px;
	}
	/* .game-page {
        position: relative;
    }
    .game-page #game-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 999;
    } */
</style>
