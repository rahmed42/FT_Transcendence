// import Phaser from "phaser";

// export class SceneSelector extends Phaser.Scene {

//     parts = {
//         '1': "Basic Player Movement",
//         '2': "Interpolation",
//         '3': "Client-predicted Input",
//         '4': "Fixed Tickrate",
//     };

//     constructor() {
//         super({ key: "selector", active: true });
//     }

//     preload() {
//         // update menu background color
//         this.cameras.main.setBackgroundColor(0x000000);

//         // preload demo assets
//         // this.load.image('ship_0001', 'assets/ship_0001.png');
//         this.load.image('ship_0001', 'https://cdn.glitch.global/3e033dcd-d5be-4db4-99e8-086ae90969ec/ship_0001.png?v=1649945243288');
//     }

//     create() {

//         // const gameContainer = this.add
//         //     .container(0, 0)
//         //     .setDepth(1)
//         //     .setSize(window.innerWidth, window.innerHeight)
//         //     .setExclusive(true)
//         //     .setScrollFactor(0);
//         // const gameContainerElement = document.getElementById('game-container');
//         // if (gameContainerElement) {
//         //     gameContainerElement.appendChild(gameContainer.getEl());
//         // }

//         // automatically navigate to hash scene if provided
//         if (window.location.hash) {
//             this.runScene(window.location.hash.substring(1));
//             return;
//         }

//         const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
//             color: "#ff0000",
//             fontSize: "32px",
//             // fontSize: "24px",
//             fontFamily: "Arial"
//         };

//         for (let partNum in this.parts) {
//             const index = parseInt(partNum) - 1;
// 			const label = this.parts[partNum as keyof typeof this.parts];

//             // this.add.text(32, 32 + 32 * index, `Part ${partNum}: ${label}`, textStyle)
//             this.add.text(130, 150 + 70 * index, `Part ${partNum}: ${label}`, textStyle)
//                 .setInteractive()
//                 .setPadding(6)
//                 .on("pointerdown", () => {
//                     this.runScene(`part${partNum}`);
//                 });
//         }
//     }

//     runScene(key: string) {
//         this.game.scene.switch("selector", key)
//     }

// 	beforeDestroy() {
//         // Déconnectez-vous de la "room" ou effectuez toute autre action de nettoyage nécessaire ici
//         // Par exemple, vous pouvez appeler une fonction de déconnexion ou d'arrêt du jeu
//         this.cleanup();
//     }

//     cleanup() {
//         // Effectuez ici toutes les opérations de nettoyage nécessaires, telles que la déconnexion de la "room" ou l'arrêt du jeu

//         // Détruisez l'instance de Phaser et supprimez toutes les références
//         this.game.destroy(true);

//         // Supprimez toutes les références à la scène
//         this.scene.remove("selector");
//     }

// }