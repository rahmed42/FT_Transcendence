<script lang="ts">
  import { user } from '../../stores/user';
  import { onDestroy, onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { writable } from 'svelte/store';
  import io from 'socket.io-client';
  import type { Socket } from 'socket.io';

  let messageInput = '';
  let messages = [
    //"tamere la gitane qui radotte du saucisson pleins la bouche de potiron polochon petoqu de la nana dd'en bas ninanana ça va comme ça les pyjamas poupoupou ça va comme ça nananana ça va comme ça ça gaz pour toi meme pas mais wtf pourquoi il met pas tout au meme endroit zebiah ouai ok c'st chelou ce bailOK KOKOKOKOKOKOK MOMOMOMOMO TOTOTOTOTOKKO &#x200"
    { content: " ", username: "manu", user: true },
    { content: " ", username: "ange", user: false },
    { content: "ton pere", username: "manu", user: true },
    { content: "la choucroute", username: "Tim", user: false },
    { content: "ton frere", username: "manu", user: true },
    { content: "le gitan", username: "Rabah", user: false },
    { content: "ta soeur", username: "Dorian", user: false },
    { content: "la madeleine", username: "manu", user: true },
    { content: "2-2 sa mere", username: "manu", user: true },
    { content: "la pute", username: "Joseph", user: false },
    { content: "Suuuuuh", username: "Louis", user: false },
    { content: "CR7!!!", username: "Mathéo", user: false },
    { content: "tamere", username: "manu", user: true },
    { content: "le saucisson", username: "ange", user: false },
    { content: "ton pere", username: "manu", user: true },
    { content: "la choucroute", username: "Tim", user: false },
    { content: "ton frere", username: "manu", user: true },
    { content: "le gitan", username: "Rabah", user: false },
    { content: "ta soeur", username: "Dorian", user: false },
    { content: "la madeleine", username: "manu", user: true },
    { content: "2-2 sa mere", username: "manu", user: true },
    { content: "la pute", username: "Joseph", user: false },
    { content: "Suuuuuh", username: "Louis", user: false },
    { content: "CR7!!!", username: "Mathéo", user: false }
  ];
  let isInvalidType = false;
  let isInvalidName = false;
  let isInvalidPassword = false;
  let isJoinInvalidType = false;
  let isJoinInvalidName = false;
  let isJoinInvalidPassword = false;
  let isModalOpen = false;
  let isJoinModalOpen = false;
  let newChannelName = '';
  let newChannelType = '';
  let newChannelPassword = '';
  let joinChannelName = '';
  let joinChannelType = '';
  let joinChannelPassword = '';
  let userID = 0;
  let token = '';
  let channelList = writable<{ name: string }[]>([]);
  let userList = writable<{ login: string }[]>([]);
  let error: string = '';
  let selectedChannel = '';
  let selectedUser = '';
    onMount(async () => {
	const socket = io('http://localhost:3333', {
		transports: ['websocket'],
		auth: {
		token: sessionStorage.getItem('jwt'),
		},
	});
	socket.on('connect', () => {
	  console.log('connected');
	});
	socket.on('disconnect', () => {
	  console.log('disconnected');
	});
	socket.on('newRoomMessage', (data: any) => {
	  console.log(data);
	});
	socket.emit("newMessage", {content : "salam"})
    const storedUser = sessionStorage.getItem('userID');

    if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
      userID = parseInt(storedUser || '0');
    } else {
      let test = get(user);
      userID = parseInt(test.id);
      sessionStorage.setItem('userID', JSON.stringify(userID));
    }
    token = sessionStorage.getItem('jwt') || '';

    const response = await fetch('http://localhost:3333/chat/rooms', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });
    if (response.ok) {
      const data = await response.json();
      channelList.set(data.rooms);
    } else {
      const data = await response.json();
      console.log(data.message);
    }
  });

  function openModal() {
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
    newChannelName = '';
    newChannelType = '';
    newChannelPassword = '';
    isInvalidName = false;
    isInvalidType = false;
    isInvalidPassword = false;
  }

  function openJoinModal() {
    isJoinModalOpen = true;
  }

  function closeJoinModal() {
    isJoinModalOpen = false;
    joinChannelName = '';
    joinChannelType = '';
    joinChannelPassword = '';
    isJoinInvalidName = false;
    isJoinInvalidType = false;
    isJoinInvalidPassword = false;
  }

  async function createChannel() {
    try {
      if (
        newChannelName.trim() !== '' &&
        newChannelName.length <= 10 &&
        isValidChannelName(newChannelName)
      ) {
        if (newChannelType === '') {
          isInvalidType = true;
        } else {
          if (newChannelType === 'protected') {
            if (newChannelPassword.trim() === '') {
              isInvalidPassword = true;
              return;
            }
          }
          const response = await fetch('http://localhost:3333/chat/createRoom', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token,
            },
            body: JSON.stringify({
              idUser: userID,
              roomName: newChannelName,
              type: newChannelType,
              password: newChannelPassword,
            }),
          });
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message);
          } else if (response.ok) {
            const newChannel = await response.json();
            channelList.update(channelList => [...channelList, { name: newChannel.room.name }]);
            console.log(newChannel.room.name);
            closeModal();
          }
        }
      } else {
        isInvalidName = true;
      }
    } catch (err) {
      if (err instanceof Error)
        alert(err.message);
    }
  }


  function isValidChannelName(name: string) {
    for (let i = 0; i < name.length; i++) {
      const charCode = name.charCodeAt(i);
      if (charCode < 32 || charCode > 126) {
        return false;
      }
    }
    return true;
  }

  function selectUser(user: string) {
    // Logique de sélection de l'utilisateur
    console.log('Utilisateur sélectionné:', user);
  }
  async function joinChannel() {
    try {
      if (joinChannelName.trim() !== '' &&
        joinChannelName.length <= 10 &&
        isValidChannelName(joinChannelName)
      ) {
        if (joinChannelType === '') {
          isJoinInvalidType = true;
        } else {
          if (joinChannelType === 'protected') {
            if (joinChannelPassword.trim() === '') {
              isJoinInvalidPassword = true;
              return;
            }
          }
          const response = await fetch('http://localhost:3333/chat/joinRoom', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token,
            },
            body: JSON.stringify({
              idUser: userID,
              roomName: joinChannelName,
              password: joinChannelPassword,
            }),
          });
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message);
          }
          else if (response.ok) {
            const newChannel = await response.json();
            channelList.update(channelList => [...channelList, { name: newChannel.room.name }]);
            socket.emit('joinRoom', { roomId: newChannel.room.id, userId: userID });
            console.log(newChannel.room.name);
          }
          closeJoinModal();
        }
      } else {
        isJoinInvalidName = true;
      }
    } catch (err) {
      if (err instanceof Error)
        alert(err.message);
    }
  }

  async function sendMessage() {
    console.log(messageInput);
    messageInput = '';
  }

  async function getChannel(channel: string) {
    try {
      selectedChannel = channel;
      const response = await fetch('http://localhost:3333/chat/rooms/' + selectedChannel, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      } else if (response.ok) {
        const newChannel = await response.json();
        if (newChannel)
        {
          	userList.set(newChannel.users);
         	console.log(JSON.stringify(get(userList), null, 2))
        }
       }
    }
    catch (err) {
      if (err instanceof Error)
        alert(err.message);
    }
  }
