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

  //invitation modal
  let isInvitationModalOpen = false;
  let selectedInvitation = '';
  let inviteUser = '';
  
  
  //admin modal
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

  //private message modal
  let isPrivateMessageModalOpen = false;
  let recipientName = '';
  let messageContent = '';
  let privateMessageError = '';

  //channel modal
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
  let invitationList = writable<{ login: string }[]>([]);
  let error: string = '';
  let selectedChannel = '';
  let selectedPrivateChannel = '';
  let selectedUser = '';
  let selectedSection = '';
  let login: string = '';
  let socket: any;
  let myCookie: any;
  let privateId : any;
  
  onMount(async () => {
    function getCookie(name: string) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift();
      }
    }
    myCookie = getCookie('jwt');
    socket = io('http://localhost:3333', {
      transports: ['websocket'],
      auth: {
        token: myCookie,
      },
    });
    /*const resp = await fetch('http://localhost:3333/chat/blockedUsers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + myCookie,
      },
      credentials: 'include',
    });
    if (resp.ok)
    {
      const data = await resp.json();
      if (data && data[0]) {
        blockList.set(data.blockedUsers.blockedUsers);
        console.log("Creating blockList : " + blockList);
      }
      else
        blockList.set([])
    }*/
  socket.on('connect', () => {
    console.log('connected');
  });
  
  socket.on('disconnect', () => {
    console.log('disconnected');
  });
  
  socket.on('newPrivateMessage', (data: {content: string, nameSender: string}) => {
    if ((blockList) && !(data.nameSender === login) && data.nameSender === selectedPrivateChannel) {
      console.log("Message IS BLOCKEEEEEEEEED");
      return;
    }
    messages = [...messages, { username: data.nameSender, content: data.content, user: true }];
  });

  socket.on('newRoomMessage', (data: { content: string, nameSender: string, roomName: string }) => {
    if (data.nameSender === login) {
    return;
    }
    if ((blockList) && !(data.nameSender === login) && data.nameSender === selectedChannel) {
      console.log("Message IS BLOCKEEEEEEEEED");
      return;
    }
    messages = [...messages, { username: data.nameSender, content: data.content, user: true }];
  });

  async function getUserinfo() {
    try {
      const response = await fetch('http://localhost:3333/profil/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + myCookie,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data) {
          userID = data.id;
          login = data.login;
          token = data.jwtToken;
        }
      } else {
        console.error('Failed to fetch user info', response.statusText);
      }
    } catch (error) {
      console.error('An error occurred while fetching user info:', error);
    }
  }

  // Wait for getUserinfo to complete before moving on
  await getUserinfo();

  // Fetch all the rooms
  const response = await fetch('http://localhost:3333/chat/rooms', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    credentials: 'include',
  });

  if (response.ok) {
    const data = await response.json();
    console.log(data.rooms);
    if (data && data.rooms) {
      channelList.set(data.rooms);
    }
  } else {
    const data = await response.json();
    throw new Error(data.message);
  }
  
  // Fetch all the private rooms
  const response2 = await fetch('http://localhost:3333/chat/privateRooms', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    credentials: 'include',
  });
  
  if (response2.ok) {
    const data = await response2.json();
    if (data && data[0]) {
      privateList.update(currentPrivateList => [...currentPrivateList, { login: data[0].users[0].login }]);
    }
  } else {
    const data = await response2.json();
    throw new Error(data.message);
  }
});


function refreshList() {
  userList.set([]);
  banList.set([]);
  muteList.set([]);
  blockList.set([]);
  adminList.set([]);
  invitationList.set([]);
  messages = [];
  selectedChannel = '';
  selectedPrivateChannel = '';
  isAdmin = false;
}

function openInvitationModal() {
    isInvitationModalOpen = true;
    selectedInvitation = '';
    inviteUser = '';
  }

  function closeInvitationModal() {
    isInvitationModalOpen = false;
  }

  function openPrivateMessageModal() {
  isPrivateMessageModalOpen = true;
  recipientName = '';
  messageContent = '';
  privateMessageError = '';
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
      adminList.set(data.administrators);
      //need to change the state of the other user (websocket) 
      throw new Error(data.message);
    }
  }
  catch (err) {
    if (err instanceof Error)
      alert(err.message);
  }     
}

