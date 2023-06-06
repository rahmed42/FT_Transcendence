import { Room, Client } from "colyseus";
import { Part1State, Start, Score, Ball, Paddle } from "./Part1State";
// import { listenerCount } from "superagent";

export class Part1Room extends Room<Part1State> {

	// Create a new instance of Room
	onCreate(options: any) {
		// Set Max client per room at 2 players
		this.maxClients = 2;

		// Set up the game state
		this.setState(new Part1State());

		// Set map dimensions
		this.state.mapWidth = 800;
		this.state.mapHeight = 600;


		// Set up the start button
		let start : Start = new Start();
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
		let score : Score = new Score();
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
		let ball : Ball = new Ball();
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
	}

	// At player joining
	onJoin(client: Client, options: any) {
		console.log(client.sessionId, "joined!");

		// create player at center vertical position
		let paddle : Paddle = new Paddle();
		// Pop on left side if paddle 1, right side if paddle 2
		if (this.state.paddles.size % 2 == 0)
			paddle.x = 40;
		else
			paddle.x = this.state.mapWidth - 40;
		paddle.y = this.state.mapHeight / 2;

		this.state.paddles.set(client.sessionId, paddle);

		// Handle start pushed from one player
		this.onMessage("start", (client, message) => {
			let start : Start = this.state.startButton.get("start");
			start.begin = true;
			this.state.startButton.set("start", start);
		});
	}

	// At player leaving destroy the room
	onLeave(client: Client, consented: boolean) {
		console.log(client.sessionId, "left!");

		// Clean created session and instances before leaving room
		// this.state.startButton.delete("start");
		// this.state.scores.delete("score");
		// this.state.balls.delete("ball");
		this.state.paddles.delete(client.sessionId);
	}

	// At player disconnection destroy the roo
	onDispose() {
		console.log("room", this.roomId, "disposing...");

		// destroy the current room
		this.disconnect();
	}
}
