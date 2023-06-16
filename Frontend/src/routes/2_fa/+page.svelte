<script lang="ts">
	import { beforeUpdate, onMount } from 'svelte';

    let qrcode = "";
    let userCode = "";
    let checkError = "";
    let errorMessage = "";
    onMount(async () => {
        async function generate_qrCode() {
            const response = await fetch('http://localhost:3333/auth/qrcode_generate', {
                method: 'POST',
                credentials: 'include',
            });
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                if (data.qrcode)
                    qrcode = data.qrcode;
            }
        }
        generate_qrCode();
    })
    // Autres instructions à exécuter après la déconnexion de l'utilisateur
    async function send_code() {
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
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (data.valide)
            {
                // need to post database to set connected variable to true;
                sessionStorage.setItem('isLogged', JSON.stringify(true));
                window.location.href = '/home';
                return;
            }
        }
        checkError = 'false';
        errorMessage = "Code not valid";
    }

</script>

<svelte:head>
	<title>Google Authentification</title>
	<meta name="Google Authentifation" content="Qrcode" />
</svelte:head>

{#if qrcode}
<div class="center">
	<div class="text-column">
		<h1>Scan the QR code to add our application</h1>
	</div>
</div>
    <div class="image-container">
        <img src={qrcode} alt="qrcode" class="qrcode"/>
    </div>
{/if}

<h1>
    Authentification
</h1>

<main class="data">
    <input type="text" bind:value={userCode} placeholder="Enter your code" />

    <button on:click={() => {
        let success = send_code();
    }}>Send</button>
</main>

{#if checkError === "false"}
    <p class="error_message">{errorMessage}</p>
{/if}

<style>
    h1 {
        color: rgb(221, 226, 60);
        font-family: tahoma, geneva, sans-serif;
        text-decoration: underline;
    }
    .error_message {
        color: red;
        font-weight: bold;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
    }
    .data {
        position: relative;
		top: 10px;
		left: 0px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 10vh;
    }
    .data input {
        font-weight: bold;
        line-height: 200%;
    }
    .data button {
        font-weight: bold;
        line-height: 200%;
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