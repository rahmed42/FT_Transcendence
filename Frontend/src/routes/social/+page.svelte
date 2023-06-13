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
</script>

<section>
	<h2>Pending friend requests</h2>
	{#each pendingRequests as request (request.id)}
	  <div>
		<p>{request.requester.login} wants to be your friend.</p>
		<button on:click={() => acceptFriendRequest(request.id)}>Accept</button>
		<button on:click={() => rejectFriendRequest(request.id)}>Reject</button>
	  </div>
	{/each}
</section>
  
<section>
	<h2>Your friends</h2>
	{#each friends as friend (friend.id)}
	  <div>
        <img src={friend.friend.small_pic} alt="{friend.friend.login}'s picture" width="50" height="50" />
		<a href={`/profile/info/?login=${friend.friend.login}`}>{friend.friend.login}</a>
		<button on:click={() => deleteFriend(friend.id)}>Delete Friend</button>
	  </div>
	{/each}
</section>
  
<section>
	<h2>Send a friend request</h2>
	<input type="text" bind:value={requesteeLogin} placeholder="Friend's user login" />
	<button on:click={sendFriendRequest}>Send friend request</button>
	{#if $notification} <!-- Display the notification message if it exists -->
		<p>{$notification}</p>
	{/if}
</section>