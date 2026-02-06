import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';

interface LevelData {
  id: string;
  name: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó' | 'Rất khó';
  description: string;
  clueCount: number;
  suspectCount: number;
  unlocked: boolean;
  completed: boolean;
  stars: number; // 0-3 stars
}

/**
 * LevelSelectScene - Choose cases from easy to hard
 */
export class LevelSelectScene extends Phaser.Scene {
  private levels: LevelData[] = [];
  private selectedIndex: number = 0;
  private levelCards: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Title
    this.add.text(width / 2, 50, '🗂️ CHỌN VỤ ÁN', {
      fontSize: '36px',
      color: '#c9a227',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, 90, 'Hoàn thành vụ án để mở khóa vụ tiếp theo', {
      fontSize: '14px',
      color: '#888888',
    }).setOrigin(0.5);

    // Load progress and build levels
    this.loadLevels();

    // Create level cards
    this.createLevelCards();

    // Back button
    const backBtn = this.add.text(30, 30, '← Quay lại', {
      fontSize: '16px',
      color: '#888888',
    }).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setColor('#888888'));
    backBtn.on('pointerdown', () => this.scene.start('MainMenuScene'));

    // Keyboard navigation
    this.input.keyboard?.on('keydown-LEFT', () => this.selectLevel(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.selectLevel(1));
    this.input.keyboard?.on('keydown-ENTER', () => this.startSelectedLevel());
    this.input.keyboard?.on('keydown-SPACE', () => this.startSelectedLevel());
  }

  private loadLevels(): void {
    const progress = SaveSystem.getProgress();

    this.levels = [
      {
        id: 'case_001',
        name: 'Phòng kín lệch thời gian',
        difficulty: 'Khó',
        description: 'Hiện trường khóa kín với đồng hồ và camera bị lệch.',
        clueCount: 5,
        suspectCount: 3,
        unlocked: true,
        completed: progress.completedCases.includes('case_001'),
        stars: progress.caseStars?.case_001 || 0,
      },
      {
        id: 'case_002',
        name: 'Bóng tối đường hầm',
        difficulty: 'Khó',
        description: 'Chuyến tàu mất điện, án mạng xảy ra ở toa khác.',
        clueCount: 5,
        suspectCount: 3,
        unlocked: progress.completedCases.includes('case_001'),
        completed: progress.completedCases.includes('case_002'),
        stars: progress.caseStars?.case_002 || 0,
      },
      {
        id: 'case_003',
        name: 'Dạ hội ba kẻ giả danh',
        difficulty: 'Khó',
        description: 'Ba người cùng nhân dạng khiến lời khai trùng khớp.',
        clueCount: 5,
        suspectCount: 3,
        unlocked: progress.completedCases.includes('case_002'),
        completed: progress.completedCases.includes('case_003'),
        stars: progress.caseStars?.case_003 || 0,
      },
      {
        id: 'case_004',
        name: 'Bệnh án bị tráo',
        difficulty: 'Rất khó',
        description: 'Mất tích trong bệnh viện với hồ sơ y tế mâu thuẫn.',
        clueCount: 5,
        suspectCount: 3,
        unlocked: progress.completedCases.includes('case_003'),
        completed: progress.completedCases.includes('case_004'),
        stars: progress.caseStars?.case_004 || 0,
      },
      {
        id: 'case_005',
        name: 'Tiếng súng trong phòng cách âm',
        difficulty: 'Rất khó',
        description: 'Tiếng súng vang lên từ căn phòng cách âm.',
        clueCount: 5,
        suspectCount: 3,
        unlocked: progress.completedCases.includes('case_004'),
        completed: progress.completedCases.includes('case_005'),
        stars: progress.caseStars?.case_005 || 0,
      },
      {
        id: 'case_006',
        name: 'Khoảng trống 2 phút',
        difficulty: 'Rất khó',
        description: 'AI tòa nhà có khoảng trống log khó giải thích.',
        clueCount: 5,
        suspectCount: 3,
        unlocked: progress.completedCases.includes('case_005'),
        completed: progress.completedCases.includes('case_006'),
        stars: progress.caseStars?.case_006 || 0,
      },
      {
        id: 'case_007',
        name: 'Bằng chứng bị đảo ngược',
        difficulty: 'Rất khó',
        description: 'Chứng cứ đều chỉ một người, nhưng có thể bị dựng.',
        clueCount: 5,
        suspectCount: 3,
        unlocked: progress.completedCases.includes('case_006'),
        completed: progress.completedCases.includes('case_007'),
        stars: progress.caseStars?.case_007 || 0,
      },
      {
        id: 'case_008',
        name: 'Hai nạn nhân, một hung thủ',
        difficulty: 'Rất khó',
        description: 'Hai vụ án đồng thời với nghi phạm có ngoại phạm.',
        clueCount: 5,
        suspectCount: 3,
        unlocked: progress.completedCases.includes('case_007'),
        completed: progress.completedCases.includes('case_008'),
        stars: progress.caseStars?.case_008 || 0,
      },
      {
        id: 'case_009',
        name: 'Bản ghi âm bị cắt ghép',
        difficulty: 'Rất khó',
        description: 'Phân tích nhiễu nền để lật tẩy đoạn thú tội giả.',
        clueCount: 5,
        suspectCount: 3,
        unlocked: progress.completedCases.includes('case_008'),
        completed: progress.completedCases.includes('case_009'),
        stars: progress.caseStars?.case_009 || 0,
      },
      {
        id: 'case_010',
        name: 'Vụ án không có nạn nhân',
        difficulty: 'Rất khó',
        description: 'Hiện trường cháy rụi nhưng không tìm thấy thi thể.',
        clueCount: 5,
        suspectCount: 3,
        unlocked: progress.completedCases.includes('case_009'),
        completed: progress.completedCases.includes('case_010'),
        stars: progress.caseStars?.case_010 || 0,
      },
    ];
  }

