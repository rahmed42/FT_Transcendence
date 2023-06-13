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

	//Start state
	startState: boolean;

	// local input cache
	inputPayload: any = {
		y: 400,
		start: false,
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
	myName: string | undefined;


	// Constructor of the scene
	constructor() {
		// console.log("Part1Scene constructor");
		// active false to prevent the scene from starting automatically
		super({ key: "part1", active: false });
		this.activeScene = 'Part1Scene';

		// Initialize the room
		this.room = new Room("Original");
		// console.log("Init %s Pong Room", this.room.name);

		// Initialize the game state
		this.myScore = 0;
		this.opponentScore = 0;

		// Init start state
		this.startState = false;

		//init inputPayload
		// this.inputPayload.y = 400;
		// this.inputPayload.start = false;

		const unsubscribe = user.subscribe((value) => {
			// update currentUser with last user value at store changes
			currentUser = value;
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
		// Define camera size
		this.cameras.main = this.cameras.add(0, 0, this.game.config.width as number, this.game.config.height as number, false, 'Original');

		//Get player name
		if (currentUser && currentUser.login)
			this.myName = currentUser.login; // To fetch from DB / discard current stored user
		else
			this.myName = "Player";
		this.gameInit();

		// connect to the room
		await this.connect();

		// listen for new players in the room
		this.gameListeners();

	}

	// Connect with the room
	async connect() {
		// add connection status text
		const connectionStatusText = this.add
			.text(50, 0, "Trying to connect \nwith the server...")
			.setStyle({ color: "#ff0000" })
			.setPadding(4)

		const client = new Client(BACKEND_URL);

		try {
			this.room = await client.joinOrCreate("Original", {});
			console.log("User : %s - Connected to game : %s", this.myName, this.room.name);

			// connection successful!
			connectionStatusText.destroy();
		} catch (e) {
			console.error("Error connecting to room: ", e);
			connectionStatusText.setText("Connection error.\nPlease try again later.");
		}
	}

	// 	/* Methods */
	// Game visual Init
	gameInit(): void {
		/* SETUP STYLES */
		// Display styled background
		const background = this.add.image(0, 0, 'boardDefault');
		background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
		background.setOrigin(0, 0);

		// Display ball
		this.ball = this.physics.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'ballDefault');
		this.ball.setOrigin(0.5, 0.5);
		this.ball.setVisible(false);

		// Display score
		this.myScoreText = this.add.text(this.cameras.main.centerX / 2, 40, '0', { fontSize: '60px', color: 'white' });
		this.opponentScoreText = this.add.text(this.cameras.main.centerX / 2 * 3, 40, '0', { fontSize: '60px', color: 'white' });

		//Init mouse pointer
		this.pointer = this.input.activePointer;
		this.pointer.y = this.cameras.main.centerY;

		/* SETUP PHYSICS */
		// Add map bounds, disable collisions on left/right bounds
		this.physics.world.setBoundsCollision(false, false, true, true);
		this.physics.world.setBounds(0, 0, this.cameras.main.width, this.cameras.main.height);

		// Add ball physics
		if (this.ball) {
			this.ball.setCollideWorldBounds(true);
			this.ball.setBounce(1);
		}

		/* Adding Menu button */
		const homeButton = this.add.image(this.cameras.main.centerX, 25, 'button');
		homeButton.setScale(0.4);
		homeButton.setOrigin(0.5, 0.5);
		//set menu button semi transparent

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
			// delete Paddles if exists
			if (this.localPaddle) {
				this.localPaddle.destroy();
				this.localPaddle = undefined;
			}
			if (this.remotePaddle) {
				this.remotePaddle.destroy();
				this.remotePaddle = undefined;
			}
			// console.log("after delete Paddles", this.localPaddle, this.remotePaddle);
			this.setActiveScene("menu");
			// Stop the current scene (part1)
			this.scene.stop('part1');
			// console.log(`Going back to ${this.activeScene}`);
			// Start the menu scene
			this.scene.start('menu')
			if (this.room)
				this.leave(this.room);
		});
	}

	createLocalPaddle(): void {
		let posY;
		if (this.pointer)
			posY = this.pointer.y;
		else
			posY = this.cameras.main.centerY;

		// Display Paddle and set bounds
		const paddle = {
			'x': 20,
			'pos': posY,
		};
		this.localPaddle = this.physics.add.image(paddle.x, paddle.pos, 'paddleDefault');
		this.localPaddle.setOrigin(0.5, 0.5);
		this.localPaddle.setCollideWorldBounds(true);
		this.localPaddle.setImmovable(true);

		if (this.ball && this.localPaddle) {
			// Add collisions between ball and paddles
			this.physics.add.collider(this.ball, this.localPaddle);
		}
		this.input.on('pointermove', () => {
			if (this.localPaddle && this.pointer)
				this.localPaddle.y = this.pointer.y;
		});
	}

	createRemotePaddle(): void {
		let posY;
		if (this.pointer)
			posY = this.pointer.y;
		else
			posY = this.cameras.main.centerY;

		// Display Paddle and set bounds
		const paddle = {
			'x': 20,
			'pos': posY,
		};
		this.remotePaddle = this.physics.add.image(this.cameras.main.width - paddle.x, this.cameras.main.centerY, 'paddleDefault');
		this.remotePaddle.setOrigin(0.5, 0.5);
		this.remotePaddle.setCollideWorldBounds(true);
		this.remotePaddle.setImmovable(true);

		if (this.ball && this.remotePaddle) {
			// Add collisions between ball and paddles
			this.physics.add.collider(this.ball, this.remotePaddle);
		}

		//GET remote position from server update when sync OK
		//...

		//TEMP to test match
		this.input.on('pointermove', () => {
			// this.remotePaddle.y = this.pointer.y;
		});
	}

	// Game listeners
	gameListeners(): void {
		//https://learn.colyseus.io/phaser/1-basic-player-movement.html
		// Listen for new players
		this.room.state.players.onAdd((player, sessionId) => {
			if (this.room && this.room.state.players.size <= 2) {
				// console.log("Paddles", this.localPaddle, this.remotePaddle);

				//Setup my Paddle
				if (this.localPaddle === undefined) {
					// console.log("Create Local Paddle", this.localPaddle);
					this.createLocalPaddle();

					//Keep reference to this remote Paddle
					const entity = this.localPaddle!;
					this.playerEntities[sessionId] = entity;
					// console.log("Local Entity : ", entity);
					// console.log("Local Player Y: ", player.y);

					// Listen for changes and push it to backend
					// player.onChange = () => {
					// 	console.log("local change", entity.y, player.y);
					// 	// entity.y = player.y
					// }
				}

				// waiting for other player
				if (this.room.state.players.size === 1) {
					// Start the animation loop if there is only one player
					this.startButtonText("Waiting for duel", false);
					this.startAnim();
				}

				// Second player added
				if (this.room.state.players.size === 2) {
					// Setup his paddle
					if (this.remotePaddle === undefined) {
						// console.log("Create Remote Paddle", this.remotePaddle);
						this.createRemotePaddle();

						// Keep reference to this remote Paddle
						const entity = this.remotePaddle!;
						this.playerEntities[sessionId] = entity;

						//Triggered when 'y' property changes
						player.listen("y", (value: number) => {
							// console.log("remote y", value);
							if (this.remotePaddle)
								this.remotePaddle.y = value;
						});

						// wait starting message from server
						this.room.onMessage("start", (start : boolean) => {
							console.log("started client from broadcast ", start);
							if (start === true)
								this.startMatch();
						});
					}
					// Set start clickable button
					this.startButtonText("🏓 Start Game 🏓", true);
					this.startAnim();
				}
			}
		});

		// Listen for removed players
		this.room.state.players.onRemove((player, sessionId) => {
			// console.log("onRemove ", sessionId);
			// delete Paddles if exists
			if (this.localPaddle) {
				this.localPaddle.destroy();
				this.localPaddle = undefined;
			}
			if (this.remotePaddle) {
				this.remotePaddle.destroy();
				this.remotePaddle = undefined;
			}
			// If the other player leaves the game we have to stop the game
			if (this.room && this.room.state.players.size < 2) {
				// remove player entity from scene
				const entity = this.playerEntities[sessionId];
				if (entity) {
					// console.log("remote entity ", entity);
					entity.destroy();
					delete this.playerEntities[sessionId];
				}
				// Kick the last player
				if (this.room.state.players.size === 1) {
					this.leave(this.room);
					alert("The other player left ! Back to the menu...");
					this.setActiveScene("menu");
					// console.log(`Going back to ${this.activeScene}`);
					this.scene.stop('part1');
					this.scene.start('menu')
				}
			}
		});

		// // Listen for paddle updates from server
		// this.room.state.paddle.onChange(() => {
		// 	const remotePlayer = this.getRemotePlayer();
		// 	if (remotePlayer && this.remotePaddle) {
		// 		this.remotePaddle.y = remotePlayer.y;
		// 	}
		// });

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

	// Utils
	countDown(): void {
		//Count from 3 to 0 each second then pop & reset the ball
		this.startButtonText("3", false);
		//wait 1 second
		this.time.delayedCall(1000, () => {
			this.startButtonText("2", false);
			this.time.delayedCall(1000, () => {
				this.startButtonText("1", false);
				this.time.delayedCall(1000, () => {
					this.startButtonText("GO !", false);
					this.time.delayedCall(1000, () => {
						this.startButton?.destroy();
						this.ball?.setVisible(true);
						this.resetBall();
					});
				});
			});
		});
	}

	startAnim(): void {
		// Create a wait animation using Phaser's tweens or animations
		//https://newdocs.phaser.io/docs/3.52.0/Phaser.Tweens.Events.TWEEN_YOYO
		const startAnimation = this.tweens.add({
			targets: this.startButton,
			alpha: { from: 1, to: 0.3 },
			ease: 'Power2',
			duration: 800,
			yoyo: true,
			repeat: -1
		});
	}

	startButtonText(text: string, clickable: boolean): void {
		this.startButton?.destroy();
		this.startButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, text, { font: '52px Arial', color: '#ffffff' });
		this.startButton.setBackgroundColor('#000000');
		this.startButton.setOrigin(0.5, 0.5);
		if (clickable) {
			this.startButton.setInteractive();
			this.startButton.on("pointerdown", () => {
				// Start the game
				if (this.startButton) {
					this.startButton.setVisible(false);
					this.startButton.disableInteractive();
				}
				this.startState = true;
				// this.startMatch();
			});
		}
		else
			this.startButton.disableInteractive();
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

	startMatch(): void {
		// Reset score
		this.myScore = 0;
		this.opponentScore = 0;

		// Reset ball
		this.countDown();
	}

	resetGame(): void {
		// Reset ball and stop it
		if (this.ball) {
			this.resetBall();
			this.ball.setVelocity(0);
			this.ball.setVisible(false);
		}

		this.startButtonText("🏓 Start Game 🏓", true);
		this.startAnim();
	}

	leave(room: Room) {
		if (room) {
			// Call the leave method on the room instance
			room.leave();
		}
		// console.log('Leaving room');
	}

	/**
	 * At every update() tick, we are going to update the
	 * local inputPayload, and send it as a message to the server.
	 */
	update(time: number, delta: number): void {
		// skip loop if not connected with room yet.
		if (!this.room) { return; }

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

		if (this.inputPayload) {
			// send input to the server if changes to avoid server spamming
			if (this.inputPayload.y !== this.input.y) {
				// console.log("client input : " + this.inputPayload.y + "/ input local " + this.input.y);
				this.inputPayload.y = this.input.y;
				this.room.send(0, this.inputPayload);
			}

			// Add linear interpolation if lag effect is visible
			//https://learn.colyseus.io/phaser/2-linear-interpolation.html

			// Check change state of start button send to server
			if (this.inputPayload.start !== this.startState) {
				this.inputPayload.start = this.startState;
				// console.log("client Start : input " + this.inputPayload.start + "/ start local " + this.startState);
				this.room.send("start", this.inputPayload);

				// check if this.startState, or from server is true begin game
				// if (this.startState === true)
				// 	this.startMatch();
				this.startState = false;
			}
		}
	}
}