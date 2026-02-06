import { CaseData } from './types';

/**
 * CaseLoader - Loads and stores case data
 */
class CaseLoaderClass {
  private currentCase: CaseData | null = null;
  private currentCaseId: string | null = null;

  /**
   * Set current case data
   */
  public setCurrentCase(data: CaseData): void {
    this.currentCase = data;
    this.currentCaseId = data.caseId;
  }

  /**
   * Get current case data
   */
  public getCurrentCase(): CaseData | null {
    return this.currentCase;
  }

  /**
   * Get current case ID
   */
  public getCurrentCaseId(): string | null {
    return this.currentCaseId;
  }

  /**
   * Get specific clue by ID
   */
  public getClue(clueId: string) {
    return this.currentCase?.clues.find((c) => c.id === clueId) || null;
  }

  /**
   * Get specific suspect by ID
   */
  public getSuspect(suspectId: string) {
    return this.currentCase?.suspects.find((s) => s.id === suspectId) || null;
  }

  /**
   * Get motive by ID
   */
  public getMotive(motiveId: string) {
    return this.currentCase?.motives.find((m) => m.id === motiveId) || null;
  }

  /**
   * Get weapon by ID
   */
  public getWeapon(weaponId: string) {
    return this.currentCase?.weapons.find((w) => w.id === weaponId) || null;
  }

  /**
   * Clear current case
   */
  public clear(): void {
    this.currentCase = null;
    this.currentCaseId = null;
  }
}

export const CaseLoader = new CaseLoaderClass();
