// Svelte stores are used to store data that can be used across components.

import { writable } from 'svelte/store';

export const isUserLoggedIn = writable(false);
export const userName = writable('--Login--');
