<!-- Profile page content -->

<script>
	if (typeof window !== 'undefined') {
		const code = new URLSearchParams(window.location.search).get('code');
		// If there is a code provided by the URL, this is a new client connexion
		// Need to generate a JWT Token for this client
		if (code)
		{
			async function getToken() {
				const response = await fetch('http://localhost:3333/auth/login?code=' + code, {
					method: 'POST',
					credentials: 'include',
				});
				const contentType = response.headers.get('Content-Type');
				if (contentType && contentType.includes('application/json')) {
					const data = await response.json();
					if (data != 'undefined')
					{
						document.cookie = "jwt=" + data.token;
						console.log(data.token);
						console.log('Cookie:', document.cookie);
					}
				}
			}
			getToken();
		}
		// If there is no code in the URL, this is the client trying to acces his information
		// Need to create endpoint that check the JWT Token and return info

	}
</script>

  <!-- {#if user}
  <p>Hello {user.login}</p>
  <p>Your email is {user.email}</p>
{/if} -->

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
