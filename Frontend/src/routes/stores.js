// Svelte stores are used to store data that can be used across components.

// writable : can be updated by any of your components using the set method.
// derived : for reactive values, they will be automatically updated when the value of one or more dependencies changes.

	import { writable } from 'svelte/store';

// create/init the state by exporting and declaring a const variable
// $ is to suscribe (automatically update the component when the store changes)

	export const isUserLoggedIn = writable(false);
	export const userName = writable('*Default*');





// // will set initial value to false if no isUserLoggedIn is found in local storage
// export const isUserLoggedIn = writable(localStorage.getItem('isUserLoggedIn') === 'true' || false);

// // will set the value of isUserLoggedIn in local storage when it changes
// isUserLoggedIn.subscribe(value => {
//   localStorage.setItem('isUserLoggedIn', value.toString());
// });

// // will set initial value to *Default* if no userName is found in local storage
// export const userName = writable(localStorage.getItem('userName') || '*Default*');

// // will set the value of userName in local storage when it changes
// userName.subscribe(value => {
// 	localStorage.setItem('userName', value);
// });