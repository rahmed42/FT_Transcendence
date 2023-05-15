import { dev } from '$app/environment';

// we don't need any JS on this page, though we'll load
// it in dev so that we get hot module replacement
export const csr = dev;

// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const prerender = true;

import Phaser from "phaser";

// Monitoring on : http://localhost:2567/colyseus/

import { SceneSelector } from "./scenes/SceneSelector";
import { Part1Scene } from "./scenes/Part1Scene";
// import { Part2Scene } from "./scenes/Part2Scene";
// import { Part3Scene } from "./scenes/Part3Scene";
// import { Part4Scene } from "./scenes/Part1Scene";

import { BACKEND_HTTP_URL } from "./backend";

/**
 * game config
*/
const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	fps: {
		target: 60,
		forceSetTimeOut: true,
		smoothStep: false,
	},
	width: 800,
	height: 600,
	// height: 200,
	backgroundColor: 0x37474f,
	parent: 'pong',
	physics: {
		default: "arcade"
	},
	pixelArt: true,
	scene: [SceneSelector, Part1Scene],
	// scene: [SceneSelector, Part1Scene, Part2Scene, Part3Scene, Part4Scene],
	// scene: [ GameScene ],
};

/**
 * instantiate the game
 */
const game = new Phaser.Game(config);
