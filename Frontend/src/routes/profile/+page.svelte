<!-- Profile page content -->

<script>
	import Header from '../Header.svelte';
	// need to check if the code provided by 42 is already in the URL

	if (typeof window !== 'undefined') {
		const currentUrl = window.location.href;
		const code = new URLSearchParams(window.location.search).get('code');
		async function getToken() {
			const response = await fetch('http://localhost:3333/auth/token?code=' + code, {
				method: 'POST',
			});
		}
		getToken();
		// console.log(response);
	}
  </script>

  <svelte:head>
	<title>Profile</title>
	<meta name="description" content="User profile" />
  </svelte:head>

  <div class="center">
	<div class="text-column">
	  <h1>User Profile PAGE</h1>
	</div>
  </div>

<style>
	.center {
	  display: flex;
	  justify-content: center;
	  align-items: center;
	}

</style>
