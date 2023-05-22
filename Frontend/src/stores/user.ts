import { writable } from 'svelte/store';
interface User {
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
}

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
	updateAt: ''
});

interface login2Fa {
	checked : boolean;
}

export const log2Fa = writable<login2Fa>({
	checked : false
});