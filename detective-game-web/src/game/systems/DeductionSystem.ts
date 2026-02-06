import { DeductionDraft, SolutionData } from '../data/types';
import { EventBus } from './EventBus';
import { SaveSystem } from './SaveSystem';
import { NotebookSystem } from './NotebookSystem';
import { CaseLoader } from '../data/caseLoader';

export interface DeductionResult {
  correct: boolean;
  killerCorrect: boolean;
  motiveCorrect: boolean;
  weaponCorrect: boolean;
  evidenceCorrect: boolean;
  explanation: string;
}

/**
 * DeductionSystem - Final case solution submission and checking
 */
export class DeductionSystem {
  /**
   * Save draft deduction
   */
  public static saveDraft(draft: DeductionDraft): void {
    const caseId = CaseLoader.getCurrentCaseId();
    if (!caseId) return;

    SaveSystem.saveDeductionDraft(caseId, draft);
  }

  /**
   * Get current draft
   */
  public static getDraft(): DeductionDraft {
    const caseId = CaseLoader.getCurrentCaseId();
    if (!caseId) return {};

    const saveData = SaveSystem.load(caseId);
    return saveData?.deductionDraft || {};
  }

  /**
   * Submit final deduction
   */
  public static submit(draft: DeductionDraft): DeductionResult {
    const caseData = CaseLoader.getCurrentCase();
    if (!caseData) {
      return {
        correct: false,
        killerCorrect: false,
        motiveCorrect: false,
        weaponCorrect: false,
        evidenceCorrect: false,
        explanation: 'Case data not loaded',
      };
    }

    const solution = caseData.solution;

    // Check each component
    const killerCorrect = draft.killerId === solution.killerId;
    const motiveCorrect = draft.motiveId === solution.motiveId;
    const weaponCorrect = draft.weaponId === solution.weaponId;
    const evidenceCorrect = draft.keyEvidenceId === solution.keyEvidenceId;

    const correct =
      killerCorrect && motiveCorrect && weaponCorrect && evidenceCorrect;

    // Add to notebook
    NotebookSystem.addEvent({
      id: `deduction_${Date.now()}`,
      timestamp: Date.now(),
      type: 'deduction',
      title: correct ? '✅ Case Solved!' : '❌ Incorrect Deduction',
      description: correct
        ? 'You correctly identified the killer and their method.'
        : 'Your deduction was not entirely correct. Keep investigating!',
    });

    const result: DeductionResult = {
      correct,
      killerCorrect,
      motiveCorrect,
      weaponCorrect,
      evidenceCorrect,
      explanation: correct
        ? solution.explanation
        : this.generateHint(killerCorrect, motiveCorrect, weaponCorrect, evidenceCorrect),
    };

    // Emit result
    EventBus.emit('deduction:result', result);

    return result;
  }

  /**
   * Generate hint for incorrect answer
   */
  private static generateHint(
    killer: boolean,
    motive: boolean,
    weapon: boolean,
    evidence: boolean
  ): string {
    const hints: string[] = [];

    if (!killer) hints.push('The killer identity is wrong');
    if (!motive) hints.push('The motive is incorrect');
    if (!weapon) hints.push('The weapon/method is wrong');
    if (!evidence) hints.push('The key evidence is not correct');

    return hints.join('. ') + '. Try again!';
  }

  /**
   * Check if all fields are filled
   */
  public static isComplete(draft: DeductionDraft): boolean {
    return !!(
      draft.killerId &&
      draft.motiveId &&
      draft.weaponId &&
      draft.keyEvidenceId
    );
  }
}
