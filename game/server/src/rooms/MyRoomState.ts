// Schema structure state synchronization: https://docs.colyseus.io/state/schema/
/**
 * Schema is a special data type from Colyseus that is capable of encoding its changes/mutations incrementally.
 * The encoding and decoding process happens internally by the framework and its SDK.
 * 
 * The state synchronization loop looks like this:
 * -State changes (mutations) are synchronized automatically from Server → Clients
 * -Clients, by attaching callbacks to their local read-only Schema structures,
 * can observe for state mutations and react to it.
 * -Clients can send arbitrary messages to the server - which decides what to do with it - and
 * may mutate the state (Go back to step 1.)
 */
import { MapSchema, Schema, type } from "@colyseus/schema";

export class Player extends Schema {
    @type("number") x: number;
    @type("number") y: number;
}

export class MyRoomState extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>();
}