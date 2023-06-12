<script lang="ts">
  import { user } from '../../stores/user';
  import { onDestroy, onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { writable } from 'svelte/store';
  import io from 'socket.io-client';

  let messageInput = '';
  interface Message {
    content: string;
    username: string;
    user: boolean;
  }
  let messages:Message[] = [];

  let isUserModalOpen = false;
  let openAdminModal = false;
  let changePassword = false;
  let banUser = false;
  let muteUser = false;
  let grantAdmin = false;
  let expulUser = false;
  let selectedUserparam = '';
  let newPassword = '';
  let muteDuration = 0;
  let loginUserToExecute = '';

  let isPrivateMessageModalOpen = false;
  let recipientName = '';
  let messageContent = '';
  let privateMessageError = '';

  let isAdmin = false;
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
  let banList = writable<{ login: string }[]>([]);
  let muteList = writable<{ login: string }[]>([]);
  let blockList = writable<{ login: string }[]>([]);
  let adminList = writable<{ login: string }[]>([]);
  let privateList = writable<{ login: string }[]>([]);
  let error: string = '';
  let selectedChannel = '';
  let selectedUser = '';
  let selectedSection = '';
  let login: string = '';
  let socket: any;
  
  
  onMount(async () => {
    socket = io('http://localhost:3333', {
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
    

    let storedUser = sessionStorage.getItem('userID');
    let storedLogin = sessionStorage.getItem('login');
    let storedToken = sessionStorage.getItem('jwt');
    console.log("premier :", storedLogin);
    if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
      userID = parseInt(storedUser || '0');
    } else {
      let test = get(user);
      userID = parseInt(test.id);
      sessionStorage.setItem('userID', JSON.stringify(userID));
    }

    if (storedLogin && storedLogin !== 'undefined' && storedLogin !== 'null' && storedLogin !== null) {
      login = storedLogin;
      console.log("login in storedLogin:", login);
    } else {
      let test = get(user);
      console.log("test :", test);
      if (test && test.login)
      {
        login = test.login;
        sessionStorage.setItem('login', login);
        console.log("deuxieme :", test.login);
      }
    }

    if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
      token = storedToken;
    } else {
      let test = get(user);
      token = test.jwtToken;
      sessionStorage.setItem('jwt', token);
    }
    console.log('login : ', login);
    console.log('jwt : ', token);
    console.log('id : ', userID);

    const response = await fetch('http://localhost:3333/chat/rooms', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });
    if (response.ok) {
      const data = await response.json();
      console.log(data.rooms);
      channelList.set(data.rooms);
    }
    
    const response2 = await fetch('http://localhost:3333/chat/privateRooms', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });
    if (response2.ok)
    {
      const data = await response2.json();
      privateList.update(currentPrivateList => [...currentPrivateList, { login: data[0].users[0].login }]);
    }
  });

  function openPrivateMessageModal() {
  isPrivateMessageModalOpen = true;
  recipientName = '';
  messageContent = '';
  privateMessageError = '';
}

  function selectSection(section: string) {
    selectedSection = section;
  }

  async function changeUserPassword(newPassword: string) 
  {
    try
    {
      const response = await fetch("http://localhost:3333/chat/changePassword", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
          body: JSON.stringify({
          idUser: userID,
          roomName: selectedChannel,
          password: newPassword,
          }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message);
        }
        else
        {
          const data = await response.json();
          throw new Error(data.message);
        }
      }
      catch (err) {
        if (err instanceof Error)
          alert(err.message);
    }
  }

