<script>
	import Header from '../Header.svelte';
	import { isUserLoggedIn, userName } from '../stores.js';
  </script>

  <svelte:head>
	<title>About</title>
	<meta name="description" content="Chat Page" />
  </svelte:head>

  <div class="center">
	<div class="text-column">
	  <h1>CHAT PAGE</h1>
	</div>
  </div>

<style>
	.center {
	  display: flex;
	  justify-content: center;
	  align-items: center;
	}

</style>
