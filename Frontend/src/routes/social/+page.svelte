<script>
	import { notification } from '../../stores/notificationStore.js';
	import { user } from '../../stores/user';

	// Create a ".env" file at the root of Frontend folder and add "VITE_API_URL=http://localhost:3333"
    const apiUrl = import.meta.env.VITE_API_URL;

	let pendingRequests = [];
	let friends = [];
	let requesteeLogin;
  
	// Define a reactive statement that triggers when $user.login changes
	$: {
		if ($user.login) {
			refreshData();
		}
	}

	async function refreshData() {
		pendingRequests = await getFriendRequests($user.login);
		friends = await getFriendList($user.login);
	}
  
	async function getFriendRequests(userLogin) {
	  const res = await fetch(`${apiUrl}/social/friend-requests/${userLogin}`);
	  return await res.json();
	}
  
	async function acceptFriendRequest(id) {
	  await fetch(`${apiUrl}/social/friend-request/${id}/accept`, { method: 'PATCH' });
	  await refreshData();
	}
  
	async function rejectFriendRequest(id) {
	  await fetch(`${apiUrl}/social/friend-request/${id}/reject`, { method: 'PATCH' });
	  await refreshData();
	}
  
	async function getFriendList(userLogin) {
	  const res = await fetch(`${apiUrl}/social/friend-list/${userLogin}`);
	  return await res.json();
	}
  
	async function sendFriendRequest() {
	  const res = await fetch(`${apiUrl}/social/friend-request`, {
		method: 'POST', 
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ requesterLogin: $user.login, requesteeLogin }) 
	  });
	  
	  if (res.ok) { 
		notification.set('Friend request sent successfully!');
		setTimeout(() => {
    	  notification.set('');
    	}, 5000);
		await refreshData();
	  } else {
		notification.set('Failed to send friend request!');
		setTimeout(() => {
     	  notification.set('');
   		}, 5000);
	  }
	}

	async function deleteFriend(id) {
      await fetch(`${apiUrl}/social/friend/${id}`, { method: 'DELETE' });
      await refreshData();
	}

	let friendRequestModalOpen = false;
  	let requesteeLoginModal = '';

	function openFriendRequestModal() {
		friendRequestModalOpen = true;
	}

	function closeFriendRequestModal() {
		friendRequestModalOpen = false;
		requesteeLoginModal = "";
	}

	async function sendFriendRequestModal() {
		requesteeLogin = requesteeLoginModal;
		await sendFriendRequest();
		closeFriendRequestModal();
	}

</script>

<section>
	<button class="btn" on:click={openFriendRequestModal}>Send a friend request</button>

	{#if friendRequestModalOpen}
		<div class="modal">
			<div class="modal-content">
				<input type="text" bind:value={requesteeLoginModal} placeholder="Friend's user login" />
				<button on:click={sendFriendRequestModal}>Send friend request</button>
				<button on:click={closeFriendRequestModal}>Cancel</button>
			</div>
		</div>
	{/if}

	{#if $notification} <!-- Display the notification message if it exists -->
		<p>{$notification}</p>
	{/if}
</section>

<section>
	<h2 class="section-heading">Pending friend requests</h2>
	<div class="friends-container">
		{#each pendingRequests as request (request.id)}
		<div class="friend-card">
			<img src={request.requester.avatar ? request.requester.avatar : request.requester.small_pic} alt="{request.requester.login}'s picture" class="friend-image"/>
			<h3 class="friend-name">{request.requester.login}</h3>
			<!-- <p class="status">
				<span class="status-circle {request.requester.connected ? 'connected' : 'disconnected'}"></span>
				{request.requester.connected ? 'Connected' : 'Disconnected'}
			</p> -->
			<button class="accept-button" on:click={() => acceptFriendRequest(request.id)}>Accept</button>
			<button class="reject-button" on:click={() => rejectFriendRequest(request.id)}>Reject</button>
		</div>
		{/each}
	</div>
</section>
  
<section>
	<h2 class="section-heading">Your friends</h2>
	<div class="friends-container">
		{#each friends as friend (friend.id)}
		<div class="friend-card">
			<button class="delete-icon" on:click={() => deleteFriend(friend.id)}>X</button>
			<img src={friend.friend.avatar ? friend.friend.avatar : friend.friend.small_pic} alt="{friend.friend.login}'s picture" class="friend-image"/>
			<h3 class="friend-name">{friend.friend.login}</h3>
			<p class="status">
				<span class="status-circle {friend.friend.connected ? 'connected' : 'disconnected'}"></span>
				{friend.friend.connected ? 'Connected' : 'Disconnected'}
			</p>			
			<a href={`/profile/info/?login=${friend.friend.login}`} class="friend-button">View Profile</a>
		</div>
		{/each}
	</div>
</section>

<style>
	.section-heading {
		font-weight: bold;
		font-size: 20px;
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

	.btn {
		font-family:"Comic Sans MS";
		font-size: 1.2rem;
		color: #fff;
		background-color: #007fff;
		border: none;
		border-radius: 75px;
		transition: background-color 0.2s ease;
		cursor: pointer;
		margin-bottom: 10px;
		width: 150px;
	}
	.btn:hover {
		background-color: #0f6402;
	}

	.accept-button, .reject-button {
		padding: 5px 10px;
		border: none;
		border-radius: 5px;
		color: #fff;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.accept-button {
		background-color: #4CAF50;
	}

	.accept-button:hover {
		background-color: #45a049;
	}

	.reject-button {
		background-color: #f44336;
	}

	.reject-button:hover {
		background-color: #da190b;
	}

	.friends-container {
		display: flex;
		flex-wrap: nowrap;
		overflow-x: auto;
		justify-content: flex-start;
		gap: 10px;
	}

	.friend-card {
		position: relative;
		flex: 0 0 auto;
		width: 100px;
		border: 1px solid #ccc;
		border-radius: 10px;
		margin: 10px;
		padding: 10px;
		box-shadow: 0 2px 5px rgba(0,0,0,0.15);
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.delete-icon {
		position: absolute;
		top: 2px;
		right: 2px;
		color: #f44336;
		cursor: pointer;
		font-weight: bold;
	}

	.friend-image {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		object-fit: cover;
	}

	.friend-name {
		margin: 5px 0;
	}

	.friend-button {
		margin-top: 5px;
		padding: 2px 2px;
		border: none;
		border-radius: 5px;
		color: #fff;
		cursor: pointer;
	}

	.friend-button {
		background-color: #007BFF;
	}

	.friend-button:hover {
		background-color: #0056b3;
		text-decoration: none;
	}

	.accept-button, .reject-button {
		margin-top: 5px;
		padding: 5px 10px;
		border: none;
		border-radius: 5px;
		color: #fff;
		cursor: pointer;
	}

	.accept-button {
		background-color: #4CAF50;
	}

	.accept-button:hover {
		background-color: #45a049;
	}

	.reject-button {
		background-color: #f44336;
	}

	.reject-button:hover {
		background-color: #da190b;
	}

	.status {
		display: flex;
		align-items: center;
		gap: 5px;
		margin: 3px 0;
	}

	.status-circle {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 50%;
	}

	@keyframes blink {
		0% { opacity: 1; }
		50% { opacity: 0; }
		100% { opacity: 1; }
	}

	.status-circle.connected {
		background-color: #4CAF50; /* green */
		animation: blink 1s infinite;
	}

	.status-circle.disconnected {
		background-color: #f44336; /* red */
	}

</style>