<!-- Shared Header config file with navigation links -->
<script lang="ts">
	import { page } from '$app/stores';
	import logo from '$lib/images/42PongLogo.png';
	import { onMount } from 'svelte';
	import { setUser, user, resetUser } from '../stores/user';
	import type { User } from '../stores/user';

	let currentUser: User;
	const serverIP = import.meta.env.VITE_SERVER_IP;

	// onMount is called when the component is mounted in the DOM
	onMount(async () => {
		// Subscribe to the user store
		const unsubscribe = user.subscribe((value) => {
			currentUser = value;
		});
		if (typeof window !== 'undefined') {
			const code = new URLSearchParams(window.location.search).get('code');
			if (code) {
				await getToken(code);
			}
		}

		async function check_2fa_user(): Promise<Boolean> {
			const response = await fetch('http://' + serverIP + ':3333/auth/2fa_info', {
				method: 'GET',
				credentials: 'include'
			});
			const contentType = response.headers.get('Content-Type');
			if (contentType && contentType.includes('application/json')) {
				const data = await response.json();
				if (data.info) {
					return true;
				}
			}
			return false;
		}
		if (checkJwtCookie()) {
			currentUser.check_2fa = await check_2fa_user();
			if (currentUser.check_2fa) {
				const response = await fetch('http://' + serverIP + ':3333/profil/me', {
					method: 'GET',
					credentials: 'include'
				});
				const contentType = response.headers.get('Content-Type');
				if (contentType && contentType.includes('application/json')) {
					const data = await response.json();
					if (data.status === 'logout')
						if (window.location.pathname !== '/2_fa') window.location.href = '/2_fa';
				}
				const res = await fetch('http://' + serverIP + ':3333/profil/me', {
					method: 'GET',
					credentials: 'include'
				});
				const content = response.headers.get('Content-Type');
				if (content && content.includes('application/json')) {
					const dataa = await res.json();
					if (dataa.status === 'login') await getUserInfo();
				}
			}
		}
		if (checkJwtCookie() && !currentUser.check_2fa)
			await getUserInfo();

		// Clean up the subscription on unmount
		return () => {
			unsubscribe();
		};
	});

	async function getToken(code: string) {
		// Fetch token from the server
		const response = await fetch('http://' + serverIP + ':3333/auth/userInfo?code=' + code, {
			method: 'POST',
			credentials: 'include'
		});
		const contentType = response.headers.get('Content-Type');
		if (contentType && contentType.includes('application/json')) {
			const data = await response.json();
			if (data !== 'undefined') {
				document.cookie = 'jwt=' + data.token;
			}
		}
	}

	function checkJwtCookie() {
		const cookies = document.cookie.split(';');

		for (let i = 0; i < cookies.length; i++) {
			const cookie = cookies[i].trim();

			if (cookie.startsWith('jwt=')) {
				const jwtValue = cookie.substring(4);

				if (jwtValue.length > 0) {
					return true;
				}
			}
		}
		return false;
	}
	async function loginUser() {
		await fetch('http://' + serverIP + ':3333/auth/login', {
			method: 'POST',
			credentials: 'include'
		});
	}
	async function logoutUser() {
		await fetch('http://' + serverIP + ':3333/auth/logout', {
			method: 'POST',
			credentials: 'include'
		});
	}

	async function getUserInfo() {
		// Fetch user informations from the server
		const response = await fetch('http://' + serverIP + ':3333/profil/me', {
			method: 'GET',
			credentials: 'include'
		});
		// add endpoint to push status: true to tell the user is logged
		const contentType = response.headers.get('Content-Type');
		if (contentType && contentType.includes('application/json')) {
			// Get the JSON data from the response
			const data = await response.json();
			// update the user store
			setUser(data);
			// status to login in DB
			await loginUser();
		}
	}

	// Logout process - if LOGOUT button is clicked
	async function handleLogOut() {
		// Clear the user store
		resetUser();
		// status to logout in DB
		await logoutUser();
		// delete jwt in cookie
		document.cookie = 'jwt=;';
	}
</script>

