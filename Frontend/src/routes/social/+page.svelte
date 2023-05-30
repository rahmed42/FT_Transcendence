<script>
	import { onMount } from 'svelte';
  
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
	  const res = await fetch(`http://localhost:3333/social/friend-requests/${userLogin}`);
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
  
	async function getFriendList(userLogin) {
	  const res = await fetch(`http://localhost:3333/social/friend-list/${userLogin}`);
	  return await res.json();
	}
  
	async function sendFriendRequest() {
	  await fetch('http://localhost:3333/social/friend-request', { 
		method: 'POST', 
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ requesterLogin: userLogin, requesteeLogin }) 
	  });
	  return refreshData();
	}
</script>
  
<input type="text" bind:value={userLogin} placeholder="Your user login" />

<section>
	<h2>Pending friend requests</h2>
	{#each pendingRequests as request (request.id)}
	  <div>
		<p>{request.requester.first_name} wants to be your friend.</p>
		<button on:click={() => acceptFriendRequest(request.id)}>Accept</button>
		<button on:click={() => rejectFriendRequest(request.id)}>Reject</button>
	  </div>
	{/each}
</section>
  
<section>
	<h2>Your friends</h2>
	{#each friends as friend (friend.id)}
	  <p><a href={`/profile/${friend.friend.login}`}>{friend.friend.login}</a></p>
	{/each}
</section>
  
<section>
	<h2>Send a friend request</h2>
	<input type="text" bind:value={requesteeLogin} placeholder="Friend's user login" />
	<button on:click={sendFriendRequest}>Send friend request</button>
</section>