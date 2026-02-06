import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';

/**
 * MainMenuScene - Title screen with game options
 */
export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const SCALE = 1.2;

    // Background gradient effect
    this.cameras.main.setBackgroundColor('#0a0a1e');
    
    // Decorative elements
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a3e, 0x1a1a3e, 0x0a0a1e, 0x0a0a1e, 1);
    bg.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, height * 0.18, '🔍', {
      fontSize: '80px', // Scaled down
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.32, 'THÁM TỬ\nĐIỀU TRA', {
      fontSize: '56px', // Scaled down
      color: '#c9a227',
      fontStyle: 'bold',
      align: 'center',
      lineSpacing: 12,
    }).setOrigin(0.5);

    // Tagline
    this.add.text(width / 2, height * 0.48, 'Thu thập manh mối • Thẩm vấn nghi phạm • Phá án', {
      fontSize: '20px', // Scaled down
      color: '#888888',
    }).setOrigin(0.5);

    // Menu buttons
    this.createButton(width / 2, height * 0.58, '🎮  Chơi mới', () => this.startNewGame());
    this.createButton(width / 2, height * 0.68, '📂  Chọn vụ án', () => this.openLevelSelect());
    
    // Continue button if save exists
    const progress = SaveSystem.getProgress();
    if (progress.completedCases.length > 0 || SaveSystem.hasSave('case_001')) {
      this.createButton(width / 2, height * 0.78, '▶️  Tiếp tục', () => this.continueGame());
    }

    // Version & credits
    this.add.text(width / 2, height - (40 * SCALE), 'v1.0 • Made with Phaser 3', {
      fontSize: '22px', // 11 * 2
      color: '#444444',
    }).setOrigin(0.5);
    
    // Completed cases display
    if (progress.completedCases.length > 0) {
      const totalStars = Object.values(progress.caseStars).reduce((a, b) => a + b, 0);
      this.add.text(20 * SCALE, height - (25 * SCALE), `⭐ ${totalStars} | 📁 ${progress.completedCases.length}/10 vụ án`, {
        fontSize: '24px', // 12 * 2
        color: '#666666',
      });
    }
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const SCALE = 2;
    const btnWidth = 280 * SCALE;
    const btnHeight = 50 * SCALE;
    const radius = 12 * SCALE;

    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(0x2a2a4a, 1);
    bg.fillRoundedRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, radius);
    bg.lineStyle(2 * SCALE, 0xc9a227, 0.8);
    bg.strokeRoundedRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, radius);

    // Button text
    const btnText = this.add.text(0, 0, text, {
      fontSize: '28px', // Scaled down
      color: '#ffffff',
    }).setOrigin(0.5);

    container.add([bg, btnText]);

    // Interactive
    container.setSize(btnWidth, btnHeight);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x3a3a5a, 1);
      bg.fillRoundedRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, radius);
      bg.lineStyle(3 * SCALE, 0xc9a227, 1);
      bg.strokeRoundedRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, radius);
      btnText.setScale(1.05);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x2a2a4a, 1);
      bg.fillRoundedRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, radius);
      bg.lineStyle(2 * SCALE, 0xc9a227, 0.8);
      bg.strokeRoundedRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, radius);
      btnText.setScale(1);
    });

    container.on('pointerdown', callback);

    return container;
  }

  private startNewGame(): void {
    SaveSystem.reset('case_001');
    this.scene.start('PreloadScene', { caseId: 'case_001' });
  }

  private openLevelSelect(): void {
    this.scene.start('LevelSelectScene');
  }

  private continueGame(): void {
    // Find last played case or first incomplete
    const progress = SaveSystem.getProgress();
    const cases = [
      'case_001',
      'case_002',
      'case_003',
      'case_004',
      'case_005',
      'case_006',
      'case_007',
      'case_008',
      'case_009',
      'case_010',
    ];
    
    // Find first non-completed case that's unlocked
    let caseToPlay = 'case_001';
    for (const caseId of cases) {
      if (!progress.completedCases.includes(caseId)) {
        caseToPlay = caseId;
        break;
      }
    }
    
    this.scene.start('PreloadScene', { caseId: caseToPlay });
  }
}
