<!-- Login page content -->

<script>
	import { get } from 'svelte/store';
	// import { fa } from '../stores/user';

	// let test = get(fa);
	// let test1 = test.fa;
	// console.log(test1);
	async function redir_42() {
		window.location.href =
			'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-2f818a332a9a2006b00174a76ce71efe9e374cc942b996040f79806509ce968d&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fhome&response_type=code';
	}
</script>

<svelte:head>
	<title>Login</title>
	<meta name="description" content="Login Page" />
</svelte:head>

<main>
	<div class="center">
		<div class="text-column">
			<h1>Please LOGIN <br /> with your intra42</h1> <br /> <br />
			<button on:click={redir_42}>LOGIN</button> <br /> <br />
		</div>
	</div>
	<!-- <label for="checkbox" class = "checkbox-label">
 		 <input type="checkbox" id="checkbox" bind:checked={test.fa} on:change={() => console.log(test.fa)}>
		  Active 2FA Authentification
	</label> -->
</main>



<style>
	.center {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	/* .checkbox-label {
		display: flex;
		justify-content: center;
		color: #981313;
		font-weight: bold;
	} */

	button {
		background-color: #007fff;
		color: #fff;
		font-size: 1.2rem;
		padding: 1rem 2rem;
		border: none;
		border-radius: 15px;
		cursor: pointer;
	}
	button:hover {
		background-color: #0055ff;
	}
</style>
