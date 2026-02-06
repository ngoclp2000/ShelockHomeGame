import Phaser from 'phaser';
import { ClueData } from '../data/types';

/**
 * Interactable - Hidden clue objects that blend into the environment
 * Player must discover them naturally without obvious markers
 */
export class Interactable {
  public sprite: Phaser.GameObjects.Sprite;
  public data: ClueData;
  private collected: boolean = false;
  private scene: Phaser.Scene;
  private hintText: Phaser.GameObjects.Text | null = null;
  private isNearPlayer: boolean = false;
  private textureKey: string;

  constructor(scene: Phaser.Scene, x: number, y: number, data: ClueData) {
    this.scene = scene;
    this.data = data;
    this.textureKey = `clue_${data.id}`;

    // Generate unique texture for this specific clue
    this.generateClueTexture();

    // Create sprite - looks like a normal object in the room
    this.sprite = scene.add.sprite(x, y, this.textureKey);
    this.sprite.setDepth(5);
    
    // Log for debugging
    console.log(`Created clue: ${data.name} at (${x}, ${y})`);
  }

  private generateClueTexture(): void {
    // Skip if texture already exists
    if (this.scene.textures.exists(this.textureKey)) {
      return;
    }

    const ASSET_SCALE = 2;
    const canvas = document.createElement('canvas');
    canvas.width = 40 * ASSET_SCALE;
    canvas.height = 40 * ASSET_SCALE;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(ASSET_SCALE, ASSET_SCALE);
    
    // Clear canvas
    ctx.clearRect(0, 0, 40, 40);

    // Draw based on clue type
    const clueId = this.data.id.toLowerCase();
    
    if (clueId.includes('knife')) {
      this.drawKnife(ctx);
    } else if (clueId.includes('letter')) {
      this.drawLetter(ctx);
    } else if (clueId.includes('fabric')) {
      this.drawFabric(ctx);
    } else if (clueId.includes('footprint')) {
      this.drawFootprint(ctx);
    } else if (clueId.includes('window') || clueId.includes('latch')) {
      this.drawLatch(ctx);
    } else {
      this.drawGenericItem(ctx);
    }

    // Add texture to manager
    this.scene.textures.addImage(this.textureKey, canvas as any);
  }

  private drawKnife(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(20, 20);
    ctx.rotate(-0.3);
    
    // Blade
    ctx.fillStyle = '#c0c0c0';
    ctx.beginPath();
    ctx.moveTo(-15, -3);
    ctx.lineTo(10, 0);
    ctx.lineTo(-15, 3);
    ctx.closePath();
    ctx.fill();
    
    // Blade edge highlight
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-12, -2);
    ctx.lineTo(8, 0);
    ctx.stroke();
    
    // Blood on blade
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 2, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(5, 1, 3, 1.5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Handle
    ctx.fillStyle = '#4a3020';
    ctx.fillRect(-18, -4, 8, 8);
    ctx.fillStyle = '#5a4030';
    ctx.fillRect(-17, -3, 6, 6);
    
    ctx.restore();
  }

