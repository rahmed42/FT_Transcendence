<!-- Login page content -->

<script>
	import Header from '../Header.svelte';
	import { isUserLoggedIn, userName } from '../stores.js';

	function handleLogIn() {
console.log('Before LOGIN = ' + $userName.toString()); // ! Debug
console.log('Before LOGIN = ' + $isUserLoggedIn.toString());// ! Debug
	  isUserLoggedIn.set(true);
	  userName.set('Fake Login'); // replace with the user's name to get from API
console.log('After LOGIN  = ' + $userName.toString());// ! Debug
console.log('After LOGIN  = ' + $isUserLoggedIn.toString());// ! Debug
	  window.location.href = "/";
	}
  </script>

  <svelte:head>
	<title>Login</title>
	<meta name="description" content="Login Page" />
  </svelte:head>

<main>
  <div class="center">
	<div class="text-column">
	  <button on:click={handleLogIn}>LOGIN</button>
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
