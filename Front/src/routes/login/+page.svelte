<!-- Login page content -->

<script>
	import Header from '../Header.svelte';
	import { isUserLoggedIn, userName } from '../stores.js';
	import { onMount } from 'svelte';

	async function fetchData() {
      const response = await fetch('http://localhost:3333/login');
      console.log(response);
  }

	// function handleLogIn() {

	// console.log('Before LOGIN = ' + $userName.toString()); // ! Debug
	// console.log('Before LOGIN = ' + $isUserLoggedIn.toString());// ! Debug
	// isUserLoggedIn.set(true);
	// userName.set('Fake Login'); // replace with the user's name to get from API
	// console.log('After LOGIN  = ' + $userName.toString());// ! Debug
	// console.log('After LOGIN  = ' + $isUserLoggedIn.toString());// ! Debug
	// window.location.href = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-2f818a332a9a2006b00174a76ce71efe9e374cc942b996040f79806509ce968d&redirect_uri=https%3A%2F%2Fprofile.intra.42.fr%2Foauth%2Fapplications&response_type=code";
	// }
</script>

  <svelte:head>
	<title>Login</title>
	<meta name="description" content="Login Page" />
  </svelte:head>

<main>
  <div class="center">
	<div class="text-column">
	  <button on:click={fetchData}>LOGIN</button>
	  <h1>Please LOGIN <br /> with your intra42</h1>
	</div>
	<div class="background-image"></div>
  </div>
</main>


<style>
	.center {
	  display: flex;
	  justify-content: center;
	  align-items: center;
	}

	.background-image {
	  background-image: url('$lib/images/pongAnim.png');
	  background-position: center;
	  background-size: cover;
	  height: 50vh;
	  width: 50%;
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
