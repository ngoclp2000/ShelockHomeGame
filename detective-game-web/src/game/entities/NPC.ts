import Phaser from 'phaser';
import { SuspectData } from '../data/types';

/**
 * NPC - Beautiful suspect characters
 */
export class NPC {
  public sprite: Phaser.GameObjects.Sprite;
  public data: SuspectData;
  private nameText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, data: SuspectData) {
    this.data = data;

    // Determine texture based on suspect ID
    const textureKey = data.id === 'suspect_wife' ? 'npc_wife' : 'npc_butler';
    
    this.sprite = scene.add.sprite(x, y, textureKey);
    this.sprite.setDepth(5);

    // Name label
    this.nameText = scene.add.text(x, y - 110, data.name, {
      fontSize: '22px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
      fontStyle: 'bold',
    });
    this.nameText.setOrigin(0.5);
    this.nameText.setDepth(6);

    // Breathing animation
    scene.tweens.add({
      targets: this.sprite,
      scaleY: 1.02,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  public destroy(): void {
    this.sprite.destroy();
    this.nameText.destroy();
  }
}
