<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { writable } from 'svelte/store';
	import io from 'socket.io-client';
	import { goto } from '$app/navigation';

	let send: string = 'src/lib/images/send1.svg';
	const serverIP = import.meta.env.VITE_SERVER_IP;

	let messageInput = '';
	interface Message {
		content: string;
		username: string;
		user: boolean;
	}
	let messages: Message[] = [];

	// invitationGame
	let gameRequest = {
		login: 'undefined',
		type: 'undefined'
	};

	//invitation modal
	let isInvitationModalOpen = false;
	let selectedInvitation = '';
	let inviteUser = '';

	//admin modal
	let isUserModalOpen = false;
	let openAdminModal = false;
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
	let channelList = writable<{ name: string; type: string }[]>([]);
	let userList = writable<{ login: string }[]>([]);
	let banList = writable<{ login: string }[]>([]);
	let muteList = writable<{ login: string }[]>([]);
	let blockList = writable<{ login: string }[]>([]);
	let adminList = writable<{ login: string }[]>([]);
	let privateList = writable<{ login: string }[]>([]);
	let invitationList = writable<{ login: string }[]>([]);
	let selectedChannel = '';
	let selectedPrivateChannel = '';
	let selectedSection = '';
	let login: string = '';
	let socket: any;
	let myCookie: any;
	let privateId: any;
	let joinGameType: string = 'Original';

	let isHovered: { [key: string]: boolean } = {};

	onMount(async () => {
		function getCookie(name: string) {
			const value = `; ${document.cookie}`;
			const parts = value.split(`; ${name}=`);
			if (parts.length === 2) {
				return parts.pop()?.split(';').shift();
			}
		}
		myCookie = getCookie('jwt');
		if (!myCookie) {
			goto('/');
		} else {
			socket = io('http://' + serverIP + ':3333', {
				transports: ['websocket'],
				auth: {
					token: myCookie
				}
			});

			socket.on('connect', () => {});

			socket.on('disconnect', () => {});

			socket.on('newPrivateMessage', (data: { content: string; nameSender: string }) => {
				if (selectedPrivateChannel) {
					if (data.nameSender == selectedPrivateChannel) {
						messages = [
							...messages,
							{ username: data.nameSender, content: data.content, user: true }
						];
						return;
					}
				}
			});

			socket.on('newRoom', (data: { roomName: string; loginReceiver: string }) => {
				if (data.loginReceiver == login) {
					privateList.update((privateList) => {
						return [...privateList, { login: data.roomName }];
					});
				}
			});

			socket.on(
				'newRoomMessage',
				(data: { content: string; nameSender: string; roomName: string }) => {
					let bl = get(blockList);
					if (bl) {
						for (let i = 0; i < bl.length; i++) {
							if (bl[i].login == data.nameSender) return;
						}
					}
					if (selectedChannel) {
						if (data.roomName === selectedChannel) {
							if (data.nameSender === login) return;
							else {
								messages = [
									...messages,
									{ username: data.nameSender, content: data.content, user: true }
								];
								return;
							}
						}
					}
				}
			);
			socket.on('roomListUpdate', (data: { userList: { login: string }[]; roomName: string }) => {
				if (data.roomName == selectedChannel) userList.set(data.userList);
			});

			socket.on(
				'sayLeave',
				(data: { roomName: string; login: string; userList: { login: string }[] }) => {
					if (data.login == login) {
						socket.emit('leaveRoom', { roomName: data.roomName, userList: data.userList });
						channelList.update((channelList) => {
							return channelList.filter((channel) => channel.name !== data.roomName);
						});
						if (selectedChannel == data.roomName) selectedChannel = '';
						refreshList();
					}
				}
			);

			socket.on('unmuted', (data: { roomName: string; login: string }) => {
				if (data.roomName == selectedChannel) {
					muteList.update((muteList) => {
						return muteList.filter((user) => user.login !== data.login);
					});
				}
			});

			socket.on('muted', (data: { roomName: string; login: string }) => {
				if (data.roomName == selectedChannel) {
					muteList.update((muteList) => {
						return [...muteList, { login: data.login }];
					});
				}
			});
			socket.on('newGameRequest', (data: { sender: string; login: string; type: string }) => {
				if (data.login == login) getGameRequest();
			});
			socket.on('redirectGame', (data: { login: string; type: string }) => {
				if (data.login == login)
					setTimeout(() => {
						goto('/game');
					}, 100);
			});
			socket.on('admin', (data: { roomName: string; login: string; isAdmin: boolean }) => {
				if (data.login == login && data.roomName == selectedChannel) {
					if (data.isAdmin) {
						adminList.update((adminList) => {
							return [...adminList, { login: data.login }];
						});
						isAdmin = true;
					} else {
						adminList.update((adminList) => {
							return adminList.filter((user) => user.login !== data.login);
						});
						let ad = get(adminList);
						if (ad.length == 0) adminList.set([]);
						isAdmin = false;
						if (openAdminModal) {
							closeSetupModal();
						}
					}
				}
			});
			socket.on('ban', (data: { roomName: string; login: string; isBanned: boolean }) => {
				if (data.roomName == selectedChannel && isAdmin) {
					if (data.isBanned) {
						banList.update((banList) => {
							return [...banList, { login: data.login }];
						});
					} else {
						banList.update((banList) => {
							return banList.filter((user) => user.login !== data.login);
						});
						let bl = get(banList);
						if (bl.length == 0) banList.set([]);
					}
				}
			});
			async function getUserinfo() {
				try {
					const response = await fetch('http://' + serverIP + ':3333/profil/me', {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							Authorization: 'Bearer ' + myCookie
						},
						credentials: 'include'
					});
					const data = await response.json();
					if (data) {
						userID = data.id;
						login = data.login;
						token = data.jwtToken;
						blockList.set(data.blockedUsers);
					}
				} catch (error) {
					console.error('An error occurred while fetching user info:', error);
				}
			}

			// Wait for getUserinfo to complete before moving on
			await getUserinfo();

			// Fetch all the rooms
			const response = await fetch('http://' + serverIP + ':3333/chat/rooms', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				},
				credentials: 'include'
			});

			const data = await response.json();
			if (data && data.rooms) {
				if (data.message) {
					alert(data.message);
					return;
				}
				channelList.set(data.rooms);
			}
			// Fetch all the private rooms
			const response2 = await fetch('http://' + serverIP + ':3333/chat/privateRooms', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				},
				credentials: 'include'
			});

			if (response2.ok) {
				const data = await response2.json();
				if (data && data[0]) {
					if (data.message) {
						alert(data.message);
						return;
					}
					privateList.update((currentPrivateList) => [
						...currentPrivateList,
						{ login: data[0].users[0].login }
					]);
				}
			} else {
				const data = await response2.json();
				alert(data.message);
			}
		}
	});

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			sendMessage();
		}
	}

	async function refreshUserList(myCookie: string, selectedChannel: string) {
		const reponse = await fetch('http://' + serverIP + ':3333/chat/rooms/' + selectedChannel, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + myCookie
			}
		});
		const newChannel = await reponse.json();
		if (newChannel.message) {
			alert(newChannel.message);
			return;
		}
		if (newChannel.users != null) return newChannel.users;
		else return [];
	}

	$: {
		if (selectedSection)
		{
			newChannelType = '';
			selectedUserparam = '';
			newPassword = '';
			muteDuration = 0;
		}
	}

	async function createGameRequest() {
		try {
			const response = await fetch('http://' + serverIP + ':3333/profil/createGameRequest', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				},
				body: JSON.stringify({
					myLogin: login,
					guestLogin: loginUserToExecute,
					gameType: joinGameType
				})
			});
			socket.emit('gameRequest', {
				sender: login,
				login: loginUserToExecute,
				type: joinGameType
			});
			closeUserModal();
		} catch (err) {
			if (err instanceof Error) alert(err.message);
		}
	}

	async function deleteGameRequest() {
		try {
			const response = await fetch('http://' + serverIP + ':3333/profil/deleteGameRequest', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				},
				body: JSON.stringify({
					myLogin: login
				})
			});
			gameRequest.login = 'undefined';
			gameRequest.type = 'undefined';
		} catch (err) {
			if (err instanceof Error) alert(err.message);
		}
	}

	async function acceptGameRequest() {
		try {
			//To avoid 2 players on same paddle for fast computers
			setTimeout(() => {
				goto('/game');
				socket.emit('acceptGameRequest', {
					login: gameRequest.login,
					type: gameRequest.type
				});
				gameRequest.login = 'undefined';
				gameRequest.type = 'undefined';
			}, 500);
		} catch (err) {
			if (err instanceof Error) alert(err.message);
		}
	}

	function refreshList() {
		userList.set([]);
		banList.set([]);
		muteList.set([]);
		blockList.set([]);
		adminList.set([]);
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

	async function changeUserPassword(newPassword: string) {
		try {
			const response = await fetch('http://' + serverIP + ':3333/chat/changePassword', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				},
				body: JSON.stringify({
					idUser: userID,
					roomName: selectedChannel,
					password: newPassword
				})
			});
			const data = await response.json();
			alert(data.message);
		} catch (err) {
			if (err instanceof Error) alert(err.message);
		}
	}

	async function grantUserAdmin() {
		try {
			let channelName = selectedChannel;
			let login = selectedUserparam;
			let id = userID;
			const response = await fetch('http://' + serverIP + ':3333/chat/giveAdmin', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				},
				body: JSON.stringify({
					idAdmin: userID,
					roomName: selectedChannel,
					loginUserToExecute: selectedUserparam
				})
			});
			const data = await response.json();
			if (data.message)
			{
				alert(data.message);
				return;
			}
			adminList.update(items => [...items, { login: login }]);
			socket.emit('adminEvent', { roomName: channelName, login: login, id: id, isAdmin: true });
		} catch (err) {
			if (err instanceof Error) alert(err.message);
		}
	}

	async function expulSelectedUser() {
		try {
			let login = selectedUserparam;
			const response = await fetch('http://' + serverIP + ':3333/chat/kickUser', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				},
				body: JSON.stringify({
					idAdmin: userID,
					roomName: selectedChannel,
					loginUserToExecute: selectedUserparam
				})
			});
			const data = await response.json();
			if (data.message)
			{
				alert(data.message);
				return;
			}
			let userL = get(userList);
			userL = userL.filter((user) => user.login != login);
			socket.emit('eventLeave', { roomName: selectedChannel, login: login, userList: userL });
			alert('User successfully kicked out of the channel.');
		} catch (err) {
			if (err instanceof Error) {
				alert(err.message);
			}
		}
	}

	async function banSelectedUser() {
		try {
			let login = selectedUserparam;
			const response = await fetch('http://' + serverIP + ':3333/chat/banUser', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				},
				body: JSON.stringify({
					idAdmin: userID,
					roomName: selectedChannel,
					loginUserToExecute: selectedUserparam
				})
			});
			const data = await response.json();
			if (data.message)
			{
				alert(data.message);
				return ;
			}
			let userL = get(userList);
			userL = userL.filter((user) => user.login != login);
			socket.emit('eventLeave', { roomName: selectedChannel, login: login, userList: userL });
			banList.update((banList) => [...banList, { login: login }]);
		} catch (err) {
			if (err instanceof Error) alert(err.message);
		}
	}

	async function unmuteUser() {
		try {
			let login = selectedUserparam;
			const response = await fetch('http://' + serverIP + ':3333/chat/unmuteUser', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				},
				body: JSON.stringify({
					idAdmin: userID,
					roomName: selectedChannel,
					loginUserToExecute: selectedUserparam
				})
			});
			const data = await response.json();
			if (data.message)
			{
				alert(data.message);
				return ;
			}
			muteList.update((currentMutes) => {
				return currentMutes.filter((mute) => mute.login != login);
			});
		} catch (err) {
			if (err instanceof Error) alert(err.message);
		}
	}

	async function revokeAdmin() {
		try {
			let channelName = selectedChannel;
			let login = selectedUserparam;
			const response = await fetch('http://' + serverIP + ':3333/chat/removeAdmin', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				},
				body: JSON.stringify({
					idAdmin: userID,
					roomName: selectedChannel,
					loginUserToExecute: selectedUserparam
				})
			});

			const data = await response.json();
			if (data.message)
			{
				alert(data.message);
				return ;
			}
			adminList.update((currentAdmins) => {
				return currentAdmins.filter((admin) => admin.login !== login);
			});
			socket.emit('adminEvent', { roomName: channelName, login: login, isAdmin: false });
		} catch (err) {
			if (err instanceof Error) {
				alert(err.message);
			}
		}
	}

	async function unbanUser() {
		try {
			let login = selectedUserparam;
			const response = await fetch('http://' + serverIP + ':3333/chat/unbanUser', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				},
				body: JSON.stringify({
					idAdmin: userID,
					roomName: selectedChannel,
					loginUserToExecute: selectedUserparam
				})
			});
			const data = await response.json();
			if (data.message)
			{
				alert(data.message);
				return ;
			}
			banList.update((currentBanList) => {
				return currentBanList.filter((user) => user.login !== login);
			});
		} catch (err) {
			if (err instanceof Error) {
				alert(err.message);
			}
		}
	}

	async function changeChannelType() {
		try {
			const response = await fetch('http://' + serverIP + ':3333/chat/changeRoomType', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				},
				body: JSON.stringify({
					idUser: userID,
					roomName: selectedChannel,
					password: newPassword,
					type: newChannelType
				})
			});
			const data = await response.json();
			if (data.message) alert(data.message);
		} catch (err) {
			if (err instanceof Error) alert(err.message);
		}
	}

	async function muteSelectedUser(muteDuration: number) {
		try {
			let chan = selectedChannel;
			let login = selectedUserparam;
			const response = await fetch('http://' + serverIP + ':3333/chat/muteUser', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				},
				body: JSON.stringify({
					idAdmin: userID,
					roomName: selectedChannel,
					loginUserToExecute: selectedUserparam,
					muteDuration: muteDuration
				})
			});
				const newMuteList = await response.json();
				if (newMuteList.message) {
					alert(newMuteList.message);
					return;
				}
				muteList.update((muteList) => [...muteList, { login: login }]);
				socket.emit('eventMute', {
					roomName: chan,
					login: newMuteList.mutedUsers.mutedUsers.login
				});
			muteDuration = 0;
		} catch (err) {
			if (err instanceof Error) alert(err.message);
		}
	}

	function closeSetupModal() {
		openAdminModal = false;
		selectedUserparam = '';
		newPassword = '';
		selectedSection = '';
		newChannelType = '';
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
					const response = await fetch('http://' + serverIP + ':3333/chat/createRoom', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: 'Bearer ' + token
						},
						body: JSON.stringify({
							idUser: userID,
							roomName: newChannelName,
							type: newChannelType,
							password: newChannelPassword
						})
					});
						const newChannel = await response.json();
						if (newChannel.message) {
						alert(newChannel.message);
						return;
					}
						channelList.update((channelList) => [
							...channelList,
							{ name: newChannel.room.name, type: newChannel.room.type }
						]);
						socket.emit('joinRoom', newChannel.room.name);
						closeModal();
					}
				}
		} catch (err) {
			if (err instanceof Error) alert(err.message);
		}
	}

	function isValidChannelName(name: string) {
		for (let i = 0; i < name.length; i++) {
			const charCode = name.charCodeAt(i);
			if (charCode < 48 || charCode > 122) {
				return false;
			}
		}
		return true;
	}

	function selectUser(user: string) {
		// Logique de sélection de l'utilisateur
		loginUserToExecute = user;
		isUserModalOpen = true;
	}

	function closeUserModal() {
		isUserModalOpen = false;
		loginUserToExecute = '';
	}

	async function joinChannel() {
		try {
			if (
				joinChannelName.trim() !== '' &&
				joinChannelName.length <= 10 &&
				isValidChannelName(joinChannelName)
			) {
				if (joinChannelType === '') {
					isJoinInvalidType = true;
					return;
				} else {
					if (joinChannelType === 'protected') {
						if (joinChannelPassword.trim() === '') {
							isJoinInvalidPassword = true;
							return;
						}
					}
				}
				const response = await fetch('http://' + serverIP + ':3333/chat/joinRoom', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: 'Bearer ' + token
					},
					body: JSON.stringify({
						idUser: userID,
						roomName: joinChannelName,
						password: joinChannelPassword
					})
				});
					const newChannel = await response.json();
					if (newChannel.message) {
					alert(newChannel.message);
					return;
				}
					channelList.update((channelList) => [
						...channelList,
						{ name: newChannel.room.name, type: newChannel.room.type }
					]);
					let userl = await refreshUserList(token, newChannel.room.name);
					socket.emit('joinRoom', { roomName: joinChannelName, userList: userl });
				closeJoinModal();
			} else {
				isJoinInvalidName = true;
				return;
			}
		} catch (err) {
			if (err instanceof Error) alert(err.message);
		}
	}

	async function sendPrivateMessage() {
		let loginToSend = recipientName;
		let contentMessage = messageContent;
		closePrivateMessageModal();
		// await new Promise(r => setTimeout(r, 1000));
		const response = await fetch('http://' + serverIP + ':3333/chat/createPrivateRoom', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + token
			},
			body: JSON.stringify({
				idUser: userID,
				loginReceiver: loginToSend
			})
		});
			const newChannel = await response.json();
			if (newChannel.message) {
			alert(newChannel.message);
			return;
		}
			socket.emit('joinRoom', { roomName: newChannel.id.id });
			socket.emit('newPrivateRoom', { login: login, loginReceiver: loginToSend });
			socket.emit('newMessage', {
				idSender: userID,
				roomName: newChannel.id,
				loginReceiver: loginToSend,
				content: contentMessage,
				type: 'private'
			});
			privateId = newChannel.id.id;
			privateList.update((privateList) => [...privateList, { login: newChannel.login }]);
			recipientName = '';
			messageContent = '';
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
			socket.emit('newMessage', {
				roomName: roomName,
				content: messageInput,
				idSender: userID,
				type: 'room'
			});
			messages = [...messages, { username: login, content: messageInput, user: false }];
			messageInput = '';
		} else if (selectedPrivateChannel !== '') {
			let loginToSend = selectedPrivateChannel;
			socket.emit('joinRoom', { roomName: privateId });
			socket.emit('newMessage', {
				idSender: userID,
				roomName: privateId,
				loginReceiver: loginToSend,
				content: messageInput,
				type: 'private'
			});
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
		} else if (selectedSection === 'revokeAdmin') {
			revokeAdmin();
		} else if (selectedSection === 'unbanUser') {
			unbanUser();
		} else if (selectedSection === 'unmuteUser') {
			unmuteUser();
		} else if (selectedSection === 'changeChannelType') {
			changeChannelType();
		}
		closeSetupModal();
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
			const response = await fetch('http://' + serverIP + ':3333/chat/rooms/' + selectedChannel, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				}
			});
				const newChannel = await response.json();
				if (newChannel) {
					if (newChannel.message) {
					alert(newChannel.message);
					return;
				}
					socket.emit('joinRoom', { roomName: selectedChannel });
					userList.set(newChannel.users);
					const messagesWithUsername = newChannel.messages.map((message: any) => {
						return {
							content: message.content,
							user: !(message.senderLogin === login),
							username: message.senderLogin
						};
					});
					messages = messagesWithUsername;
					banList.set(newChannel.bannedUsers);
					muteList.set(newChannel.mutedUsers);
					adminList.set(newChannel.administrators);
					invitationList.set(newChannel.invitations);
					blockList.set(newChannel.blockedUsers);
					isAdmin = false;
					if (newChannel.administrators) {
						newChannel.administrators.forEach((admin: { id: number; login: string }) => {
							if (admin.login === login && admin.id === userID) {
								isAdmin = true;
								return;
							}
						});
					}
				}
		} catch (err) {
			if (err instanceof Error) {
				alert(err.message);
			}
		}
	}

	async function getProfile() {
		let redir = '/profile/info/?login=' + loginUserToExecute;
		goto(redir);
	}

	async function inviteUsr(inviteUser: string) {
		try {
			const response = await fetch('http://' + serverIP + ':3333/chat/inviteUser/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				},
				body: JSON.stringify({
					idAdmin: userID,
					roomName: selectedChannel,
					loginUserToExecute: inviteUser
				})
			});
				const newProfile = await response.json();
				closeInvitationModal();
				alert(newProfile.message);
		} catch (err) {
			if (err instanceof Error) alert(err.message);
		}
	}

	async function getGameRequest() {
		try {
			const response = await fetch('http://' + serverIP + ':3333/profil/me', {
				method: 'GET',
				headers: {
					'Content-Type': 'applications/json',
					Authorization: 'Bearer ' + token
				},
				credentials: 'include'
			});
			if (!response.ok) {
				const data = await response.json();
				alert(data.message);
			} else {
				const data = await response.json();
				gameRequest.login = data.loginGameInvitation;
				gameRequest.type = data.gameTypeInvitation;
			}
		} catch (err) {
			if (err instanceof Error) alert(err.message);
		}
	}

	async function unblockUser() {
		const response = await fetch('http://' + serverIP + ':3333/chat/unblockUser', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + token
			},
			body: JSON.stringify({
				idUser: userID,
				loginUserToBlock: loginUserToExecute
			})
		});
			const newProfile = await response.json();
			if (newProfile.message) {
			alert(newProfile.message);
			return;
		}
			blockList.set(newProfile.blockedUser.blockedUsers);
			alert('User unblocked');
		}

	async function blockUser() {
		try {
			const response = await fetch('http://' + serverIP + ':3333/chat/blockUser', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				},
				body: JSON.stringify({
					idUser: userID,
					loginUserToBlock: loginUserToExecute
				})
			});
				const newProfile = await response.json();
				if (newProfile.message) {
				alert(newProfile.message);
				return;
			}
				blockList.set(newProfile.blockedUsers);
				alert('User blocked');
		} catch (err) {
			if (err instanceof Error) alert(err.message);
		}
	}

	async function setup() {
		openAdminModal = true;
	}

	async function getPrivateChannel(Channel: string) {
		selectedChannel = '';
		selectedPrivateChannel = Channel;
		const response = await fetch(
			'http://' + serverIP + ':3333/chat/privateRooms/' + selectedPrivateChannel,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				}
			}
		);
			const data = await response.json();
			if (data && data.messages) {
				if (data.message) {
				alert(data.message);
				return;
			}
				privateId = data.id;
				socket.emit('joinRoom', { roomName: privateId });
				userList.set(data.users);
				const messagesRecus = data.messages;
				messages.length = 0;
				for (const msg of messagesRecus) {
					if (msg && msg.content && msg.sender && msg.sender.login) {
						if (msg.sender.login == login) {
							const message = {
								content: msg.content,
								username: msg.sender.login,
								user: false
							};
							messages.push(message);
						} else {
							const message = {
								content: msg.content,
								username: msg.sender.login,
								user: true
							};
							messages.push(message);
						}
					}
				}
			}
	}

	async function leaveRoom() {
		let userl = await refreshUserList(token, selectedChannel);
		let users = userl.filter((user: any) => user.login !== login);
		try {
			const response = await fetch('http://' + serverIP + ':3333/chat/leaveRoom', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + token
				},
				body: JSON.stringify({
					idUser: userID,
					roomName: selectedChannel
				})
			});
				const newProfile = await response.json();
				if (newProfile.message) {
				alert(newProfile.message);
				return;
			}
				socket.emit('eventLeave', { roomName: selectedChannel, login:login, userList: users });
				channelList.update((channelList) =>
					channelList.filter((channel) => channel.name !== selectedChannel)
				);
				refreshList();
		} catch (err) {
			if (err instanceof Error) alert(err.message);
		}
	}

	function handleHover(channelName: string, value: boolean) {
		isHovered = { ...isHovered, [channelName]: value };
	}
