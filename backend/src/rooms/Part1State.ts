import { Schema, type, MapSchema } from "@colyseus/schema";

/**
 * Schema is a special data type from Colyseus that is capable of encoding
 * its changes/mutations incrementally.
 * The encoding and decoding process happens internally by the framework and its SDK.
*/
// Start button
export class Start extends Schema {
	@type("boolean") begin: boolean;
}

//Scores for each player
export class Score extends Schema {
	@type("number") leftPlayer: number;
	@type("number") rightPlayer: number;
}

//Ball class
export class Ball extends Schema {
	@type("number") x: number;
	@type("number") y: number;
	@type("number") xVelocity: number;
	@type("number") yVelocity: number;
}

//Player class
export class Paddle extends Schema {
	@type("number") x: number;
	@type("number") y: number;
}

export class Part1State extends Schema {
	@type("number") mapWidth: number;
	@type("number") mapHeight: number;

	@type({ map: Start }) startButton = new MapSchema<Start>();
	@type({ map: Score }) scores = new MapSchema<Score>();
	@type({ map: Ball }) balls = new MapSchema<Ball>();
	@type({ map: Paddle }) paddles = new MapSchema<Paddle>();
}
