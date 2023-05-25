<script lang="ts">
	import { get } from 'svelte/store';
	import { user } from '../../stores/user';
	// import { checked } from '../../stores/user';
	import { beforeUpdate, onMount } from 'svelte';

	let checked = false;
	  onMount(() => {
    const storedValue = localStorage.getItem('checked');
    checked = storedValue ? JSON.parse(storedValue) : false;
  });

  $: {
    // Mise à jour du localStorage lorsque la variable checked change
    localStorage.setItem('checked', JSON.stringify(checked));
  }
  console.log('final ->', checked);
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
		<label for="checkbox" class="checkbox-label">
		<input type="checkbox" id="checkbox" bind:checked={checked}/>
		Active 2FA Authentication
		</label>
	</div>
</div>

<style>
	.center {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
