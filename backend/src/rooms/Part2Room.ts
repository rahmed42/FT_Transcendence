import { Room, Client } from "colyseus";
import { Part2State, Player } from "./Part2State";

export class Part2Room extends Room<Part2State> {

  onCreate (options: any) {
    this.setState(new Part2State());

    // set map dimensions
    this.state.mapWidth = 800;
    this.state.mapHeight = 600;

    // handle player input
    this.onMessage(0, (client, input) => {
      const player = this.state.players.get(client.sessionId);
      const velocity = 2;

    //   if (input.left) {
    //     player.x -= velocity;

    //   } else if (input.right) {
    //     player.x += velocity;
    //   }

      if (input.up) {
        player.y -= velocity;

      } else if (input.down) {
        player.y += velocity;
      }

    });
  }

  onJoin (client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    // create player at center vertical position
    const player = new Player();
	// Pop on left side if player 1, right side if player 2
	if (this.state.players.size % 2 == 0)
    	player.x = 0;
	else
		player.x = this.state.mapWidth;
    player.y = this.state.mapHeight / 2;

    this.state.players.set(client.sessionId, player);
  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

}
