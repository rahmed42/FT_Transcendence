<!-- Profile page content -->

<script>
	import { onMount } from 'svelte'
	if (typeof window !== 'undefined') { 
		const code = new URLSearchParams(window.location.search).get('code');
		if (code)
		{
			onMount(async function getToken() {
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
			});
			// getToken();
		}
	}
	let user = {
		login: 'unknow',
		email: 'unknow',
		large_pic: '',
	}
	onMount( async function getUserInfo() {
		const response = await fetch('http://localhost:3333/profil/me', {
			method: 'GET',
			credentials: 'include',
		});
		const contentType = response.headers.get('Content-Type');
		if (contentType && contentType.includes('application/json')) {
			const userInfo = await response.json();
			user = userInfo;
		}
	})
	// getUserInfo();
</script>

<img src={user.large_pic} alt={`Picture of ${user.login}`} />
<p>Hello {user.login}</p>
<p>Your email is {user.email}</p>

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
