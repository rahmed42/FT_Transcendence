<script lang="ts">
	import { get } from 'svelte/store';
	import { user } from '../../stores/user';

	let myUser = get(user);
	let checked = myUser.two_fa;
	let active_message = "Enable Google Authenticator";
	let desactive_message = "Disable Google Authenticator";
	let fileInput: HTMLInputElement;
	let files: FileList;
	let avatar: string;

	async function active_2_fa_auth() {
		if (checked)
			checked = false;
		else
			checked = true;
		const response = await fetch('http://localhost:3333/auth/settings', {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				check: checked,
			}),
		});
		const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            if (data.valide)
            {
                sessionStorage.setItem('isLogged', JSON.stringify(true));
                window.location.href = '/home';
                return;
            }
        }
	}
	function getBase64(image: File) {
		const reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = e => {
			avatar = e.target!.result as string;
			if (avatar)
				upload_profile_picture(avatar);
	};
	async function upload_profile_picture(avatar: string) {
		const imgData = avatar.split(',');
		const picture = imgData[1];
		if (picture)
		{
			await fetch('http://localhost:3333/profil/picture', {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				body: JSON.stringify({ data: picture }),
			});
		}
	}
};
</script>

<svelte:head>
	<title>Profile</title>
	<meta name="description" content="User profile" />
</svelte:head>
 
<h1 class="title">Welcome <strong>{$user.first_name} {$user.last_name}</strong></h1>

<div class = "container">
	{#if avatar}
        <img class="pp" id="avatar" src={avatar} alt="avatar"/>
    {:else}
        <img class = "pp" id="avatar" src={$user.large_pic} alt={`Picture of ${$user.login}`}/>
    {/if}
    <input class="hidden" id="file-to-upload" type="file" accept=".png,.jpg" bind:files bind:this={fileInput} on:change={() => getBase64(files[0])}/>
	<button class="upload_btn" on:click={ () => fileInput.click() }>Upload Picture</button>
</div>

<div class = "auth_button">
	<button on:click={active_2_fa_auth}>
	{#if !checked}
		{active_message}
	{:else}
		{desactive_message}
	{/if}
</div>

<!-- <div class = "upload_button">
	<button on:click={edit_pp}>
			Edit Profile Picture
	</button>
</div> -->

<!-- <div class = "edit_username">
	<button on:click={edit_username}>
			Change Username
	</button>
</div> -->


 <style>
	.title {
		color: rgb(212, 203, 29);
		margin-left: center;
		margin-right: center;
	}
	.hidden {
        display: none;
    }
	.pp {
		border-radius: 0 100px 0 100px;
		width: 450px;
		border: 2px solid rgb(88, 44, 231);
		padding: 5px;
		margin-left: 250px;
	}
	.auth_button {
		font-family:"Comic Sans MS";
		position: relative;
		top: -350px;
		left: -40px;
	}
	.auth_button button {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #007fff;
		color: #fff;
		font-size: 1.2rem;
		padding: 1rem 2rem;
		border: none;
		transition: background-color 0.2s ease;
		border-radius: 75px;
		cursor: pointer;
		width: 200px;
		height: 100px;
	}
	.upload_btn {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #007fff;
		color: #fff;
		font-size: 1.2rem;
		padding: 1rem 2rem;
		border: none;
		transition: background-color 0.2s ease;
		border-radius: 75px;
		cursor: pointer;
		width: 200px;
		height: 100px;
		font-family:"Comic Sans MS";
		position: relative;
		top: -350px;
		left: -40px;
	}
	/* .edit_username {
		font-family:"Comic Sans MS";
		position: relative;
		top: -350px;
		left: -40px;
	}
	.edit_username button {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #007fff;
		color: #fff;
		font-size: 1.2rem;
		padding: 1rem 2rem;
		border: none;
		transition: background-color 0.2s ease;
		border-radius: 75px;
		cursor: pointer;
		width: 200px;
		height: 100px;
	} */
	button:hover {
		background-color: #0f6402;
		/* border-radius: 75px; */
	}
</style>
