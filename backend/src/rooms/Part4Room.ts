import { Room, Client } from "colyseus";
import { Part4State, Start, Score, Ball, Player, Powerup } from "./Part4State";

export class Part4Room extends Room<Part4State> {

	// Create a new instance of Room
	constructor() {
		super();
		// Set Max client per room at 2 players
		this.maxClients = 2;
	}

	// API Server side : https://docs.colyseus.io/server/room/
	onCreate(options: any) {
		// Set up the game state
		this.setState(new Part4State());

		// set map dimensions
		this.state.mapWidth = 800;
		this.state.mapHeight = 600;

		// handle player input
		this.onMessage(0, (client, input) => {
			const player = this.state.players.get(client.sessionId);

			if (input.y)
				player.y = input.y;

			if (input.name)
				player.name = input.name;
		});

		// Handle startButton from player
		this.onMessage("start", (client, input) => {
			if (input.start)
				console.log("Starting Game");
			const player = this.state.startButton.get(client.sessionId);

			player.begin = input.start;

			// send to all the room the startGame message
			this.broadcast("startGame", player.begin);
		});

		// Handle ball movement from player
		this.onMessage("ball", (client, position) => {
			const ball = this.state.balls.get(client.sessionId);

			// invert ball position but host is on left side
			if (position.ballX)
				ball.ballX = this.state.mapWidth - position.ballX;
			if (position.ballY)
				ball.ballY = position.ballY;

			// send to all the room the ball position
			this.broadcast("ballX", ball.ballX);
			this.broadcast("ballY", ball.ballY);
		});

		// Handle powerup movement from player
		this.onMessage("powerUp", (client, position) => {
			const powerup = this.state.powerups.get(client.sessionId);

			// invert powerup position but host is on left side
			if (position.powerUpX)
				powerup.powerUpX = this.state.mapWidth - position.powerUpX;
			if (position.powerUpY)
				powerup.powerUpY = position.powerUpY;

			// send to all the room the powerup position
			this.broadcast("powerUpX", powerup.powerUpX);
			this.broadcast("powerUpY", powerup.powerUpY);
		});

		//Powerup changes information
		this.onMessage("powerUpInfo", (client, position) => {
			const powerup = this.state.powerups.get(client.sessionId);

			if (position.powerupScale)
				powerup.powerupScale = position.powerupScale;
			powerup.powerupVisible = position.powerupVisible;

			// send to all the room
			this.broadcast("powerUpScale", powerup.powerupScale);
			this.broadcast("powerUpVisible", powerup.powerupVisible);
		});

		// remote powerup taken sending local to client (swap position)
		this.onMessage("localPowerupTaken", (client, info) => {
			const powerup = this.state.powerups.get(client.sessionId);

			// console.log("localPowerupTaken", position.localPowerupTaken);
			powerup.localPowerupTaken = info.localPowerupTaken;
			powerup.powerType = info.powerType;

			// send to all the room
			this.broadcast("powerTypeFromServer", powerup.powerType);
			this.broadcast("localPowerupFromServer", powerup.localPowerupTaken);
		});

		// local powerup taken sending remote to client (swap position)
		this.onMessage("remotePowerupTaken", (client, info) => {
			const powerup = this.state.powerups.get(client.sessionId);

			// console.log("remotePowerupTaken", position.remotePowerupTaken);
			powerup.remotePowerupTaken = info.remotePowerupTaken;
			powerup.powerType = info.powerType;

			// send to all the room
			this.broadcast("powerTypeFromServer", powerup.powerType);
			this.broadcast("remotePowerupFromServer", powerup.remotePowerupTaken);
		});

		// Handle score for opponent
		this.onMessage("hostScore", (client, value) => {
			const score = this.state.scores.get(client.sessionId);

			// invert score but host is on left side
			if (score)
				score.opponentScore = value;

			// send to all the room the score
			this.broadcast("opponentScore", score.opponentScore);
		});

		// Handle score for player
		this.onMessage("clientScore", (client, value) => {
			const score = this.state.scores.get(client.sessionId);

			// invert score but host is on left side
			if (score)
				score.myScore = value;

			// send to all the room the score
			this.broadcast("myScore", score.myScore);
		});

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

		/* INIT the powerups */
		// Set up the powerups
		const powerup = new Powerup();
		powerup.powerUpX = this.state.mapWidth / 2;
		powerup.powerUpY = this.state.mapHeight / 2;
		powerup.powerupScale = 1;
		powerup.powerupVisible = false;
		powerup.remotePowerupTaken = false;
		powerup.localPowerupTaken = false;
		powerup.powerType = 0;

		this.state.powerups.set(client.sessionId, powerup);

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
	}
}