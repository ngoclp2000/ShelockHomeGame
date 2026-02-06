import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { EventBus } from './EventBus';

/**
 * InputSystem - Handles keyboard, touch joystick, and interaction input
 */
export class InputSystem {
  private scene: Phaser.Scene;
  private player: Player;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private wasd: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key } | null = null;
  private interactKey: Phaser.Input.Keyboard.Key | null = null;
  private enabled: boolean = true;
  
  // Touch joystick
  private joystickBase: Phaser.GameObjects.Graphics | null = null;
  private joystickThumb: Phaser.GameObjects.Graphics | null = null;
  private joystickPointer: Phaser.Input.Pointer | null = null;
  private joystickOrigin: { x: number; y: number } = { x: 0, y: 0 };
  private touchDirection: { x: number; y: number } = { x: 0, y: 0 };

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;

    this.setupKeyboard();
    this.setupTouchJoystick();
  }

  private setupKeyboard(): void {
    if (!this.scene.input.keyboard) return;

    // Arrow keys
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    // WASD
    this.wasd = {
      W: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Interact key (SPACE) - primary interaction
    this.interactKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    this.interactKey.on('down', () => {
      if (this.enabled) {
        EventBus.emit('input:interact');
      }
    });

    // Also allow E key for interaction (alternative)
    const altInteractKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );
    altInteractKey.on('down', () => {
      if (this.enabled) {
        EventBus.emit('input:interact');
      }
    });
  }

  private setupTouchJoystick(): void {
    // Create joystick visuals
    const baseX = 100;
    const baseY = this.scene.cameras.main.height - 150;

    this.joystickBase = this.scene.add.graphics();
    this.joystickBase.fillStyle(0x888888, 0.5);
    this.joystickBase.fillCircle(0, 0, 50);
    this.joystickBase.setPosition(baseX, baseY);
    this.joystickBase.setScrollFactor(0);
    this.joystickBase.setDepth(100);
    this.joystickBase.setVisible(false);

    this.joystickThumb = this.scene.add.graphics();
    this.joystickThumb.fillStyle(0xcccccc, 0.8);
    this.joystickThumb.fillCircle(0, 0, 25);
    this.joystickThumb.setPosition(baseX, baseY);
    this.joystickThumb.setScrollFactor(0);
    this.joystickThumb.setDepth(101);
    this.joystickThumb.setVisible(false);

    // Touch events
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.x < this.scene.cameras.main.width / 2) {
        // Left side - joystick
        this.joystickPointer = pointer;
        this.joystickOrigin = { x: pointer.x, y: pointer.y };
        this.joystickBase?.setPosition(pointer.x, pointer.y);
        this.joystickThumb?.setPosition(pointer.x, pointer.y);
        this.joystickBase?.setVisible(true);
        this.joystickThumb?.setVisible(true);
      }
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.joystickPointer && pointer.id === this.joystickPointer.id) {
        const dx = pointer.x - this.joystickOrigin.x;
        const dy = pointer.y - this.joystickOrigin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 50;

        if (distance > 0) {
          const clampedDist = Math.min(distance, maxDist);
          const normX = (dx / distance) * clampedDist;
          const normY = (dy / distance) * clampedDist;

          this.joystickThumb?.setPosition(
            this.joystickOrigin.x + normX,
            this.joystickOrigin.y + normY
          );

          // Normalize to -1 to 1
          this.touchDirection = {
            x: normX / maxDist,
            y: normY / maxDist,
          };
        }
      }
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.joystickPointer && pointer.id === this.joystickPointer.id) {
        this.joystickPointer = null;
        this.touchDirection = { x: 0, y: 0 };
        this.joystickBase?.setVisible(false);
        this.joystickThumb?.setVisible(false);
      }
    });
  }

  /**
   * Get current movement direction
   */
  public getDirection(): { x: number; y: number } {
    if (!this.enabled) return { x: 0, y: 0 };

    let dx = 0;
    let dy = 0;

    // Keyboard input
    if (this.cursors) {
      if (this.cursors.left.isDown) dx -= 1;
      if (this.cursors.right.isDown) dx += 1;
      if (this.cursors.up.isDown) dy -= 1;
      if (this.cursors.down.isDown) dy += 1;
    }

    if (this.wasd) {
      if (this.wasd.A.isDown) dx -= 1;
      if (this.wasd.D.isDown) dx += 1;
      if (this.wasd.W.isDown) dy -= 1;
      if (this.wasd.S.isDown) dy += 1;
    }

    // If no keyboard input, use touch
    if (dx === 0 && dy === 0) {
      dx = this.touchDirection.x;
      dy = this.touchDirection.y;
    }

    return { x: dx, y: dy };
  }

  public setEnabled(value: boolean): void {
    this.enabled = value;
    if (!value) {
      this.touchDirection = { x: 0, y: 0 };
      this.joystickBase?.setVisible(false);
      this.joystickThumb?.setVisible(false);
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }
}
