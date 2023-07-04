import Phaser from "phaser";
import { Room, Client } from "colyseus.js";
import { BACKEND_URL } from "../backend";
import { user } from '../../../stores/user';
import { get } from "svelte/store";

//Style Default
import { getUpdatedSkins } from "./SceneSelector";

// User getter
let currentUser = get(user);
let skins: any[];
const serverIP = import.meta.env.VITE_SERVER_IP;

const INACTIVITY_TIMEOUT = 60000; // in milliseconds

async function load_skins() {
	skins = await getUpdatedSkins();
}

function getCookie(name: string) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		return parts.pop()?.split(';').shift();
	}
}

let myCookie = getCookie('jwt');

export class Part1Scene extends Phaser.Scene {
	//room reference
	room: Room | undefined;

	// Players we will assign each player visual representation here by their `sessionId`
	playerEntities: { [sessionId: string]: Phaser.Types.Physics.Arcade.ImageWithDynamicBody } = {};

	// get movement timer
	lastMovementTimer: number;
	inactivityTimeout: NodeJS.Timeout;

	// mouse pointer
	pointer: Phaser.Input.Pointer | undefined;

	//Start state
	startState: boolean;
	gameHost: boolean;
	runningGame: boolean;
	gameReady: boolean;

	// local input cache
	inputPayload: any = {
		y: 300,
		start: false,
		ballX: 400,
		ballY: 300,
		name: "",
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

	//Timer text
	connectionTimerText: Phaser.GameObjects.Text | undefined;

	// Score values
	myScore: number;
	opponentScore: number;

	// scene reference
	activeScene: string;

	// Player Name
	myName: string;
	opponentName: string;

	// Constructor of the scene
	constructor() {
		// active false to prevent the scene from starting automatically
		load_skins();
		super({ key: "Part1", active: false });
		this.activeScene = 'Part1Scene';

		// Initialize the room
		this.room = new Room("Original");

		// Initialize the game state
		this.myScore = 0;
		this.opponentScore = 0;
		this.gameReady = false;

		// init defaults names
		this.myName = "Player 1";
		this.opponentName = "Player 2";

		// Init start state
		this.startState = false;
		this.gameHost = false;
		this.runningGame = false;

		// Init last movement timer
		this.lastMovementTimer = 0;
		this.inactivityTimeout = setTimeout(() => { }, 0);
	}

	startInactivityTimeout() {
		this.inactivityTimeout = setTimeout(() => {
			//check if the page isn't /game destroyGame
			if (window.location.pathname !== "/game") {
				this.stopInactivityTimeout();
				this.destroyGame();
				return;
			}

			const inactivityTimer = Date.now() - this.lastMovementTimer;
			if (inactivityTimer >= INACTIVITY_TIMEOUT && this.lastMovementTimer) {
				this.destroyGame();
			} else if (inactivityTimer >= (INACTIVITY_TIMEOUT / 4) && this.lastMovementTimer) {
				let colorText = "#ffff00";
				if (inactivityTimer >= (INACTIVITY_TIMEOUT * 3 / 4))
					colorText = "#ff0000";

				if (this.connectionTimerText !== undefined)
					this.connectionTimerText.destroy();
				this.connectionTimerText = this.add
					.text(60, 10, "Inactivity timeout " + (inactivityTimer / 1000).toFixed(0) + "s")
					.setStyle({ color: colorText })
					.setPadding(4);
				this.startInactivityTimeout();
			} else {
				if (this.connectionTimerText !== undefined)
					this.connectionTimerText.destroy();
				this.startInactivityTimeout();
			}
		}, 1000);
	}

	stopInactivityTimeout() {
		clearTimeout(this.inactivityTimeout);
	}

	// set the active scene
	setActiveScene(sceneName: string) {
		this.activeScene = sceneName;
	}

	preload() {
		//Loading style
		for (const skin of skins)
			this.load.image(skin.name, skin.src);
	}

	async create() {
		// Define camera size
		this.cameras.main = this.cameras.add(0, 0, this.game.config.width as number, this.game.config.height as number, false, 'Original');

		//Get player name
		if (currentUser && currentUser.login)
			this.myName = currentUser.login; // To fetch from DB / discard current stored user

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
			.setPadding(4);

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
		const background = this.add.image(0, 0, 'boardSkin');
		background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
		background.setOrigin(0, 0);

		// Display ball
		this.ball = this.physics.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'ballSkin');
		this.ball.setOrigin(0.5, 0.5);
		this.ball.setVisible(false);

		// Display score
		this.myScoreText = this.add.text(this.cameras.main.centerX / 2, 40, '0', {
			fontSize: '64px', color: '#ffffff', stroke: '#000000', strokeThickness: 1
		});
		this.opponentScoreText = this.add.text(this.cameras.main.centerX / 2 * 3, 40, '0', {
			fontSize: '64px', color: '#ffffff', stroke: '#000000', strokeThickness: 1
		});

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

		// setting the text as interactive
		homeButton.setInteractive();

		// adding text on button
		const homeButtonText = this.add.text(this.cameras.main.centerX, 25, 'Menu', {
			font: '32px Arial', color: '#ffffff', stroke: '#000000', strokeThickness: 1
		});
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
			this.destroyGame();
		});
	}

	destroyGame(): void {
		if (window.location.pathname === "/game") {
			this.resetGame(true);
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

			this.lastMovementTimer = 0;
			if (this.connectionTimerText !== undefined)
				this.connectionTimerText.destroy();

			this.setActiveScene("menu");
			this.scene.stop('Part1');
			// Start the menu scene
			this.scene.start('menu')
		}

		if (this.room)
			this.leave(this.room);
	}

	createLocalPaddle(): void {
		let posY;
		if (this.pointer !== undefined && this.pointer.y !== null)
			posY = this.pointer.y;
		else
			posY = this.cameras.main.centerY;

		// Display Paddle and set bounds
		const paddle = {
			'x': 20,
			'pos': posY,
		};
		this.localPaddle = this.physics.add.image(paddle.x, paddle.pos, 'myPaddleSkin');
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

			// refresh timout timer
			this.lastMovementTimer = Date.now();
		});
	}

	createRemotePaddle(): void {
		// Display Paddle and set bounds
		const paddle = {
			'x': 20,
			// 'pos': posY,
		};
		this.remotePaddle = this.physics.add.image(this.cameras.main.width - paddle.x, this.cameras.main.centerY, 'otherPaddleSkin');
		this.remotePaddle.setOrigin(0.5, 0.5);
		this.remotePaddle.setCollideWorldBounds(true);
		this.remotePaddle.setImmovable(true);

		if (this.ball && this.remotePaddle) {
			// Add collisions between ball and paddles
			this.physics.add.collider(this.ball, this.remotePaddle);
		}
	}

	// Game listeners
	gameListeners(): void {
		//https://learn.colyseus.io/phaser/1-basic-player-movement.html
		if (!this.room) { return; }

		// Listen for new players
		this.room.state.players.onAdd((player, sessionId) => {
			if (this.room && this.room.state.players.size <= 2) {
				//Setup my Paddle
				if (this.localPaddle === undefined) {
					this.createLocalPaddle();

					// listen for timers
					this.startInactivityTimeout();

					//Keep reference to this remote Paddle
					const entity = this.localPaddle!;
					this.playerEntities[sessionId] = entity;
				}

				// waiting for other player
				if (this.room.state.players.size === 1) {
					// Start the animation loop if there is only one player
					this.startButtonText("Waiting for duel", false);
					this.startAnim();
				}

				// Second player added
				if (this.room.state.players.size === 2 && this.remotePaddle === undefined) {
					this.createRemotePaddle();

					// Keep reference to this remote Paddle
					const entity = this.remotePaddle!;
					this.playerEntities[sessionId] = entity;

					//Triggered when 'y' property changes
					player.listen("y", (value: number) => {
						if (this.remotePaddle)
							this.remotePaddle.y = value;
					});

					//Triggered when 'name' property changes
					player.listen("name", (value: string) => {
						// Update opponent name
						this.opponentName = value;
					});

					// Getting starting game from server
					this.room.onMessage("startGame", (start: boolean) => {
						if (start === true)
							this.startMatch();
					});

					// Get ball position from server if not hosting
					this.room.onMessage("ballX", (ballX: number) => {
						if (!this.gameHost && this.ball)
							this.ball.x = ballX;
					});
					this.room.onMessage("ballY", (ballY: number) => {
						if (!this.gameHost && this.ball)
							this.ball.y = ballY;
					});

					// Update score from server host
					this.room.onMessage("opponentScore", (score: number) => {
						if (!this.gameHost && this.runningGame) {
							this.opponentScore = score;
							this.opponentScoreText!.setText(score.toString());
							if (this.opponentScore >= 3)
								this.resetGame(false);
						}
					});

					this.room.onMessage("myScore", (score: number) => {
						if (!this.gameHost && this.runningGame) {
							this.myScore = score;
							this.myScoreText!.setText(score.toString());
							if (this.myScore >= 3)
								this.resetGame(false);
						}
					});

					// Set start clickable button
					this.startButtonText("🏓 Start Game 🏓", true);
					this.startAnim();

					this.gameReady = true;
				}
			}
		});

		// Listen for removed players
		this.room.state.players.onRemove((player, sessionId) => {
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
					entity.destroy();
					delete this.playerEntities[sessionId];
				}

				// stop timeout
				this.stopInactivityTimeout();

				// Kick the last player
				if (this.room.state.players.size === 1) {
					this.leave(this.room);
					alert("The other player left ! Back to the menu...");
					this.setActiveScene("menu");
					this.scene.stop('Part1');
					this.scene.start('menu')
				}
			}
		});
	}

	// Utils
	async countDown() {
		this.myScoreText!.setColor('#ffffff');
		this.myScoreText!.setText(this.myScore.toString());
		this.opponentScoreText!.setText(this.opponentScore.toString());

		await fetch('http://' + serverIP + ':3333/auth/in_game', {
			method: 'POST',
			credentials: 'include',
		})

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
						if (this.startButton !== undefined)
							this.startButton.destroy();
						if (this.ball !== undefined)
							this.ball.setVisible(true);
						this.runningGame = true;
						this.launchBall();
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
		if (this.startButton !== undefined)
			this.startButton.destroy();
		this.startButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, text, {
			font: '52px Arial', color: '#ffffff', stroke: '#000000', strokeThickness: 1
		});
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
				// The player who clicked will be the host for the ball update
				this.gameHost = true;
				this.startState = true;
			});
		}
		else
			this.startButton.disableInteractive();
	}

	// Game logics
	launchBall(): void {
		/* Refresh Score */
		if (this.myScoreText)
			this.myScoreText.setText(this.myScore.toString());
		if (this.opponentScoreText)
			this.opponentScoreText.setText(this.opponentScore.toString());

		if (this.ball && this.cameras.main) {
			// set the ball to center
			this.ball.x = this.cameras.main.centerX;
			this.ball.y = this.cameras.main.centerY;

			if (this.gameHost) {
				// Launch the ball to random direction
				let velocityX = Phaser.Math.Between(350, 550);
				let velocityY = Phaser.Math.Between(200, 400);

				// random negative or positive
				velocityX *= Math.random() < 0.5 ? 1 : -1;
				velocityY *= Math.random() < 0.5 ? 1 : -1;
				this.ball.setVelocity(velocityX, velocityY);
			}
		}
	}

	async push_match_stats() {
		await fetch('http://' + serverIP + ':3333/auth/login', {
			method: 'POST',
			credentials: 'include',
		})

		await fetch('http://' + serverIP + ':3333/profil/match_stats', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + myCookie,
			},
			body: JSON.stringify({
				currentUser,
				type: this.room!.name,
				score: this.myScore,
				name: this.opponentName,
				opponentScore: this.opponentScore,
			})
		});
	}

	startMatch(): void {
		// Reset score
		this.myScore = 0;
		this.opponentScore = 0;

		// Reset ball
		this.countDown();
	}

	async resetGame(home_button: boolean) {
		// Wait for new game host
		this.gameHost = false;
		this.runningGame = false;

		// Reset ball and stop it
		if (this.ball) {
			this.launchBall();
			this.ball.setVelocity(0);
			this.ball.setVisible(false);
		}

		if (this.myScore > this.opponentScore) {
			this.myScoreText!.setColor('#00ff00');
			this.myScoreText!.setText(this.myScore.toString() + "\n You  WIN !");
			this.startButtonText("🏓 Beat again ? 🏓", true);
		}
		else {
			this.myScoreText!.setColor('#ff0000');
			this.myScoreText!.setText(this.myScore.toString() + "\n You  LOSE!");
			this.startButtonText("🏓  Revenge ?  🏓", true);
		}
		this.startAnim();

		if (!home_button)
			await this.push_match_stats();
	}

	leave(room: Room) {
		// Call the leave method on the room instance
		if (room)
			room.leave();

		// stop timeout
		this.stopInactivityTimeout();
	}

	/**
	 * At every update() tick, we are going to update the
	 * local inputPayload, and send it as a message to the server.
	 */
	update(time: number, delta: number): void {
		// skip loop if not connected with room yet.
		if (this.room === undefined) { return; }

		if (this.gameReady) {
			// Update scores
			if (this.ball && this.gameHost) {
				if (this.ball.x > this.cameras.main.width) {
					this.myScore++;

					// Send score to server
					this.room.send("hostScore", this.myScore);
				} else if (this.ball.x < 0) {
					this.opponentScore++;

					// Send score to server
					this.room.send("clientScore", this.opponentScore);
				}
			}

			// Handle scores from server if host
			if (this.ball && (this.ball.x < 0 || this.ball.x > this.cameras.main.width)) {
				if (this.myScore >= 3 || this.opponentScore >= 3)
					this.resetGame(false);
				else
					this.launchBall();
			}

			// Update input player
			if (this.inputPayload !== undefined) {
				// send input to the server if changes to avoid server spamming
				if ((this.input.y !== undefined) && (this.inputPayload.y !== this.input.y)) {
					this.inputPayload.y = this.input.y;
					this.inputPayload.name = this.myName;
					this.room.send(0, this.inputPayload);
				}

				// Add linear interpolation if lag effect is visible
				//https://learn.colyseus.io/phaser/2-linear-interpolation.html

				// Check change state of start button send to server
				if ((this.startState !== undefined) && (this.inputPayload.start !== this.startState)) {
					this.inputPayload.start = this.startState;
					this.room.send("start", this.inputPayload);

					// reset state
					this.startState = false;
				}

				// send ball position to server
				if (this.ball && this.gameHost && (this.inputPayload.ballX !== this.ball.x || this.inputPayload.ballY !== this.ball.y)) {
					this.inputPayload.ballX = this.ball.x;
					this.inputPayload.ballY = this.ball.y;
					this.room.send("ball", this.inputPayload);
				}
			}
		}
	}
}