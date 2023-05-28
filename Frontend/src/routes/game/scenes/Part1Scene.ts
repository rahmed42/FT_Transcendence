import Phaser, { Textures } from "phaser";
import { Room, Client } from "colyseus.js";
import { BACKEND_URL } from "../backend";
import { user, type User } from '../../../stores/user';

// User getter
let currentUser: User | undefined;

//Style Default
import boardDefault from '$lib/assets/default/backgroundDefault.png';
import ballDefault from '$lib/assets/default/ballDefault.png';
import paddleDefault from '$lib/assets/default/paddleDefault.png';

export class Part1Scene extends Phaser.Scene {
	//room reference
	room: Room | undefined;

	// Players
	// we will assign each player visual representation here
	// by their `sessionId`
	playerEntities: { [sessionId: string]: Phaser.Types.Physics.Arcade.ImageWithDynamicBody } = {};

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
	localPaddle: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | undefined;
	remotePaddle: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | undefined;

	// Set Ball
	ball: Phaser.Types.Physics.Arcade.ImageWithDynamicBody | undefined;

	// Score
	myScoreText: Phaser.GameObjects.Text | undefined;
	opponentScoreText: Phaser.GameObjects.Text | undefined;

	//Starting button
	startButton: Phaser.GameObjects.Text | undefined;

	// Score values
	myScore: number;
	opponentScore: number;

	// scene reference
	activeScene: string;

	// Player Name
	myName: string;

	// Constructor of the scene
	constructor() {
		// active false to prevent the scene from starting automatically
		super({ key: "part1", active: false });
		this.activeScene = 'Part1Scene';

		// Initialize the room
		this.room = new Room("Original");
		console.log("Init %s Pong Room", this.room.name);

		// Initialize the game state
		this.myScore = 0;
		this.opponentScore = 0;

		const unsubscribe = user.subscribe((value) => {
			// update currentUser with last user value at store changes
			currentUser = value;
			console.log(user, value);
		});
	}

	// set the active scene
	setActiveScene(sceneName: string) {
		this.activeScene = sceneName;
	}

	// preload basic assets
	preload() {
		//Default style
		this.load.image('ballDefault', ballDefault);
		this.load.image('paddleDefault', paddleDefault);
		this.load.image('boardDefault', boardDefault);
	}

	async create() {
		//Get player name
		if (currentUser && currentUser.login)
			this.myName = currentUser.login;
		else
			this.myName = "Player";
		this.gameInit();

		// connect to the room
		await this.connect();

		// listen for new players in the room
		this.gameListeners();
	}

	// 	/* Methods */
	// Connect with the room
	async connect() {
		// add connection status text
		const connectionStatusText = this.add
			.text(0, 0, "Trying to connect with the server...")
			.setStyle({ color: "#ff0000" })
			.setPadding(4)

		const client = new Client(BACKEND_URL);

		try {
			this.room = await client.joinOrCreate("Original", {});
			console.log("%s - Connected to room: %s", this.myName, this.room.name);

			// connection successful!
			connectionStatusText.destroy();

			// // Wait to have 2 players in the room to begin
			// this.room.onMessage("start", () => {
			// 	this.startGame();
			// });

			//check the number of players in the room
			console.log(`We have ${this.room.state.players.size} players connected !`)
			if (this.room.state.players.size >= 2) {
				console.log("all players connected : start game")
				this.startGame();
			}

		} catch (e) {
			// couldn't connect
			connectionStatusText.text = "Could not connect with the server.";
		}
	}

