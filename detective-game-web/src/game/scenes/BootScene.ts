import Phaser from 'phaser';

/**
 * BootScene - Minimal loading, route to next scene
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Load minimal assets for loading screen
    this.load.setBaseURL('./');
    
    // Loading bar background
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 4, height / 2 - 15, width / 2, 30);
    
    const progressBar = this.add.graphics();
    
    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '24px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5, 0.5);
    
    // Progress events
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xc9a227, 1);
      progressBar.fillRect(width / 4 + 5, height / 2 - 10, (width / 2 - 10) * value, 20);
    });
    
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }

  create(): void {
    // Route to MainMenu
    this.scene.start('MainMenuScene');
  }
}
