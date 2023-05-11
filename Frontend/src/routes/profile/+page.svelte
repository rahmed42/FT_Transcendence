<!-- Profile page content -->

<script>
	if (typeof window !== 'undefined') {
		const currentUrl = window.location.href;
		const code = new URLSearchParams(window.location.search).get('code');
		if (code) // temporary security, later we should check if there is a token in the cookie for the request /profile URL
		{
			async function getToken() {
				const response = await fetch('http://localhost:3333/auth/login?code=' + code, {
					method: 'POST',
				});
			}
			getToken();
		}
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
