import { Room, Client } from "colyseus";
import { Part1State, Start, Score, Ball, Player } from "./Part1State";

export class Part1Room extends Room<Part1State> {

	// Create a new instance of Room
	constructor() {
		super();
		// Set Max client per room at 2 players
		this.maxClients = 2;
	}

	onCreate(options: any) {
		// Set up the game state
		this.setState(new Part1State());

		// set map dimensions
		this.state.mapWidth = 800;
		this.state.mapHeight = 600;

		// Set up the start button
		let start = new Start();
		start.begin = false;

		// Refresh the start button state
		this.state.startButton.set("start", start);

		// Handle startButton from player
		this.onMessage("start", (client, message) => {
			start = this.state.startButton.get("start");
			start.begin = true;
			this.state.startButton.set("start", start);
		});


		// Set up the scores
		let score = new Score();
		score.leftPlayer = 0;
		score.rightPlayer = 0;

		// Refresh the score state
		this.state.scores.set("score", score);

		// Handle score from player
		this.onMessage("score", (client, message) => {
			score = this.state.scores.get("score");
			score.leftPlayer = message.leftPlayer;
			score.rightPlayer = message.rightPlayer;
			this.state.scores.set("score", score);
		});


		// Set up the ball
		let ball = new Ball();
		ball.x = this.state.mapWidth / 2;
		ball.y = this.state.mapHeight / 2;
		ball.xVelocity = 0;
		ball.yVelocity = 0;

		// Refresh the ball state
		this.state.balls.set("ball", ball);

		// Handle ball movement from player
		this.onMessage("ball", (client, message) => {
			ball = this.state.balls.get("ball");
			ball.x = message.x;
			ball.y = message.y;
			ball.xVelocity = message.xVelocity;
			ball.yVelocity = message.yVelocity;
			this.state.balls.set("ball", ball);
		});

		// handle player input
		this.onMessage(0, (client, input) => {
			const player = this.state.players.get(client.sessionId);
			const velocity = 2;

			if (input.up) {
				player.y -= velocity;

			} else if (input.down) {
				player.y += velocity;
			}
		});
	}

	onJoin(client: Client, options: any) {
		console.log(client.sessionId, "joined!");

		// create player at center vertical position
		const player = new Player();
		// Pop on left side if player 1, right side if player 2
		if (this.state.players.size % 2 == 0)
			player.x = 40;
		else
			player.x = this.state.mapWidth - 40;
		player.y = this.state.mapHeight / 2;

		this.state.players.set(client.sessionId, player);

		// Handle start pushed from one player
		this.onMessage("start", (client, message) => {
			let start = this.state.startButton.get("start");
			start.begin = true;
			this.state.startButton.set("start", start);
		});
	}

	onLeave(client: Client, consented: boolean) {
		console.log(client.sessionId, "left!");
		this.state.players.delete(client.sessionId);
	}

	onDispose() {
		console.log("room", this.roomId, "disposing...");

		// destroy the current room
		// this.disconnect();
	}

}