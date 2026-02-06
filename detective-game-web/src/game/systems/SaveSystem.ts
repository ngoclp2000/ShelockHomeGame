import { SaveData, DeductionDraft } from '../data/types';

const SAVE_PREFIX = 'detective_game_';
const PROGRESS_KEY = 'detective_game_progress';

interface GameProgress {
  completedCases: string[];
  caseStars: Record<string, number>;
}

/**
 * SaveSystem - localStorage persistence for game progress
 */
export class SaveSystem {
  /**
   * Get overall game progress
   */
  public static getProgress(): GameProgress {
    const data = localStorage.getItem(PROGRESS_KEY);
    if (data) {
      try {
        return JSON.parse(data) as GameProgress;
      } catch {
        return { completedCases: [], caseStars: {} };
      }
    }
    return { completedCases: [], caseStars: {} };
  }

  /**
   * Mark case as completed with stars
   */
  public static completeCase(caseId: string, stars: number): void {
    const progress = this.getProgress();
    if (!progress.completedCases.includes(caseId)) {
      progress.completedCases.push(caseId);
    }
    // Keep highest star rating
    progress.caseStars[caseId] = Math.max(progress.caseStars[caseId] || 0, stars);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }

  /**
   * Check if save exists
   */
  public static hasSave(caseId: string): boolean {
    return localStorage.getItem(`${SAVE_PREFIX}${caseId}`) !== null;
  }

  /**
   * Load save data
   */
  public static load(caseId: string): SaveData | null {
    const data = localStorage.getItem(`${SAVE_PREFIX}${caseId}`);
    if (data) {
      try {
        return JSON.parse(data) as SaveData;
      } catch (e) {
        console.error('Failed to parse save data', e);
        return null;
      }
    }
    return null;
  }

  /**
   * Save game state
   */
  public static save(caseId: string, partial: Partial<SaveData>): void {
    const existing = this.load(caseId) || this.createDefault(caseId);
    const updated = { ...existing, ...partial };
    localStorage.setItem(`${SAVE_PREFIX}${caseId}`, JSON.stringify(updated));
  }

  /**
   * Create default save data
   */
  private static createDefault(caseId: string): SaveData {
    return {
      caseId,
      collectedClues: [],
      importantClues: [],
      askedQuestions: {},
      unlockedQuestions: {},
      notebookEvents: [],
      deductionDraft: {},
    };
  }

  /**
   * Add collected clue
   */
  public static addCollectedClue(caseId: string, clueId: string): void {
    const data = this.load(caseId) || this.createDefault(caseId);
    if (!data.collectedClues.includes(clueId)) {
      data.collectedClues.push(clueId);
      this.save(caseId, data);
    }
  }

  /**
   * Toggle important clue
   */
  public static toggleImportantClue(caseId: string, clueId: string): boolean {
    const data = this.load(caseId) || this.createDefault(caseId);
    const index = data.importantClues.indexOf(clueId);
    if (index > -1) {
      data.importantClues.splice(index, 1);
      this.save(caseId, data);
      return false;
    } else {
      data.importantClues.push(clueId);
      this.save(caseId, data);
      return true;
    }
  }

  /**
   * Add asked question
   */
  public static addAskedQuestion(
    caseId: string,
    suspectId: string,
    questionId: string
  ): void {
    const data = this.load(caseId) || this.createDefault(caseId);
    if (!data.askedQuestions[suspectId]) {
      data.askedQuestions[suspectId] = [];
    }
    if (!data.askedQuestions[suspectId].includes(questionId)) {
      data.askedQuestions[suspectId].push(questionId);
      this.save(caseId, data);
    }
  }

  /**
   * Unlock questions
   */
  public static unlockQuestions(
    caseId: string,
    suspectId: string,
    questionIds: string[]
  ): void {
    const data = this.load(caseId) || this.createDefault(caseId);
    if (!data.unlockedQuestions[suspectId]) {
      data.unlockedQuestions[suspectId] = [];
    }
    questionIds.forEach((qId) => {
      if (!data.unlockedQuestions[suspectId].includes(qId)) {
        data.unlockedQuestions[suspectId].push(qId);
      }
    });
    this.save(caseId, data);
  }

  /**
   * Save deduction draft
   */
  public static saveDeductionDraft(
    caseId: string,
    draft: DeductionDraft
  ): void {
    this.save(caseId, { deductionDraft: draft });
  }

  /**
   * Reset save
   */
  public static reset(caseId: string): void {
    localStorage.removeItem(`${SAVE_PREFIX}${caseId}`);
  }

  /**
   * Reset all progress
   */
  public static resetAll(): void {
    localStorage.removeItem(PROGRESS_KEY);
    // Also clear all case saves
    for (let i = 1; i <= 10; i++) {
      const caseId = `case_${String(i).padStart(3, '0')}`;
      localStorage.removeItem(`${SAVE_PREFIX}${caseId}`);
    }
  }
}
