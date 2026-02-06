import Phaser from 'phaser';
import { EventBus } from './EventBus';
import { DialogueSystem } from './DialogueSystem';
import { SuspectData, QuestionData } from '../data/types';

/**
 * DialogueHUD - In-game display for NPC conversations
 * Replaces the HTML DialogueModal to ensure consistent input handling.
 */
export class DialogueHUD {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private overlay: Phaser.GameObjects.Graphics;
  private panel: Phaser.GameObjects.Container;
  
  private currentSuspect: SuspectData | null = null;
  private currentQuestions: QuestionData[] = [];
  private currentAnswer: string | null = null;

  private readonly SCALE = 1.2;
  private readonly WIDTH = 800;
  private readonly HEIGHT = 600;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    // Create main container fixed to camera
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(2000); // Top layer
    this.container.setVisible(false);

    // Dark overlay background
    this.overlay = scene.add.graphics();
    this.overlay.fillStyle(0x000000, 0.7);
    this.overlay.fillRect(0, 0, scene.scale.width, scene.scale.height); // Will need update on resize
    this.container.add(this.overlay);

    // Panel container
    this.panel = scene.add.container(0, 0);
    this.container.add(this.panel);

    // Event listeners
    EventBus.on('dialogue:start', (data: { suspect: SuspectData, questions: QuestionData[] }) => {
      this.show(data.suspect, data.questions);
    });
    
