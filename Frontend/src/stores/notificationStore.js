import { writable } from 'svelte/store';

export const notification = writable({ message: '', error: false });