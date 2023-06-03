<!-- Config page content  -->

<script lang="ts">
	import { beforeUpdate, onMount } from 'svelte';

    let qrcode = "";
    let userCode = "";
    let errorMessage = "";
    onMount(async () => {
        let isLoggedValue = false;
        const isLogged = sessionStorage.getItem('isLogged');
        if (isLogged !== null) {
            isLoggedValue = JSON.parse(isLogged);
        }
    
        async function generate_qrCode() {
            const response = await fetch('http://localhost:3333/auth/qrcode_generate', {
                method: 'POST',
                credentials: 'include',
            });
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                qrcode = data.qrcode;
            }
        }
        if (isLoggedValue === false) {
            generate_qrCode();
        }
    })
    async function send_code() {
        if (userCode === "")
            return false;
        const response = await fetch('http://localhost:3333/auth/2fa_code', {
            method: 'POST',
            credentials: 'include',
            headers: {
				'Content-Type': 'application/json',
			},
            body: JSON.stringify({
                code: userCode,
            })
        })
        // const contentType = response.headers.get('Content-Type');
        // if (contentType && contentType.includes('application/json')) {
        //     const data = await response.json();
        //     console.log(data);
        // }
        return true;
    }
</script>

<svelte:head>
	<title>Two Factor Authentification</title>
	<meta name="description" content="Game CONFIG" />
</svelte:head>


<div class="center">
	<div class="text-column">
		<h1>Scan the QR code to add our application</h1>
	</div>
</div>

{#if qrcode.length > 1}
    <div class="image-container">
        <img src={qrcode} alt="Mon image" class="qrcode"/>
    </div>
{/if}

<main class="data">
    <input type="text" bind:value={userCode} placeholder="Enter your code" />

    <button on:click={() => {
    const success = send_code();
    if (!success) {
      errorMessage = "Your code is not valid";
    }
    else {
        errorMessage = "";
    }
  }}>Send</button>
</main>

{#if errorMessage.length > 1}
    <p class="error_message">{errorMessage}</p>
{/if}

<style>
    .error_message {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
    }
    .data {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 10vh;
    }
    .image-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 50vh;
    }
	.center {
		display: flex;
		justify-content: center;
		align-items: center;
	}
    .qrcode {
        max-width: 100%;
        max-height: 100%;
    }
</style>