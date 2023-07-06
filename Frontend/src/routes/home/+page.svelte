<script lang="ts">
	import backgroundHome from '$lib/images/backgroundHome.png';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let myCookie : any = '';
	let code : any = null;
	onMount(async () => {
		function getCookie(name: string) {
			const value = `; ${document.cookie}`;
			const parts = value.split(`; ${name}=`);
			if (parts.length === 2) {
				return parts.pop()?.split(';').shift();
			}
		}
		myCookie = getCookie('jwt');
		code = new URLSearchParams(window.location.search).get('code');
		if (!myCookie && !code)
		{
			goto('/');
		}
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte pong app" />
</svelte:head>
{#if code}
	<ul class="background">
		<picture>
			<img src={backgroundHome} alt="backgroundHome" />
		</picture>
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
	</ul>
{/if}

<style>
	img {
		position: fixed;
		top: 2em;
		left: 0;
		opacity: 0.7;
		width: 100%;
		/* height: auto; */
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		z-index: -1;
	}
	pre {
		font-family: 'Courier New', Courier, monospace;
		font-size: 0.6em;
		color: white;
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
	}
</style>
