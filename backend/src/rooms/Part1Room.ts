import { Room, Client } from "colyseus";
import { Part1State, Start, Score, Ball, Player } from "./Part1State";

export class Part1Room extends Room<Part1State> {

	// Create a new instance of Room
	constructor() {
		super();
		// Set Max client per room at 2 players
		this.maxClients = 2;
	}

	// API Server side : https://docs.colyseus.io/server/room/
	onCreate(options: any) {
		// Set up the game state
		this.setState(new Part1State());

		// set map dimensions
		this.state.mapWidth = 800;
		this.state.mapHeight = 600;

		// handle player input
		this.onMessage(0, (client, input) => {
			const player = this.state.players.get(client.sessionId);

			if (input.y)
				player.y = input.y;
			// console.log("player.y = " + player.y);
		});

		// Handle startButton from player
		this.onMessage("start", (client, input) => {
			if (input.start)
				console.log("Starting Game");
			const player = this.state.startButton.get(client.sessionId);

			player.begin = input.start;
			// console.log("player.begin = " + player.begin);

			// send to all the room the startGame message
			this.broadcast("startGame", player.begin);
		});

		// Handle ball movement from player
		this.onMessage("ball", (client, position) => {
			const ball = this.state.balls.get(client.sessionId);
			// if (position) console.log("Ball info srv X=" + position.ballX + " - Y=" + position.ballY);

			// invert ball position but host is on left side
			if (position.ballX)
				ball.ballX = this.state.mapWidth - position.ballX;
			if (position.ballY)
				ball.ballY = position.ballY;

			// send to all the room the ball position
			this.broadcast("ballX", ball.ballX);
			this.broadcast("ballY", ball.ballY);
		});

		// // Handle score for player
		// this.onMessage("opponentScore", (client, score) => {
		// 	const scorePlayer = this.state.scores.get(client.sessionId);
		// 	if (score) console.log("Score info srv myScore=" + score);

		// 	// invert score but host is on left side
		// 	if (score)
		// 		scorePlayer.myScore = score;
		// });

		// Handle score for opponent
		this.onMessage("hostScore", (client, value) => {
			const score = this.state.scores.get(client.sessionId);
			if (value) console.log("Score info srv opponentScore=" + value);

			// invert score but host is on left side
			if (score)
				score.opponentScore = value;

			// send to all the room the score
			this.broadcast("opponentScore", score.opponentScore);
		});

		// Handle score for player
		this.onMessage("clientScore", (client, value) => {
			const score = this.state.scores.get(client.sessionId);
			if (value) console.log("Score info srv myScore=" + value);

			// invert score but host is on left side
			if (score)
				score.myScore = value;

			// send to all the room the score
			this.broadcast("myScore", score.myScore);
		});

		// // Handle score from player
		// this.onMessage("score", (client, message) => {
		// 	score = this.state.scores.get("score");
		// 	score.myScore = message.myScore;
		// 	score.opponentScore = message.opponentScore;
		// 	this.state.scores.set("score", score);
		// });
	}

	onJoin(client: Client, options: any) {
		console.log(client.sessionId, "joined!");

		/* INIT Players */
		// create player at center vertical position
		const player = new Player();

		// Pop on left side if player 1, right side if player 2
		if (this.state.players.size % 2 == 0)
			player.x = 40;
		else
			player.x = this.state.mapWidth - 40;
		player.y = this.state.mapHeight / 2;

		this.state.players.set(client.sessionId, player);

		/* INIT Start button */
		// Set up the start button
		const start = new Start();
		start.begin = false;

		this.state.startButton.set(client.sessionId, start);

		/* INIT the ball */
		// Set up the ball
		const ball = new Ball();
		ball.ballX = this.state.mapWidth / 2;
		ball.ballY = this.state.mapHeight / 2;

		this.state.balls.set(client.sessionId, ball);

		/* INIT the scores */
		// Set up the scores
		const score = new Score();
		score.myScore = 0;
		score.opponentScore = 0;

		this.state.scores.set(client.sessionId, score);
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