import { ClueData, NotebookEvent } from '../data/types';
import { EventBus } from './EventBus';
import { SaveSystem } from './SaveSystem';
import { NotebookSystem } from './NotebookSystem';
import { CaseLoader } from '../data/caseLoader';

/**
 * ClueSystem - Manages clue collection and state
 */
export class ClueSystem {
  /**
   * Collect a clue
   */
  public static collectClue(clue: ClueData): void {
    const caseId = CaseLoader.getCurrentCaseId();
    if (!caseId) return;

    // Save to storage
    SaveSystem.addCollectedClue(caseId, clue.id);

    // Add to notebook
    NotebookSystem.addEvent({
      id: `clue_${clue.id}_${Date.now()}`,
      timestamp: Date.now(),
      type: 'clue',
      title: `Found: ${clue.name}`,
      description: clue.description,
    });

    // Show toast
    EventBus.emit('toast:show', {
      message: `🔍 Found: ${clue.name}`,
      type: 'success',
    });

    // Emit event for UI update
    EventBus.emit('clue:collected', { clue });
  }

  /**
   * Get all collected clues
   */
  public static getCollectedClues(): ClueData[] {
    const caseId = CaseLoader.getCurrentCaseId();
    const caseData = CaseLoader.getCurrentCase();
    if (!caseId || !caseData) return [];

    const saveData = SaveSystem.load(caseId);
    if (!saveData) return [];

    return caseData.clues.filter((c) =>
      saveData.collectedClues.includes(c.id)
    );
  }

  /**
   * Check if clue is collected
   */
  public static hasClue(clueId: string): boolean {
    const caseId = CaseLoader.getCurrentCaseId();
    if (!caseId) return false;

    const saveData = SaveSystem.load(caseId);
    return saveData?.collectedClues.includes(clueId) ?? false;
  }

  /**
   * Toggle clue importance
   */
  public static toggleImportant(clueId: string): boolean {
    const caseId = CaseLoader.getCurrentCaseId();
    if (!caseId) return false;

    return SaveSystem.toggleImportantClue(caseId, clueId);
  }

  /**
   * Check if clue is marked important
   */
  public static isImportant(clueId: string): boolean {
    const caseId = CaseLoader.getCurrentCaseId();
    if (!caseId) return false;

    const saveData = SaveSystem.load(caseId);
    return saveData?.importantClues.includes(clueId) ?? false;
  }
}
