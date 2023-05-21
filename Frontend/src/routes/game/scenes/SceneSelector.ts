import * as Phaser from "phaser"; // will import all the Phaser types

// To import images in assets folder

//Style modern
import ballStyle1 from '$lib/assets/style1/Ball.png';
import myPaddleStyle1 from '$lib/assets/style1/Player.png';
import opponentPaddleStyle1 from '$lib/assets/style1/Computer.png';
import boardStyle1 from '$lib/assets/style1/Board.png';

export class GameSelector extends Phaser.Scene {
	// Adding game parts list
	parts = {
		'1': "Original",
		'2': "Modern",
	};

	// scene reference
	activeScene: string;

	// GameSelector constructor
	constructor() {
		// console.log("SceneSelector constructor");
		super({ key: "menu", active: true });
		this.activeScene = 'selectorScene';
	}

	// set the active scene
	setActiveScene(sceneName: string) {
		this.activeScene = sceneName;
	}

	/* Optionnal constructor methods */
	// preload basic assets
	preload() {
		// setting background color
		this.cameras.main.setBackgroundColor(0x004C99)

		this.load.image('ballStyle1', ballStyle1);
		this.load.image('myPaddleStyle1', myPaddleStyle1);
		this.load.image('opponentPaddleStyle1', opponentPaddleStyle1);
		this.load.image('boardStyle1', boardStyle1);
	}

	// create game parts list
	create() {
		/* Phaser API Doc : https://newdocs.phaser.io/docs/3.60.0/Phaser.Types.GameObjects.Text */
		// Text to display
		const title = '42 PONG';
		const centerX = this.cameras.main.centerX;
		const centerY = this.cameras.main.centerY;
		const spanY = centerY / 4;

		// Text style display
		const titleText = this.add.text(centerX, spanY * 2, title, { font: '55px Arial', color: '#ffffff' });

		// Define center of text object
		titleText.setOrigin(0.5, 0.5);

		// adding game parts
		for (let gameType in this.parts) {
			if (this.parts.hasOwnProperty(gameType)) {
				const index = parseInt(gameType) + 3; // index of the game part
				const selector = this.parts[gameType as keyof typeof this.parts]; // name of the game part

				const button = this.add.text(
					centerX, spanY * index, // position of the text
					`🏓 ${selector} 🏓`, // text
					{ font: '32px Arial', color: '#ffffff' }); // text style

				// Define the center of the text
				button.setOrigin(0.5, 0.5);

				// setting the text as interactive
				button.setInteractive();

				// Button style
				button.setStyle({
					backgroundColor: '#007fff',
				});

				// Add a hover effect when the mouse is over the button
				button.on('pointerover', () => {
					button.setScale(0.90); // Change scale to reduce size effect
					button.setStyle({ backgroundColor: '#0055ff' });
				});

				button.on('pointerout', () => {
					button.setScale(1);
					button.setStyle({ backgroundColor: '#007fff' });
				});

				// setting the text as clickable
				button.on("pointerdown", () => { // set the event when the text is clicked
					this.setActiveScene(`part${gameType}`); // set the active scene
					// console.log(`Running game ${this.activeScene} : ${selector} Pong`);
					this.runScene(this.activeScene); // run the scene
				});
			}
		}
	}

	/* Methods */
	// run the game part selected by the user
	runScene(sceneName: string) {
		this.game.scene.switch('menu', sceneName); // switch to the game part selected
	}
}