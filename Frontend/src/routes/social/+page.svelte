<script lang="ts">

import { notification } from '../../stores/notificationStore.js';
import { user } from '../../stores/user';
import io from 'socket.io-client';
import { onMount } from 'svelte';

const apiUrl = import.meta.env.VITE_API_URL;

let pendingRequests = [];
let friends = [];
let requesteeLogin: string;
let friendRequestModalOpen = false;
let requesteeLoginModal = '';
let socket: any;
let myCookie: any;

onMount(async () => {
    function getCookie(name: string) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop()?.split(';').shift();
        }
    }
    myCookie = getCookie('jwt');
    socket = io('http://' + "localhost" + ':3333', {
        transports: ['websocket'],
        auth: {
            token: myCookie
        }
    });
    socket.on('connect', () => {
        console.log('connected');
    });
    socket.on('disconnect', () => {
        console.log('disconnected');
    });
    socket.on('friend-request', (data: {
        login: string
    }) => {
        if (data.login == $user.login || data.login == "")
            refreshData();
    });
});

// Reactive statement that triggers when $user.login changes
$: {
    if ($user.login) {
        refreshData();
    }
}

async function refreshData() {
    try {
        pendingRequests = await getFriendRequests($user.login);
        friends = await getFriendList($user.login);
    } catch (error) {
        notification.set({
            message: 'An error occurred while fetching data',
            error: true
        });
    }
}

async function getFriendRequests(userLogin: string) {
    try {
        const res = await fetch(`${apiUrl}/social/friend-requests/${userLogin}`);
        return await res.json();
    } catch (error) {
        throw new Error('Error: Failed to fetch friend requests');
    }
}

async function acceptFriendRequest(id) {
    try {
        await fetch(`${apiUrl}/social/friend-request/${id}/accept`, {
            method: 'PATCH'
        });
        socket.emit("newFriendRequest", {
            login: ""
        });
    } catch (error) {
        notification.set({
            message: 'An error occurred while accepting the friend request',
            error: true
        });
    }
}

async function rejectFriendRequest(id) {
    try {
        await fetch(`${apiUrl}/social/friend/${id}`, {
            method: 'DELETE'
        });
        socket.emit("newFriendRequest", {
            login: ""
        });
    } catch (error) {
        notification.set({
            message: 'An error occurred while rejecting the friend request',
            error: true
        });
    }
}

async function getFriendList(userLogin: string) {
    try {
        const res = await fetch(`${apiUrl}/social/friend-list/${userLogin}`);
        return await res.json();
    } catch (error) {
        throw new Error('Error: Failed to fetch friend list');
    }
}

