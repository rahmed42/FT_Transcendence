<script>
  import { onMount } from 'svelte';

  let messageInput = '';

  let isInvalidType = false;
  let isInvalidName = false;
  let isInvalidPassword = false;
  let isModalOpen = false;
  let newChannelName = '';
  let newChannelType = '';
  let newChannelPassword = '';
  let userId = null;
  let channelList = null;
  let selectedChannel = null;

  channelList = [
  ];

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

  async function createChannel() {
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
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            idUser: 89526,
            roomName: newChannelName,
            type: newChannelType,
            password: newChannelPassword
          })
        });
        console.log(response);
        closeModal();
        // Ajoutez ici la logique pour mettre à jour la liste des channels côté front-end
      }
    } else {
      isInvalidName = true;
    }
  }

  function isValidChannelName(name) {
    for (let i = 0; i < name.length; i++) {
      const charCode = name.charCodeAt(i);
      if (charCode < 32 || charCode > 126) {
        return false;
      }
    }
    return true;
  }

  async function joinChannel(channel) {
    selectedChannel = channel;
    const response = await fetch('http://localhost:3333/chat/joinRoom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async function sendMessage() {
    console.log(messageInput);
    messageInput = '';
  }

  onMount(async () => {
    // Effectuez ici une requête vers votre backend pour récupérer l'ID de l'utilisateur et la liste des channels
    try {
      const response = await fetch('http://localhost:3333/chat/rooms', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        userId = data.userId;
        channelList = data.channels;
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error(error);
    }
  });
</script>

<svelte:head>
  <title>Chat</title>
  <meta name="description" content="Chat Page" />
</svelte:head>

<div class="container">
  <div class="sidebar">
    <div class="chat-area">
      {#if selectedChannel != null}
        <div class="channel-header">
          <h2>{selectedChannel.name}</h2>
        </div>
      {/if}
      {#if channelList !== null && channelList.length === 0}
        <p>No channels joined</p>
      {/if}
    </div>
    <button class="create-channel" on:click={() => openModal()}>
      Create a channel
    </button>
    {#if channelList !== null}
      {#each channelList as channel}
        <button class="channel-button" on:click={() => joinChannel(channel)}>
          {channel.name}
        </button>
      {/each}
    {/if}
  </div>
  <div class="chat-area">
    <div class="messages"></div>
    <div class="input-area">
      <input bind:value={messageInput} type="text" placeholder="Type here..." />
      <button on:click={sendMessage}>Send</button>
    </div>
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
        {#if isInvalidType && newChannelType === 'protected' && isInvalidPassword}
          <p class="error-message">Please enter a password for the protected channel.</p>
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
        {/if}
        <button on:click={createChannel}>Create</button>
        <button on:click={closeModal}>Cancel</button>
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
  }

  .channel-button {
    display: block;
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: none;
    cursor: pointer;
    text-align: left;
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
  }

  .chat-area {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
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

  .input-area input {
    flex-grow: 1;
    margin-right: 10px;
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
</style>
