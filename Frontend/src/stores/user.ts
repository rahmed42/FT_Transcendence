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
}

// Create a store with a default value
export const user = writable<User>({
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
});

// Export functions to update the store
export function setUser(value: User) {
	user.set(value);
}

// export function updateUser(updateFn: (value: User) => User) {
// 	user.update(updateFn);
// }

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
	});
}

// Interface for login2Fa
export interface Login2Fa {
	checked: boolean;
}

export const log2Fa = writable<Login2Fa>({
	checked: false,
});

export const checked = writable<boolean>(false);