</script>

<svelte:head>
	<title>Chat</title>
	<meta name="description" content="Chat Page" />
</svelte:head>
{#if myCookie}
	{#if isInvitationModalOpen}
		<div class="modal">
			<div class="modal-content">
				<h3>Invitation list</h3>
				<input
					bind:value={inviteUser}
					id="inviteUser"
					type="Username ..."
					placeholder="Enter username"
					name="inviteUser"
				/><br />
				{#if inviteUser && selectedChannel}
					<br /><button class="greenButton" on:click={() => inviteUsr(inviteUser)}>Invite</button>
				{:else}
					<p class="error-message">Need to be in a channel and add a username to invite</p>
				{/if}
				<button class="redButton" on:click={closeInvitationModal}>Close</button>
			</div>
		</div>
	{/if}

	{#if isUserModalOpen}
		<div class="modal">
			<div class="modal-content">
				<h3>User Options</h3>
				<div>
					<button id="modalButtons" class="btn-grad-red" on:click={blockUser}>Block</button>
					<button id="modalButtons" class="btn-grad-green" on:click={unblockUser}>Unblock</button>
				</div>
				<button id="modalButtons" class="btn-grad-lightGreen" on:click={createGameRequest}
					>Invite Game</button
				>
				<input
					type="radio"
					value="Original"
					id="Original"
					name="gameType"
					bind:group={joinGameType}
					checked
				/>
				<label for="Original">Original</label>
				<input type="radio" value="Modern" id="Modern" name="gameType" bind:group={joinGameType} />
				<label for="Modern">Modern</label><br />

				<div>
					<button id="modalButtons" class="btn-grad-blue" on:click={getProfile}>Profile</button>
				</div>
				<br /><button id="modalButtons" class="redButton" on:click={closeUserModal}>Close</button>
			</div>
		</div>
	{/if}

	{#if openAdminModal}
		<div class="modal">
			<div class="modal-content">
				<h3>Channel Admin</h3>

				{#if selectedSection === 'changeChannelType'}
					<div class="selected-option">
						<p>
							Change Type:
							<label>
								<input
									type="radio"
									value="public"
									id="public"
									name="channelType"
									bind:group={newChannelType}
								/> Public
							</label>
							<label>
								<input
									type="radio"
									value="private"
									id="private"
									name="channelType"
									bind:group={newChannelType}
								/> Private
							</label>
							<label>
								<input
									type="radio"
									value="protected"
									id="protected"
									name="channelType"
									bind:group={newChannelType}
								/> Protected
							</label>
						</p>
						{#if newChannelType === 'protected'}
							<input
								bind:value={newPassword}
								type="password"
								id="channelPassword"
								placeholder="Password"
								name="NewPassword"
							/>
						{/if}
					</div>
				{/if}

				{#if selectedSection === 'changePassword'}
					<div class="selected-option">
						<p>Change Password:</p>
						<input
							bind:value={newPassword}
							id="newPassword"
							type="password"
							placeholder="New Password"
							name="newPassword"
						/>
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
						<p>Mute User :</p>
						<select name="selectedUser" bind:value={selectedUserparam}>
							{#each $userList as user}
								<option value={user.login}>{user.login}</option>
							{/each}
						</select>
						<p>
							<input
								id="muteDuration"
								bind:value={muteDuration}
								type="number"
								name="duration"
								placeholder="Mute Duration (minutes)"
								min="1"
							/> Minutes
						</p>
					</div>
				{/if}

				{#if selectedSection === 'unbanUser'}
					<div class="selected-option">
						<p>Unban User:</p>
						<select name="selectedUser" bind:value={selectedUserparam}>
							{#if $banList.length > 0}
								{#each $banList as bannedUsers}
									<option value={bannedUsers.login}>{bannedUsers.login}</option>
								{/each}
							{:else}
								<option disabled selected>No banned users</option>
							{/if}
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
					<br /><label for="sectionSelect">Select Section:</label>
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
					{#if newChannelType != '' || selectedUserparam != '' || muteDuration != 0 || newPassword != ''}
							<br /><button class="greenButton" on:click={() => confirmSelection()}>Confirm</button>
					{/if}
					<button class="redButton" on:click={() => closeSetupModal()}>Cancel</button>
				</div>
			</div>
		</div>
	{/if}

	{#if isJoinModalOpen}
		<div class="modal">
			<div class="modal-content">
				<h3>Join a channel</h3>
				<input
					bind:value={joinChannelName}
					type="text"
					placeholder="Channel Name"
					name="joinChannelName"
					id="joinChannelName1"
				/>
				{#if isJoinInvalidName}
					<p class="error-message">Invalid channel name. Please enter a valid name.</p>
				{/if}
				{#if isJoinInvalidType}
					<p class="error-message">Please select a channel type.</p>
				{/if}
				<div class="channel-type">
					<span>Channel Type:</span><br />
					<label>
						<input
							type="radio"
							value="public"
							bind:group={joinChannelType}
							name="radio_public"
							id="radio_pub"
						/> Public/Private
					</label>
					<label>
						<input
							type="radio"
							value="protected"
							bind:group={joinChannelType}
							name="radio_protected"
							id="radio_protect"
						/> Protected
					</label>
				</div>
				<br />
				{#if joinChannelType === 'protected'}
					<input
						bind:value={joinChannelPassword}
						type="password"
						placeholder="Password"
						name="joinChannelPassword"
					/>
					{#if isJoinInvalidPassword}
						<p class="error-message">Please enter a password for the protected channel.</p>
					{/if}
				{/if}
				<button class="greenButton" on:click={joinChannel}>Join</button>
				<button class="redButton" on:click={closeJoinModal}>Cancel</button>
			</div>
		</div>
	{/if}
	<div class="container">
		<div class="sidebar">
			<div>
				{#if selectedChannel != '' || selectedPrivateChannel != ''}
					{#if selectedChannel}
						<div class="channel-header">
							<h3>{selectedChannel}</h3>
							{#if isAdmin}
								<button id="leftButtons" class="btn-grad-blue" on:click={setup}>Admin</button>
							{/if}
							<button id="leftButtons" class="btn-grad-red" on:click={() => leaveRoom()}>
								Leave Channel
							</button>
							<br />
						</div>
					{:else}
						<div class="channel-header">
							<h2>{selectedPrivateChannel} (private)</h2>
						</div>
					{/if}
				{/if}
			</div>
			<button id="leftButtons" class="btn-grad-grey" on:click={() => openModal()}>
				Create channel
			</button>
			<button id="leftButtons" class="btn-grad-grey" on:click={() => openJoinModal()}>
				Join Channel
			</button>
			<br />

			{#if channelList !== null}
				{#each $channelList as channel}
					<button
						on:mouseover={() => handleHover(channel.name, true)}
						on:focus={() => handleHover(channel.name, true)}
						on:mouseout={() => handleHover(channel.name, false)}
						on:blur={() => handleHover(channel.name, false)}
						style="
							color: white;
							margin: 10px;
							padding: 5px 5px;
							text-align: center;
							transition: 0.5s;
							background-size: 200% auto;
							border-radius: 10px;
							display: block;
							cursor: pointer;
							width: 140px;
							height: 50px;
							font-size: 1em;
							font-weight: bold;
							{channel.type === 'public'
							? 'background-image: linear-gradient(to right, #00bf8f 0%, #001510 51%, #00bf8f 100%);'
							: ''}
							{channel.type === 'protected'
							? 'background-image: linear-gradient(to right, #1A2980 0%, #26D0CE 51%, #1A2980 100%);'
							: ''}
							{channel.type === 'private'
							? 'background-image: linear-gradient(to right, #ff0084 0%, #33001b 51%, #ff0084 100%);'
							: ''}
							{isHovered[channel.name] === true
							? 'background-position: right center;'
							: 'background-position: left center;'}
							"
						on:click={() => getChannel(channel.name)}
					>
						{channel.name}
					</button>
				{/each}
			{/if}

			<br />
			{#if privateList !== null}
				{#each $privateList as privateChannel}
					<button
						on:mouseover={() => handleHover(privateChannel.login, true)}
						on:focus={() => handleHover(privateChannel.login, true)}
						on:mouseout={() => handleHover(privateChannel.login, false)}
						on:blur={() => handleHover(privateChannel.login, false)}
						style="
						color: white;
						margin: 10px;
						padding: 5px 5px;
						text-align: center;
						transition: 0.5s;
						background-size: 200% auto;
						border-radius: 10px;
						display: block;
						cursor: pointer;
						width: 140px;
						height: 50px;
						font-size: 1em;
						font-weight: bold;
						background-image: linear-gradient(to right, #1A2980 0%, #26D0CE 51%, #1A2980 100%);
						{isHovered[privateChannel.login] === true
							? 'background-position: right center;'
							: 'background-position: left center;'}
						"
						on:click={() => getPrivateChannel(privateChannel.login)}
					>
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
							<p class="message-utilisateur"><strong> {message.username} </strong></p>
							<p class="message-utilisateur">{message.content}</p>
						</div>
					{:else}
						<div class="message-container-other">
							<p class="message-autre-utilisateur"><strong> {message.username} </strong></p>
							<p class="message-autre-utilisateur">{message.content}</p>
						</div>
					{/if}
				{/each}
			</div>
			<div class="input-area">
				<input
					type="text"
					bind:value={messageInput}
					placeholder="Type here..."
					id="input-text"
					name="messageInput"
					on:keydown={handleKeyPress}
				/>
				<img id="send-picture" src={send} alt="send-icon" on:click={sendMessage} on:keydown />
				</div>
		</div>
		<div class="user-list">
			<h3 class="user-list-title">Users</h3>
			<button
				id="rightButtons"
				class="btn-grad-lightGreen"
				on:click={() => openPrivateMessageModal()}
			>
				Private Message
			</button>
			{#if selectedChannel}
				<button id="rightButtons" class="btn-grad-blue" on:click={() => openInvitationModal()}>
					Invitation
				</button>
			{/if}
			<br />
			{#each $userList as user}
				{#if user.login !== login}
					<button id="rightButtons" class="btn-grad-blue" on:click={() => selectUser(user.login)}>
						{user.login}
					</button>
				{/if}
			{/each}
			{#if gameRequest.login !== 'undefined'}
				<div id="gameRequest">
					<p id="gameRequestPopup">
						{gameRequest.login} <br /> Invited you to play <br />
						{gameRequest.type} game.
					</p>
					<div id="gameRequestButtons">
						<button class="greenButton" on:click={() => acceptGameRequest()}>Accept </button>
						<button class="redButton" on:click={() => deleteGameRequest()}>Decline </button>
					</div>
				</div>
			{/if}
		</div>

		{#if isModalOpen}
			<div class="modal">
				<div class="modal-content">
					<h3>Create a new channel</h3>
					<input
						bind:value={newChannelName}
						type="text"
						placeholder="Channel Name"
						name="newChannelName"
					/><br />
					{#if isInvalidName}
						<p class="error-message">Invalid channel name. Please enter a valid name.</p>
					{/if}
					{#if isInvalidType}
						<p class="error-message">Please select a channel type.</p>
					{/if}
					<div class="channel-type">
						<span>Channel Type:</span><br />
						<label>
							<input
								type="radio"
								value="public"
								bind:group={newChannelType}
								id="newChannelTypePublic"
							/> Public
						</label>
						<label>
							<input
								type="radio"
								value="private"
								bind:group={newChannelType}
								id="newChannelTypePrivate"
							/> Private
						</label>
						<label>
							<input
								type="radio"
								value="protected"
								bind:group={newChannelType}
								id="newChannelTypeProtected"
							/> Protected
						</label>
					</div>
					{#if newChannelType === 'protected'}
						<input
							bind:value={newChannelPassword}
							type="password"
							placeholder="Password"
							name="newChannelPassword"
						/>
						{#if isInvalidPassword}
							<p class="error-message">Please enter a password for the protected channel.</p>
						{/if}
					{/if}
					<br />
					<button class="greenButton" on:click={createChannel}>Create</button>
					<button class="redButton" on:click={closeModal}>Cancel</button>
				</div>
			</div>
		{/if}

		{#if isPrivateMessageModalOpen}
			<div class="modal">
				<div class="modal-content">
					<h3>Send Private Message</h3>
					<input
						bind:value={recipientName}
						type="text"
						placeholder="Username"
						name="recipientName"
					/>
					<br />
					<br />
					<textarea bind:value={messageContent} placeholder="Message" name="messageContent" />
					{#if privateMessageError !== ''}
						<p class="error-message">{privateMessageError}</p>
					{/if}
					{#if !recipientName || !messageContent}
						<p class="error-message">Please enter a username and a message.</p>
					{/if}
					<br /><button
						class="greenButton"
						on:click={sendPrivateMessage}
						disabled={!recipientName || !messageContent || privateMessageError !== ''}
						>Send Message</button
					>
					<button class="redButton" on:click={closePrivateMessageModal}>Cancel</button>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	#leftButtons {
		cursor: pointer;
		width: 140px;
		height: 50px;
		font-size: 1em;
		font-weight: bold;
	}

	#rightButtons {
		cursor: pointer;
		width: 170px;
		height: 50px;
		font-size: 1.1em;
		font-weight: bold;
	}

	#modalButtons {
		display: inline-block;
		padding: 10px;
		width: 120px;
		font-size: 1em;
		font-weight: bold;
	}

	#muteDuration {
		width: 100px;
	}

	.container {
		display: flex;
		margin-top: 10px;
	}

	.sidebar {
		padding: 10px;
		height: 100%;
		max-height: 100vh;
		min-width: 150px;
		padding-right: 10px; /* Ajout des marges intérieures */
	}

	.channel-header {
		text-align: center;
		font-weight: bold;
	}

	.chat-area {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		border-radius: 10px;
		max-height: 400px;
		min-height: 300px;
		background-color: white; /* Couleur de fond de la bulle de message */
	}

	.messages {
		flex-grow: 1;
		overflow-y: auto;
	}

	.input-area {
		display: flex;
		justify-content: space-between;
		padding: 10px;
	}
	#input-text {
		border-radius: 10px;
		width: 500px;
		height: 50px;
		margin-left: 0;
		margin-bottom: 0;
	}
	#send-picture {
		margin-right: 0px;
		width: 50px;
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
		/* background-color: #5446da; */
		background: linear-gradient(to bottom, #4bc3ff, #2b0bbc);
		padding: 10px;
		border-radius: 5px;
		text-align: center;
	}

	.modal-content h3 {
		margin-top: 0;
		margin-bottom: 10px;
		font-size: 2em;
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
		height: 100%;
		max-height: 100%;
		padding-left: 10px; /* Ajout des marges intérieures */
	}

	.message-container-user {
		max-width: 50%; /* Limiter la largeur du message */
		margin: 1px; /* Ajouter de l'espace autour du message */
		padding: 1px; /* Ajouter de l'espace à l'intérieur du message */
		border-radius: 20px; /* Arrondir les coins */
		background-color: rgb(184, 236, 184); /* Couleur de fond de la bulle de message */
		margin-right: 50%; /* Add margin to push the bubble to the left */
		border-bottom-left-radius: 0; /* Make the right top corner sharp */
		direction: ltr;
		word-wrap: break-word;
	}

	.message-container-other {
		max-width: 50%; /* Limiter la largeur du message */
		margin: 1px; /* Ajouter de l'espace autour du message */
		padding: 1px; /* Ajouter de l'espace à l'intérieur du message */
		border-radius: 20px; /* Arrondir les coins */
		background-color: lightblue; /* Couleur de fond de la bulle de message */
		direction: rtl;
		margin-left: 50%; /* Add margin to push the bubble to the right */
		border-bottom-right-radius: 0; /* Make the left top corner sharp */
		word-wrap: break-word;
	}

	.message-utilisateur {
		color: black; /* Couleur du texte */
		direction: ltr;
		padding: 2px;
	}

	.message-autre-utilisateur {
		align-self: flex-start;
		color: black; /* Couleur du texte */
		direction: ltr;
	}

	.user-list-title {
		text-align: center;
	}

	#gameRequest {
		background: linear-gradient(to bottom, #4bc3ff, #2b0bbc);
		padding: 0.5rem;
		border-radius: 15px;
		text-align: center;
		font-weight: bold;
	}
</style>