<header>
	<ul>
		<!-- Home button Logo  -->
		{#if currentUser && currentUser.login}
			<li class:selected={$page.url.pathname === '/home' ? 'page' : undefined}>
				{#if $page.url.pathname === '/home'}
					<a class="active" href="/home"><img src={logo} alt="Logo 42Pong" /></a>
				{:else}
					<a href="/home"><img src={logo} alt="Logo 42Pong" /></a>
				{/if}
			</li>
		{:else}
			<li style="float: left; border-left: none;">
				{#if $page.url.pathname === '/'}
					<a class="active" href="/"><img src={logo} alt="Logo 42Pong" /></a>
				{:else}
					<a href="/"><img src={logo} alt="Logo 42Pong" /></a>
				{/if}
			</li>
		{/if}

		<!-- Navigation links -->
		{#if currentUser && currentUser.login}
			<li class:selected={$page.url.pathname === '/game' ? 'page' : undefined}>
				{#if $page.url.pathname === '/game'}
					<a href="/game" class="active">Game</a>
				{:else}
					<a href="/game">Game</a>
				{/if}
			</li>

			<li class:selected={$page.url.pathname === '/config' ? 'page' : undefined}>
				{#if $page.url.pathname === '/config'}
					<a href="/config" class="active">Setup</a>
				{:else}
					<a href="/config">Setup</a>
				{/if}
			</li>

			<li class:selected={$page.url.pathname === '/social' ? 'page' : undefined}>
				{#if $page.url.pathname === '/social'}
					<a href="/social" class="active">Friends</a>
				{:else}
					<a href="/social">Friends</a>
				{/if}
			</li>

			<li class:selected={$page.url.pathname === '/chat' ? 'page' : undefined}>
				{#if $page.url.pathname === '/chat'}
					<a href="/chat" class="active">Chat</a>
				{:else}
					<a href="/chat">Chat</a>
				{/if}
			</li>
		{/if}

		<!-- User menu -->
		{#if currentUser && currentUser.login}
			<li class:selected={$page.url.pathname === '/' ? 'page' : undefined}>
				<a href="/" on:click={handleLogOut}>Logout</a>
			</li>
			<li class:selected={$page.url.pathname === '/profile' ? 'page' : undefined}>
				{#if $page.url.pathname === '/profile'}
					<a href="/profile" class="active">
						{currentUser.login}
						{#if currentUser.avatar}
							<img
								src={currentUser.avatar}
								alt={`Picture of ${currentUser.login}`}
								style="max-height: 2em; width: auto; margin-left:0.5em"
							/>
						{:else}
							<img
								src={currentUser.small_pic}
								alt={`Picture of ${currentUser.login}`}
								style="max-height: 2em; width: auto; margin-left:0.5em"
							/>
						{/if}
					</a>
				{:else}
					<a href="/profile">
						<!-- if (currentUser.pseudo) -->
						<!-- {currentUser.pseudo} -->
						<!-- else -->
						{currentUser.login}
						{#if currentUser.avatar}
							<img
								src={currentUser.avatar}
								alt={`Picture of ${currentUser.login}`}
								style="max-height: 2em; width: auto; margin-left:0.5em"
							/>
						{:else}
							<img
								src={currentUser.small_pic}
								alt={`Picture of ${currentUser.login}`}
								style="max-height: 2em; width: auto; margin-left:0.5em"
							/>
						{/if}
					</a>
				{/if}
			</li>
		{/if}
	</ul>
</header>

<style>
	img {
		height: 2em;
		width: auto;
		display: block;
	}

	ul {
		list-style-type: none;
		margin: 0;
		padding: 0;
		overflow: hidden;
		background: linear-gradient(to bottom, #080027, #2b0bbc);
		height: 2em;
		opacity: 0.8;
	}

	li {
		float: left;
		border-right: 1px solid #bbb;
		height: 100%;
	}

	li a {
		display: flex;
		justify-content: center;
		align-items: center;
		color: white;
		text-align: center;
		padding: 0 16px;
		text-decoration: none;
		height: 100%;
	}

	li:nth-last-child(2) {
		/* Sélectionne l'avant-dernier élément */
		float: right; /* Aligne les éléments à droite */
	}
	li:last-child {
		/* Sélectionne le dernier élément */
		float: right; /* Aligne les éléments à droite */
		border-left: 1px solid #bbb;
	}

	li:nth-last-child(2) a,
	li:last-child a {
		justify-content: flex-end; /* Aligne le contenu à droite */
	}

	li a:hover:not(.active) {
		background: linear-gradient(to top, #4bc3ff, #2b0bbc);
	}

	.active {
		background: linear-gradient(to bottom, #4bc3ff, #2b0bbc);
		font-weight: bold;
	}
</style>
