import * as Phaser from "phaser"; // will import all the Phaser types

// To import images in assets folder
// Menu
import logo from '$lib/images/42PongLogo.png';
import button from '$lib/assets/buttons/blue.png';
import backgroundMenu from '$lib/images/backArcade.jpg';

import boardLink from '$lib/assets/boards/boardModern.png';
import ballLink from '$lib/assets/balls/ballGold.png';
import myPaddleLink from '$lib/assets/paddles/myPaddle/mypaddlePink.png';
import otherPaddleLink from '$lib/assets/paddles/otherPaddle/otherpaddleOrange.png';

//Skins to export
export const skins = [
	{ name: 'boardSkin', src: boardLink },
	{ name: 'ballSkin', src: ballLink },
	{ name: 'myPaddleSkin', src: myPaddleLink },
	{ name: 'otherPaddleSkin', src: otherPaddleLink },
];

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

	/* Methods */
	// run the game part selected by the user
	runScene(sceneName: string) {
		this.game.scene.switch('menu', sceneName); // switch to the game part selected
	}

	// set the active scene
	setActiveScene(sceneName: string) {
		this.activeScene = sceneName;
	}

	/* Optionnal constructor methods */
	// preload basic assets
	preload() {
		// loading background
		this.load.image('backgroundMenu', backgroundMenu);
		this.load.image('logo', logo);

		// loading button
		this.load.image('button', button);
	}

	// create game parts list
	create() {
		// Define camera size
		this.cameras.main = this.cameras.add(0, 0, this.game.config.width, this.game.config.height, true, 'menu');

		//Background
		const background = this.add.image(0, 0, 'backgroundMenu');
		background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
		background.setOrigin(0, 0);

		/* Phaser API Doc : https://newdocs.phaser.io/docs/3.60.0/Phaser.Types.GameObjects.Text */
		// Text to display
		//const title = '42 PONG';
		const centerX = this.cameras.main.centerX;
		const centerY = this.cameras.main.centerY;
		const spanY = centerY / 4;

		const logo = this.add.image(centerX, spanY * 3, 'logo');
		//logo.setScale(0.5);
		logo.setOrigin(0.4, 0.5);

		// Text style display
		//const titleText = this.add.text(centerX, spanY * 2, title, { font: '55px Arial', color: '#ffffff' });

		// Define center of text object
		//titleText.setOrigin(0.5, 0.5);

		// adding game parts
		for (let gameType in this.parts) {
			if (this.parts.hasOwnProperty(gameType)) {
				const index = parseInt(gameType) + 4; // index of the game part
				const selector = this.parts[gameType as keyof typeof this.parts]; // name of the game part

				//button settings
				const button = this.add.image(centerX, spanY * index, 'button');
				button.setScale(0.5);
				button.setOrigin(0.5, 0.5);

				// setting the button as interactive
				button.setInteractive();

				// adding text on button
				const buttonText = this.add.text(
					centerX, spanY * index, // position of the text
					`${selector}`, // text
					{ font: '32px Arial', color: '#ffffff' }); // text style

				// Define the center of the text
				buttonText.setOrigin(0.5, 0.5);

				// Add a hover effect when the mouse is over the button
				button.on('pointerover', () => {
					button.setScale(0.48); // Change scale to reduce size effect
					buttonText.setScale(0.95);
					// set text color to dark white
					buttonText.setColor('#E8E8E8');
				});

				button.on('pointerout', () => {
					button.setScale(0.5);
					buttonText.setScale(1);
					// set text color to white
					buttonText.setColor('#FFFFFF');
				});

				// setting the text as clickable
				button.on("pointerdown", () => { // set the event when the text is clicked
					this.setActiveScene(`Part${gameType}`); // set the active scene
					// console.log(`Running game ${this.activeScene} : ${selector} Pong`);
					this.runScene(this.activeScene); // run the scene
				});
			}
		}
	}


}