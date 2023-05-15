<!-- Profile page content -->

<script>
	if (typeof window !== 'undefined') {
		const currentUrl = window.location.href;
		const code = new URLSearchParams(window.location.search).get('code');
		if (code)
		{
			async function getToken() {
				const response = await fetch('http://localhost:3333/auth/login?code=' + code, {
					method: 'POST',
				});
				const data = await response.json();
				console.log(data.token);
			}
			getToken();
		}
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
