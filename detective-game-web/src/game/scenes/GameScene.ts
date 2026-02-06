import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Interactable } from '../entities/Interactable';
import { NPC } from '../entities/NPC';
import { InputSystem } from '../systems/InputSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { EvidenceHUD } from '../systems/EvidenceHUD';
import { DialogueHUD } from '../systems/DialogueHUD';
import { CaseLoader } from '../data/caseLoader';
import { EventBus } from '../systems/EventBus';
import { SaveSystem } from '../systems/SaveSystem';

/**
 * GameScene - Main gameplay scene with tilemap and entities
 */
export class GameScene extends Phaser.Scene {
  private player!: Player;
  private inputSystem!: InputSystem;
  private interactionSystem!: InteractionSystem;
  private evidenceHUD!: EvidenceHUD;
  private dialogueHUD!: DialogueHUD;
  private interactables: Interactable[] = [];
  private npcs: NPC[] = [];
  private caseId: string = 'case_001';

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { caseId?: string }): void {
    if (data.caseId) {
      this.caseId = data.caseId;
    }
  }

  create(): void {
    // Create tilemap
    const map = this.createTilemap();

    // Create player
    this.player = new Player(this, 400, 600);

    // Setup camera
    this.setupCamera(map);

    // Create input system
    this.inputSystem = new InputSystem(this, this.player);

    // Spawn interactables and NPCs from map objects
    this.spawnMapObjects(map);

    // Create interaction system
    this.interactionSystem = new InteractionSystem(
      this,
      this.player,
      this.interactables,
      this.npcs
    );

    // Setup collision
    if (map) {
      this.setupCollision(map);
    }

    // Load save data
    this.loadSaveData();

    // Listen for events
    this.setupEventListeners();

    // Emit scene ready
    EventBus.emit('scene:ready', { caseId: this.caseId });

    // Create Evidence HUD (in-game display of collected clues)
    this.evidenceHUD = new EvidenceHUD(this);
    this.dialogueHUD = new DialogueHUD(this);
  }

  private createTilemap(): Phaser.Tilemaps.Tilemap | null {
    // Always use beautiful generated room background
    this.createFallbackMap();
    return null;
  }

  private createFallbackMap(): void {
    const SCALE = 2; // Resolution scale
    const width = 960 * SCALE;
    const height = 640 * SCALE;
    
    // Use the beautiful generated room background
    const caseData = CaseLoader.getCurrentCase();
    const themeKey = caseData?.backgroundTheme
      ? `room_background_${caseData.backgroundTheme}`
      : 'room_background';

    if (this.textures.exists(themeKey)) {
      const bg = this.add.image(width / 2, height / 2, themeKey);
      bg.setDepth(0);
    } else if (this.textures.exists('room_background')) {
      const bg = this.add.image(width / 2, height / 2, 'room_background');
      bg.setDepth(0);
    } else {
      // Fallback solid color
      const graphics = this.add.graphics();
      graphics.fillStyle(0x3d2e1f);
      graphics.fillRect(0, 0, width, height);
      graphics.setDepth(0);
    }
    
    // Set world bounds
    this.physics.world.setBounds(50 * SCALE, 100 * SCALE, width - (100 * SCALE), height - (150 * SCALE));
  }

  private setupCamera(map: Phaser.Tilemaps.Tilemap | null): void {
    const SCALE = 2;
    const camera = this.cameras.main;
    camera.startFollow(this.player.sprite, true, 0.1, 0.1);
    
    if (map) {
      camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    } else {
      camera.setBounds(0, 0, 960 * SCALE, 640 * SCALE);
    }

    // Zoom for pixel art - reduced zoom since resolution is higher
    camera.setZoom(1.0);
  }

  private spawnMapObjects(map: Phaser.Tilemaps.Tilemap | null): void {
    const caseData = CaseLoader.getCurrentCase();
    if (!caseData) {
      console.warn('No case data loaded');
      return;
    }

    // Try to get objects from map
    let objectLayer: Phaser.Tilemaps.ObjectLayer | null = null;
    if (map) {
      objectLayer = map.getObjectLayer('Objects');
    }

    if (objectLayer) {
      // Spawn from Tiled map objects
      objectLayer.objects.forEach((obj) => {
        this.spawnObjectFromTiled(obj, caseData);
      });
    } else {
      // Fallback: spawn from case data
      this.spawnFromCaseData(caseData);
    }
  }

  private spawnObjectFromTiled(
    obj: Phaser.Types.Tilemaps.TiledObject,
    caseData: ReturnType<typeof CaseLoader.getCurrentCase>
  ): void {
    if (!caseData) return;

    const x = obj.x ?? 0;
    const y = obj.y ?? 0;

    if (obj.type === 'clue') {
      const clueData = caseData.clues.find((c) => c.id === obj.name);
      if (clueData) {
        const interactable = new Interactable(this, x, y, clueData);
        this.interactables.push(interactable);
      }
    } else if (obj.type === 'npc') {
      const suspectData = caseData.suspects.find((s) => s.id === obj.name);
      if (suspectData) {
        const npc = new NPC(this, x, y, suspectData);
        this.npcs.push(npc);
      }
    }
  }

  private spawnFromCaseData(
    caseData: ReturnType<typeof CaseLoader.getCurrentCase>
  ): void {
    if (!caseData) return;

    // Clear existing entities first
    this.interactables.forEach(i => i.destroy());
    this.npcs.forEach(n => n.destroy());
    this.interactables = [];
    this.npcs = [];

    const SCALE = 2;

    // Clue positions spread across the ENTIRE room:
    // - Near bookshelf (left): 100-150, 180-250
    // - Near fireplace (top center): 450-520, 140-180
    // - On carpet (center): 350-550, 300-380
    // - Near desk (right): 700-800, 180-220
    // - Near armchair (bottom left): 100-160, 420-480
    const cluePositions: Record<string, { x: number; y: number }> = {
      'clue_bloody_knife': { x: 140 * SCALE, y: 205 * SCALE },       // Near bookshelf (visible early)
      'clue_threatening_letter': { x: 720 * SCALE, y: 180 * SCALE }, // On desk (right side)
      'clue_torn_fabric': { x: 480 * SCALE, y: 150 * SCALE },        // Near fireplace (top center)
      'clue_muddy_footprint': { x: 350 * SCALE, y: 340 * SCALE },    // On carpet (center)
      'clue_window_latch': { x: 130 * SCALE, y: 450 * SCALE },       // Near armchair (bottom left)
    };

    // Default positions if clue not in map - spread across room
    const defaultPositions = [
      { x: 150 * SCALE, y: 220 * SCALE },  // Left side
      { x: 480 * SCALE, y: 160 * SCALE },  // Top center
      { x: 400 * SCALE, y: 320 * SCALE },  // Center
      { x: 600 * SCALE, y: 280 * SCALE },  // Right center
      { x: 250 * SCALE, y: 420 * SCALE },  // Bottom left
    ];

    console.log(`Spawning ${caseData.clues.length} clues for ${this.caseId}`);

    caseData.clues.forEach((clue, index) => {
      const pos = cluePositions[clue.id] || defaultPositions[index % defaultPositions.length];
      console.log(`  - ${clue.name} at (${pos.x}, ${pos.y})`);
      const interactable = new Interactable(this, pos.x, pos.y, clue);
      this.interactables.push(interactable);
    });

    const npcPositions = this.getNpcPositions(caseData.suspects.length, SCALE);

    console.log(`Spawning ${caseData.suspects.length} NPCs`);

    caseData.suspects.forEach((suspect, index) => {
      const pos = npcPositions[index % npcPositions.length];
      console.log(`  - ${suspect.name} at (${pos.x}, ${pos.y})`);
      const npc = new NPC(this, pos.x, pos.y, suspect);
      this.npcs.push(npc);
    });
  }

  private setupCollision(map: Phaser.Tilemaps.Tilemap): void {
    const SCALE = 2;
    const wallsLayer = map.getLayer('Walls');
    if (wallsLayer) {
      this.physics.add.collider(
        this.player.sprite,
        wallsLayer.tilemapLayer as Phaser.Tilemaps.TilemapLayer
      );
    }

    // World bounds collision
    const body = this.player.sprite.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setCollideWorldBounds(true);
    }
    this.physics.world.setBounds(32 * SCALE, 32 * SCALE, 896 * SCALE, 576 * SCALE);
  }

  private getNpcPositions(
    count: number,
    scale: number
  ): { x: number; y: number }[] {
    const centerX = 480 * scale;
    const centerY = 320 * scale;
    const radiusX = 140 * scale;
    const radiusY = 90 * scale;

    if (count <= 1) {
      return [{ x: centerX, y: centerY }];
    }

    const positions: { x: number; y: number }[] = [];
    const angleStep = (Math.PI * 2) / count;
    const startAngle = -Math.PI / 2;
    for (let i = 0; i < count; i++) {
      const angle = startAngle + angleStep * i;
      positions.push({
        x: centerX + Math.cos(angle) * radiusX,
        y: centerY + Math.sin(angle) * radiusY,
      });
    }

    return positions;
  }

  private loadSaveData(): void {
    const saveData = SaveSystem.load(this.caseId);
    if (saveData) {
      // Mark collected clues as collected
      saveData.collectedClues.forEach((clueId) => {
        const interactable = this.interactables.find(
          (i) => i.data.id === clueId
        );
        if (interactable) {
          interactable.setCollected(true);
        }
      });

      // Restore player position
      if (saveData.playerPosition) {
        this.player.sprite.setPosition(
          saveData.playerPosition.x,
          saveData.playerPosition.y
        );
      }
    }
  }

  private setupEventListeners(): void {
    // Pause input when UI opens
    EventBus.on('input:pause', () => {
      this.inputSystem.setEnabled(false);
    });

    EventBus.on('input:resume', () => {
      this.inputSystem.setEnabled(true);
    });

    // Save game periodically
    EventBus.on('game:save', () => {
      this.saveGame();
    });
  }

  private saveGame(): void {
    SaveSystem.save(this.caseId, {
      playerPosition: {
        x: this.player.sprite.x,
        y: this.player.sprite.y,
      },
    });
  }

  update(): void {
    // Update player movement
    if (this.inputSystem.isEnabled()) {
      const direction = this.inputSystem.getDirection();
      this.player.move(direction.x, direction.y);
    } else {
      this.player.move(0, 0);
    }

    // Check interactions
    this.interactionSystem.update();
  }
}
