import Phaser from 'phaser';

/**
 * Player entity - Detective character with trench coat and fedora
 * Sprite format: 4 cols x 4 rows (down, left, right, up)
 */
export class Player {
  public sprite: Phaser.Physics.Arcade.Sprite;
  private scene: Phaser.Scene;
  private speed: number = 360;
  private currentDirection: string = 'down';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;

    this.sprite = scene.physics.add.sprite(x, y, 'player', 0);
    this.sprite.setDepth(10);
    this.sprite.setCollideWorldBounds(true);

    if (this.sprite.body) {
      this.sprite.body.setSize(48, 32);
      this.sprite.body.setOffset(40, 96);
    }

    this.createAnimations();
  }

  private createAnimations(): void {
    const anims = this.scene.anims;
    if (anims.exists('walk_down')) return;

    // 4 frames per row, rows: down(0), left(1), right(2), up(3)
    anims.create({
      key: 'walk_down',
      frames: anims.generateFrameNumbers('player', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    anims.create({
      key: 'walk_left',
      frames: anims.generateFrameNumbers('player', { start: 4, end: 7 }),
      frameRate: 10,
      repeat: -1,
    });

    anims.create({
      key: 'walk_right',
      frames: anims.generateFrameNumbers('player', { start: 8, end: 11 }),
      frameRate: 10,
      repeat: -1,
    });

    anims.create({
      key: 'walk_up',
      frames: anims.generateFrameNumbers('player', { start: 12, end: 15 }),
      frameRate: 10,
      repeat: -1,
    });

    // Idle animations (first frame of each direction)
    anims.create({ key: 'idle_down', frames: [{ key: 'player', frame: 0 }], frameRate: 1 });
    anims.create({ key: 'idle_left', frames: [{ key: 'player', frame: 4 }], frameRate: 1 });
    anims.create({ key: 'idle_right', frames: [{ key: 'player', frame: 8 }], frameRate: 1 });
    anims.create({ key: 'idle_up', frames: [{ key: 'player', frame: 12 }], frameRate: 1 });
  }

  public move(dx: number, dy: number): void {
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    if (magnitude > 0) {
      dx = (dx / magnitude) * this.speed;
      dy = (dy / magnitude) * this.speed;
    }

    this.sprite.setVelocity(dx, dy);

    if (dx === 0 && dy === 0) {
      this.sprite.anims.play(`idle_${this.currentDirection}`, true);
    } else {
      if (Math.abs(dx) > Math.abs(dy)) {
        this.currentDirection = dx > 0 ? 'right' : 'left';
      } else {
        this.currentDirection = dy > 0 ? 'down' : 'up';
      }
      this.sprite.anims.play(`walk_${this.currentDirection}`, true);
    }
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  public getFacingDirection(): { x: number; y: number } {
    const dirs: Record<string, { x: number; y: number }> = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
    };
    return dirs[this.currentDirection] || dirs.down;
  }
}