	gameListeners(): void {
		if (!this.room) {
			console.log("No rooms !");
			return;
		}

		// Listen for new players
		// console.log(sessionId, player);
		this.room.state.players.onAdd((player, sessionId) => {
			// const { first_name } = currentUser;
			if (this.room && this.room.state.players.size <= 2) {
				const entity = this.physics.add.image(player.x, player.y, 'myPaddle');

				// keep a reference of it on `playerEntities`
				this.playerEntities[sessionId] = entity;

				// listening for server updates we need all the new coordinates at once with .onChange()
				player.onChange(() => {
					// update local position immediately
					entity.x = player.x;
					entity.y = player.y;
				});

				// set the remote paddle to follow the second player.
				if (this.room.state.players.size === 2) {
					// create remote paddle
					const remotePlayer = this.getRemotePlayer();
					if (remotePlayer) {
						this.createRemotePaddle(remotePlayer);
					}
				}
			}
		});

		// Listen for removed players
		this.room.state.players.onRemove((player, sessionId) => {
			if (this.room && this.room.state.players.size <= 2) {
				// remove player entity from scene
				const entity = this.playerEntities[sessionId];
				if (entity) {
					entity.destroy();
					delete this.playerEntities[sessionId];
				}

				// stop game if one player left
				if (this.room.state.players.size === 1) {
					this.stopGame();
				}
			}
		});

		// Listen for paddle updates from server
		this.room.state.paddle.onChange(() => {
			const remotePlayer = this.getRemotePlayer();
			if (remotePlayer && this.remotePaddle) {
				this.remotePaddle.y = remotePlayer.y;
			}
		});

		//   // Listen for ball updates from server
		//   this.room.state.ball.onChange(() => {
		// 	if (this.ball) {
		// 	  this.ball.x = this.room!.state.ball.x;
		// 	  this.ball.y = this.room!.state.ball.y;
		// 	}
		//   });

		//   // Listen for score updates from server
		//   this.room.state.scores.onChange(() => {
		// 	this.myScore = this.room!.state.scores[this.room!.sessionId];
		// 	this.opponentScore = this.room!.state.scores[
		// 	  this.getOpponentSessionId()
		// 	];

		// 	if (this.myScoreText && this.opponentScoreText) {
		// 	  this.myScoreText.setText(`Score: ${this.myScore}`);
		// 	  this.opponentScoreText.setText(`Opponent: ${this.opponentScore}`);
		// 	}
		//   });
	}

	// Game visual callbacks
	gameInit(): void {
		/* SETUP STYLES */
		// Display styled background
		const background = this.add.image(0, 0, 'boardDefault');
		background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
		background.setOrigin(0, 0);

		// Display ball
		this.ball = this.physics.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'ballDefault');
		this.ball.setOrigin(0.5, 0.5);

		// Display score
		this.myScoreText = this.add.text(this.cameras.main.centerX / 2, 40, '0', { fontSize: '60px', color: 'white' });
		this.opponentScoreText = this.add.text(this.cameras.main.centerX / 2 * 3, 40, '0', { fontSize: '60px', color: 'white' });

		//Init mouse pointer
		this.pointer = this.input.activePointer;
		this.pointer.y = 0;

