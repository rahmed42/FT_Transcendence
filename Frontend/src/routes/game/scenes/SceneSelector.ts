import * as Phaser from "phaser"; // will import all the Phaser types

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


        this.load.image('ship_0001', 'https://cdn.glitch.global/3e033dcd-d5be-4db4-99e8-086ae90969ec/ship_0001.png?v=1649945243288');

		//adding image background
		// this.load.image('pongAnim', 'https://static.vecteezy.com/system/resources/thumbnails/002/082/105/small/hud-ui-gui-futuristic-user-interface-screen-elements-high-tech-screen-for-video-game-sci-fi-concept-design-vector.jpg');
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