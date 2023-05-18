<script lang="ts">
	import { onMount } from 'svelte';
	import { user } from '../../stores/user';

	let userInfo;

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

			await getUserInfo();

			// Clean up the subscription on unmount
			return () => {
				unsubscribe();
			};
		}
	});

	async function getToken(code: string) {
		const response = await fetch('http://localhost:3333/auth/login?code=' + code, {
			method: 'POST',
			credentials: 'include'
		});
		const contentType = response.headers.get('Content-Type');
		if (contentType && contentType.includes('application/json')) {
			const data = await response.json();
			if (data !== 'undefined') {
				document.cookie = 'jwt=' + data.token;
				console.log(data.token);
				console.log('Cookie:', document.cookie);
			}
		}
	}

	async function getUserInfo() {
		const response = await fetch('http://localhost:3333/profil/me', {
			method: 'GET',
			credentials: 'include'
		});
		const contentType = response.headers.get('Content-Type');
		if (contentType && contentType.includes('application/json')) {
			const userInfo = await response.json();
			// update the user store
			user.set(userInfo);
		}
	}
</script>

<svelte:head>
	<title>Profile</title>
	<meta name="description" content="User profile" />
</svelte:head>

<div class="center">
	<div class="text-column">
		<h1>Welcome <strong>{$user.first_name} {$user.last_name}</strong></h1>
		<img src={$user.large_pic} alt={`Picture of ${$user.login}`} />
		<p>
			Login : {$user.login}<br />
			Email : {$user.email}
		</p>
	</div>
</div>

<style>
	.center {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
