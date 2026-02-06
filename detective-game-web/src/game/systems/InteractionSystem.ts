import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Interactable } from '../entities/Interactable';
import { NPC } from '../entities/NPC';
import { EventBus } from './EventBus';
import { ClueSystem } from './ClueSystem';
import { DialogueSystem } from './DialogueSystem';

/**
 * InteractionSystem - Handles proximity detection and interaction
 * Clues are hidden - only shows hint when VERY close (within 30px)
 */
export class InteractionSystem {
  private scene: Phaser.Scene;
  private player: Player;
  private interactables: Interactable[];
  private npcs: NPC[];
  private clueProximityRadius: number = 70; // 35 * 2
  private npcProximityRadius: number = 120; // 60 * 2
  private currentTarget: Interactable | NPC | null = null;
  private npcPromptText: Phaser.GameObjects.Text | null = null;
  private interactButton: Phaser.GameObjects.Container | null = null;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    interactables: Interactable[],
    npcs: NPC[]
  ) {
    this.scene = scene;
    this.player = player;
    this.interactables = interactables;
    this.npcs = npcs;

    this.createMobileButton();
    this.setupEventListeners();
  }

  private createMobileButton(): void {
    // Mobile interact button - only for NPCs
    const SCALE = 2;
    this.interactButton = this.scene.add.container(
      this.scene.cameras.main.width - (80 * SCALE),
      this.scene.cameras.main.height - (150 * SCALE)
    );
    this.interactButton.setScrollFactor(0);
    this.interactButton.setDepth(100);

    const btnBg = this.scene.add.graphics();
    btnBg.fillStyle(0xc9a227, 0.9);
    btnBg.fillCircle(0, 0, 35 * SCALE);

    const btnText = this.scene.add.text(0, 0, '💬', {
      fontSize: '48px', // 24 * 2
    });
    btnText.setOrigin(0.5);

    this.interactButton.add([btnBg, btnText]);
    this.interactButton.setSize(70 * SCALE, 70 * SCALE);
    this.interactButton.setInteractive();
    this.interactButton.setVisible(false);

    this.interactButton.on('pointerdown', () => {
      this.interact();
    });

    // NPC prompt text
    this.npcPromptText = this.scene.add.text(0, 0, '', {
      fontSize: '22px', // 11 * 2
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 12, y: 6 },
    });
    this.npcPromptText.setOrigin(0.5);
    this.npcPromptText.setDepth(50);
    this.npcPromptText.setVisible(false);
  }

  private setupEventListeners(): void {
    EventBus.on('input:interact', () => {
      this.interact();
    });
  }

  /**
   * Update - check proximity each frame
   */
  public update(): void {
    const playerPos = this.player.getPosition();
    let nearestClue: Interactable | null = null;
    let nearestClueDist = Infinity;
    let nearestNPC: NPC | null = null;
    let nearestNPCDist = Infinity;

    // Check clue interactables - update proximity hints
    for (const interactable of this.interactables) {
      if (interactable.isCollected()) continue;

      const pos = interactable.getPosition();
      const dist = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        pos.x,
        pos.y
      );

      // Show/hide proximity hint based on distance
      interactable.showProximityHint(dist < this.clueProximityRadius);

      if (dist < this.clueProximityRadius && dist < nearestClueDist) {
        nearestClueDist = dist;
        nearestClue = interactable;
      }
    }

    // Check NPCs
    for (const npc of this.npcs) {
      const pos = npc.getPosition();
      const dist = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        pos.x,
        pos.y
      );

      if (dist < this.npcProximityRadius && dist < nearestNPCDist) {
        nearestNPCDist = dist;
        nearestNPC = npc;
      }
    }

    // Determine current target (clues take priority if very close)
    const newTarget = nearestClue ?? nearestNPC ?? null;

    if (newTarget !== this.currentTarget) {
      this.currentTarget = newTarget;
      this.updateNPCPrompt();
    }

    // Update NPC prompt position
    if (this.currentTarget instanceof NPC && this.npcPromptText) {
      const pos = this.currentTarget.getPosition();
      this.npcPromptText.setPosition(pos.x, pos.y - 100);
    }
  }

  private updateNPCPrompt(): void {
    // Only show prompt for NPCs, clues handle their own hints
    if (this.currentTarget instanceof NPC) {
      const name = this.currentTarget.data.name.split('(')[0].trim();
      this.npcPromptText?.setText(`[SPACE] Nói chuyện với ${name}`);
      this.npcPromptText?.setVisible(true);
      this.interactButton?.setVisible(true);
    } else {
      this.npcPromptText?.setVisible(false);
      // Only show mobile button for NPCs
      this.interactButton?.setVisible(false);
    }
  }

  private interact(): void {
    if (!this.currentTarget) return;

    if (this.currentTarget instanceof Interactable) {
      // Collect clue
      ClueSystem.collectClue(this.currentTarget.data);
      this.currentTarget.setCollected(true);
      this.currentTarget = null;
      this.updateNPCPrompt();
    } else if (this.currentTarget instanceof NPC) {
      // Start dialogue
      DialogueSystem.startDialogue(this.currentTarget.data);
    }
  }
}