  private drawLetter(ctx: CanvasRenderingContext2D): void {
    // Envelope/letter
    ctx.fillStyle = '#f5f0e0';
    ctx.fillRect(6, 8, 28, 22);
    
    // Paper shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(8, 10, 24, 18);
    
    // Writing lines
    ctx.strokeStyle = 'rgba(50,50,80,0.3)';
    ctx.lineWidth = 1;
    for (let y = 14; y < 26; y += 4) {
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(30, y);
      ctx.stroke();
    }
    
    // Red wax seal
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.arc(28, 24, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a01010';
    ctx.beginPath();
    ctx.arc(27, 23, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawFabric(ctx: CanvasRenderingContext2D): void {
    // Torn red silk fabric
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.moveTo(8, 12);
    ctx.bezierCurveTo(15, 8, 28, 15, 32, 10);
    ctx.bezierCurveTo(35, 18, 30, 32, 26, 34);
    ctx.bezierCurveTo(16, 32, 10, 28, 8, 12);
    ctx.fill();
    
    // Silk sheen
    ctx.fillStyle = 'rgba(255,100,100,0.4)';
    ctx.beginPath();
    ctx.ellipse(18, 20, 8, 5, 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Torn edge details
    ctx.strokeStyle = '#6B0000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, 12);
    ctx.lineTo(6, 16);
    ctx.lineTo(9, 22);
    ctx.lineTo(7, 28);
    ctx.stroke();
  }

  private drawFootprint(ctx: CanvasRenderingContext2D): void {
    // Muddy footprint - small, feminine
    ctx.fillStyle = 'rgba(50,35,15,0.8)';
    
    // Shoe sole shape
    ctx.beginPath();
    ctx.ellipse(20, 18, 7, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Heel
    ctx.beginPath();
    ctx.ellipse(20, 34, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Mud texture
    ctx.fillStyle = 'rgba(70,50,25,0.5)';
    ctx.beginPath();
    ctx.arc(16, 14, 3, 0, Math.PI * 2);
    ctx.arc(24, 16, 2, 0, Math.PI * 2);
    ctx.arc(18, 22, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Mud splatter
    ctx.fillStyle = 'rgba(50,35,15,0.4)';
    ctx.beginPath();
    ctx.arc(30, 18, 3, 0, Math.PI * 2);
    ctx.arc(10, 22, 2, 0, Math.PI * 2);
    ctx.arc(28, 30, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawLatch(ctx: CanvasRenderingContext2D): void {
    // Window latch - broken
    ctx.fillStyle = '#888888';
    ctx.fillRect(10, 14, 20, 8);
    
    // Latch arm - bent/broken
    ctx.fillStyle = '#666666';
    ctx.save();
    ctx.translate(20, 18);
    ctx.rotate(0.4);
    ctx.fillRect(-3, -10, 6, 14);
    ctx.restore();
    
    // Scratch marks (fresh)
    ctx.strokeStyle = '#bbbbbb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(12, 10);
    ctx.lineTo(16, 13);
    ctx.moveTo(24, 11);
    ctx.lineTo(28, 14);
    ctx.moveTo(14, 26);
    ctx.lineTo(18, 28);
    ctx.stroke();
    
    // Base plate
    ctx.fillStyle = '#555555';
    ctx.fillRect(8, 22, 24, 6);
  }

  private drawGenericItem(ctx: CanvasRenderingContext2D): void {
    // Generic suspicious item - small box/object
    ctx.fillStyle = '#5a4a3a';
    ctx.fillRect(10, 12, 20, 16);
    ctx.fillStyle = '#6a5a4a';
    ctx.fillRect(12, 14, 16, 12);
    
    // Gleam/highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(13, 15, 6, 3);
  }

  /**
   * Show subtle hint when player is very close
   */
  public showProximityHint(show: boolean): void {
    if (this.collected) return;
    
    if (show && !this.isNearPlayer) {
      this.isNearPlayer = true;
      
      // Create hint text
      if (!this.hintText) {
        this.hintText = this.scene.add.text(
          this.sprite.x,
          this.sprite.y - 56,
          '[SPACE] Kiểm tra',
          {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 8, y: 4 },
          }
        ).setOrigin(0.5).setDepth(20);
        
        // Fade in
        this.hintText.setAlpha(0);
        this.scene.tweens.add({
          targets: this.hintText,
          alpha: 1,
          duration: 200,
        });
      }
    } else if (!show && this.isNearPlayer) {
      this.isNearPlayer = false;
      
      if (this.hintText) {
        const textToDestroy = this.hintText;
        this.hintText = null;
        
        this.scene.tweens.add({
          targets: textToDestroy,
          alpha: 0,
          duration: 150,
          onComplete: () => {
            textToDestroy.destroy();
          },
        });
      }
    }
  }

  public isCollected(): boolean {
    return this.collected;
  }

  public setCollected(value: boolean): void {
    this.collected = value;
    if (value) {
      // Hide hint immediately
      if (this.hintText) {
        this.hintText.destroy();
        this.hintText = null;
      }
      
      // Collect animation
      this.scene.tweens.add({
        targets: this.sprite,
        y: this.sprite.y - 60,
        alpha: 0,
        scale: 0.5,
        duration: 400,
        ease: 'Back.easeIn',
        onComplete: () => {
          this.sprite.setVisible(false);
        },
      });
    }
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  public destroy(): void {
    this.sprite.destroy();
    if (this.hintText) {
      this.hintText.destroy();
    }
  }
}
