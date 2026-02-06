import Phaser from 'phaser';
import { EventBus } from './EventBus';
import { ClueSystem } from './ClueSystem';
import { SaveSystem } from './SaveSystem';
import { CaseLoader } from '../data/caseLoader';
import { ClueData } from '../data/types';

/**
 * EvidenceHUD - In-game display of collected clues and progress
 */
export class EvidenceHUD {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private progressText: Phaser.GameObjects.Text;
  private solveButton: Phaser.GameObjects.Container | null = null;
  private clueIcons: Phaser.GameObjects.Sprite[] = [];
  private clueSlots: Phaser.GameObjects.Graphics[] = [];
  private suspectIcons: Phaser.GameObjects.Container[] = [];
  private suspectSlots: Phaser.GameObjects.Graphics[] = [];
  
  private readonly SCALE = 1.2;
  private readonly SLOT_SIZE = 48;
  private readonly SLOT_GAP = 12;
  private readonly MAX_VISIBLE_CLUES = 6;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // Create container fixed to camera
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(1000);

    // Create background panel header (Clues)
    const panelWidth = (this.SLOT_SIZE + this.SLOT_GAP) * this.MAX_VISIBLE_CLUES + 300;
    const panelHeight = 160 * this.SCALE; // Doubled height for suspects row
    const panelX = scene.cameras.main.width - panelWidth - 20 * this.SCALE;
    const panelY = 20 * this.SCALE;

