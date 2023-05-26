<!-- Shared Header config file with navigation links -->
<script lang="ts">
	import { page } from '$app/stores';
	import logo from '$lib/images/42PongLogo.png';
	import { user } from '../stores/user';
	import { beforeUpdate, onMount } from 'svelte';

	let userInfo = {
		token: '',
		jwtToken: '',
		id: '',
		email: '',
		login: '',
		first_name: '',
		last_name: '',
		large_pic: '',
		medium_pic: '',
		small_pic: '',
		createAt: '',
		updateAt: '',
		two_fa: false,
	};

	// onMount is called when the component is mounted in the DOM
	onMount(async () => {
		if (typeof window !== 'undefined') {
			// Subscribe to the user store
			const unsubscribe = user.subscribe((value) => {
				// update userInfo with last user value at store changes
				userInfo = value;
			});

			const code = new URLSearchParams(window.location.search).get('code');
			if (code) {
				await getToken(code);
			}
			// HERE NEED TO CHECK IS THERE IS A JWT IN THE COOKIE, IS YES, DON'T DO GETUSERINFO
			await getUserInfo();

			// Clean up the subscription on unmount
			return () => {
				unsubscribe();
			};
		}
	});

	beforeUpdate(async () => {
		// redirect to home Page if log and on login Page
		if ((userInfo.login || userInfo.login !== '') && window.location.pathname === '/')
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
			const userInfo = await response.json();
			// update the user store
			user.set(userInfo);
		}

		if (userInfo.two_fa === true)
			console.log('THIS IS FUCKING TRUE');
		// redirect to login Page if not log
		if ((!userInfo.login || userInfo.login === '') && window.location.pathname !== '/')
			window.location.href = '/';
	}

	// Logout process - if LOGOUT button is clicked
	function handleLogOut() {
		// Clear the user store
		user.set({
			token: '',
			jwtToken: '',
			id: '',
			email: '',
			login: '',
			first_name: '',
			last_name: '',
			large_pic: '',
			medium_pic: '',
			small_pic: '',
			createAt: '',
			updateAt: '',
			two_fa: false,
		});
		// Clear the cookie
		document.cookie = 'jwt=;';
	}
</script>

<header>
	<nav>
		<!-- Logo clickable with redirection -->
		{#if userInfo.login}
			<a href="/home"> <img src={logo} alt="Logo 42Pong" /> </a>
		{:else}
			<a href="/"> <img src={logo} alt="Logo 42Pong" /> </a>
		{/if}

		<!-- Begin of Header Box -->
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
		</svg>
		<ul>
			{#if userInfo.login}
				<!-- Header links -->
				<li class:selected={$page.url.pathname === '/home' ? 'page' : undefined}>
					<a href="/home">~Home~</a>
				</li>

				<li class:selected={$page.url.pathname === '/chat' ? 'page' : undefined}>
					<a href="/chat">~Chat~</a>
				</li>

				<li class:selected={$page.url.pathname === '/game' ? 'page' : undefined}>
					<a href="/game">~Game~</a>
				</li>

				<li class:selected={$page.url.pathname === '/config' ? 'page' : undefined}>
					<a href="/config">~Config~</a>
				</li>
			{:else}
				<li class:selected={$page.url.pathname === '/' ? 'page' : undefined}>
					<a href="/">LOGIN</a>
				</li>
			{/if}
		</ul>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
		</svg>
		<!-- End of Header Box -->

		<!-- Profile Header Box -->
		{#if userInfo.login}
			<svg viewBox="0 0 2 3" aria-hidden="true">
				<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
			</svg>
			<ul>
				<li class:selected={$page.url.pathname === '/profile' ? 'page' : undefined}>
					<a href="/profile">
						{userInfo.login}
						<img
							src={userInfo.small_pic}
							alt={`Picture of ${userInfo.login}`}
							style="max-height: 2em; width: auto;"
						/>
					</a>
				</li>
				<li class:selected={$page.url.pathname === '/' ? 'page' : undefined}>
					<a href="/" on:click={handleLogOut}>~Logout~</a>
				</li>
			</ul>
			<svg viewBox="0 0 2 3" aria-hidden="true">
				<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
			</svg>
		{/if}
		<!-- End of Profile Header Box -->
	</nav>
</header>

<style>
	header {
		display: flex;
		justify-content: center;
	}

	img {
		width: 200px;
		display: block;
		margin-left: 1em;
	}

	nav {
		display: flex;
		justify-content: center;
		margin-right: auto;
		--background: rgba(37, 164, 179, 0.7);
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: var(--color-text);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--color-theme-1);
	}
</style>
