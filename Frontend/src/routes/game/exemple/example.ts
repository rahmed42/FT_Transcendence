import { Client, Room } from "colyseus.js";

// From the Phaser scene, let’s instantiate our Colyseus Client instance, and connect into a Room.
// We need the create() method to be defined as async to be able to use await inside it.

// custom scene class
export class GameScene extends Phaser.Scene {
    // (...)

    client = new Client("ws://localhost:2567"); // local server endpoint
    room: Room;

   // (...)

    // local input cache
    inputPayload = {
        left: false,
        right: false,
        up: false,
        down: false,
    };

    cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

    preload() {
        // (...)
        this.cursorKeys = this.input.keyboard.createCursorKeys();
    }

    update(time: number, delta: number): void {
        // skip loop if not connected with room yet.
        if (!this.room) { return; }

        // send input to the server
        this.inputPayload.left = this.cursorKeys.left.isDown;
        this.inputPayload.right = this.cursorKeys.right.isDown;
        this.inputPayload.up = this.cursorKeys.up.isDown;
        this.inputPayload.down = this.cursorKeys.down.isDown;
        this.room.send(0, this.inputPayload);
    }
    // (...)

    async create() {
      console.log("Joining room...");

      try {
        this.room = await this.client.joinOrCreate("my_room"); // creating or joining "my_room" room
		// Notice that my_room is the default room identifier set by the barebones Colyseus server. You can and should change this identifier in the arena.config.ts file.
        console.log("Joined successfully!");

      } catch (e) {
        console.error(e);
      }
    }

    // (...)
}