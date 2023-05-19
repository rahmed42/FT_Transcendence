import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";

/* Import your Room files */
import { Part1Room } from "./rooms/Part1Room";
import { Part2Room } from "./rooms/Part2Room";


export default Arena({
	getId: () => "42 Pong",

	initializeGameServer: (gameServer) => {
		/* Define your room handlers */
		gameServer.define('part1_room', Part1Room);
		gameServer.define('part2_room', Part2Room);
	},

	initializeExpress: (app) => {
		/* Bind your custom express routes here */
		app.get("/", (req, res) => {
			res.send("Welcome to 42 Pong game server!");
		});

	/**
	 * Bind @colyseus/monitor
	 * It is recommended to protect this route with a password.
	 * Read more: https://docs.colyseus.io/tools/monitor/
	 */
		app.use("/colyseus", monitor());
	},


	beforeListen: () => {
		/**
		 * Before before gameServer.listen() is called.
		 */
	}
});