    const bg = scene.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.85);
    bg.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 16 * this.SCALE);
    bg.lineStyle(2 * this.SCALE, 0xc9a227, 0.8);
    bg.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 16 * this.SCALE);
    
    // Separator line
    bg.lineStyle(1 * this.SCALE, 0x3d3d5c, 0.5);
    bg.strokeLineShape(new Phaser.Geom.Line(
      panelX + 20 * this.SCALE, 
      panelY + panelHeight / 2, 
      panelX + panelWidth - 20 * this.SCALE, 
      panelY + panelHeight / 2
    ));

    this.container.add(bg);

    // --- Row 1: Clues ---
    const totalClues = this.getTotalClues();
    const clueSlotsToShow = Math.min(totalClues, this.MAX_VISIBLE_CLUES);
    
    for (let i = 0; i < clueSlotsToShow; i++) {
      const slotX = panelX + 20 * this.SCALE + i * (this.SLOT_SIZE + this.SLOT_GAP);
      const slotY = panelY + 20 * this.SCALE;
      
      const slot = scene.add.graphics();
      slot.fillStyle(0x2d2d44, 0.8);
      slot.fillRoundedRect(slotX, slotY, this.SLOT_SIZE, this.SLOT_SIZE, 8 * this.SCALE);
      slot.lineStyle(1 * this.SCALE, 0x3d3d5c, 1);
      slot.strokeRoundedRect(slotX, slotY, this.SLOT_SIZE, this.SLOT_SIZE, 8 * this.SCALE);
      this.container.add(slot);
      this.clueSlots.push(slot);
    }

    // --- Row 2: Suspects ---
    const suspects = CaseLoader.getCurrentCase()?.suspects || [];
    const suspectSlotsToShow = Math.min(suspects.length, this.MAX_VISIBLE_CLUES);

    for (let i = 0; i < suspectSlotsToShow; i++) {
      const slotX = panelX + 20 * this.SCALE + i * (this.SLOT_SIZE + this.SLOT_GAP);
      const slotY = panelY + 85 * this.SCALE; // Second row offset
      
      const slot = scene.add.graphics();
      slot.fillStyle(0x2d2d44, 0.8);
      slot.fillRoundedRect(slotX, slotY, this.SLOT_SIZE, this.SLOT_SIZE, 8 * this.SCALE);
      slot.lineStyle(1 * this.SCALE, 0x3d3d5c, 1);
      slot.strokeRoundedRect(slotX, slotY, this.SLOT_SIZE, this.SLOT_SIZE, 8 * this.SCALE);
      this.container.add(slot);
      this.suspectSlots.push(slot);
    }

    // Progress text (Clues)
    const progressX = panelX + 20 * this.SCALE + this.MAX_VISIBLE_CLUES * (this.SLOT_SIZE + this.SLOT_GAP) + 10 * this.SCALE;
    const progressY = panelY + 40 * this.SCALE;
    
    this.progressText = scene.add.text(progressX, progressY, '', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.progressText.setOrigin(0, 0.5);
    this.container.add(this.progressText);

    // Setup event listeners
    EventBus.on('clue:collected', () => this.refresh());
    EventBus.on('dialogue:end', () => this.refresh()); // Refresh when dialogue ends to update status
    EventBus.on('dialogue:start', () => this.refresh());

    // Handle screen resize
    this.scene.scale.on('resize', this.handleResize, this);

    // Initial refresh
    this.refresh();
  }

  private handleResize(gameSize: Phaser.Structs.Size): void {
    // Re-render to update positions relative to new screen width
    // clear() is called inside refresh() implicitly via destroying old objects
    this.refresh();
  }

  private getTotalClues(): number {
    const caseData = CaseLoader.getCurrentCase();
    return caseData?.clues.length || 0;
  }

  private getCollectedCount(): number {
    return ClueSystem.getCollectedClues().length;
  }

  public refresh(): void {
    const collectedClues = ClueSystem.getCollectedClues();
    const totalClues = this.getTotalClues();
    const collectedCount = collectedClues.length;

    // Update progress text
    this.progressText.setText(`📋 ${collectedCount}/${totalClues}`);

    // Update clue icons
    this.updateClueIcons(collectedClues);

    // Update suspect icons
    this.updateSuspectIcons();

    // Show/hide solve button
    if (collectedCount >= totalClues && totalClues > 0) {
      this.showSolveButton();
    } else {
      this.hideSolveButton();
    }
  }

  private updateClueIcons(collectedClues: ClueData[]): void {
    // Clear existing icons
    this.clueIcons.forEach(icon => icon.destroy());
    this.clueIcons = [];

    // Get panel position
    const panelWidth = (this.SLOT_SIZE + this.SLOT_GAP) * this.MAX_VISIBLE_CLUES + 300;
    const panelX = this.scene.cameras.main.width - panelWidth - 20 * this.SCALE;
    const panelY = 20 * this.SCALE;

    const cluesToShow = collectedClues.slice(0, this.MAX_VISIBLE_CLUES);
    
    cluesToShow.forEach((clue, i) => {
      const slotX = panelX + 20 * this.SCALE + i * (this.SLOT_SIZE + this.SLOT_GAP);
      const slotY = panelY + 20 * this.SCALE;
      
      const emoji = this.getClueEmoji(clue);
      
      const icon = this.scene.add.text(
        slotX + this.SLOT_SIZE / 2,
        slotY + this.SLOT_SIZE / 2,
        emoji,
        { fontSize: '40px' }
      );
      icon.setOrigin(0.5);
      icon.setInteractive({ useHandCursor: true });
      icon.on('pointerdown', () => {
        EventBus.emit('ui:open', { panel: 'clues' });
      });

      this.container.add(icon);
      this.clueIcons.push(icon as any);

      // Animation only if just created (simple check: if it's the last one and recent... skipping for simplicity)
    });
  }

  private updateSuspectIcons(): void {
    // Clear existing
    this.suspectIcons.forEach(icon => icon.destroy());
    this.suspectIcons = [];

    const suspects = CaseLoader.getCurrentCase()?.suspects || [];
    const panelWidth = (this.SLOT_SIZE + this.SLOT_GAP) * this.MAX_VISIBLE_CLUES + 300;
    const panelX = this.scene.cameras.main.width - panelWidth - 20 * this.SCALE;
    const panelY = 20 * this.SCALE;

    const suspectsToShow = suspects.slice(0, this.MAX_VISIBLE_CLUES);

    suspectsToShow.forEach((suspect, i) => {
      const slotX = panelX + 20 * this.SCALE + i * (this.SLOT_SIZE + this.SLOT_GAP);
      const slotY = panelY + 85 * this.SCALE;

      const container = this.scene.add.container(slotX + this.SLOT_SIZE / 2, slotY + this.SLOT_SIZE / 2);
      container.setSize(this.SLOT_SIZE, this.SLOT_SIZE);
      container.setInteractive({ useHandCursor: true });
      
      container.on('pointerdown', () => {
        EventBus.emit('ui:open', { panel: 'suspects' });
      });
      
      // Avatar
      const avatar = this.scene.add.text(0, 0, '👤', { fontSize: '40px' });
      avatar.setOrigin(0.5);
      container.add(avatar);

      // Check status
      const hasMet = this.hasMetSuspect(suspect.id);
      
      if (!hasMet) {
        // Question mark overlay
        const status = this.scene.add.text(10 * this.SCALE, 10 * this.SCALE, '❓', { 
          fontSize: '24px',
          color: '#ff4444',
          stroke: '#000000',
          strokeThickness: 4
        });
        status.setOrigin(0.5);
        container.add(status);
        avatar.setAlpha(0.6); // Dim unmet suspects
      } else {
        avatar.setAlpha(1);
      }

      this.container.add(container);
      this.suspectIcons.push(container);
    });

    // Add Notebook Button if not exists
    this.addNotebookButton(panelX, panelY);
  }

  private addNotebookButton(panelX: number, panelY: number): void {
    // Check if we already have it (hacky but functional for now)
    // Ideally store it in a property, but for this quick add:
    const notebookBtnName = 'notebookBtn';
    const existing = this.container.getByName(notebookBtnName);
    if (existing) return;

    const btnX = panelX - 60 * this.SCALE;
    const btnY = panelY + 40 * this.SCALE;

    const btn = this.scene.add.container(btnX, btnY);
    btn.setName(notebookBtnName);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x2d2d44, 1);
    bg.fillRoundedRect(-25 * this.SCALE, -25 * this.SCALE, 50 * this.SCALE, 50 * this.SCALE, 12 * this.SCALE);
    bg.lineStyle(2 * this.SCALE, 0xc9a227, 0.8);
    bg.strokeRoundedRect(-25 * this.SCALE, -25 * this.SCALE, 50 * this.SCALE, 50 * this.SCALE, 12 * this.SCALE);

    const icon = this.scene.add.text(0, 0, '📓', { fontSize: '32px' });
    icon.setOrigin(0.5);

    btn.add([bg, icon]);
    btn.setSize(50 * this.SCALE, 50 * this.SCALE);
    btn.setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => {
      EventBus.emit('ui:open', { panel: 'notebook' });
    });

    this.container.add(btn);
  }

  private hasMetSuspect(suspectId: string): boolean {
    const caseId = CaseLoader.getCurrentCaseId();
    if (!caseId) return false;

    const saveData = SaveSystem.load(caseId);
    if (!saveData) return false;

    // Check if any questions have been asked to this suspect
    const asked = saveData.askedQuestions[suspectId];
    return asked && asked.length > 0;
  }

  private getClueEmoji(clue: ClueData): string {
    // Map clue types to emojis
    const clueId = clue.id.toLowerCase();
    if (clueId.includes('knife') || clueId.includes('weapon')) return '🔪';
    if (clueId.includes('letter') || clueId.includes('note')) return '📄';
    if (clueId.includes('blood')) return '🩸';
    if (clueId.includes('footprint') || clueId.includes('shoe')) return '👣';
    if (clueId.includes('glass') || clueId.includes('window')) return '🪟';
    if (clueId.includes('photo')) return '📷';
    if (clueId.includes('key')) return '🔑';
    if (clueId.includes('phone')) return '📱';
    if (clueId.includes('poison')) return '☠️';
    if (clueId.includes('rope')) return '🪢';
    return '🔍'; // Default
  }

  private showSolveButton(): void {
    if (this.solveButton) return;

    const panelWidth = (this.SLOT_SIZE + this.SLOT_GAP) * this.MAX_VISIBLE_CLUES + 300;
    const panelX = this.scene.cameras.main.width - panelWidth - 20 * this.SCALE;
    const panelY = 20 * this.SCALE;
    const panelHeight = 80 * this.SCALE;

    const btnX = panelX + panelWidth - 140 * this.SCALE;
    const btnY = panelY + panelHeight / 2;

    this.solveButton = this.scene.add.container(btnX, btnY);
    
    const btnBg = this.scene.add.graphics();
    btnBg.fillStyle(0xc9a227, 1);
    btnBg.fillRoundedRect(-60 * this.SCALE, -20 * this.SCALE, 120 * this.SCALE, 40 * this.SCALE, 10 * this.SCALE);

    const btnText = this.scene.add.text(0, 0, '💡 Phá án!', {
      fontSize: '24px',
      color: '#1a1a2e',
      fontStyle: 'bold',
    });
    btnText.setOrigin(0.5);

    this.solveButton.add([btnBg, btnText]);
    this.solveButton.setSize(120 * this.SCALE, 40 * this.SCALE);
    this.solveButton.setInteractive({ useHandCursor: true });
    this.container.add(this.solveButton);

    // Pulse animation
    this.scene.tweens.add({
      targets: this.solveButton,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Click handler
    this.solveButton.on('pointerdown', () => {
      EventBus.emit('ui:open', { panel: 'deduction' });
    });
  }

  private hideSolveButton(): void {
    if (this.solveButton) {
      this.solveButton.destroy();
      this.solveButton = null;
    }
  }

  public destroy(): void {
    EventBus.off('clue:collected', () => this.refresh());
    this.container.destroy();
  }
}
