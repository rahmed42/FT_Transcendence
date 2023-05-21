import Phaser from "phaser";
import { Room, Client } from "colyseus.js";
import { BACKEND_URL } from "../backend";

export class Part1Scene extends Phaser.Scene {
	//room reference
	room: Room | undefined;

	// // player reference (local player)
	// currentPlayer: Phaser.Types.Physics.Arcade.ImageWithDynamicBody = this.physics.add.image(400, 300, 'ship_0001');
	// playerEntities: { [sessionId: string]: Phaser.Types.Physics.Arcade.ImageWithDynamicBody } = {};

	// mouse pointer
	pointer: Phaser.Input.Pointer | undefined;

	// local input cache
	inputPayload = {
		left: false,
		right: false,
		up: false,
		down: false,
	};

	// Set Paddle
	// localPaddle: Phaser.GameObjects.Rectangle | undefined;
	localPaddle: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | undefined;
	// remotePaddle: Phaser.GameObjects.Rectangle | undefined;
	remotePaddle: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | undefined;

	// Set Ball
	// ball: Phaser.Physics.Arcade.Image | undefined; //Phaser.GameObjects.Rectangle |undefined;
	ball: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | undefined;

	// Score
	myScoreText: Phaser.GameObjects.Text | undefined;
	opponentScoreText: Phaser.GameObjects.Text | undefined;
	// Score values
	myScore: number = 0;
	opponentScore: number = 0;

	// scene reference
	activeScene: string;

	// Constructor of the scene
	constructor() {
		// active false to prevent the scene from starting automatically
		console.log("Part1Scene constructor");
		super({ key: "part1", active: false });
		this.activeScene = 'Part1Scene';

		// Initialize the room
		this.room = new Room("part1_room");
		console.log(this.room);

		// Initialize the player
		// this.player = this.physics.add.image(400, 300, 'ship_0001');
	}

	// set the active scene
	setActiveScene(sceneName: string) {
		this.activeScene = sceneName;
	}

	// // preload basic assets
	// preload() {
	// 	console.log("Part1Scene preload");
	// 	// Adding background color
	// 	// this.cameras.main.setBackgroundColor(0x000000);

	//load game assets

	// 	// // preload pong assets
	// 	// this.load.image('ball', '../assets/style1/Ball.png');
	// 	// this.load.image('myPaddle', '../assets/style1/Player.png');
	// 	// this.load.image('opponentPaddle', '../assets/style1/Computer.png');
	// }

