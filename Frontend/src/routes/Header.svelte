<!-- Shared Header config file with navigation links -->
<script lang="ts">
	import { page } from '$app/stores';
	import logo from '$lib/images/42PongLogo.png';
	import { afterUpdate, onMount } from 'svelte';
	import { setUser, user, resetUser, type User } from '../stores/user';

	let currentUser: User | null = null;

	// onMount is called when the component is mounted in the DOM
	onMount(async () => {
		if (typeof window !== 'undefined') {
			// Subscribe to the user store
			const unsubscribe = user.subscribe((value) => {
				// update currentUser with last user value at store changes if exist
				if (value.login) {
					currentUser = value;
					sessionStorage.setItem('user', JSON.stringify(value));
					// console.log('GetValue ', currentUser);
				}
				// Fist time user is null, so we check if sessionStorage has a user or it will return null
				else if (sessionStorage.getItem('user')) {
					currentUser = JSON.parse(sessionStorage.getItem('user'));
					// console.log('SessionRestored ', currentUser);
				}
			});
			const code = new URLSearchParams(window.location.search).get('code');
			if (code) {
				await getToken(code);
			}

			if (checkJwtCookie())
			{
				// console.log('START GETUSERINFO');
				await getUserInfo();
			}
			const first_log = sessionStorage.getItem('isLogged');
			if (currentUser && currentUser.two_fa && !first_log) //Attention IsLogged est set que si 2fa est actif !
			{
				sessionStorage.setItem('isLogged', JSON.stringify(currentUser.isLogged));
				if (window.location.pathname !== '/2_fa')
					window.location.href = '/2_fa';
			}

			// redirect to home Page if logged in and reload on game page
			if (sessionStorage.getItem('user') && window.location.pathname === '/game')
			{
				console.log('tamerelapute');
				window.location.href = '/home';
			}

			// Clean up the subscription on unmount
			return () => {
				unsubscribe();
			};
		}
	});

	afterUpdate(async () => {
		// redirect the user if isLogged is true
		// redirect to home Page if logged in and on login Page / To add on backend checks
		if (sessionStorage.getItem('user') && window.location.pathname === '/') 
		{
			console.log('redirect to /home');
			window.location.href = '/home'
		}
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
				sessionStorage.setItem('jwt', data.token);
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

	async function getUserInfo() {
		// Fetch user informations from the server
		const response = await fetch('http://localhost:3333/profil/me', {
			method: 'GET',
			credentials: 'include',
		});
		const contentType = response.headers.get('Content-Type');
		if (contentType && contentType.includes('application/json')) {
			// Get the JSON data from the response
			const data = await response.json();
			// update the user store
			setUser(data);
		}
		// redirect to login Page if not logged in
		if ((!currentUser || !currentUser.login || !sessionStorage.getItem('user')) && window.location.pathname !== '/')
			window.location.href = '/';
	}

	// Logout process - if LOGOUT button is clicked
	async function handleLogOut() {
		// Clear the user store
		resetUser();
		// Clear the cookie
		document.cookie = 'jwt=;';
		// sessionStorage.setItem('isLogged', JSON.stringify(false));
		// sessionStorage cleaning
		sessionStorage.removeItem('user');
		sessionStorage.removeItem('isLogged');
		sessionStorage.removeItem('jwt');
		// reset currentUser
		currentUser = null;
	}
</script>

<head>
	<!-- Preload image to avoid flickering -->
	<link rel="preload" as="image" href={logo} />
</head>

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