</script>

<svelte:head>
  <title>Chat</title>
  <meta name="description" content="Chat Page" />
</svelte:head>

{#if isJoinModalOpen}
  <div class="modal">
    <div class="modal-content">
      <h3>Join a channel</h3>
      <input bind:value={joinChannelName} type="text" placeholder="Channel Name" />
      {#if isJoinInvalidName}
        <p class="error-message">Invalid channel name. Please enter a valid name.</p>
      {/if}
      {#if isJoinInvalidType}
        <p class="error-message">Please select a channel type.</p>
      {/if}
      <div class="channel-type">
        <span>Channel Type:</span>
        <label>
          <input type="radio" value="public" bind:group={joinChannelType} /> Public
        </label>
        <label>
          <input type="radio" value="protected" bind:group={joinChannelType} /> Protected
        </label>
      </div>
      {#if joinChannelType === 'protected'}
        <input bind:value={joinChannelPassword} type="password" placeholder="Password" />
        {#if isJoinInvalidType && joinChannelType === 'protected' && isJoinInvalidPassword}
          <p class="error-message">Please enter a password for the protected channel.</p>
        {/if}
      {/if}
      <button on:click={joinChannel}>Join</button>
      <button on:click={closeJoinModal}>Cancel</button>
    </div>
  </div>
{/if}
<div class="container">
  <div class="sidebar">
    <div class="chat-area">
      {#if selectedChannel != null}
        <div class="channel-header">
          <h2>{selectedChannel}</h2>
        </div>
      {/if}
      {#if $channelList !== null && $channelList.length === 0}
        <p>No channels joined</p>
      {/if}
    </div>
    <button class="create-channel p-anim" on:click={() => openModal()}>
      Create a channel
    </button>
    <button class="create-channel p-anim" on:click={() => openJoinModal()}>
      Join Channel
    </button>
    {#if channelList !== null}
      {#each $channelList as channel}
        <button class="channel-button p-anim" on:click={() => getChannel(channel.name)}>
          {channel.name}
        </button>
      {/each}
    {/if}
  </div>
  <div class="chat-area" style="max-height: 800px">
    <div class="messages">
      {#each messages as message}
        {#if message.user}
          <div class="message-container">
            <p class="message-utilisateur"> <strong> {message.username} </strong> </p>
            <p class="message-utilisateur">{message.content}</p>
          </div>
        {:else}
          <div class="message-container">
            <p class="message-autre-utilisateur"> <strong> {message.username} </strong> </p>
            <p class="message-autre-utilisateur">{message.content}</p>
          </div>
        {/if}
      {/each}
    </div>
    <div class="input-area">
      <input bind:value={messageInput} type="text" placeholder="Type here..." />
      <button on:click={sendMessage}>Send</button>
    </div>
  </div>
  <div class="user-list">
    <h3 class="user-list-title">User List</h3>
    {#if $userList !== null && $userList.length === 0}
      <p>No users online</p>
    {/if}
    {#each $userList as user}
      <button class="user-button p-anim" on:click={() => selectUser(user.login)}>
        {user.login}
      </button>
    {/each}
  </div>

  {#if isModalOpen}
    <div class="modal">
      <div class="modal-content">
        <h3>Create a new channel</h3>
        <input bind:value={newChannelName} type="text" placeholder="Channel Name" />
        {#if isInvalidName}
          <p class="error-message">Invalid channel name. Please enter a valid name.</p>
        {/if}
        {#if isInvalidType}
          <p class="error-message">Please select a channel type.</p>
        {/if}
        <div class="channel-type">
          <span>Channel Type:</span>
          <label>
            <input type="radio" value="public" bind:group={newChannelType} /> Public
          </label>
          <label>
            <input type="radio" value="private" bind:group={newChannelType} /> Private
          </label>
          <label>
            <input type="radio" value="protected" bind:group={newChannelType} /> Protected
          </label>
        </div>
        {#if newChannelType === 'protected'}
          <input bind:value={newChannelPassword} type="password" placeholder="Password" />
          {#if isInvalidPassword}
            <p class="error-message">Please enter a password for the protected channel.</p>
          {/if}
        {/if}
        <button on:click={createChannel}>Create</button>
        <button on:click={closeModal}>Cancel</button>
      </div>
    </div>
  {/if}

  {#if isJoinModalOpen}
    <div class="modal">
      <div class="modal-content">
        <h3>Join a channel</h3>
        <input bind:value={joinChannelName} type="text" placeholder="Channel Name" />
        {#if isJoinInvalidName}
          <p class="error-message">Invalid channel name. Please enter a valid name.</p>
        {/if}
        {#if isJoinInvalidType}
          <p class="error-message">Please select a channel type.</p>
        {/if}
        <div class="channel-type">
          <span>Channel Type:</span>
          <label>
            <input type="radio" value="public" bind:group={joinChannelType} /> Public
          </label>
          <label>
            <input type="radio" value="protected" bind:group={joinChannelType} /> Protected
          </label>
        </div>
        {#if joinChannelType === 'protected'}
          <input bind:value={joinChannelPassword} type="password" placeholder="Password" />
          {#if isJoinInvalidType && joinChannelType === 'protected' && isJoinInvalidPassword}
            <p class="error-message">Please enter a password for the protected channel.</p>
          {/if}
        {/if}
        <button on:click={joinChannel}>Join</button>
        <button on:click={closeJoinModal}>Cancel</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .container {
    display: flex;
  }

  .sidebar {
    width: 200px;
    padding: 10px;
    height: 100vh;
    max-height: 100vh;
    overflow-y: auto;
    border-right: 1px solid #ccc; /* Ajout de la bordure */
    padding-right: 10px; /* Ajout des marges intérieures */
  }

  .channel-button,
  .user-button {
    display: block;
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: none;
    cursor: pointer;
    text-align: left;
    border-radius: 10px;
  }

  .channel-header {
    text-align: center;
  }

  .create-channel {
    display: block;
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: none;
    cursor: pointer;
    text-align: left;
    border-radius: 10px;
  }

  .chat-area {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
    max-height: 700px;
  }

  .messages {
    flex-grow: 1;
    overflow-y: auto;
  }

  .input-area {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    border-top: 1px solid #ccc;
  }

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal-content {
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
  }

  .channel-type {
    margin-top: 10px;
  }

  .error-message {
    color: red;
    font-size: 12px;
    margin-top: 5px;
  }

  .user-list {
    width: 200px;
    padding: 10px;
    height: 100vh;
    max-height: 100vh;
    overflow-y: auto;
    border-left: 1px solid #ccc; /* Ajout de la bordure */
    padding-left: 10px; /* Ajout des marges intérieures */
  }

  .message-utilisateur {
    text-align: right;
    color: red;
  }

  .message-autre-utilisateur{
    text-align: left;
    color: blue;
  }

  .user-list-title {
    text-align: center;
  }

  .p-anim {
    transition: color 2s;
    color: #6E98B8;
  }

  .p-anim:hover {
    color: #EDA11A;
  }
</style>
