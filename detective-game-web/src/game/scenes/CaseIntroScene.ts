import Phaser from 'phaser';
import { CaseLoader } from '../data/caseLoader';

/**
 * CaseIntroScene - Introduces the case with story and tutorial
 */
export class CaseIntroScene extends Phaser.Scene {
  private caseId: string = 'case_001';
  private currentStep: number = 0;
  private introSteps: string[] = [];
  private textDisplay!: Phaser.GameObjects.Text;
  private continueText!: Phaser.GameObjects.Text;
  private typewriterTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'CaseIntroScene' });
  }

  init(data: { caseId?: string }): void {
    if (data.caseId) {
      this.caseId = data.caseId;
    }
    this.currentStep = 0;
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const caseData = CaseLoader.getCurrentCase();
    const SCALE = 1.2;

    // Dark cinematic background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a0a);

    // Title
    const caseTitle = caseData?.title || 'Vụ án bí ẩn';
    this.add.text(width / 2, 60 * SCALE, caseTitle, {
      fontSize: '48px', // Scaled down
      color: '#c9a227',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 5,
    }).setOrigin(0.5);

    // Case number
    const caseNum = this.caseId.replace('case_', 'Vụ án #');
    this.add.text(width / 2, 110 * SCALE, caseNum, {
      fontSize: '24px', // Scaled down
      color: '#888888',
    }).setOrigin(0.5);

    // Build intro steps
    this.introSteps = this.buildIntroSteps(caseData);

    // Text display area with paper texture
    this.add.rectangle(width / 2, height / 2, width - (100 * SCALE), height - (250 * SCALE), 0x1a1a1a, 0.9)
      .setStrokeStyle(4, 0xc9a227); // 2 * 2

    this.textDisplay = this.add.text(80 * SCALE, 150 * SCALE, '', {
      fontSize: '24px', // Scaled down
      color: '#ffffff',
      wordWrap: { width: width - (160 * SCALE) },
      lineSpacing: 10,
    });

    // Continue prompt
    this.continueText = this.add.text(width / 2, height - (80 * SCALE), '[ Nhấn SPACE hoặc Click để tiếp tục ]', {
      fontSize: '28px', // 14 * 2
      color: '#888888',
    }).setOrigin(0.5);

    // Blink animation
    this.tweens.add({
      targets: this.continueText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Progress indicator
    this.add.text(width - (50 * SCALE), height - (30 * SCALE), `${this.currentStep + 1}/${this.introSteps.length}`, {
      fontSize: '24px', // 12 * 2
      color: '#666666',
    }).setOrigin(1, 1);

    // Show first step
    this.showStep();

    // Input handlers
    this.input.keyboard?.on('keydown-SPACE', this.nextStep, this);
    this.input.keyboard?.on('keydown-ENTER', this.nextStep, this);
    this.input.on('pointerdown', this.nextStep, this);

    // Skip button
    const skipBtn = this.add.text(width - (20 * SCALE), 20 * SCALE, 'Bỏ qua >>', {
      fontSize: '28px', // 14 * 2
      color: '#666666',
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    skipBtn.on('pointerover', () => skipBtn.setColor('#c9a227'));
    skipBtn.on('pointerout', () => skipBtn.setColor('#666666'));
    skipBtn.on('pointerdown', () => this.startGame());
  }

  private buildIntroSteps(caseData: ReturnType<typeof CaseLoader.getCurrentCase>): string[] {
    const steps: string[] = [];

    // Story intro
    if (caseData?.intro) {
      steps.push(`📜 GIỚI THIỆU VỤ ÁN\n\n${caseData.intro}`);
    } else {
      steps.push('📜 GIỚI THIỆU VỤ ÁN\n\nMột vụ án bí ẩn cần được điều tra. Hãy thu thập manh mối và tìm ra thủ phạm!');
    }

    // Suspects intro
    if (caseData?.suspects && caseData.suspects.length > 0) {
      let suspectsText = '👥 CÁC NGHI PHẠM\n\n';
      caseData.suspects.forEach((s, i) => {
        suspectsText += `${i + 1}. ${s.name}\n   ${s.description || 'Chưa có thông tin'}\n\n`;
      });
      steps.push(suspectsText);
    }

    // Tutorial - Controls
    steps.push(
      '🎮 HƯỚNG DẪN ĐIỀU KHIỂN\n\n' +
      '• Di chuyển: WASD hoặc phím mũi tên ←↑↓→\n\n' +
      '• Tương tác: Nhấn SPACE hoặc E khi đứng gần đối tượng\n\n' +
      '• Thu thập manh mối: Đi đến gần các vật phẩm phát sáng\n\n' +
      '• Nói chuyện: Tiến đến gần NPC và nhấn SPACE'
    );

    // Tutorial - Game objectives
    steps.push(
      '🎯 MỤC TIÊU\n\n' +
      '1. Thu thập tất cả manh mối trong phòng\n\n' +
      '2. Thẩm vấn các nghi phạm\n\n' +
      '3. Phân tích bằng chứng\n\n' +
      '4. Đưa ra kết luận: Ai là thủ phạm?\n\n\n' +
      '💡 Mẹo: Chú ý đến các chi tiết trong lời khai của nghi phạm!'
    );

    // Ready to start
    steps.push(
      '🔍 SẴN SÀNG ĐIỀU TRA!\n\n' +
      'Bạn đã sẵn sàng để bắt đầu cuộc điều tra.\n\n' +
      'Hãy quan sát kỹ, thu thập bằng chứng,\nvà tìm ra sự thật đằng sau vụ án này!\n\n\n' +
      '🕵️ Chúc may mắn, Thám tử!'
    );

    return steps;
  }

  private showStep(): void {
    const text = this.introSteps[this.currentStep];
    this.textDisplay.setText('');
    
    // Typewriter effect
    let charIndex = 0;
    if (this.typewriterTimer) {
      this.typewriterTimer.destroy();
    }

    this.typewriterTimer = this.time.addEvent({
      delay: 20,
      callback: () => {
        if (charIndex < text.length) {
          this.textDisplay.setText(text.substring(0, charIndex + 1));
          charIndex++;
        }
      },
      repeat: text.length - 1,
    });
  }

  private nextStep(): void {
    // Skip typewriter if still running
    if (this.typewriterTimer && this.typewriterTimer.getProgress() < 1) {
      this.typewriterTimer.destroy();
      this.textDisplay.setText(this.introSteps[this.currentStep]);
      return;
    }

    this.currentStep++;

    if (this.currentStep >= this.introSteps.length) {
      this.startGame();
    } else {
      this.showStep();
    }
  }

  private startGame(): void {
    // Fade out and start game
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start('GameScene', { caseId: this.caseId });
    });
  }
}