async function expulSelectedUser() {
  try {
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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    } else {
      userList.update(currentUsers => currentUsers.filter(user => user.login !== selectedUserparam));
      //need to use socket to kick the user
      alert('User successfully kicked out of the channel.');
    }

  } catch (err) {
    if (err instanceof Error) {
      alert(err.message);
    }
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
      alert(newMuteList.message);
      console.log("old mute list : ", muteList);
      muteList.update(currentMuteList => {
        return currentMuteList.filter(user => user.login !== selectedUserparam);
      });}
      console.log("new mute list : ", muteList);
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

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        } else {
            // Ici, la réponse est OK, donc nous devons mettre à jour le store
            adminList.update((currentAdmins) => {
                return currentAdmins.filter(admin => admin.login !== selectedUserparam);
            });

            alert("Admin révoqué avec succès");
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
            socket.emit('joinRoom', newChannel.room.name);
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
            closeJoinModal();
            throw new Error(data.message);
          }
          else if (response.ok) 
          {
            const newChannel = await response.json();
            channelList.update(channelList => [...channelList, { name: newChannel.room.name }]);
            socket.emit('joinRoom', { roomName: joinChannelName});
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
  
  async function sendPrivateMessage() {
	let loginToSend = recipientName;
	let contentMessage = messageContent;
  closePrivateMessageModal();
	// await new Promise(r => setTimeout(r, 1000));
  const response = await fetch('http://localhost:3333/chat/createPrivateRoom', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify({
      idUser: userID,
      loginReceiver: loginToSend,
    }),
  });
  if (!response.ok)
  {
    const data = await response.json();
	  console.log("Error : ", data)
	  throw new Error(data.message);
  }
  else if (response.ok)
  {
    const newChannel = await response.json();
    console.log("New channel : ", newChannel);
    socket.emit('joinRoom', { roomName: newChannel.id });
    socket.emit('newMessage', { idSender: userID, roomName : newChannel.id, loginReceiver: loginToSend, content: contentMessage, type: "private" });
    privateId = newChannel.id;
    messages = [...messages, { username: login, content: contentMessage, user: false }];
	  privateList.update(privateList => [...privateList, { login: newChannel.users[0].login }]);
    recipientName = '';
    messageContent = '';
    alert(newChannel.message);
  }
}

  async function sendMessage() {
    if (selectedChannel === '' && selectedPrivateChannel === '') {
      messageInput = '';
      return;
    }
    if (messageInput.trim() === '') {
      return;
    }
    if (selectedChannel !== '') {
      let roomName = selectedChannel;
      socket.emit('newMessage', { roomName: roomName, content: messageInput, idSender: userID, type: "room" });
      messages = [...messages, { username: login, content: messageInput, user: false }];
      messageInput = '';
    }
    else if (selectedPrivateChannel !== '') {
      let loginToSend = selectedPrivateChannel;
      socket.emit('joinRoom', { roomName: privateId });
      socket.emit('newMessage', { idSender: userID, roomName: privateId, loginReceiver: loginToSend, content: messageInput, type: "private" });
      messages = [...messages, { username: login, content: messageInput, user: false }];
      messageInput = '';
    }
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

  async function declineInvitation(selectedInvitation: string) {

  }

  async function acceptInvitation(selectedInvitation: string) {

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
        selectedPrivateChannel = '';
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
            console.log("New channel : ", newChannel);
            if (newChannel) {
                socket.emit('joinRoom', { roomName: selectedChannel })
                userList.set(newChannel.users);
                const messagesWithUsername = newChannel.messages.map((message : any) => {
                  return {
                    content : message.content,
                    user : !(message.senderLogin === login),
                    username: message.senderLogin
                  }
                });
                messages = messagesWithUsername;
                banList.set(newChannel.bannedUsers);
                muteList.set(newChannel.mutedUsers);
                adminList.set(newChannel.administrators);
                invitationList.set(newChannel.invitations);
                blockList.set(newChannel.blockedUsers);
                isAdmin = false;
                if (newChannel.administrators) {
                    newChannel.administrators.forEach((admin: {id: number, login: string}) => {
                        if (admin.login === login && admin.id === userID) {
                            isAdmin = true;
                            return;
                        }
                    });
                }
            }
        }
    } catch (err) {
        if (err instanceof Error) {
            alert(err.message);
        }
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
  async function inviteUsr(inviteUser: string){
    try {
      const response = await fetch('http://localhost:3333/chat/inviteUser/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({
          idAdmin: userID,
          roomName: selectedChannel,
          loginUserToExecute: inviteUser,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      } else if (response.ok) {
        const newProfile = await response.json();
        console.log('Contenu de newProfile:', newProfile);
        //need socket to send invitation
        invitationList.update(currentInvitations => [
        ...currentInvitations,
        { login: inviteUser }
        ]);
        throw new Error(newProfile.message);
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
      alert("User unblocked");
    }
    const resp = await fetch('http://localhost:3333/chat/blockedUsers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + myCookie,
      },
      credentials: 'include',
    });
    if (resp.ok)
    {
      const data = await resp.json();
      if (data && data[0]) {
        blockList.set(data.blockedUsers.blockedUsers);
      }
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

    async function getPrivateChannel(Channel: string) {
    selectedChannel = '';
    selectedPrivateChannel = Channel;
  const response = await fetch('http://localhost:3333/chat/privateRooms/' + Channel, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
  });
  if (response.ok) {
    const data = await response.json();
    if (data && data.messages) {
      privateId = data.id;
      socket.emit('joinRoom', { roomName: privateId })
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
      socket.emit('leaveRoom', { roomName: selectedChannel });
      channelList.update(channelList => channelList.filter(channel => channel.name !== selectedChannel));
      adminList.update(adminList => adminList.filter(admin => admin.login !== login));
      refreshList();
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

{#if isInvitationModalOpen}
  <div class="modal">
    <div class="modal-content">
      <h3>Invitation list</h3>
      <input bind:value={inviteUser} id="inviteUser" type="inviteUser" placeholder="inviteUser" name = "inviteUser"/>
      {#if inviteUser && selectedChannel}
        <button on:click={ ()=> inviteUsr(inviteUser)}>Invite</button>
      {:else}
        <p class="error-message">Need to be in a channel and add a username to invite</p>
      {/if}
        {#if $invitationList}
        <select name="selectedInvitation" bind:value={selectedInvitation}>
          <option disabled selected>Select an invitation</option>
          {#each $invitationList as invitation}
            <option value={invitation.login}>{invitation.login}</option>
          {/each}
        </select>
        {#if isAdmin && selectedInvitation}
          <div>
            <button on:click={() => acceptInvitation(selectedInvitation)}>Accept</button>
            <button on:click={() => declineInvitation(selectedInvitation)}>Decline</button>
          </div>
        {/if}
      {:else}
        <p>No invitation</p>
      {/if}
      <button on:click={closeInvitationModal}>Close</button>
    </div>
  </div>
{/if}

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
          {#if $muteList.length > 0}
            {#each $muteList as mutedUsers}
              <option value={mutedUsers.login}>{mutedUsers.login}</option>
            {/each}
          {:else}
            <option disabled selected>No muted users</option>
          {/if}
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
          <input type="radio" value="public" bind:group={joinChannelType} name="radio_public" id="radio_pub" /> Public/Private
        </label>
        <label>
          <input type="radio" value="protected" bind:group={joinChannelType} name="radio_protected" id="radio_protect"/> Protected
        </label>
      </div>
      {#if joinChannelType === 'protected'}
        <input bind:value={joinChannelPassword} type="password" placeholder="Password" name="joinChannelPassword" />
        {#if isJoinInvalidPassword}
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
      {#if selectedChannel != '' || selectedPrivateChannel != ''}
          {#if selectedChannel}
              <div class="channel-header">
                  <h2>{selectedChannel}</h2>
                  {#if isAdmin}
                      <button on:click={setup} class="button-admin">Setup</button>
                  {/if}
              </div>
          {:else}
              <div class="channel-header">
                  <h2>{selectedPrivateChannel} (private)</h2>
              </div>
          {/if}
      {:else}
          <div class="channel-header">
              <h2>Chat</h2>
          </div>
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
      <input bind:value={messageInput} type="text" placeholder="Type here..." id = test name = "messageInput"/>
      <button on:click={sendMessage}>Send</button>
    </div>
  </div>
  <div class="user-list">
    <h3 class="user-list-title">User List</h3>
    <button class="user-button p-anim" on:click={() => openInvitationModal()}>
      Invitation
    </button>
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
    min-width: 15vh;
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
    margin-right: 50%; /* Add margin to push the bubble to the left */
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
    direction: rtl;
    margin-left: 50%; /* Add margin to push the bubble to the right */
    border-top-left-radius: 0; /* Make the left top corner sharp */
    word-wrap: break-word;  }

.message-utilisateur {
    color: black; /* Couleur du texte */
    direction: ltr;
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
