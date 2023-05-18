<script lang="ts">
	import { user } from '../../stores/user';
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
