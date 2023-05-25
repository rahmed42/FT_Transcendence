<script>
	import { onMount } from 'svelte';
  
	let pendingRequests = [];
	let friends = [];
	let userId;
	let requesteeId;
  
	$: userId && refreshData();
  
	async function refreshData() {
	  pendingRequests = await getFriendRequests(userId);
	  friends = await getFriendList(userId);
	}
  
	async function getFriendRequests(userId) {
	  const res = await fetch(`http://localhost:3333/social/friend-requests/${userId}`);
	  return await res.json();
	}
  
	async function acceptFriendRequest(id) {
	  await fetch(`http://localhost:3333/social/friend-request/${id}/accept`, { method: 'PATCH' });
	  await refreshData();
	}
  
	async function rejectFriendRequest(id) {
	  await fetch(`http://localhost:3333/social/friend-request/${id}/reject`, { method: 'PATCH' });
	  await refreshData();
	}
  
	async function getFriendList(userId) {
	  const res = await fetch(`http://localhost:3333/social/friend-list/${userId}`);
	  return await res.json();
	}
  
	async function sendFriendRequest() {
	  await fetch('http://localhost:3333/social/friend-request', { 
		method: 'POST', 
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ requesterId: userId, requesteeId }) 
	  });
	  await refreshData();
	}
</script>
  
<input type="number" bind:value={userId} placeholder="Your user id" />

<section>
	<h2>Pending friend requests</h2>
	{#each pendingRequests as request (request.id)}
	  <div>
		<p>{request.requesterUser.first_name} wants to be your friend.</p>
		<button on:click={() => acceptFriendRequest(request.id)}>Accept</button>
		<button on:click={() => rejectFriendRequest(request.id)}>Reject</button>
	  </div>
	{/each}
</section>
  
<section>
	<h2>Your friends</h2>
	{#each friends as friend (friend.id)}
	  <p><a href={`/profile/${friend.id}`}>{friend.first_name} {friend.last_name}</a></p>
	{/each}
</section>
  
<section>
	<h2>Send a friend request</h2>
	<input type="number" bind:value={requesteeId} placeholder="Friend's user id" />
	<button on:click={sendFriendRequest}>Send friend request</button>
</section>
