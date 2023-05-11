<!-- Shared Header config file with navigation links -->

<script>
	// import { writable } from 'svelte/store';
	import { isUserLoggedIn, userName} from './stores.js';
	import { page } from '$app/stores';
	import logo from '$lib/images/42PongLogo.png';

	$: name = $userName; // use the latest value of the userName store
	$: logged = $isUserLoggedIn; // use the latest value of the isUserLoggedIn store

	function handleLogOut() {
// console.log('Before LOGOUT = ' + $userName.toString()); // ! Debug
// console.log('Before LOGOUT = ' + $isUserLoggedIn.toString());// ! Debug
		userName.set('-NotLog-');
		isUserLoggedIn.set(false);
// console.log('After LOGOUT = ' + $userName.toString());// ! Debug
// console.log('After LOGOUT = ' + $isUserLoggedIn.toString());// ! Debug
// console.log("COUCOU");
	}
</script>


<header>
	<nav>
		<img src={logo} alt="Logo 42Pong" />
		<!-- Begin of Header Box -->
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
		</svg>
		<ul>
			<!-- {#if logged} -->
				<!-- Header links -->
				<li aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
					<a href="/">~Home~</a>
				</li>

				<li aria-current={$page.url.pathname === '/chat' ? 'page' : undefined}>
					<a href="/chat">~Chat~</a>
				</li>

				<li aria-current={$page.url.pathname === '/game' ? 'page' : undefined}>
					<a href="/game">~Game~</a>
				</li>

				<li aria-current={$page.url.pathname === '/config' ? 'page' : undefined}>
					<a href="/config">~Config~</a>
				</li>
			<!-- {:else} -->
				<!-- {isUserLoggedIn.set(false)} -->
				<li aria-current={$page.url.pathname === '/auth' ? 'page' : undefined}>
					<a href="/auth">~User~</a>
				</li>
			<!-- {/if} -->
		</ul>
		<!-- End of Header Box -->
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
		</svg>

		<!-- {#if logged} -->
			<!-- Name Header Box -->
			<svg viewBox="0 0 2 3" aria-hidden="true">
				<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
			</svg>
			<ul>
				<li aria-current={$page.url.pathname === '/profile' ? 'page' : undefined}>
					<a href="/profile">{name}</a>
				</li>
				<li aria-current={$page.url.pathname === '/auth' ? 'page' : undefined}>
					<a href="/auth" on:click={handleLogOut}>~Logout~</a>
				</li>
			</ul>
			<svg viewBox="0 0 2 3" aria-hidden="true">
				<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
			</svg>
		<!-- {/if} -->
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

	li[aria-current='page']::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--color-theme-1);
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