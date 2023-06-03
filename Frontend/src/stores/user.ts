// import { writable } from 'svelte/store';

// // Structure of User
// export interface User {
// 	token: string;
// 	jwtToken: string;
// 	id: string;
// 	email: string;
// 	login: string;
// 	first_name: string;
// 	last_name: string;
// 	large_pic: string;
// 	medium_pic: string;
// 	small_pic: string;
// 	createAt: string;
// 	updateAt: string;
// 	two_fa: boolean;
// 	two_fa_secret: string,
// 	isLogged: boolean;
// }

// // Retrieve the user from the session storage if exist else return an empty object
// const userSession = sessionStorage.getItem('user');
// const defaultUser : User = {
// 	token: '',
// 	jwtToken: '',
// 	id: '',
// 	email: '',
// 	login: '',
// 	first_name: '',
// 	last_name: '',
// 	large_pic: '',
// 	medium_pic: '',
// 	small_pic: '',
// 	createAt: '',
// 	updateAt: '',
// 	two_fa: false,
// 	two_fa_secret: '',
// 	isLogged: false,
// };

// // Create a store with a default value or session storage if exists
// // .parse : Converts a JavaScript Object Notation (JSON) string into an object.
// export const user = writable<User>(userSession ? JSON.parse(userSession) : defaultUser);
// console.log('userSession ',userSession);
// console.log('user ', user);
// console.log('defaultUser ', defaultUser);


// //Suscribe to user changes and update sessionStorage
// user.subscribe((value) => {
// 	// .stringify : Converts a JavaScript value to a JavaScript Object Notation (JSON) string
// 	sessionStorage.setItem('user', JSON.stringify(value));
// });

// // Reset the user to the default value
// export function resetUser() {
// 	user.set(defaultUser);
// }

// // function to update the store
// export function setUser(value: User) {
// 	user.set(value);
// }


// // Interface for login2Fa
// export interface Login2Fa {
// 	checked: boolean;
// }

// export const log2Fa = writable<Login2Fa>({
// 	checked: false,
// });

// export const checked = writable<boolean>(false);


import { writable } from 'svelte/store';

// Structure of User
export interface User {
	token: string;
	jwtToken: string;
	id: string;
	email: string;
	login: string;
	first_name: string;
	last_name: string;
	large_pic: string;
	medium_pic: string;
	small_pic: string;
	createAt: string;
	updateAt: string;
	two_fa: boolean;
	two_fa_secret: string,
	isLogged: boolean;
}
;
// Create a store with a default value
export const user = writable<User>({} as User);
export function resetUser() {
	user.set({
		token: '',
		jwtToken: '',
		id: '',
		email: '',
		login: '',
		first_name: '',
		last_name: '',
		large_pic: '',
		medium_pic: '',
		small_pic: '',
		createAt: '',
		updateAt: '',
		two_fa: false,
		two_fa_secret: '',
		isLogged: false,
	})
}
resetUser();

// Export functions to update the store
export function setUser(value: User) {
	user.set(value);
}


// Interface for login2Fa
export interface Login2Fa {
	checked: boolean;
}

export const log2Fa = writable<Login2Fa>({
	checked: false,
});

export const checked = writable<boolean>(false);
