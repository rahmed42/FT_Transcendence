<!-- Home  "/" page content -->

<script>
	import welcome from '$lib/images/pongAnim.png';
	import { isUserLoggedIn, userName} from './stores.js';

	$: name = $userName; // use the latest value of the userName store
	$: logged = $isUserLoggedIn; // use the latest value of the isUserLoggedIn store

</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte pong app" />
</svelte:head>

<section>
	<h1>
		Welcome <strong>{name}</strong> to<br>Ft_Trancendance<br><br>
		<span class="welcome">
			<picture>
				<img src={welcome} alt="Welcome" />
			</picture>
		</span>
	</h1>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome img {
		position: static;
		width: 100%;
		height: 100%;
		top: 1;
		display: inside;
	}
</style>
