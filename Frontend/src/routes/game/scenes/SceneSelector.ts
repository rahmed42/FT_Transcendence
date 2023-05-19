import * as Phaser from "phaser"; // will import all the Phaser types

export class GameSelector extends Phaser.Scene {
	// Adding game parts list
	parts = {
		'1': "Original game",
		'2': "Modern game",
	};

	// GameSelector constructor
	constructor() {
		super({ key: "selector", active: true });
	}

	/* Optionnal constructor methods */
	// preload basic assets
	preload() {
		// setting background color
		this.cameras.main.setBackgroundColor(0x000000)
	}

	// create game parts list
	create() {
		// Text to display
		this.add.text(80, 50, 'Select your game type :', { font: '32px Arial', color: '#ffffff' });

		// adding game parts
		for (let gameType in this.parts) {
			if (this.parts.hasOwnProperty(gameType)) {
				const index = parseInt(gameType) - 1; // index of the game part
				const selector = this.parts[gameType as keyof typeof this.parts]; // name of the game part
				const textOptions = this.add.text(
					130, 150 + 70 * index, // position of the text
					`Game ${gameType}: ${selector}`, // text
					{ font: '24px Arial', color: '#ffffff' }); // text style

				// setting the text as interactive
				textOptions.setInteractive();

				// setting the text as clickable
				textOptions.on("pointerdown", () => { // set the event when the text is clicked
					this.runScene(`part${gameType}`); // run method to run the game part
				});
			}
		}
	}

	/* Methods */
	// run the game part selected by the user
	runScene(key: string) {
		console.log(`Running game ${key}`);
		this.scene.stop('selector'); // stop the selector
		this.scene.run(key); // run the game part selected

		// this.game.scene.switch('selector', key); // switch to the game part selected
	}

	// // Cleaning the game
	// gameCleanup() {
	// 	for (let gameType in this.parts) {
	// 		this.scene.stop(`part${gameType}`);// stop all the game parts
	// 		this.scene.remove(`part${gameType}`);// remove all the game parts
	// 	}
	// 	this.scene.stop('selector');// stop the selector
	// 	this.scene.remove('selector');// remove the selector
	// 	this.game.destroy(true);// destroy the allocated memory for the game
	// }
}