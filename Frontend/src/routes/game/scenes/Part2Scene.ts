import Phaser from "phaser";
import { Room, Client } from "colyseus.js";
import { BACKEND_URL } from "../backend";

export class Part2Scene extends Phaser.Scene {
	//room reference
	room: Room;

	// // player reference (local player)
	// currentPlayer: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | undefined;
	// playerEntities: { [sessionId: string]: Phaser.Types.Physics.Arcade.ImageWithDynamicBody } = {};

	// // mouse pointer
	// pointer: Phaser.Input.Pointer | undefined;

	// // local input cache
	// inputPayload = {
	// 	// left: false,
	// 	// right: false,
	// 	up: false,
	// 	down: false,
	// };

	// scene reference
	activeScene: string;

	// Constructor of the scene
	constructor() {
		// active false to prevent the scene from starting automatically
		console.log("Part2Scene constructor");
		super({ key: "part2", active: false });
		this.activeScene = 'Part2Scene';

				// Initialize the room
				this.room = new Room("part2_room");
				console.log(this.room);
	}

	// set the active scene
	setActiveScene(sceneName: string) {
		this.activeScene = sceneName;
	}

	// // preload basic assets
	// preload() {
	// 	console.log("Part2Scene preload");

	// 	// Adding background color
	// 	this.cameras.main.setBackgroundColor(0x000000);


	// 	// // preload pong assets
	// 	// this.load.image('ball', '../assets/style1/Ball.png');
	// 	// this.load.image('myPaddle', '../assets/style1/Player.png');
	// 	// this.load.image('opponentPaddle', '../assets/style1/Computer.png');
	// }

	// create the game
	async create() {
		console.log("Part2Scene create");

		// adding vertical white dotted line to separate the two games
		this.add.line(400, 0, 400, 0, 400, 600, 0xffffff);

		// Adding Home menu button
		const homeButton = this.add.text(this.cameras.main.centerX, 18, 'Menu', { font: '32px Arial', color: '#ffffff' });

		// Define the center of the text
		homeButton.setOrigin(0.5, 0.5);

		// setting the text as interactive
		homeButton.setInteractive();

		// button style
		homeButton.setStyle({
			backgroundColor: '#007fff',
		});

		// Add a hover effect when the mouse is over the button
		homeButton.on('pointerover', () => {
			homeButton.setScale(0.90); // Change scale to reduce size effect
			homeButton.setStyle({ backgroundColor: '#0055ff' });
		});

		homeButton.on('pointerout', () => {
			homeButton.setScale(1);
			homeButton.setStyle({ backgroundColor: '#007fff' });
		});

		// Add a pointerdown event to go back to the menu
		homeButton.on("pointerdown", () => {
			this.setActiveScene("menu");
			console.log(`Running game ${this.activeScene} : Menu`);
			this.game.scene.switch("part2", "menu");
		});

		// 	//get the mouse pointer
		// 	this.pointer = this.input.activePointer;

		// 	// connect with the room
		// 	await this.connect();

		// 	// Listen for new players
		// 	this.room.state.players.onAdd((player, sessionId) => {
		// 		/* Player one */
		// 		// create a new player entity
		// 		const entity = this.physics.add.image(player.x, player.y, 'myPaddle');

		// 		// keep a reference of it on `playerEntities`
		// 		this.playerEntities[sessionId] = entity;

		// 		// listening for server updates we need all the new coordinates at once with .onChange()
		// 		player.onChange(() => {
		// 			// update local position immediately
		// 			entity.x = player.x;
		// 			entity.y = player.y;
		// 		});

		// 		/* Player two */
		// 		// create second player entity
		// 		const opponentEntity = this.physics.add.image(player.x, player.y, 'opponentPaddle');

		// 		// keep a reference of it on `playerEntities`
		// 		this.playerEntities[sessionId] = opponentEntity;

		// 		// listening for server updates we need all the new coordinates at once with .onChange()
		// 		player.onChange(() => {
		// 			// update local position immediately
		// 			opponentEntity.x = player.x;
		// 			opponentEntity.y = player.y;
		// 		});

		// 		// listen for ball updates
		// 		this.room.state.ball.onChange(() => {
		// 			// update local position immediately
		// 			ball.x = this.room.state.ball.x;
		// 			ball.y = this.room.state.ball.y;
		// 		});

		// 		// listen for score updates
		// 		this.room.state.score.onChange(() => {
		// 			// update local position immediately
		// 			scoreText.setText(`Score: ${this.room.state.score.player1} - ${this.room.state.score.player2}`);
		// 		});

		// 		// listen for game over
		// 		this.room.state.gameOver.onChange(() => {
		// 			// update local position immediately
		// 			if (this.room.state.gameOver) {
		// 				gameOverText.setText(`Game Over!`);
		// 			}
		// 		});

		// 		// Removing disconnected players
		// 		// remove local reference when entity is removed from the server
		// 		this.room.state.players.onRemove((player, sessionId) => {
		// 			const entity = this.playerEntities[sessionId];
		// 			if (entity) {
		// 				// destroy entity
		// 				entity.destroy();
		// 				// clear local reference
		// 				delete this.playerEntities[sessionId]
		// 			}
		// 		});

		// 		// Camera settings
		// 		this.cameras.main.setBounds(0, 0, 800, 600);
	}

	// 	/* Methods */
	// 	// Connect with the room
	// 	async connect() {
	// 		// add connection status text
	// 		const connectionStatusText = this.add
	// 			.text(0, 0, "Trying to connect with the server...")
	// 			.setStyle({ color: "#ff0000" })
	// 			.setPadding(4)

	// 		const client = new Client(BACKEND_URL);

	// 		try {
	// 			this.room = await client.joinOrCreate("part1_room", {});

	// 			// connection successful!
	// 			connectionStatusText.destroy();

	// 		} catch (e) {
	// 			// couldn't connect
	// 			connectionStatusText.text = "Could not connect with the server.";
	// 		}
	// 	}

	// /**
	//  * At every update() tick, we are going to update the
	//  * local inputPayload, and send it as a message to the server.
	//  */
	// 	update(time: number, delta: number): void {
	// 		// skip loop if not connected with room yet.
	// 		if (!this.room) {
	// 			return;
	// 		}

	// 		// send pointer to the server
	// 		// this.inputPayload.pointerX = this.pointer.x;
	// 		this.inputPayload.pointerY = this.pointer.y;
	// 		this.room.send(0, this.inputPayload);
	// 	}
}