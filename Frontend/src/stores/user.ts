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
	avatar: string,
}

// Retrieve the user from the session storage if exist else return an empty object
const defaultUser: User = {
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
	avatar: '',
};

// Create a store with a default value
export const user = writable<User>(defaultUser);

// Reset the user to the default value
export function resetUser() {
	user.set(defaultUser);
}

// function to update the store
export function setUser(value: User) {
	user.set(value);
}