async function grantUserAdmin() 
{
  try
  {
    const response = await fetch("http://localhost:3333/chat/giveAdmin", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
      body: JSON.stringify({
      idAdmin: userID,
      roomName: selectedChannel,
      loginUserToExecute: selectedUserparam,
      }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    else
    {
      const data = await response.json();
      throw new Error(data.message);
      adminList.set(data.administrators);
    }
  }
  catch (err) {
    if (err instanceof Error)
      alert(err.message);
  }     
}

async function expulSelectedUser() {
  try
  {
    const response = await fetch("http://localhost:3333/chat/kickUser", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
      body: JSON.stringify({
      idAdmin: userID,
      roomName: selectedChannel,
      loginUserToExecute: selectedUserparam,
      }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    else
    {
      const data = await response.json();
      throw new Error(data.message);
      //need to get the newlist of user, to update the list
    }
  }
  catch (err) {
    if (err instanceof Error)
      alert(err.message);
  } 
}

async function banSelectedUser() {
  try
  {
    const response = await fetch("http://localhost:3333/chat/banUser", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
      body: JSON.stringify({
      idAdmin: userID,
      roomName: selectedChannel,
      loginUserToExecute: selectedUserparam,
      }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    else
    {
      const data = await response.json();
      throw new Error(data.message);
      //need to get the newlist of userban, to update the list
    }
  }
  catch (err) {
    if (err instanceof Error)
      alert(err.message);
  } 
}

async function unmuteUser() {
  try
  {
    const response = await fetch("http://localhost:3333/chat/unmuteUser", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
        body: JSON.stringify({
        idAdmin: userID,
        roomName: selectedChannel,
        loginUserToExecute: selectedUserparam,
        }),
      });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    else
    {
      const newMuteList = await response.json();
      throw new Error(newMuteList.message);
      muteList.set(newMuteList.mutedUsers.mutedUsers.login);
    }
  }
  catch (err) {
    if (err instanceof Error)
      alert(err.message);
  }
}

async function revokeAdmin() {
    try {
        const response = await fetch("http://localhost:3333/chat/removeAdmin", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
            body: JSON.stringify({
                idAdmin: userID,
                roomName: selectedChannel,
                loginUserToExecute: selectedUserparam,
            }),
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message);
        }
        else
        {
          const data = await response.json();
          throw new Error(data.message);
          //need to adapte the list of admin without the revokeadmin
        }
    } catch (err) {
        if (err instanceof Error) {
            alert(err.message);
        }
    }
}

async function unbanUser() {
    try {
        const response = await fetch("http://localhost:3333/chat/unbanUser", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
            body: JSON.stringify({
                idAdmin: userID,
                roomName: selectedChannel,
                loginUserToExecute: selectedUserparam,
            }),
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message);
        }
        else
        {
          const data = await response.json();
          throw new Error(data.message);
          //need to adapte the list of banuser without the unbanuser
        }
    } catch (err) {
        if (err instanceof Error) {
            alert(err.message);
        }
    }
}

async function changeChannelType() {
  try
  {
    const response = await fetch("http://localhost:3333/chat/changeRoomType", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
      body: JSON.stringify({
      idUser: userID,
      roomName: selectedChannel,
      password: newPassword,
      type: newChannelType,
      }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    else
    {
      const data = await response.json();
      throw new Error(data.message);
    }
  }
  catch (err) {
    if (err instanceof Error)
      alert(err.message);
  } 
}

async function muteSelectedUser(muteDuration: number) {
  try
  {
    const response = await fetch("http://localhost:3333/chat/muteUser", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
      body: JSON.stringify({
      idAdmin: userID,
      roomName: selectedChannel,
      loginUserToExecute: selectedUserparam,
      muteDuration: muteDuration,
      }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    else
    {
      const newMuteList = await response.json();
      throw new Error(newMuteList.message);
      muteList.set(newMuteList.mutedUsers.mutedUsers.login);
    }
    muteDuration = 0;
  }
  catch (err) {
    if (err instanceof Error)
      alert(err.message);
  } 
}

function closeSetupModal() {
  openAdminModal = false;
  changePassword = false;
  banUser = false;
  muteUser = false;
  grantAdmin = false;
  expulUser = false;
  selectedUserparam = '';
  newPassword = '';
  selectedSection = '';
}


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
          } else
          {
            const newChannel = await response.json();
            channelList.update(channelList => [...channelList, { name: newChannel.room.name }]);
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
    loginUserToExecute = user;
    isUserModalOpen = true;
    console.log('Utilisateur sélectionné:', user);
  }

  function closeUserModal()
  {
    isUserModalOpen = false;
    loginUserToExecute = '';
  }

  async function joinChannel()
  {
    try 
    {
      if (joinChannelName.trim() !== '' &&
        joinChannelName.length <= 10 &&
        isValidChannelName(joinChannelName))
        {
          if (joinChannelType === '')
          {
            isJoinInvalidType = true;
            return;
          }
          else
          {
            if (joinChannelType === 'protected')
            {
              if (joinChannelPassword.trim() === '')
              {
                isJoinInvalidPassword = true;
                return;
              }
            }
          }
          const response = await fetch('http://localhost:3333/chat/joinRoom',
          {
            method: 'POST',
            headers:
            {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token,
            },
            body: JSON.stringify({
              idUser: userID,
              roomName: joinChannelName,
              password: joinChannelPassword,
            }),
          });
          if (!response.ok) 
          {
            const data = await response.json();
            throw new Error(data.message);
          }
          else if (response.ok) 
          {
            const newChannel = await response.json();
            channelList.update(channelList => [...channelList, { name: newChannel.room.name }]);
            //socket.emit('joinRoom', { roomId: newChannel.room.id, userId: userID });
            console.log(newChannel.room.name);
          }
          closeJoinModal();
        }
      else
      {
        isJoinInvalidName = true;
        return;
      }
    }
    catch (err) {
      if (err instanceof Error)
        alert(err.message);
    }
  }

  async function sendMessage() {
    if (selectedChannel === '') {
      messageInput = '';
      return;
    }
    if (messageInput.trim() === '') {
      return;
    }
    console.log(messageInput);
    messages = [...messages, { username: login, content: messageInput, user: true }];
    messageInput = '';
  }

  async function confirmSelection() {
    if (selectedSection === 'changePassword') {
      changeUserPassword(newPassword);
    } else if (selectedSection === 'grantAdmin') {
      grantUserAdmin();
    } else if (selectedSection === 'expulUser') {
      expulSelectedUser();
    } else if (selectedSection === 'banUser') {
      banSelectedUser();
    } else if (selectedSection === 'muteUser') {
      muteSelectedUser(muteDuration);
    }
    else if (selectedSection === 'revokeAdmin') {
      revokeAdmin();
    }
    else if (selectedSection === 'unbanUser') {
      unbanUser();
    }
    else if (selectedSection === 'unmuteUser') {
      unmuteUser();
    }
    else if (selectedSection === 'changeChannelType') {
      changeChannelType();
    }
    else {
      console.log("error");
    }
    closeSetupModal();
  }

  async function sendPrivateMessage() {
    socket.emit('newMessage', { idSender: userID, loginReceiver: recipientName, content: messageContent, type: "private" });
    closePrivateMessageModal();
    const response = await fetch('http://localhost:3333/chat/' + selectedChannel, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });
  }

function closePrivateMessageModal() {
  isPrivateMessageModalOpen = false;
  recipientName = '';
  messageContent = '';
  privateMessageError = '';
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
            messages = newChannel.messages;
            banList.set(newChannel.bannedUsers);
            muteList.set(newChannel.mutedUsers);
            adminList.set(newChannel.administrators);
            if (newChannel.administrators) {
              newChannel.administrators.forEach((admin: {id: number}) => {
                if (admin.id === userID) {
              isAdmin = true;
          }
        });
      }
        }
      }
    }
    catch (err) {
      if (err instanceof Error)
        alert(err.message);
    }
  }

  async function getProfile() {
    try {
      const response = await fetch('http://localhost:3333/chat/profile/' + selectedUserparam, {
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
        const newProfile = await response.json();
        console.log('Contenu de newProfile:', newProfile);
      }
    }
    catch (err) {
      if (err instanceof Error)
        alert(err.message);
    }
  }

  async function inviteGame() {
    try {
      const response = await fetch('http://localhost:3333/chat/inviteGame/' + selectedUserparam, {
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
        const newProfile = await response.json();
        console.log('Contenu de newProfile:', newProfile);
      }
    }
    catch (err) {
      if (err instanceof Error)
        alert(err.message);
    }
  }

  async function unblockUser() {
  try
  {
    const response = await fetch('http://localhost:3333/chat/unblockUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        idUser: userID,
        loginUserToBlock: loginUserToExecute,
      }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    } else {
      const newProfile = await response.json();
      blockList.set(newProfile.blockedUsers);
      throw new Error("User unblocked");
    }
  }
  catch(err)
  {
    if (err instanceof Error)
      alert(err.message);
  }
}

  async function blockUser() {
    try {
      const response = await fetch('http://localhost:3333/chat/blockUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          idUser: userID,
          loginUserToBlock: loginUserToExecute,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      } else if (response.ok) {
        const newProfile = await response.json();
        blockList.set(newProfile.blockedUsers);
        throw new Error("User blocked");
      }
    }
    catch (err) {
      if (err instanceof Error)
        alert(err.message);
    }
  }

  async function setup() {
      openAdminModal = true;
    }

    async function getPrivateChannel(selectedChannel: string) {
  const response = await fetch('http://localhost:3333/chat/privateRooms/' + selectedChannel, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
  });

  if (response.ok) {
    const data = await response.json();
    if (data && data.messages) {
      userList.set(data.users);
      const messagesRecus = data.messages;
      messages.length = 0;
      for (const msg of messagesRecus) {
        if (msg && msg.content && msg.sender && msg.sender.login)
        {
          if (msg.sender.login == login)
          {
            const message = {
              content: msg.content,
              username: msg.sender.login,
              user: false,
            };
            messages.push(message);
          }
          else
          {
            const message = {
              content: msg.content,
              username: msg.sender.login,
              user: true,
            };
            messages.push(message);
          }
        }
      }
    }
  } else {
    const data = await response.json();
    throw Error(data.message);
  }
}

async function leaveRoom()
{
  try
  {
    const response = await fetch('http://localhost:3333/chat/leaveRoom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({
        idUser: userID,
        roomName: selectedChannel,
      }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    } else {
      const newProfile = await response.json();
      channelList.update(channelList => channelList.filter(channel => channel.name !== selectedChannel));
    }
  }
  catch(err)
  {
    if (err instanceof Error)
      alert(err.message);
  }
}
</script>

<svelte:head>
  <title>Chat</title>
  <meta name="description" content="Chat Page" />
</svelte:head>


{#if isUserModalOpen}
  <div class="modal">
    <div class="modal-content">
      <h3>User Options</h3>
      <button on:click={getProfile}>Profil</button>
      <button on:click={inviteGame}>Invite Game</button>
      <button on:click={blockUser}>Block</button>
      <button on:click={unblockUser}>Unblock</button>
      <button on:click={closeUserModal}>Close</button>
    </div>
  </div>
{/if}

{#if openAdminModal}
  <div class="modal">
    <div class="modal-content">
      <h3>Setup</h3>

      {#if selectedSection === 'changeChannelType'}
      <div class="selected-option">
        <p>Change Type:</p>
        <label>
          <input type="radio" value="public" id="public" name="channelType" bind:group={newChannelType} /> Public
        </label>
        <label>
          <input type="radio" value="private" id="private" name="channelType" bind:group={newChannelType} /> Private
        </label>
        <label>
          <input type="radio" value="protected" id="protected" name="channelType" bind:group={newChannelType} /> Protected
        </label>
    
        {#if newChannelType === 'protected'}
          <input bind:value={newPassword} type="password" id="channelPassword" placeholder="Password" name = NewPassword />
        {/if}
      </div>
    {/if}

      {#if selectedSection === 'changePassword'}
        <div class="selected-option">
          <p>Change Password:</p>
          <input bind:value={newPassword} id="newPassword" type="password" placeholder="New Password" name = "newPassword"/>
        </div>
      {/if}

      {#if selectedSection === 'grantAdmin'}
        <div class="selected-option">
          <p>Give Admin:</p>
          <select name="selectedUser" bind:value={selectedUserparam}>
            {#each $userList as user}
              <option value={user.login}>{user.login}</option>
            {/each}
          </select>
        </div>
      {/if}

      {#if selectedSection === 'revokeAdmin'}
        <div class="selected-option">
          <p>Revoke Admin:</p>
          <select name="selectedUser" bind:value={selectedUserparam}>
            {#each $adminList as admin}
              <option value={admin.login}>{admin.login}</option>
            {/each}
          </select>
        </div>
      {/if}

      {#if selectedSection === 'expulUser'}
        <div class="selected-option">
          <p>Kick User:</p>
          <select name="selectedUser" bind:value={selectedUserparam}>
            {#each $userList as user}
              <option value={user.login}>{user.login}</option>
            {/each}
          </select>
        </div>
      {/if}

      {#if selectedSection === 'banUser'}
        <div class="selected-option">
          <p>Ban User:</p>
          <select name="selectedUser" bind:value={selectedUserparam}>
            {#each $userList as user}
              <option value={user.login}>{user.login}</option>
            {/each}
          </select>
        </div>
      {/if}

      {#if selectedSection === 'muteUser'}
        <div class="selected-option">
          <p>Mute User:</p>
          <select name="selectedUser" bind:value={selectedUserparam}>
            {#each $userList as user}
              <option value={user.login}>{user.login}</option>
            {/each}
          </select>
          <input bind:value={muteDuration} type="number" name="duration" placeholder="Mute Duration (minutes)" min="1" />
        </div>
      {/if}

      {#if selectedSection === 'unbanUser'}
        <div class="selected-option">
          <p>Unban User:</p>
          <select name="selectedUser" bind:value={selectedUserparam}>
            {#each $banList as bannedUsers}
              <option value={bannedUsers.login}>{bannedUsers.login}</option>
            {/each}
          </select>
        </div>
      {/if}

      {#if selectedSection === 'unmuteUser'}
        <div class="selected-option">
          <p>Unmute User:</p>
          <select name="selectedUser" bind:value={selectedUserparam}>
            {#each $muteList as mutedUsers}
              <option value={mutedUsers.login}>{mutedUsers.login}</option>
            {/each}
          </select>
        </div>
      {/if}

      <div class="section-select">
        <label for="sectionSelect">Select Section:</label>
        <select bind:value={selectedSection} id="sectionSelect">
          <option value="changeChannelType">Change Type</option>
          <option value="changePassword">Change Password</option>
          <option value="grantAdmin">Give Admin</option>
          <option value="revokeAdmin">Revoke Admin</option>
          <option value="expulUser">Kick User</option>
          <option value="banUser">Ban User</option>
          <option value="muteUser">Mute User</option>
          <option value="unbanUser">Unban User</option>
          <option value="unmuteUser">Unmute User</option>
        </select>
      </div>

      <div class="modal-actions">
        <button on:click={() => confirmSelection()}>Confirm</button>
        <button on:click={() => closeSetupModal()}>Cancel</button>
      </div>
    </div>
  </div>
{/if}

{#if isJoinModalOpen}
  <div class="modal">
    <div class="modal-content">
      <h3>Join a channel</h3>
      <input bind:value={joinChannelName} type="text" placeholder="Channel Name" name="joinChannelName" id="joinChannelName1" />
      {#if isJoinInvalidName}
        <p class="error-message">Invalid channel name. Please enter a valid name.</p>
      {/if}
      {#if isJoinInvalidType}
        <p class="error-message">Please select a channel type.</p>
      {/if}
      <div class="channel-type">
        <span>Channel Type:</span>
        <label>
          <input type="radio" name="public" value="public" bind:group={joinChannelType} /> Public
        </label>
        <label>
          <input type="radio" name="protected" value="protected" bind:group={joinChannelType} /> Protected
        </label>
      </div>
      {#if joinChannelType === 'protected'}
        <input bind:value={joinChannelPassword} type="password" placeholder="Password" name = "joinChannelPassword" />
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
          {#if isAdmin}
            <button on:click={setup} class="button-admin">Setup</button>
          {/if}
        </div>
      {/if}
      {#if $channelList != null && $channelList.length === 0}
        <p>No channels joined</p>
      {/if}
    </div>
    <button class="create-channel p-anim" on:click={() => openModal()}>
      Create a channel
    </button>
    <button class="create-channel p-anim" on:click={() => openJoinModal()}>
      Join Channel
    </button>
    <button class="create-channel p-anim" on:click={() => openPrivateMessageModal()}>
      Private Message
    </button>
    {#if selectedChannel}
      <button class="create-channel p-anim" on:click={() => leaveRoom()}>
        Leave Channel
      </button>
    {/if}
    {#if channelList !== null}
      {#each $channelList as channel}
        <button class="channel-button p-anim" on:click={() => getChannel(channel.name)}>
            {channel.name}
        </button>
      {/each}
    {/if}
    {#if privateList !== null}
      {#each $privateList as privateChannel}
        <button class="channel-private-button p-anim-private" on:click={() => getPrivateChannel(privateChannel.login)}>
            {privateChannel.login}
        </button>
      {/each}
    {/if}
  </div>
  <div class="chat-area" style="max-height: 800px">
    <div class="messages">
      {#each messages as message}
        {#if message.user}
          <div class="message-container-user">
            <p class="message-utilisateur"> <strong> {message.username} </strong> </p>
            <p class="message-utilisateur">{message.content}</p>
          </div>
        {:else}
          <div class="message-container-other">
            <p class="message-autre-utilisateur"> <strong> {message.username} </strong> </p>
            <p class="message-autre-utilisateur">{message.content}</p>
          </div>
        {/if}
      {/each}
    </div>
    <div class="input-area">
      <input bind:value={messageInput} type="text" placeholder="Type here..." id = userID name = "messageInput"/>
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
        <input bind:value={newChannelName} type="text" placeholder="Channel Name" name = newChannelName/>
        {#if isInvalidName}
          <p class="error-message">Invalid channel name. Please enter a valid name.</p>
        {/if}
        {#if isInvalidType}
          <p class="error-message">Please select a channel type.</p>
        {/if}
        <div class="channel-type">
          <span>Channel Type:</span>
          <label>
            <input type="radio" value="public" bind:group={newChannelType} id="newChannelTypePublic"/> Public
          </label>
          <label>
            <input type="radio" value="private" bind:group={newChannelType} id="newChannelTypePrivate"/> Private
          </label>
          <label>
            <input type="radio" value="protected" bind:group={newChannelType} id="newChannelTypeProtected" /> Protected
          </label>
        </div>
        {#if newChannelType === 'protected'}
          <input bind:value={newChannelPassword} type="password" placeholder="Password" name = "newChannelPassword" />
          {#if isInvalidPassword}
            <p class="error-message">Please enter a password for the protected channel.</p>
          {/if}
        {/if}
        <button on:click={createChannel}>Create</button>
        <button on:click={closeModal}>Cancel</button>
      </div>
    </div>
  {/if}

  {#if isPrivateMessageModalOpen}
    <div class="modal">
      <div class="modal-content">
        <h3>Send Private Message</h3>
        <input bind:value={recipientName} type="text" placeholder="Recipient Name" name = "recipientName"/>
        <textarea bind:value={messageContent} placeholder="Message" name = "messageContent"></textarea>
        {#if privateMessageError !== ''}
          <p class="error-message">{privateMessageError}</p>
        {/if}
        <button on:click={sendPrivateMessage}>Send Message</button>
        <button on:click={closePrivateMessageModal}>Cancel</button>
      </div>
    </div>
  {/if}

  {#if isJoinModalOpen}
  <div class="modal">
    <div class="modal-content">
      <h3>Join a channel</h3>
      <input bind:value={joinChannelName} type="text" placeholder="Channel Name" name="joinChannelName" />
      {#if isJoinInvalidName}
        <p class="error-message">Invalid channel name. Please enter a valid name.</p>
      {/if}
      {#if isJoinInvalidType}
        <p class="error-message">Please select a channel type.</p>
      {/if}
      <div class="channel-type">
        <span>Channel Type:</span>
        <label>
          <input type="radio" value="public" bind:group={joinChannelType} id="joinChannelTypePublic"/> Public
        </label>
        <label>
          <input type="radio" value="protected" bind:group={joinChannelType} id="joinChannelTypeProtected" /> Protected
        </label>
      </div>
      {#if joinChannelType === 'protected'}
        <input bind:value={joinChannelPassword} type="password" placeholder="Password" name="joinChannelPassword" />
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
    margin-top: 10px; 
  }

  .sidebar {
    width: 150px;
    padding: 10px;
    height: 100vh;
    max-height: 100vh;
    border-right: 1px solid #ccc; /* Ajout de la bordure */
    padding-right: 10px; /* Ajout des marges intérieures */
    overflow-y: auto;
  }

  .channel-private-button
  {
    display: block;
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: none;
    cursor: pointer;
    text-align: left;
    border-radius: 10px;
    color: red;
  }

  .channel-button,
  .user-button,
  .button-admin{
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
    font-weight: bold;
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
    background-color: #5446da;
    padding: 20px;
    border-radius: 4px;
  }

  .channel-type {
    margin-top: 10px;
  }

  .error-message {
    color: rgb(184, 200, 65);
    font-size: 12px;
    margin-top: 5px;
  }

  .user-list {
    width: 200px;
    padding: 10px;
    height: 100vh;
    max-height: 100vh;
    border-left: 1px solid #ccc; /* Ajout de la bordure */
    padding-left: 10px; /* Ajout des marges intérieures */
  }

  .message-container-user {
    max-width: 60%; /* Limiter la largeur du message */
    margin: 1px; /* Ajouter de l'espace autour du message */
    padding: 1px; /* Ajouter de l'espace à l'intérieur du message */
    border-radius: 20px; /* Arrondir les coins */
    background-color: #f0f0f0; /* Couleur de fond de la bulle de message */
    margin-left: 50%; /* Add margin to push the bubble to the right */
    border-top-right-radius: 0; /* Make the right top corner sharp */
    direction: ltr;
    word-wrap: break-word;
  }

.message-container-other {
    max-width: 60%; /* Limiter la largeur du message */
    margin: 1px; /* Ajouter de l'espace autour du message */
    padding: 1px; /* Ajouter de l'espace à l'intérieur du message */
    border-radius: 20px; /* Arrondir les coins */
    background-color: #f0f0f0; /* Couleur de fond de la bulle de message */
    direction: ltr;
    margin-right: 50%; /* Add margin to push the bubble to the right */
    border-top-left-radius: 0; /* Make the left top corner sharp */
    word-wrap: break-word;  }

.message-utilisateur {
    align-self: flex-end;
    color: black; /* Couleur du texte */
}

.message-autre-utilisateur {
    align-self: flex-start;
    color: black; /* Couleur du texte */
    direction: ltr;
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

  
  @media screen and (max-width: 600px) {
  .container 
  {
    flex-direction: column;
    margin: 10px;
  }

  .sidebar,
  .chat-area,
  .user-list {
    max-height: 500px;
    overflow-y: auto;
    border-radius: 10px;
    margin-bottom: 10px;
  }
  .channel-header{
    text-align: center;
    color: black;
  }

  .user-list-title{
    text-align: center;
    color: black;
  }

  .sidebar,
  .chat-area {
    width: 100%;
  }

  .user-list {
    width: 100%;
  }

  .sidebar,
  .chat-area,
  .user-list {
    background-color: #f5f5f5;
  }

  .message-container-user,
  .message-container-other {
    background-color: #9ab3f5;
    font-family: Arial, sans-serif;
  }
}

</style>