    // Handle resize
    this.scene.scale.on('resize', this.handleResize, this);
  }

  private handleResize(): void {
    if (!this.container.visible) return;
    
    // Update overlay size
    this.overlay.clear();
    this.overlay.fillStyle(0x000000, 0.7);
    this.overlay.fillRect(0, 0, this.scene.scale.width, this.scene.scale.height);
    
    // Recenter panel
    this.centerPanel();
  }

  private centerPanel(): void {
    const { width, height } = this.scene.scale;
    this.panel.setPosition(width / 2, height / 2);
  }

  public show(suspect: SuspectData, questions: QuestionData[]): void {
    this.currentSuspect = suspect;
    this.currentQuestions = questions;
    this.currentAnswer = null;
    
    this.container.setVisible(true);
    this.handleResize(); // Ensure correct positioning
    this.render();
  }

  public hide(): void {
    this.container.setVisible(false);
    this.currentSuspect = null;
    DialogueSystem.endDialogue();
  }

  private render(): void {
    if (!this.currentSuspect) return;

    // Clear previous panel content
    this.panel.removeAll(true);

    const panelW = this.WIDTH * this.SCALE;
    const panelH = this.HEIGHT * this.SCALE;

    // 1. Panel Background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 20 * this.SCALE);
    bg.lineStyle(4 * this.SCALE, 0xc9a227, 1);
    bg.strokeRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 20 * this.SCALE);
    this.panel.add(bg);

    // 2. Header (Avatar + Name + Close)
    const headerY = -panelH / 2 + 40 * this.SCALE;
    
    // Avatar
    const avatar = this.scene.add.text(-panelW / 2 + 40 * this.SCALE, headerY, '👤', { fontSize: `${40 * this.SCALE}px` });
    avatar.setOrigin(0, 0.5);
    this.panel.add(avatar);

    // Name
    const name = this.scene.add.text(-panelW / 2 + 100 * this.SCALE, headerY, this.currentSuspect.name, {
      fontSize: `${28 * this.SCALE}px`,
      color: '#c9a227',
      fontStyle: 'bold'
    });
    name.setOrigin(0, 0.5);
    this.panel.add(name);

    // Close Button - use center alignment for proper click detection
    const closeBtn = this.createButton(panelW / 2 - 40 * this.SCALE, headerY, '✖', () => this.hide(), { fontSize: 30, width: 60, height: 60, align: 'center' });
    this.panel.add(closeBtn);

    // Separator
    const separator = this.scene.add.graphics();
    separator.lineStyle(2 * this.SCALE, 0x3d3d5c, 0.5);
    separator.strokeLineShape(new Phaser.Geom.Line(
      -panelW / 2 + 20 * this.SCALE, 
      headerY + 40 * this.SCALE, 
      panelW / 2 - 20 * this.SCALE, 
      headerY + 40 * this.SCALE
    ));
    this.panel.add(separator);

    // 3. Content Body
    const contentY = headerY + 80 * this.SCALE;
    
    if (this.currentAnswer) {
      this.renderAnswer(contentY, panelW);
    } else {
      this.renderQuestions(contentY, panelW);
    }
  }

  private renderQuestions(startY: number, panelW: number): void {
    // Intro Text
    const intro = this.scene.add.text(0, startY, '"What would you like to ask?"', {
      fontSize: `${24 * this.SCALE}px`,
      color: '#ffffff',
      fontStyle: 'italic'
    });
    intro.setOrigin(0.5, 0);
    this.panel.add(intro);

    // Question Buttons
    const questions = this.currentQuestions;
    let currentY = startY + 60 * this.SCALE;
    const buttonWidth = panelW - 100 * this.SCALE;

    questions.forEach(q => {
      const isAsked = DialogueSystem.hasAskedQuestion(this.currentSuspect!.id, q.id);
      const btnColor = isAsked ? 0x3d3d5c : 0x2d2d44;
      const textColor = isAsked ? '#aaaaaa' : '#ffffff';
      
      // Position button at -width/2 so it's centered when using left alignment
      const btn = this.createButton(-buttonWidth / 2, currentY, q.text, () => {
        this.askQuestion(q);
      }, {
        width: buttonWidth,
        height: 60 * this.SCALE,
        bgColor: btnColor,
        textColor: textColor,
        fontSize: 20,
        align: 'left'
      });
      
      this.panel.add(btn);
      currentY += 80 * this.SCALE;
    });
  }

  private renderAnswer(startY: number, panelW: number): void {
    // TAP ANYWHERE TO CONTINUE
    // We create a large invisible hit area covering the panel
    const panelH = this.HEIGHT * this.SCALE;
    const hitZone = this.scene.add.zone(0, 0, panelW, panelH);
    hitZone.setInteractive({ useHandCursor: true });
    hitZone.on('pointerdown', () => {
      this.currentAnswer = null;
      if (this.currentSuspect) {
        this.currentQuestions = DialogueSystem.getAvailableQuestions(this.currentSuspect);
        this.render();
      }
    });
    this.panel.addAt(hitZone, 0);

    // Answer Box
    const boxWidth = panelW - 80 * this.SCALE;
    const boxBg = this.scene.add.graphics();
    boxBg.fillStyle(0x2d2d44, 1);
    boxBg.fillRoundedRect(-boxWidth / 2, startY, boxWidth, 200 * this.SCALE, 10 * this.SCALE);
    this.panel.add(boxBg);

    // Answer Text
    const answerText = this.scene.add.text(0, startY + 20 * this.SCALE, this.currentAnswer || '', {
      fontSize: `${22 * this.SCALE}px`,
      color: '#ffffff',
      wordWrap: { width: boxWidth - 40 * this.SCALE },
      lineSpacing: 8
    });
    answerText.setOrigin(0.5, 0);
    this.panel.add(answerText);

    // Continue Indicator (Visual only, since whole panel is clickable)
    const continueY = startY + 240 * this.SCALE;
    const continueText = this.scene.add.text(0, continueY, '▼ Tap anywhere to continue', {
      fontSize: `${18 * this.SCALE}px`,
      color: '#888888',
      fontStyle: 'italic'
    });
    continueText.setOrigin(0.5);
    
    // Pulse animation for the indicator
    this.scene.tweens.add({
      targets: continueText,
      alpha: 0.5,
      y: continueY + 5,
      duration: 800,
      yoyo: true,
      repeat: -1
    });
    
    this.panel.add(continueText);
  }

  private askQuestion(question: QuestionData): void {
    this.currentAnswer = question.answer;
    DialogueSystem.askQuestion(question);
    
    // If we want to stay in "answer mode" immediately:
    this.render();
  }

  private createButton(
    x: number, 
    y: number, 
    text: string, 
    callback: () => void,
    options: { width?: number, height?: number, fontSize?: number, bgColor?: number, textColor?: string, align?: 'center' | 'left' } = {}
  ): Phaser.GameObjects.Container {
    const w = options.width || 100;
    const h = options.height || 40;
    const fontSize = options.fontSize ? options.fontSize * this.SCALE : 20 * this.SCALE;
    const bgColor = options.bgColor !== undefined ? options.bgColor : 0x000000;
    const textColor = options.textColor || '#ffffff';
    const align = options.align || 'center';

    // Always use container at center for consistency
    const containerX = align === 'center' ? x : x + w / 2;
    const containerY = align === 'center' ? y : y + h / 2;
    
    const container = this.scene.add.container(containerX, containerY);

    // Background Graphics
    const bg = this.scene.add.graphics();
    
    // Hit area - transparent graphics rectangle
    const hitGraphics = this.scene.add.graphics();
    hitGraphics.fillStyle(0x000000, 0.01); // Nearly invisible for hit detection
    hitGraphics.fillRect(-w / 2, -h / 2, w, h);
    hitGraphics.setInteractive(
      new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
      Phaser.Geom.Rectangle.Contains
    );

    // Background
    if (options.bgColor !== undefined) {
      bg.fillStyle(bgColor, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8 * this.SCALE);
    }

    // Text
    const textX = align === 'center' ? 0 : -w / 2 + 20 * this.SCALE;
    const label = this.scene.add.text(textX, 0, text, {
      fontSize: `${fontSize}px`,
      color: textColor,
    });
    label.setOrigin(align === 'center' ? 0.5 : 0, 0.5);

    container.add([hitGraphics, bg, label]);
    
    // Make hit area respond to events
    hitGraphics.on('pointerdown', callback);
    hitGraphics.on('pointerover', () => {
      this.scene.input.setDefaultCursor('pointer');
      label.setColor('#c9a227');
      if (options.bgColor !== undefined) {
        bg.clear();
        bg.fillStyle(0x3d3d5c, 1);
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8 * this.SCALE);
      }
    });
    
    hitGraphics.on('pointerout', () => {
      this.scene.input.setDefaultCursor('default');
      label.setColor(textColor);
      if (options.bgColor !== undefined) {
        bg.clear();
        bg.fillStyle(bgColor, 1);
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8 * this.SCALE);
      }
    });

    return container;
  }
}
