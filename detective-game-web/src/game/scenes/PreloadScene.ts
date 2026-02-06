import Phaser from 'phaser';
import { CaseLoader } from '../data/caseLoader';
import { EventBus } from '../systems/EventBus';

type BackgroundTheme =
  | 'study'
  | 'train'
  | 'ballroom'
  | 'hospital'
  | 'boardroom'
  | 'tech'
  | 'newsroom'
  | 'alley'
  | 'studio'
  | 'apartment';

/**
 * PreloadScene - Load assets and generate detective character
 */
export class PreloadScene extends Phaser.Scene {
  private caseId: string = 'case_001';

  constructor() {
    super({ key: 'PreloadScene' });
  }

  init(data: { caseId?: string }): void {
    if (data.caseId) {
      this.caseId = data.caseId;
    }
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Loading UI
    this.add.rectangle(width / 2, height / 2, width / 2 + 10, 40, 0x333333);
    const progressBar = this.add.rectangle(width / 4 + 5, height / 2, 0, 30, 0xc9a227);
    progressBar.setOrigin(0, 0.5);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Đang tải vụ án...', {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.width = (width / 2 - 10) * value;
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      loadingText.destroy();
    });

    // Load case data
    this.load.json(this.caseId, `cases/${this.caseId}.json`);
  }

  create(): void {
    // Generate all sprites
    this.generateDetectiveSprite();
    this.generateClueIcon();
    this.generateNPCSprites();
    
    // Parse case data
    const caseData = this.cache.json.get(this.caseId);
    if (!caseData) {
      this.add.text(400, 300, 'Không tải được dữ liệu vụ án!', { 
        fontSize: '24px', 
        color: '#ff0000' 
      }).setOrigin(0.5);
      return;
    }
    
    CaseLoader.setCurrentCase(caseData);
    EventBus.emit('case:loaded', { caseId: this.caseId });

    const backgroundTheme = this.resolveBackgroundTheme(caseData?.backgroundTheme);
    this.generateRoomBackground(backgroundTheme);
    if (!this.textures.exists('room_background')) {
      this.generateRoomBackground('study', 'room_background');
    }
    
    // Go to case intro scene (story + tutorial)
    this.scene.start('CaseIntroScene', { caseId: this.caseId });
  }

  /**
   * Generate beautiful detective sprite with trench coat and fedora
   */
  private generateDetectiveSprite(): void {
    const ASSET_SCALE = 2;
    const frameWidth = 64;
    const frameHeight = 64;
    const cols = 4; // 4 frames per direction
    const rows = 4; // down, left, right, up
    
    const canvas = document.createElement('canvas');
    canvas.width = frameWidth * cols * ASSET_SCALE;
    canvas.height = frameHeight * rows * ASSET_SCALE;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(ASSET_SCALE, ASSET_SCALE);
    
    const directions = ['down', 'left', 'right', 'up'];
    
    directions.forEach((dir, row) => {
      for (let frame = 0; frame < 4; frame++) {
        const x = frame * frameWidth;
        const y = row * frameHeight;
        const cx = x + frameWidth / 2;
        const cy = y + frameHeight;
        
        // Walking animation offset
        const walkOffset = Math.sin(frame * Math.PI / 2) * 2;
        const legOffset = frame % 2 === 0 ? 3 : -3;
        
        this.drawDetective(ctx, cx, cy - 4, dir, walkOffset, legOffset);
      }
    });
    
    this.textures.addSpriteSheet('player', canvas as any, {
      frameWidth: frameWidth * ASSET_SCALE,
      frameHeight: frameHeight * ASSET_SCALE,
    });
  }

  private drawDetective(
    ctx: CanvasRenderingContext2D, 
    cx: number, 
    cy: number, 
    direction: string,
    walkOffset: number,
    legOffset: number
  ): void {
    // Colors
    const coatColor = '#4a3828';     // Brown trench coat
    const coatHighlight = '#5a4838';
    const hatColor = '#3a2818';       // Dark brown fedora
    const skinColor = '#e8c8a8';
    const shirtColor = '#f5f5dc';     // Beige shirt
    const pantsColor = '#2a2a2a';
    const shoeColor = '#1a1a1a';
    
    ctx.save();
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Legs with walking animation
    ctx.fillStyle = pantsColor;
    if (direction === 'down' || direction === 'up') {
      // Left leg
      ctx.fillRect(cx - 8 + legOffset, cy - 22, 6, 14);
      // Right leg
      ctx.fillRect(cx + 2 - legOffset, cy - 22, 6, 14);
    } else {
      // Side view - one leg visible
      ctx.fillRect(cx - 4, cy - 22, 8, 14);
    }
    
    // Shoes
    ctx.fillStyle = shoeColor;
    if (direction === 'down' || direction === 'up') {
      ctx.fillRect(cx - 9 + legOffset, cy - 8, 8, 4);
      ctx.fillRect(cx + 1 - legOffset, cy - 8, 8, 4);
    } else {
      ctx.fillRect(cx - 5, cy - 8, 10, 4);
    }
    
    // Trench coat body
    ctx.fillStyle = coatColor;
    ctx.beginPath();
    if (direction === 'down') {
      ctx.moveTo(cx - 14, cy - 20);
      ctx.lineTo(cx - 16, cy - 44);
      ctx.quadraticCurveTo(cx, cy - 48, cx + 16, cy - 44);
      ctx.lineTo(cx + 14, cy - 20);
      ctx.closePath();
    } else if (direction === 'up') {
      ctx.moveTo(cx - 14, cy - 20);
      ctx.lineTo(cx - 14, cy - 44);
      ctx.quadraticCurveTo(cx, cy - 50, cx + 14, cy - 44);
      ctx.lineTo(cx + 14, cy - 20);
      ctx.closePath();
    } else {
      // Side view
      ctx.moveTo(cx - 10, cy - 20);
      ctx.lineTo(cx - 12, cy - 44);
      ctx.quadraticCurveTo(cx, cy - 48, cx + 12, cy - 44);
      ctx.lineTo(cx + 10, cy - 20);
      ctx.closePath();
    }
    ctx.fill();
    
    // Coat details - collar
    ctx.fillStyle = coatHighlight;
    if (direction === 'down') {
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy - 44);
      ctx.lineTo(cx - 10, cy - 38);
      ctx.lineTo(cx - 4, cy - 36);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(cx + 6, cy - 44);
      ctx.lineTo(cx + 10, cy - 38);
      ctx.lineTo(cx + 4, cy - 36);
      ctx.closePath();
      ctx.fill();
    }
    
    // Shirt visible at neck
    ctx.fillStyle = shirtColor;
    if (direction === 'down') {
      ctx.fillRect(cx - 4, cy - 44, 8, 4);
    }
    
    // Arms
    ctx.fillStyle = coatColor;
    if (direction === 'left') {
      // One arm visible, maybe holding something
      ctx.fillRect(cx + 6 + walkOffset, cy - 42, 8, 18);
    } else if (direction === 'right') {
      ctx.fillRect(cx - 14 - walkOffset, cy - 42, 8, 18);
    } else {
      // Arms at sides
      ctx.fillRect(cx - 18, cy - 42 + walkOffset, 6, 16);
      ctx.fillRect(cx + 12, cy - 42 - walkOffset, 6, 16);
    }
    
    // Hands
    ctx.fillStyle = skinColor;
    if (direction === 'left') {
      ctx.beginPath();
      ctx.arc(cx + 10 + walkOffset, cy - 24, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (direction === 'right') {
      ctx.beginPath();
      ctx.arc(cx - 10 - walkOffset, cy - 24, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(cx - 15, cy - 26 + walkOffset, 3, 0, Math.PI * 2);
      ctx.arc(cx + 15, cy - 26 - walkOffset, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 50, 10, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Face features
    if (direction === 'down') {
      // Eyes
      ctx.fillStyle = '#2a2a2a';
      ctx.beginPath();
      ctx.arc(cx - 4, cy - 51, 2, 0, Math.PI * 2);
      ctx.arc(cx + 4, cy - 51, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Slight smile or neutral
      ctx.strokeStyle = '#5a4a3a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy - 46, 3, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
    } else if (direction === 'up') {
      // Back of head - just hair color visible under hat
    } else {
      // Side profile
      ctx.fillStyle = '#2a2a2a';
      const eyeX = direction === 'left' ? cx - 2 : cx + 2;
      ctx.beginPath();
      ctx.arc(eyeX, cy - 51, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Fedora hat
    ctx.fillStyle = hatColor;
    // Hat brim
    ctx.beginPath();
    if (direction === 'down') {
      ctx.ellipse(cx, cy - 56, 14, 5, 0, 0, Math.PI * 2);
    } else if (direction === 'up') {
      ctx.ellipse(cx, cy - 58, 14, 5, 0, 0, Math.PI * 2);
    } else {
      ctx.ellipse(cx, cy - 57, 16, 4, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    
    // Hat crown
    ctx.beginPath();
    if (direction === 'down') {
      ctx.moveTo(cx - 10, cy - 56);
      ctx.quadraticCurveTo(cx - 10, cy - 66, cx, cy - 64);
      ctx.quadraticCurveTo(cx + 10, cy - 66, cx + 10, cy - 56);
      ctx.closePath();
    } else if (direction === 'up') {
      ctx.moveTo(cx - 10, cy - 58);
      ctx.quadraticCurveTo(cx - 10, cy - 68, cx, cy - 66);
      ctx.quadraticCurveTo(cx + 10, cy - 68, cx + 10, cy - 58);
      ctx.closePath();
    } else {
      ctx.moveTo(cx - 8, cy - 57);
      ctx.quadraticCurveTo(cx - 8, cy - 67, cx + 2, cy - 65);
      ctx.quadraticCurveTo(cx + 12, cy - 67, cx + 10, cy - 57);
      ctx.closePath();
    }
    ctx.fill();
    
    // Hat band
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 2;
    if (direction === 'down' || direction === 'up') {
      ctx.beginPath();
      ctx.moveTo(cx - 9, cy - 58);
      ctx.lineTo(cx + 9, cy - 58);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  private resolveBackgroundTheme(theme?: string): BackgroundTheme {
    const allowedThemes: BackgroundTheme[] = [
      'study',
      'train',
      'ballroom',
      'hospital',
      'boardroom',
      'tech',
      'newsroom',
      'alley',
      'studio',
      'apartment',
    ];
    if (theme && allowedThemes.includes(theme as BackgroundTheme)) {
      return theme as BackgroundTheme;
    }
    return 'study';
  }

  private generateRoomBackground(
    theme: BackgroundTheme,
    textureKey: string = `room_background_${theme}`
  ): void {
    const ASSET_SCALE = 2;
    const canvas = document.createElement('canvas');
    canvas.width = 960 * ASSET_SCALE;
    canvas.height = 640 * ASSET_SCALE;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(ASSET_SCALE, ASSET_SCALE);
    if (theme === 'train') {
      this.drawTrainCar(ctx);
    } else if (theme === 'alley') {
      this.drawAlley(ctx);
    } else {
      this.drawInteriorBase(ctx, theme);
      this.drawThemeProps(ctx, theme);
    }

    this.textures.addImage(textureKey, canvas as any);
  }

  private drawInteriorBase(ctx: CanvasRenderingContext2D, theme: BackgroundTheme): void {
    const palette = this.getInteriorPalette(theme);

    if (theme === 'hospital' || theme === 'tech' || theme === 'studio') {
      this.drawTileFloor(ctx, palette.floorTile, palette.floorTileLine);
    } else {
      this.drawWoodFloor(ctx, palette.floorPlanks);
    }

    // Carpet
    const carpetGrad = ctx.createRadialGradient(480, 320, 0, 480, 320, 250);
    carpetGrad.addColorStop(0, palette.carpetCenter);
    carpetGrad.addColorStop(0.7, palette.carpetMid);
    carpetGrad.addColorStop(1, palette.carpetOuter);
    ctx.fillStyle = carpetGrad;
    ctx.beginPath();
    ctx.roundRect(180, 140, 600, 360, 20);
    ctx.fill();

    ctx.strokeStyle = palette.carpetBorder;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(195, 155, 570, 330, 15);
    ctx.stroke();

    ctx.strokeStyle = palette.carpetInnerBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(220, 180, 520, 280, 10);
    ctx.stroke();

    // Walls
    const wallGrad = ctx.createLinearGradient(0, 0, 0, 100);
    wallGrad.addColorStop(0, palette.wallTop);
    wallGrad.addColorStop(1, palette.wallBottom);
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, 960, 100);

    for (let x = 20; x < 940; x += 80) {
      ctx.fillStyle = palette.wallPanel;
      ctx.beginPath();
      ctx.roundRect(x, 15, 60, 70, 5);
      ctx.fill();

      ctx.fillStyle = palette.wallPanelInner;
      ctx.beginPath();
      ctx.roundRect(x + 8, 23, 44, 54, 3);
      ctx.fill();
    }

    ctx.fillStyle = palette.molding;
    ctx.fillRect(0, 95, 960, 10);

    ctx.fillStyle = palette.wainscot;
    ctx.fillRect(0, 580, 960, 60);
    ctx.fillStyle = palette.wainscotAccent;
    ctx.fillRect(0, 580, 960, 8);
  }

  private getInteriorPalette(theme: BackgroundTheme): {
    floorPlanks: string[];
    floorTile: string;
    floorTileLine: string;
    carpetCenter: string;
    carpetMid: string;
    carpetOuter: string;
    carpetBorder: string;
    carpetInnerBorder: string;
    wallTop: string;
    wallBottom: string;
    wallPanel: string;
    wallPanelInner: string;
    molding: string;
    wainscot: string;
    wainscotAccent: string;
  } {
    const palette = {
      floorPlanks: ['#6b5344', '#5d4a3a', '#7a6050', '#645040'],
      floorTile: '#bfc7cf',
      floorTileLine: 'rgba(0,0,0,0.15)',
      carpetCenter: '#8B2323',
      carpetMid: '#6B1010',
      carpetOuter: '#4B0808',
      carpetBorder: '#DAA520',
      carpetInnerBorder: '#B8860B',
      wallTop: '#2d1810',
      wallBottom: '#4a2820',
      wallPanel: '#3d2820',
      wallPanelInner: '#4a3530',
      molding: '#5a4a40',
      wainscot: '#3d2820',
      wainscotAccent: '#4a3530',
    };

    const overrides: Partial<typeof palette> = {};
    if (theme === 'ballroom') {
      overrides.carpetCenter = '#6f2da8';
      overrides.carpetMid = '#4f1975';
      overrides.carpetOuter = '#3a0f55';
      overrides.carpetBorder = '#e0b85c';
      overrides.floorPlanks = ['#7a624f', '#6a5445', '#806856', '#705948'];
    } else if (theme === 'hospital') {
      overrides.carpetCenter = '#d9f0f5';
      overrides.carpetMid = '#b8dce5';
      overrides.carpetOuter = '#9cc7d1';
      overrides.carpetBorder = '#7aa6b0';
      overrides.carpetInnerBorder = '#5f8d96';
      overrides.wallTop = '#e6f2f5';
      overrides.wallBottom = '#c8dde3';
      overrides.wallPanel = '#d3e6ea';
      overrides.wallPanelInner = '#c0d8de';
      overrides.wainscot = '#c8dde3';
      overrides.wainscotAccent = '#b3cbd1';
      overrides.floorTile = '#d8e3e6';
    } else if (theme === 'boardroom') {
      overrides.carpetCenter = '#2f3b4a';
      overrides.carpetMid = '#273241';
      overrides.carpetOuter = '#1f2835';
      overrides.carpetBorder = '#8b9db1';
      overrides.carpetInnerBorder = '#6f8096';
      overrides.floorPlanks = ['#4a3b2f', '#3f3228', '#533f32', '#443629'];
    } else if (theme === 'tech') {
      overrides.carpetCenter = '#1e2b3a';
      overrides.carpetMid = '#18222f';
      overrides.carpetOuter = '#111924';
      overrides.carpetBorder = '#2e7ea5';
      overrides.carpetInnerBorder = '#1c5a77';
      overrides.wallTop = '#1a2430';
      overrides.wallBottom = '#263443';
      overrides.wallPanel = '#2a394b';
      overrides.wallPanelInner = '#31485f';
      overrides.molding = '#3c566f';
      overrides.wainscot = '#233140';
      overrides.wainscotAccent = '#2f455b';
      overrides.floorTile = '#283846';
      overrides.floorTileLine = 'rgba(255,255,255,0.08)';
    } else if (theme === 'newsroom') {
      overrides.carpetCenter = '#3d2f2f';
      overrides.carpetMid = '#2f2323';
      overrides.carpetOuter = '#221818';
      overrides.carpetBorder = '#c29f7c';
      overrides.carpetInnerBorder = '#a88768';
      overrides.wallTop = '#2f2a28';
      overrides.wallBottom = '#433a36';
    } else if (theme === 'studio') {
      overrides.carpetCenter = '#2d2d2d';
      overrides.carpetMid = '#232323';
      overrides.carpetOuter = '#1a1a1a';
      overrides.carpetBorder = '#6f6f6f';
      overrides.carpetInnerBorder = '#4f4f4f';
      overrides.wallTop = '#2b2b2b';
      overrides.wallBottom = '#3a3a3a';
      overrides.wallPanel = '#383838';
      overrides.wallPanelInner = '#2f2f2f';
      overrides.floorTile = '#2a2a2a';
      overrides.floorTileLine = 'rgba(255,255,255,0.1)';
    } else if (theme === 'apartment') {
      overrides.carpetCenter = '#7b4c2e';
      overrides.carpetMid = '#643b22';
      overrides.carpetOuter = '#4c2c18';
      overrides.carpetBorder = '#d2a072';
      overrides.carpetInnerBorder = '#b98755';
      overrides.wallTop = '#3a2c25';
      overrides.wallBottom = '#4b3a32';
      overrides.wainscot = '#4b3a32';
      overrides.wainscotAccent = '#5b4740';
    }

    return { ...palette, ...overrides };
  }

  private drawWoodFloor(ctx: CanvasRenderingContext2D, colors: string[]): void {
    for (let y = 0; y < 640; y += 20) {
      for (let x = 0; x < 960; x += 60) {
        const colorIndex = ((x / 60) + (y / 20)) % colors.length;
        ctx.fillStyle = colors[colorIndex];
        ctx.fillRect(x, y, 60, 20);

        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, 60, 20);
      }
    }
  }

  private drawTileFloor(
    ctx: CanvasRenderingContext2D,
    tileColor: string,
    lineColor: string
  ): void {
    ctx.fillStyle = tileColor;
    ctx.fillRect(0, 0, 960, 640);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    for (let y = 0; y < 640; y += 40) {
      for (let x = 0; x < 960; x += 40) {
        ctx.strokeRect(x, y, 40, 40);
      }
    }
  }

  private drawThemeProps(ctx: CanvasRenderingContext2D, theme: BackgroundTheme): void {
    switch (theme) {
      case 'study':
        this.drawStudyProps(ctx);
        break;
      case 'ballroom':
        this.drawBallroomProps(ctx);
        break;
      case 'hospital':
        this.drawHospitalProps(ctx);
        break;
      case 'boardroom':
        this.drawBoardroomProps(ctx);
        break;
      case 'tech':
        this.drawTechProps(ctx);
        break;
      case 'newsroom':
        this.drawNewsroomProps(ctx);
        break;
      case 'studio':
        this.drawStudioProps(ctx);
        break;
      case 'apartment':
        this.drawApartmentProps(ctx);
        break;
      default:
        this.drawStudyProps(ctx);
        break;
    }
  }

  private drawStudyProps(ctx: CanvasRenderingContext2D): void {
    // Large desk (right side)
    ctx.fillStyle = '#3a2515';
    ctx.beginPath();
    ctx.roundRect(720, 50, 200, 80, 8);
    ctx.fill();
    ctx.fillStyle = '#4a3525';
    ctx.beginPath();
    ctx.roundRect(730, 55, 180, 70, 5);
    ctx.fill();

    ctx.fillStyle = '#2a1505';
    ctx.fillRect(730, 130, 15, 50);
    ctx.fillRect(895, 130, 15, 50);

    // Bookshelf (left side)
    ctx.fillStyle = '#3a2515';
    ctx.fillRect(40, 50, 120, 200);
    ctx.fillStyle = '#2a1505';
    ctx.fillRect(45, 55, 110, 190);

    const bookColors = ['#8B0000', '#00008B', '#006400', '#4B0082', '#8B4513'];
    for (let shelf = 0; shelf < 4; shelf++) {
      const shelfY = 65 + shelf * 45;
      ctx.fillStyle = '#3a2515';
      ctx.fillRect(45, shelfY + 35, 110, 8);

      let bookX = 50;
      while (bookX < 145) {
        const bookWidth = 8 + Math.random() * 12;
        const bookHeight = 28 + Math.random() * 8;
        ctx.fillStyle = bookColors[Math.floor(Math.random() * bookColors.length)];
        ctx.fillRect(bookX, shelfY + 35 - bookHeight, bookWidth, bookHeight);
        bookX += bookWidth + 2;
      }
    }

    // Armchair (bottom left)
    ctx.fillStyle = '#4a1818';
    ctx.beginPath();
    ctx.roundRect(60, 450, 100, 80, 15);
    ctx.fill();
    ctx.fillStyle = '#6a2828';
    ctx.beginPath();
    ctx.roundRect(70, 460, 80, 50, 10);
    ctx.fill();
    ctx.fillStyle = '#4a1818';
    ctx.beginPath();
    ctx.roundRect(55, 420, 110, 40, [15, 15, 0, 0]);
    ctx.fill();

    // Fireplace (top center)
    ctx.fillStyle = '#555555';
    ctx.fillRect(380, 5, 200, 95);
    ctx.fillStyle = '#333333';
    ctx.fillRect(400, 30, 160, 65);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(410, 40, 140, 50);
    const fireGrad = ctx.createRadialGradient(480, 70, 0, 480, 70, 30);
    fireGrad.addColorStop(0, 'rgba(255,100,0,0.3)');
    fireGrad.addColorStop(1, 'rgba(255,50,0,0)');
    ctx.fillStyle = fireGrad;
    ctx.fillRect(410, 40, 140, 50);
  }

  private drawBoardroomProps(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#2b1b12';
    ctx.beginPath();
    ctx.roundRect(260, 240, 440, 160, 16);
    ctx.fill();
    ctx.fillStyle = '#3a2a1f';
    ctx.beginPath();
    ctx.roundRect(280, 250, 400, 140, 12);
    ctx.fill();

    ctx.fillStyle = '#1e120b';
    for (let i = 0; i < 6; i++) {
      ctx.roundRect(260 + i * 70, 210, 40, 30, 6);
      ctx.roundRect(260 + i * 70, 400, 40, 30, 6);
      ctx.fill();
    }

    ctx.fillStyle = '#24303a';
    ctx.roundRect(720, 90, 160, 60, 8);
    ctx.fill();
  }

  private drawBallroomProps(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#5a3b2b';
    ctx.fillRect(260, 70, 440, 60);
    ctx.fillStyle = '#8a5c3a';
    ctx.fillRect(280, 80, 400, 40);

    ctx.fillStyle = '#d8c47a';
    ctx.beginPath();
    ctx.arc(480, 140, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#bfa85a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(480, 140, 40, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 215, 120, 0.35)';
    ctx.beginPath();
    ctx.arc(480, 300, 120, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawHospitalProps(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#f5f7f8';
    ctx.fillRect(160, 210, 200, 90);
    ctx.fillRect(600, 210, 200, 90);
    ctx.fillStyle = '#c9d4da';
    ctx.fillRect(170, 220, 180, 50);
    ctx.fillRect(610, 220, 180, 50);

    ctx.fillStyle = '#8aa4b4';
    ctx.fillRect(170, 270, 30, 30);
    ctx.fillRect(760, 270, 30, 30);

    ctx.fillStyle = '#b6cdd8';
    ctx.fillRect(420, 180, 120, 70);
    ctx.fillStyle = '#94acb8';
    ctx.fillRect(430, 190, 100, 20);
  }

  private drawTechProps(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#1a2028';
    ctx.fillRect(70, 120, 120, 300);
    ctx.fillRect(770, 120, 120, 300);
    ctx.fillStyle = '#2d3b4a';
    for (let y = 140; y < 380; y += 40) {
      ctx.fillRect(85, y, 90, 20);
      ctx.fillRect(785, y, 90, 20);
    }
    ctx.fillStyle = '#1d2f3d';
    ctx.beginPath();
    ctx.roundRect(340, 230, 280, 120, 12);
    ctx.fill();
    ctx.fillStyle = '#4bb5ff';
    ctx.fillRect(370, 260, 80, 10);
    ctx.fillRect(470, 260, 80, 10);
    ctx.fillRect(570, 260, 20, 10);
  }

  private drawNewsroomProps(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#3a2c24';
    for (let row = 0; row < 2; row++) {
      const y = 210 + row * 120;
      for (let i = 0; i < 3; i++) {
        const x = 180 + i * 220;
        ctx.fillRect(x, y, 160, 50);
        ctx.fillStyle = '#1d1f2a';
        ctx.fillRect(x + 20, y - 20, 40, 20);
        ctx.fillStyle = '#3a2c24';
      }
    }
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(760, 80, 140, 80);
    ctx.fillStyle = '#4c7d99';
    ctx.fillRect(780, 100, 100, 40);
  }

  private drawStudioProps(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(300, 260, 360, 120);
    ctx.fillStyle = '#3b3b3b';
    for (let x = 320; x < 620; x += 40) {
      ctx.fillRect(x, 280, 20, 60);
    }
    ctx.fillStyle = '#111111';
    ctx.fillRect(220, 200, 60, 120);
    ctx.fillRect(680, 200, 60, 120);
    ctx.fillStyle = '#444444';
    ctx.beginPath();
    ctx.arc(250, 240, 18, 0, Math.PI * 2);
    ctx.arc(710, 240, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#2e2e2e';
    for (let x = 80; x < 880; x += 80) {
      ctx.fillRect(x, 20, 40, 60);
    }
  }

  private drawApartmentProps(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#5b3a2a';
    ctx.fillRect(80, 420, 200, 90);
    ctx.fillStyle = '#7a4f3a';
    ctx.fillRect(90, 440, 180, 50);

    ctx.fillStyle = '#3a2f24';
    ctx.fillRect(700, 120, 180, 60);
    ctx.fillStyle = '#594535';
    ctx.fillRect(710, 130, 160, 20);

    ctx.fillStyle = '#2f5f2f';
    ctx.beginPath();
    ctx.arc(860, 420, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4a2f1f';
    ctx.fillRect(856, 440, 8, 30);
  }

  private drawTrainCar(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#2b2f33';
    ctx.fillRect(0, 0, 960, 640);

    ctx.fillStyle = '#3a3f45';
    for (let x = 0; x < 960; x += 60) {
      ctx.fillRect(x, 240, 40, 180);
      ctx.fillRect(x + 20, 240, 10, 180);
    }

    ctx.fillStyle = '#6b7075';
    ctx.fillRect(0, 80, 960, 120);
    ctx.fillStyle = '#a3b1bf';
    for (let x = 60; x < 900; x += 140) {
      ctx.fillRect(x, 100, 100, 60);
      ctx.fillStyle = '#4a6072';
      ctx.fillRect(x + 8, 108, 84, 44);
      ctx.fillStyle = '#a3b1bf';
    }

    ctx.fillStyle = '#1b1b1b';
    ctx.fillRect(0, 0, 960, 40);
    ctx.fillStyle = '#51565c';
    ctx.fillRect(0, 40, 960, 20);

    ctx.fillStyle = '#444';
    ctx.fillRect(0, 500, 960, 140);
    ctx.fillStyle = '#5a5a5a';
    for (let x = 40; x < 920; x += 220) {
      ctx.fillRect(x, 520, 180, 50);
      ctx.fillRect(x, 580, 180, 30);
    }
  }

  private drawAlley(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#2f2c28';
    ctx.fillRect(0, 0, 960, 640);
    ctx.strokeStyle = '#3b362f';
    for (let y = 0; y < 640; y += 40) {
      for (let x = 0; x < 960; x += 60) {
        ctx.strokeRect(x, y, 60, 40);
      }
    }

    ctx.fillStyle = '#3a2d24';
    ctx.fillRect(0, 0, 960, 140);
    ctx.fillStyle = '#4c3b2f';
    ctx.fillRect(0, 140, 960, 20);

    ctx.fillStyle = '#2c3438';
    ctx.fillRect(100, 380, 80, 60);
    ctx.fillRect(780, 360, 100, 80);
    ctx.fillStyle = '#5a5f66';
    ctx.fillRect(110, 390, 60, 40);
    ctx.fillRect(790, 370, 80, 60);

    ctx.fillStyle = '#c9a227';
    ctx.fillRect(840, 40, 20, 80);
    ctx.beginPath();
    ctx.arc(850, 30, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(201,162,39,0.3)';
    ctx.beginPath();
    ctx.arc(850, 90, 60, 0, Math.PI * 2);
    ctx.fill();
  }

  private generateClueIcon(): void {
    const ASSET_SCALE = 2;
    const canvas = document.createElement('canvas');
    canvas.width = 32 * ASSET_SCALE;
    canvas.height = 32 * ASSET_SCALE;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(ASSET_SCALE, ASSET_SCALE);
    
    // Glow
    const glow = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    glow.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
    glow.addColorStop(0.5, 'rgba(255, 180, 0, 0.4)');
    glow.addColorStop(1, 'rgba(255, 150, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(16, 16, 16, 0, Math.PI * 2);
    ctx.fill();
    
    // Magnifying glass
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(13, 12, 8, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(13, 12, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(19, 18);
    ctx.lineTo(27, 26);
    ctx.stroke();
    
    this.textures.addImage('clue_icon', canvas as any);
  }

  private generateNPCSprites(): void {
    // Wife
    this.generateNPCSprite('npc_wife', '#8B0000', '#f5deb3', '#8B4513');
    // Butler
    this.generateNPCSprite('npc_butler', '#1a1a1a', '#f5deb3', '#808080');
  }

  private generateNPCSprite(key: string, clothColor: string, skinColor: string, hairColor: string): void {
    const ASSET_SCALE = 2;
    const canvas = document.createElement('canvas');
    canvas.width = 48 * ASSET_SCALE;
    canvas.height = 64 * ASSET_SCALE;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(ASSET_SCALE, ASSET_SCALE);
    
    const cx = 24;
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(cx, 60, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body/Dress
    ctx.fillStyle = clothColor;
    ctx.beginPath();
    ctx.moveTo(cx - 14, 58);
    ctx.bezierCurveTo(cx - 16, 40, cx - 10, 28, cx, 26);
    ctx.bezierCurveTo(cx + 10, 28, cx + 16, 40, cx + 14, 58);
    ctx.closePath();
    ctx.fill();
    
    // Collar/accent
    ctx.fillStyle = key.includes('wife') ? '#DAA520' : '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx, 28, 6, 4, 0, 0, Math.PI, true);
    ctx.fill();
    
    // Head
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.ellipse(cx, 18, 10, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Hair
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.ellipse(cx, 12, 12, 8, 0, Math.PI, 0);
    ctx.fill();
    
    // Side hair (for wife)
    if (key.includes('wife')) {
      ctx.beginPath();
      ctx.ellipse(cx - 10, 18, 4, 10, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 10, 18, 4, 10, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Face
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx - 4, 17, 1.5, 0, Math.PI * 2);
    ctx.arc(cx + 4, 17, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(cx, 22, 3, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    
    this.textures.addImage(key, canvas as any);
  }
}
