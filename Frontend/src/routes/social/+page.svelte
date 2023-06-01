<script>
	import { onMount } from 'svelte';
	import { notification } from '../../stores/notificationStore.js';

    const apiUrl = import.meta.env.VITE_API_URL;

	let pendingRequests = [];
	let friends = [];
	let userLogin;
	let requesteeLogin;
  
	$: userLogin && refreshData();
  
	async function refreshData() {
	  pendingRequests = await getFriendRequests(userLogin);
	  friends = await getFriendList(userLogin);
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
		body: JSON.stringify({ requesterLogin: userLogin, requesteeLogin }) 
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
  
<input type="text" bind:value={userLogin} placeholder="Your user login" />

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
	  <p>
		<a href={`/profile/${friend.friend.login}`}>{friend.friend.login}</a>
		<button on:click={() => deleteFriend(friend.id)}>Delete Friend</button>
	  </p>
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