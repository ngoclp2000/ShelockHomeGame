import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { CaseIntroScene } from './scenes/CaseIntroScene';
import { GameScene } from './scenes/GameScene';

/**
 * Phaser 3 game configuration
 * Desktop landscape for better detective game experience
 */
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  
  // Landscape dimensions for room exploration
  // Responsive fullscreen
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: '100%',
    height: '100%',
  },
  
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  
  scene: [
    BootScene, 
    PreloadScene, 
    MainMenuScene, 
    LevelSelectScene, 
    CaseIntroScene, 
    GameScene
  ],
  
  input: {
    activePointers: 2,
  },
  
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: true,
  },
};

let game: Phaser.Game | null = null;

export function initGame(): Phaser.Game {
  game = new Phaser.Game(config);
  return game;
}

export function getGame(): Phaser.Game | null {
  return game;
}
