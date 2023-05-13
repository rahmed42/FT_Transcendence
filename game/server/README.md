# Welcome to Colyseus!

This project has been created using [⚔️ `create-colyseus-app`](https://github.com/colyseus/create-colyseus-app/) - an npm init template for kick starting a Colyseus project in TypeScript.

[Documentation](http://docs.colyseus.io/)

## :crossed_swords: Usage

```
npm start
```

## Structure

- `index.ts`: main entry point, register an empty room handler and attach [`@colyseus/monitor`](https://github.com/colyseus/colyseus-monitor)
- `src/rooms/MyRoom.ts`: an empty room handler for you to implement your logic
- `src/rooms/schema/MyRoomState.ts`: an empty schema used on your room's state.
- `loadtest/example.ts`: scriptable client for the loadtest tool (see `npm run loadtest`)
- `package.json`:
    - `scripts`:
        - `npm start`: runs `ts-node-dev index.ts`
        - `npm test`: runs mocha test suite
        - `npm run loadtest`: runs the [`@colyseus/loadtest`](https://github.com/colyseus/colyseus-loadtest/) tool for testing the connection, using the `loadtest/example.ts` script.
- `tsconfig.json`: TypeScript configuration file


## Doc
https://docs.colyseus.io

## TS
https://www.typescriptlang.org/docs/handbook/intro.html

## Learn Step by step tutorial oin phaser
https://learn.colyseus.io/phaser/

## CONFIGURATION Colyseus Server
- IF fresh install : npm init colyseus-app ./server

- THEN
`cd server`
`npm install`
If Deprecated packages are found, run `npm update --all` to update them
If vulnerabilities are found, run `npm audit fix` to fix them

`npm start`

Acces to http://localhost:2567

## CONFIGURATION Phaser Client
- IF Fresh install : npm install --save-dev parcel typescript
npm install --save phaser colyseus.js@preview
npx tsc --init
Setup files as tutorial
npx parcel serve index.html

- THEN
`cd client`
`npm install`
If Deprecated packages are found, run `npm update --all` to update them
If vulnerabilities are found, run `npm audit fix` to fix them

`npm start`

Acces to http://localhost:1234