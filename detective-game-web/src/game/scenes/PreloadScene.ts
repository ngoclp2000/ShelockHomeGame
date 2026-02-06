import Phaser from 'phaser';
import { CaseLoader } from '../data/caseLoader';
import { EventBus } from '../systems/EventBus';

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
    this.generateRoomBackground();
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

  private generateRoomBackground(): void {
    const ASSET_SCALE = 2;
    const canvas = document.createElement('canvas');
    canvas.width = 960 * ASSET_SCALE;
    canvas.height = 640 * ASSET_SCALE;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(ASSET_SCALE, ASSET_SCALE);
    
    // Beautiful Victorian room
    
    // Wood floor with planks
    const woodColors = ['#6b5344', '#5d4a3a', '#7a6050', '#645040'];
    for (let y = 0; y < 640; y += 20) {
      for (let x = 0; x < 960; x += 60) {
        const colorIndex = ((x / 60) + (y / 20)) % woodColors.length;
        ctx.fillStyle = woodColors[colorIndex];
        ctx.fillRect(x, y, 60, 20);
        
        // Plank lines
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, 60, 20);
      }
    }
    
    // Rich carpet in center
    const carpetGrad = ctx.createRadialGradient(480, 320, 0, 480, 320, 250);
    carpetGrad.addColorStop(0, '#8B2323');
    carpetGrad.addColorStop(0.7, '#6B1010');
    carpetGrad.addColorStop(1, '#4B0808');
    ctx.fillStyle = carpetGrad;
    ctx.beginPath();
    ctx.roundRect(180, 140, 600, 360, 20);
    ctx.fill();
    
    // Carpet gold border
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(195, 155, 570, 330, 15);
    ctx.stroke();
    
    // Carpet inner pattern
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(220, 180, 520, 280, 10);
    ctx.stroke();
    
    // Walls - dark wood paneled
    const wallGrad = ctx.createLinearGradient(0, 0, 0, 100);
    wallGrad.addColorStop(0, '#2d1810');
    wallGrad.addColorStop(1, '#4a2820');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, 960, 100);
    
    // Wall panels
    for (let x = 20; x < 940; x += 80) {
      ctx.fillStyle = '#3d2820';
      ctx.beginPath();
      ctx.roundRect(x, 15, 60, 70, 5);
      ctx.fill();
      
      // Panel inner
      ctx.fillStyle = '#4a3530';
      ctx.beginPath();
      ctx.roundRect(x + 8, 23, 44, 54, 3);
      ctx.fill();
    }
    
    // Wall crown molding
    ctx.fillStyle = '#5a4a40';
    ctx.fillRect(0, 95, 960, 10);
    
    // Wainscoting bottom
    ctx.fillStyle = '#3d2820';
    ctx.fillRect(0, 580, 960, 60);
    ctx.fillStyle = '#4a3530';
    ctx.fillRect(0, 580, 960, 8);
    
    // Furniture
    
    // Large desk (right side)
    ctx.fillStyle = '#3a2515';
    ctx.beginPath();
    ctx.roundRect(720, 50, 200, 80, 8);
    ctx.fill();
    ctx.fillStyle = '#4a3525';
    ctx.beginPath();
    ctx.roundRect(730, 55, 180, 70, 5);
    ctx.fill();
    
    // Desk legs
    ctx.fillStyle = '#2a1505';
    ctx.fillRect(730, 130, 15, 50);
    ctx.fillRect(895, 130, 15, 50);
    
    // Bookshelf (left side)
    ctx.fillStyle = '#3a2515';
    ctx.fillRect(40, 50, 120, 200);
    ctx.fillStyle = '#2a1505';
    ctx.fillRect(45, 55, 110, 190);
    
    // Books on shelf
    const bookColors = ['#8B0000', '#00008B', '#006400', '#4B0082', '#8B4513'];
    for (let shelf = 0; shelf < 4; shelf++) {
      const shelfY = 65 + shelf * 45;
      // Shelf
      ctx.fillStyle = '#3a2515';
      ctx.fillRect(45, shelfY + 35, 110, 8);
      
      // Books
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
    // Chair cushion
    ctx.fillStyle = '#6a2828';
    ctx.beginPath();
    ctx.roundRect(70, 460, 80, 50, 10);
    ctx.fill();
    // Chair back
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
    // Fire glow
    const fireGrad = ctx.createRadialGradient(480, 70, 0, 480, 70, 30);
    fireGrad.addColorStop(0, 'rgba(255,100,0,0.3)');
    fireGrad.addColorStop(1, 'rgba(255,50,0,0)');
    ctx.fillStyle = fireGrad;
    ctx.fillRect(410, 40, 140, 50);
    
    this.textures.addImage('room_background', canvas as any);
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
