import Phaser from 'phaser';
import { GameSelector } from './scenes/SceneSelector';

function initializePhaserGame(): void {
	const config: Phaser.Types.Core.GameConfig = {
	  type: Phaser.AUTO,
	  width: 800,
	  height: 600,
	  scene: [GameSelector],
	};

	new Phaser.Game(config);
  }

  // Call the function to initialize the game
  initializePhaserGame();
  