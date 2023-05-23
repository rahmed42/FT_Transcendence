<script>
  import { onMount } from 'svelte';
  import { user } from '../../stores/user';
  import { get } from 'svelte/store';

  let messageInput = '';

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
  let userId = get(user);
  const userID = userId.id;
  let selectedChannel = null;

  let channelList = [
  { name : "Channel 1" },
  { name : "Channel 2" },
  { name : "Channel 3" },
  { name : "Channel 4" },
  { name : "Channel 5" },
  { name : "Channel 6" },
  { name : "Channel 7" },
  { name : "Channel 8" },
  { name : "Channel 9" },
  { name : "Channel 10" },
  { name : "Channel 11" },
  { name : "Channel 12" },
  { name : "Channel 13" },
  { name : "Channel 14" },
  { name : "Channel 15" },
  { name : "Channel 16" },
  { name : "Channel 17" },
  { name : "Channel 18" },
  { name : "Channel 19" },
  { name : "Channel 20" },
  { name : "Channel 21" },
  { name : "Channel 22" },
  { name : "Channel 23" },
  { name : "Channel 24" },
  { name : "Channel 25" },
  { name : "Channel 26" },
  { name : "Channel 27" },
  { name : "Channel 28" },
  { name : "Channel 29" },
  { name : "Channel 30" },
  { name : "Channel 31" },
  { name : "Channel 32" },
  { name : "Channel 33" },
  { name : "Channel 34" },
  { name : "Channel 35" },
  { name : "Channel 36" },
  { name : "Channel 37" },
  { name : "Channel 38" },
  { name : "Channel 39" },
  { name : "Channel 40" }
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
          },
          body: JSON.stringify({
            idUser: userID,
            roomName: newChannelName,
            type: newChannelType,
            password: newChannelPassword,
          }),
        });
        console.log(userID);
        console.log(newChannelName, newChannelType, newChannelPassword);
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

  async function joinChannel() {
    if (
      joinChannelName.trim() !== '' &&
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
          },
          body: JSON.stringify({
            idUser: userID,
            roomName: joinChannelName,
            type: joinChannelType,
            password: joinChannelPassword,
          }),
        });
        console.log(userID);
        console.log(joinChannelName, joinChannelType, joinChannelPassword);
        closeJoinModal();
        // Ajoutez ici la logique pour mettre à jour la liste des channels côté front-end
      }
    } else {
      isJoinInvalidName = true;
    }
  }

  async function sendMessage() {
    console.log(messageInput);
    messageInput = '';
  }
</script>

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
    <button class="create-channel p-anim" on:click={() => openModal()}>
      Create a channel
    </button>
    <button class="create-channel p-anim" on:click={() => openJoinModal()}>
      Join Channel
    </button>
    {#if channelList !== null}
      {#each channelList as channel}
        <button class="channel-button p-anim" on:click={() => joinChannel()}>
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
  }

  .channel-button {
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

  .p-anim {
    -moz-transition: color 2s;
    color: #6E98B8;
  }
  .p-anim:hover {
    color: #EDA11A;
  }
  </style>