  private createLevelCards(): void {
    const { width, height } = this.cameras.main;
    const cardWidth = 150;
    const cardHeight = 210;
    const spacing = 16;
    const columns = 5;
    const startX = (width - (cardWidth * columns + spacing * (columns - 1))) / 2 + cardWidth / 2;
    const startY = 160;

    this.levels.forEach((level, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      const x = startX + col * (cardWidth + spacing);
      const y = startY + row * (cardHeight + spacing);

      const card = this.createLevelCard(level, x, y, cardWidth, cardHeight, index);
      this.levelCards.push(card);
    });

    // Highlight first unlocked
    this.updateSelection();
  }

  private createLevelCard(
    level: LevelData,
    x: number,
    y: number,
    w: number,
    h: number,
    index: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Card background
    const bgColor = level.unlocked ? 0x2a2a4a : 0x1a1a2a;
    const bg = this.add.rectangle(0, 0, w, h, bgColor).setStrokeStyle(2, 
      level.completed ? 0x00ff00 : level.unlocked ? 0xc9a227 : 0x333333
    );
    container.add(bg);

    if (level.unlocked) {
      // Difficulty badge
      const diffColors: Record<string, number> = {
        'Dễ': 0x00aa00,
        'Trung bình': 0xaaaa00,
        'Khó': 0xaa5500,
        'Rất khó': 0xaa0000,
      };
      const badge = this.add.rectangle(0, -h/2 + 20, 80, 24, diffColors[level.difficulty], 0.8);
      const badgeText = this.add.text(0, -h/2 + 20, level.difficulty, {
        fontSize: '12px',
        color: '#ffffff',
      }).setOrigin(0.5);
      container.add([badge, badgeText]);

      // Case name
      const nameText = this.add.text(0, -30, level.name, {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold',
        wordWrap: { width: w - 20 },
        align: 'center',
      }).setOrigin(0.5);
      container.add(nameText);

      // Description
      const descText = this.add.text(0, 20, level.description, {
        fontSize: '11px',
        color: '#aaaaaa',
        wordWrap: { width: w - 20 },
        align: 'center',
      }).setOrigin(0.5);
      container.add(descText);

      // Stats
      const statsText = this.add.text(0, 65, `🔍 ${level.clueCount} manh mối | 👥 ${level.suspectCount} nghi phạm`, {
        fontSize: '10px',
        color: '#888888',
      }).setOrigin(0.5);
      container.add(statsText);

      // Stars
      if (level.completed) {
        const starsStr = '⭐'.repeat(level.stars) + '☆'.repeat(3 - level.stars);
        const starsText = this.add.text(0, 85, starsStr, {
          fontSize: '18px',
        }).setOrigin(0.5);
        container.add(starsText);
      }

      // Make interactive
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => {
        bg.setFillStyle(0x3a3a5a);
        this.selectedIndex = index;
        this.updateSelection();
      });
      bg.on('pointerout', () => {
        bg.setFillStyle(bgColor);
      });
      bg.on('pointerdown', () => {
        this.startLevel(level.id);
      });
    } else {
      // Locked overlay
      const lock = this.add.text(0, 0, '🔒', {
        fontSize: '48px',
      }).setOrigin(0.5);
      container.add(lock);

      const lockText = this.add.text(0, 50, 'Hoàn thành vụ trước', {
        fontSize: '11px',
        color: '#666666',
      }).setOrigin(0.5);
      container.add(lockText);
    }

    return container;
  }

  private selectLevel(direction: number): void {
    // Find next unlocked level
    let newIndex = this.selectedIndex + direction;
    while (newIndex >= 0 && newIndex < this.levels.length) {
      if (this.levels[newIndex].unlocked) {
        this.selectedIndex = newIndex;
        this.updateSelection();
        return;
      }
      newIndex += direction;
    }
  }

  private updateSelection(): void {
    this.levelCards.forEach((card, index) => {
      const bg = card.list[0] as Phaser.GameObjects.Rectangle;
      if (index === this.selectedIndex && this.levels[index].unlocked) {
        bg.setStrokeStyle(3, 0xffffff);
      } else {
        const level = this.levels[index];
        bg.setStrokeStyle(2, 
          level.completed ? 0x00ff00 : level.unlocked ? 0xc9a227 : 0x333333
        );
      }
    });
  }

  private startSelectedLevel(): void {
    const level = this.levels[this.selectedIndex];
    if (level?.unlocked) {
      this.startLevel(level.id);
    }
  }

  private startLevel(caseId: string): void {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start('PreloadScene', { caseId });
    });
  }
}
