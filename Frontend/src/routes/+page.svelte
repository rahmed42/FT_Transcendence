<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Particles from 'svelte-particles';
	import { loadFull } from 'tsparticles';

	import { particlesConfig2 } from './particles';
	import { beforeUpdate } from 'svelte';

	const link = import.meta.env.VITE_API_LINK;
	let user: string | undefined = '';
	let particlesContainer: any;

	let onParticlesLoaded = (event: CustomEvent) => {
		particlesContainer = event.detail.particles;

		// you can use particlesContainer to call all the Container class
		// (from the core library) methods like play, pause, refresh, start, stop
		// the tsParticles instance is stored in the particlesContainer object
		if (window.location.pathname === '/game') particlesContainer.stop();
		else particlesContainer.start();
	};

	let particlesInit = async (main: any) => {
		// you can use main to customize the tsParticles instance adding presets or custom shapes
		// this loads the tsparticles package bundle, it's the easiest method for getting everything ready
		// starting from v2 you can add only the features you need reducing the bundle size
		await loadFull(main);
	};

	async function redir_42() {
		window.location.href = link;
	}

	onDestroy(() => {
		if (!particlesContainer) return;
		particlesContainer.stop();
	});

	onMount(async () => {
		user = document.cookie.split(';').find((cookie) => cookie.startsWith('jwt='));
		if (!particlesContainer) return;
		particlesContainer.start();
	});
</script>

<svelte:head>
	<title>Login</title>
	<meta name="description" content="Login Page" />
</svelte:head>

<main>
	{#if !user}
		<div class="center">
			<div id="log" class="text-column">
				<h1>Welcome to <br /> FT Transcendance</h1>
				<br />
				<button class="button-styled" on:click={redir_42}>LOGIN</button> <br /> <br />
			</div>
		</div>
		<footer>
			<pre>
    :::      ::::::::   :::::::::   ::::::::  ::::    :::  ::::::::
   :+:      :+:    :+:  :+:    :+: :+:    :+: :+:+:   :+: :+:    :+:
  +:+ +:+         +:+   +:+    +:+ +:+    +:+ :+:+:+  +:+ +:+
 +#+  +:+       +#+     +#++:++#+  +#+    +:+ +#+ +:+ +#+ :#:
+#+#+#+#+#+   +#+       +#+        +#+    +#+ +#+  +#+#+# +#+   +#+#
      #+#    #+#        #+#        #+#    #+# #+#   #+#+# #+#    #+#
      ###   ##########  ###         ########  ###    ####  ########
			</pre>
			<center>
				Made By <strong> ☁️ anggonza 🌟 ddupont 🌟 mmatthie 🌟 rahmed 🌟 tbrandt ☁️ </strong>
			</center>
		</footer>
	{/if}
</main>

<Particles
	id="tsparticles"
	options={particlesConfig2}
	on:particlesLoaded={onParticlesLoaded}
	{particlesInit}
/>

<style>
	.center {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	#log {
		margin-top: center;
	}
	button {
		width: 300px;
		height: 60px;
		font-size: 30px;
		font-weight: bold;
		margin-left: auto;
		margin-right: auto;
	}

	footer {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 12px;
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		color: white;
		font-size: 10px;
	}

</style>