	async create() {
		this.gameUpdater();

		// add a start button
		const startButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Start Game', { font: '32px Arial', color: '#ffffff' });

		// start the game
		startButton.setInteractive();
		startButton.on("pointerdown", () => {
			// Hide the button
			startButton.setVisible(false);
			// Reset the game
			this.resetGame();
		});

		// connect with the room
		// await this.connect();

		// listen for new players
		// this.room.state.players.onAdd((player, sessionId) => {
		// 	console.log("New player joined with sessionId ", player, sessionId);

		// 	const entity = this.physics.add.image(player.x, player.y, 'ship_0001');

		// 	// keep a reference of it on `playerEntities`
		// 	this.playerEntities[sessionId] = entity;

		// 	// listening for server updates we need all the new coordinates at once with .onChange()
		// 	player.onChange(() => {
		// 		//
		// 		// update local position immediately
		// 		// (WE WILL CHANGE THIS ON PART 2)
		// 		//
		// 		entity.x = player.x;
		// 		entity.y = player.y;
		// 	});
		// });



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
	// Game visual callbacks
	gameUpdater(): void {
		/* SETUP STYLES */
		// Display styled background
		const background = this.add.image(0, 0, 'boardStyle1');
		background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
		background.setOrigin(0, 0);

		// Display ball
		this.ball = this.physics.add.image(400, 300, 'ballStyle1');
		this.ball.setOrigin(0.5, 0.5);

		// Display score
		this.myScoreText = this.add.text(this.cameras.main.centerX / 2, 40, '0', { fontSize: '60px', color: 'white' });
		this.opponentScoreText = this.add.text(this.cameras.main.centerX / 2 * 3, 40, '0', { fontSize: '60px', color: 'white' });

		//Init mouse pointer
		this.pointer = this.input.activePointer;
		this.pointer.y = 0;

		/* SETUP PHYSICS */
		// Add map bounds, disable collisions on left/right bounds
		this.physics.world.setBoundsCollision(true, true, true, true);
		this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);

		// Add ball physics
		if (this.ball) {
			this.ball.setCollideWorldBounds(true);
			this.ball.setBounce(1);
			this.ball.setVelocityX(Phaser.Math.Between(-100, 100));
			this.ball.setVelocityY(Phaser.Math.Between(-100, 100));
		}

		this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
			if (this.localPaddle)
				this.localPaddle.destroy();

			if (this.remotePaddle)
				this.remotePaddle.destroy();

			// Display Paddle and set bounds
			const paddle = {
				'x': 20,
				'y': 100,
				'pos': this.pointer.y
			};

			this.localPaddle = this.physics.add.image(paddle.x / 2, paddle.pos, 'myPaddleStyle1');
			this.localPaddle.setOrigin(0.5, 0.5);
			this.localPaddle.setCollideWorldBounds(true);

			this.remotePaddle = this.physics.add.image(this.cameras.main.width - paddle.x / 2, paddle.pos, 'opponentPaddleStyle1');
			this.remotePaddle.setOrigin(0.5, 0.5);
			this.remotePaddle.setCollideWorldBounds(true);
		});

		if (this.ball && this.localPaddle && this.remotePaddle) {
			// Add collisions
			this.physics.add.collider(this.ball, this.localPaddle, this.hitPaddle, undefined, this);
			this.physics.add.collider(this.ball, this.remotePaddle, this.hitPaddle, undefined, this);
		}

		/* Adding Menu button */
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
			this.game.scene.switch("part1", "menu");
		});

		/* Refresh Score */
		if (this.myScoreText)
			this.myScoreText.setText(this.myScore.toString());
		if (this.opponentScoreText)
			this.opponentScoreText.setText(this.opponentScore.toString());

	}
	// Game logics
	hitPaddle(): void {
		let diff = 0;

		if (this.ball.x < this.localPaddle.x) {
			// Ball is on the left-hand side of the paddle
			diff = this.localPaddle.x - this.ball.x;
			this.ball.setVelocityX(-10 * diff);
		} else if (this.ball.x > this.localPaddle.x) {
			// Ball is on the right-hand side of the paddle
			diff = this.ball.x - this.localPaddle.x;
			this.ball.setVelocityX(10 * diff);
		} else {
			// Ball is perfectly in the middle
			// Add a little random X to stop it bouncing straight up!
			this.ball.setVelocityX(2 + Math.random() * 8);
		}
	}

	resetBall(): void {
		if (this.ball) {
			// set the ball to center
			this.ball.x = this.cameras.main.centerX;
			this.ball.y = this.cameras.main.centerY;

			// Launch the ball to random direction
			this.ball.setVelocityX(Phaser.Math.Between(-100, 100));
			this.ball.setVelocityY(Phaser.Math.Between(-100, 100));

			// set the ball speed
			// this.ball.setAccelerationX(100);
			this.ball.setAcceleration(100);
		}
	}

	resetGame(): void {
		// Reset score
		this.myScore = 0;
		this.opponentScore = 0;

		// Refresh the score
		if (this.myScoreText)
			this.myScoreText.setText(this.myScore.toString());
		if (this.opponentScoreText)
			this.opponentScoreText.setText(this.opponentScore.toString());

		// Reset ball
		if (this.ball)
			this.resetBall();
	}

	// Connect with the room
	async connect() {
		// add connection status text
		const connectionStatusText = this.add
			.text(0, 0, "Trying to connect with the server...")
			.setStyle({ color: "#ff0000" })
			.setPadding(4)

		const client = new Client(BACKEND_URL);

		try {
			this.room = await client.joinOrCreate("part1_room", {});

			// connection successful!
			connectionStatusText.destroy();

		} catch (e) {
			// couldn't connect
			connectionStatusText.text = "Could not connect with the server.";
		}
	}

	/**
	 * At every update() tick, we are going to update the
	 * local inputPayload, and send it as a message to the server.
	 */
	update(time: number, delta: number): void {
		// skip loop if not connected with room yet.
		if (!this.room) {
			return;
		}

		// Reset the ball if outbounds
		if (this.ball && (this.ball.y < 0 || this.ball.y > this.cameras.main.height)) {
			this.resetBall();
		}
		// send pointer to the server
		// this.inputPayload.pointerX = this.pointer.x;
		// this.inputPayload.pointerY = this.pointer.y;
		// this.room.send(0, this.inputPayload);
	}
}
