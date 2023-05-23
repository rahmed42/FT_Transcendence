<script>
	import { get } from 'svelte/store';
	import { log2Fa } from '../stores/user';

	// const getter = get(log2Fa);
	let isChecked = false;

	function handleChange() {
   		console.log('Valeure de isChecked', isChecked);
  	}
	async function redir_42() {
   		console.log('Valeure de isChecked DANS 42', isChecked);
		// const requestBody = {
		// 	checked: getter.checked,
		// }
		// console.log('in redir_42 function -> ' , requestBody.checked);
		const response = await fetch('http://localhost:3333/auth/google', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ isChecked }),
		});
		// Add logic to put in DB the 2FA state
		// ... To push on DB last 'checked2Fa' value

		// Redir to google 2FA website if checked2Fa is true
		// if (log2Fa.checked) {
		// 	window.location.href = 'http://chez.API.GOOGLE.2FA';
		window.location.href =
			'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-2f818a332a9a2006b00174a76ce71efe9e374cc942b996040f79806509ce968d&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fhome&response_type=code';
	}

	// // Function to change 2FA state
	// function change2FaState() {
	// 	// const getter = get(log2Fa);
	// 	// console.log('in change2FA function -> ' , getter.checked);
	// 	log2Fa.update((value) => {
	// 		// set writable to opposite value
	// 		value.checked = !value.checked;
	// 		return value;
	// 	});
	// }
</script>

<svelte:head>
	<title>Login</title>
	<meta name="description" content="Login Page" />
</svelte:head>

<main>
	<div class="center">
		<div class="text-column">
			<h1>Please LOGIN <br /> with your intra42</h1>
			<br /> <br />
			<button on:click={redir_42}>LOGIN</button> <br /> <br />
		</div>
	</div>
	<label for="checkbox" class="checkbox-label">
		<!-- Add Checkbox to update log2FA checked variable -->
		<input type="checkbox" bind:checked={isChecked} on:change={handleChange}/>
		Active 2FA Authentication
	</label>
</main>

<style>
	.center {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.checkbox-label {
		display: flex;
		justify-content: center;
		color: #981313;
		font-weight: bold;
	}

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
