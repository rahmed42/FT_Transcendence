// // (...)
// //onJoin() method to create a Player instance whenever a new connection is established with the room.
// onJoin(client: Client, options: any) {
// 	console.log(client.sessionId, "joined!");

// 	const mapWidth = 800;
// 	const mapHeight = 600;

// 	// create Player instance
// 	const player = new Player();

// 	// place Player at a random position
// 	player.x = (Math.random() * mapWidth);
// 	player.y = (Math.random() * mapHeight);

// 	// place player in the map of players by its sessionId
// 	// (client.sessionId is unique per connection!)
// 	this.state.players.set(client.sessionId, player);
// }
// // (...)

// // (...)
// // when the client disconnects, let’s remove the player from the map of players:
// onLeave(client: Client, consented: boolean) {
// 	console.log(client.sessionId, "left!");

// 	this.state.players.delete(client.sessionId);
// }
// // (...)

// // (...)
// onCreate(options: any) {
//     this.setState(new MyRoomState());

//     // handle player input
//     this.onMessage(0, (client, data) => {
//       // get reference to the player who sent the message
//       const player = this.state.players.get(client.sessionId);
//       const velocity = 2;

//       if (input.left) {
//         player.x -= velocity;

//       } else if (input.right) {
//         player.x += velocity;
//       }

//       if (input.up) {
//         player.y -= velocity;

//       } else if (input.down) {
//         player.y += velocity;
//       }
//     });
//   }
// // (...)