		/* SETUP PHYSICS */
		// Add map bounds, disable collisions on left/right bounds
		this.physics.world.setBoundsCollision(false, false, true, true);
		this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);

		// Add ball physics
		if (this.ball) {
			this.ball.setCollideWorldBounds(true);
			this.ball.setBounce(1);
		}

		this.input.on('pointermove', () => {
			if (this.localPaddle)
				this.localPaddle.destroy();

			// if (this.remotePaddle)
			// 	this.remotePaddle.destroy();

			let posY;
			if (this.pointer)
				posY = this.pointer.y;
			else
				posY = this.cameras.main.centerY;

			// Display Paddle and set bounds
			const paddle = {
				'x': 20,
				'y': 100,
				'pos': posY,
			};
			this.localPaddle = this.physics.add.image(paddle.x, paddle.pos, 'paddleDefault');
			this.localPaddle.setOrigin(0.5, 0.5);
			this.localPaddle.setCollideWorldBounds(true);
			this.localPaddle.setImmovable(true);

			// this.remotePaddle = this.physics.add.image(this.cameras.main.width - paddle.x, this.cameras.main.centerY, 'paddleDefault');
			// this.remotePaddle.setOrigin(0.5, 0.5);
			// this.remotePaddle.setCollideWorldBounds(true);
			// this.remotePaddle.setImmovable(true);

			if (this.ball && this.localPaddle
				//  && this.remotePaddle
			) {
				// Add collisions between ball and paddles
				this.physics.add.collider(this.ball, this.localPaddle);
				// this.physics.add.collider(this.ball, this.remotePaddle);
			}
		});

		/* Adding Menu button */
		const homeButton = this.add.image(this.cameras.main.centerX, 25, 'button');
		homeButton.setScale(0.4);
		homeButton.setOrigin(0.5, 0.5);

		// setting the text as interactive
		homeButton.setInteractive();

		// adding text on button
		const homeButtonText = this.add.text(this.cameras.main.centerX, 25, 'Menu', { font: '32px Arial', color: '#ffffff' });
		homeButtonText.setOrigin(0.5, 0.5);

		// Add a hover effect when the mouse is over the button
		homeButton.on('pointerover', () => {
			homeButton.setScale(0.38); // Change scale to reduce size effect
			homeButtonText.setScale(0.95);
			// set text color to dark white
			homeButtonText.setColor('#E8E8E8');
		});

		homeButton.on('pointerout', () => {
			homeButton.setScale(0.4);
			homeButtonText.setScale(1);
			// set text color to white
			homeButtonText.setColor('#FFFFFF');
		});

		// Add a pointerdown event to go back to the menu
		homeButton.on("pointerdown", () => {
			this.resetGame();
			this.myScore = 0;
			this.opponentScore = 0;
			// Refresh the score
			if (this.myScoreText)
				this.myScoreText.setText(this.myScore.toString());
			if (this.opponentScoreText)
				this.opponentScoreText.setText(this.opponentScore.toString());
			this.setActiveScene("menu");
			//console.log(`Running game ${this.activeScene} : Menu`);
			this.game.scene.switch("part1", "menu");
		});

		// Adding start button for the Game
		this.startButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Start Game', { font: '64px Arial', color: '#ffffff' });
		this.startButton.setOrigin(0.5, 0.5);
		this.startButton.setInteractive();

		this.startButton.on("pointerdown", () => {
			// Start the game
			if (this.startButton) {
				this.startButton.setVisible(false);
				this.startButton.disableInteractive();
			}
			this.startGame();
		});
	}

	// Game logics
	resetBall(): void {
		/* Refresh Score */
		if (this.myScoreText)
			this.myScoreText.setText(this.myScore.toString());
		if (this.opponentScoreText)
			this.opponentScoreText.setText(this.opponentScore.toString());

		if (this.ball) {
			// set the ball to center
			this.ball.x = this.cameras.main.centerX;
			this.ball.y = this.cameras.main.centerY;

			// Launch the ball to random direction
			let velocityX = Phaser.Math.Between(300, 450);
			let velocityY = Phaser.Math.Between(200, 350);

			// random negative or positive
			velocityX *= Math.random() < 0.5 ? 1 : -1;
			velocityY *= Math.random() < 0.5 ? 1 : -1;
			this.ball.setVelocity(velocityX, velocityY);
		}
	}

	startGame(): void {
		// Reset score
		this.myScore = 0;
		this.opponentScore = 0;

		// Reset ball
		this.resetBall();
	}

	resetGame(): void {
		// Reset ball and stop it
		if (this.ball) {
			this.resetBall();
			this.ball.setVelocity(0);
		}
		// Show start button
		if (this.startButton) {
			this.startButton.setVisible(true);
			this.startButton.setInteractive();
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
		if (this.ball && (this.ball.x < 0 || this.ball.x > this.cameras.main.width)) {
			if (this.ball.x < 0)
				this.opponentScore++;
			else
				this.myScore++;

			if (this.myScore >= 3 || this.opponentScore >= 3)
				this.resetGame();
			else
				this.resetBall();
		}
		// send pointer position to server
		// this.inputPayload.x = this.input.x;
		// this.room.send(0, this.inputPayload);
	}
}