async function sendFriendRequest() {
    try {
        const res = await fetch(`${apiUrl}/social/friend-request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requesterLogin: $user.login,
                requesteeLogin
            })
        });

        socket.emit("newFriendRequest", {
            login: requesteeLogin
        })

        if (!res.ok) {
            const result = await res.json();
            notification.set({
                message: result.message || 'Error: Failed to send friend request!',
                error: true
            });
        } else {
            notification.set({
                message: 'Friend request sent successfully!',
                error: false
            });
            socket.emit("newFriendRequest", {
                login: ""
            })
        }
    } catch (error) {
        notification.set({
            message: 'An error occurred while sending the friend request',
            error: true
        });
    } finally {
        setTimeout(() => {
            notification.set({
                message: '',
                error: false
            });
        }, 5000);
    }
}

async function deleteFriend(id) {
    try {
        await fetch(`${apiUrl}/social/friend/${id}`, {
            method: 'DELETE'
        });
        socket.emit("newFriendRequest", {
            login: ""
        });
    } catch (error) {
        notification.set({
            message: 'An error occurred while deleting the friend',
            error: true
        });
    }
}

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

<section class="actions">
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

    {#if $notification.message} <!-- Display the notification message if it exists -->
    <p class={$notification.error ? 'notification-error' : 'notification-success'}>{$notification.message}</p>
    {/if}
</section>

<section>
    <div class="white-frame">
        <h2 class="section-heading">Pending Friend Requests</h2>
        <div class="friends-container">
            {#each pendingRequests as request (request.id)}
            <div class="friend-card">
                <img src={request.requester.avatar ? request.requester.avatar : request.requester.small_pic} alt="{request.requester.login}'s picture" class="friend-image" />
                <h3 class="friend-name">{request.requester.login}</h3>
                <button class="accept-button" on:click={() => acceptFriendRequest(request.id)}>Accept</button>
                <button class="reject-button" on:click={() => rejectFriendRequest(request.id)}>Reject</button>
            </div>
            {/each}
        </div>
    </div>
</section>

<section>
    <div class="white-frame">
        <h2 class="section-heading">Friends</h2>
        <div class="friends-container">
            {#each friends as friend (friend.id)}
            <div class="friend-card">
                <img src={friend.friend.avatar ? friend.friend.avatar : friend.friend.small_pic} alt="{friend.friend.login}'s picture" class="friend-image" />
                <h3 class="friend-name">{friend.friend.login}</h3>
                <p class="status">
                    <span class={`status-circle ${friend.friend.status}`}></span>
                    {friend.friend.status === 'login' ? 'Connected' : friend.friend.status === 'logout' ? 'Disconnected' : 'In Game'}
                </p>
                <a href={`/profile/info/?login=${friend.friend.login}`} class="friend-button">View Profile</a>
                <button class="delete-button" on:click={() => deleteFriend(friend.id)}>Delete Friend</button>
            </div>
            {/each}
        </div>
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
    font-family: "Comic Sans MS";
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

/* Friend Cards */
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
    width: 120px;
    border: 1px solid #ccc;
    border-radius: 10px;
    margin: 10px;
    padding: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

/* View Profile Button */
.friend-button {
    width: 95px;
    margin-top: 5px;
    padding: 2px 2px;
    border: none;
    border-radius: 5px;
    color: #fff;
    cursor: pointer;
    background-color: #007BFF;
    font-size: 1rem;
}

.friend-button:hover {
    background-color: #0056b3;
    text-decoration: none;
}

/* Delete Friend Button */
.delete-button {
    width: 105px;
    font-size: 1rem;
    margin-top: 5px;
    padding: 2px 2px;
    border: none;
    border-radius: 5px;
    color: #fff;
    cursor: pointer;
    background-color: #f44336;
}

.delete-button:hover {
    background-color: #da190b;
    text-decoration: none;
}

.delete-icon {
    position: absolute;
    top: 10px;
    right: 10px;
    color: #f44336;
    cursor: pointer;
    font-weight: bold;
    font-size: 20px;
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

/* Accept and Reject Buttons */
.accept-button,
.reject-button {
    font-size: 1rem;
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

/* Status */
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
    0% {
        opacity: 1;
    }

    50% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.status-circle.login {
    background-color: #4CAF50;
}

.status-circle.logout {
    background-color: #f44336;
}

.status-circle.ingame {
    background-color: yellow;
    animation: blink 1s infinite;
}

button {
    background-color: #007fff;
    color: #fff;
    font-size: 1.2rem;
    padding: 1rem 2rem;
    border: none;
    border-radius: 15px;
    cursor: pointer;
}

/* Errors Friend Requests */
.notification-error {
    font-size: 1.2rem;
    color: red;
    font-weight: bold;
}

.notification-success {
    font-size: 1.2rem;
    color: rgb(0, 255, 0);
    font-weight: bold;
}

/* White Frame Sections */
.white-frame {
    border: 2px solid #fff;
    padding: 15px;
    border-radius: 10px;
    min-height: 50px;
    margin: 10px 0;
}

.section-heading {
    text-align: left;
    padding-bottom: 10px;
    border-bottom: 1px solid #ddd;
}

.friend-card {
    margin: 5px;
}

/* Notifications Location */
.actions {
    display: flex;
    align-items: center;
    gap: 10px;
}

.notification-error,
.notification-success {
    margin: 0;
}

</style>
