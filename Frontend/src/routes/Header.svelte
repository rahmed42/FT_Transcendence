<!-- Shared Header config file with navigation links -->
<script lang="ts">
	import { page } from '$app/stores';
	import logo from '$lib/images/42PongLogo.png';
	import { beforeUpdate, onMount } from 'svelte';
	import { setUser, user, resetUser, type User } from '../stores/user';

	let currentUser: User | undefined;

	// onMount is called when the component is mounted in the DOM
	onMount(async () => {
		//await loading all page before starting
		await new Promise((resolve) => setTimeout(resolve, 1000));
		if (typeof window !== 'undefined') {
			// Subscribe to the user store
			const unsubscribe = user.subscribe((value) => {
				// update currentUser with last user value at store changes
				currentUser = value;
				console.log(user, value);
			});

			const code = new URLSearchParams(window.location.search).get('code');
			if (code) {
				await getToken(code);
			}
			// HERE NEED TO CHECK IF THERE IS A JWT IN THE COOKIE, IF YES, DON'T DO GETUSERINFO
			await getUserInfo();

			// Clean up the subscription on unmount
			return () => {
				unsubscribe();
			};
		}
	});

	beforeUpdate(async () => {
		// redirect to home Page if logged in and on login Page
		if (currentUser && currentUser.login && window.location.pathname === '/')
			window.location.href = '/home';
	});

	async function getToken(code: string) {
		// Fetch token from the server
		const response = await fetch('http://localhost:3333/auth/login?code=' + code, {
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

	async function getUserInfo() {
		// Fetch user informations from the server
		const response = await fetch('http://localhost:3333/profil/me', {
			method: 'GET',
			credentials: 'include'
		});
		const contentType = response.headers.get('Content-Type');
		if (contentType && contentType.includes('application/json')) {
			// Get the JSON data from the response
			const data = await response.json();
			// update the user store
			setUser(data);
		}

		if (currentUser && currentUser.two_fa === true) console.log('THIS IS FUCKING TRUE');
		// redirect to login Page if not logged in
		if ((!currentUser || !currentUser.login) && window.location.pathname !== '/')
			window.location.href = '/';
	}

	// Logout process - if LOGOUT button is clicked
	function handleLogOut() {
		// Clear the user store
		resetUser();
		// Clear the cookie
		document.cookie = 'jwt=;';
	}
</script>

<header>
	<ul>
		<!-- Home button Logo  -->
		{#if  currentUser && currentUser.login}
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
						<img
							src={currentUser.small_pic}
							alt={`Picture of ${currentUser.login}`}
							style="max-height: 2em; width: auto; margin-left:0.5em"
						/>
					</a>
				{:else}
					<a href="/profile">
						{currentUser.login}
						<img
							src={currentUser.small_pic}
							alt={`Picture of ${currentUser.login}`}
							style="max-height: 2em; width: auto; margin-left:0.5em"
						/>
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
		background-color: #100050;
		height: 2em;
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
		background-color: #386ade;
	}

	.active {
		background-color: #2b0bbc;
	}
</style>
