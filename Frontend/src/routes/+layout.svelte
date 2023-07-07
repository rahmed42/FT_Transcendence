<!-- Common layout for all pages -->
<script lang="ts">
	import Header from './Header.svelte';
	import './styles.css';

</script>

<div>
	<Header />
	<main>
		<slot />
	</main>
</div>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
		color: white;
	}
</style>
