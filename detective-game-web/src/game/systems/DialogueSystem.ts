import { SuspectData, QuestionData } from '../data/types';
import { EventBus } from './EventBus';
import { SaveSystem } from './SaveSystem';
import { NotebookSystem } from './NotebookSystem';
import { ClueSystem } from './ClueSystem';
import { CaseLoader } from '../data/caseLoader';

/**
 * DialogueSystem - Manages NPC conversations and question branching
 */
export class DialogueSystem {
  private static currentSuspect: SuspectData | null = null;

  /**
   * Start dialogue with a suspect
   */
  public static startDialogue(suspect: SuspectData): void {
    this.currentSuspect = suspect;

    // Pause game input
    EventBus.emit('input:pause');

    // Open dialogue UI
    EventBus.emit('dialogue:start', {
      suspect,
      questions: this.getAvailableQuestions(suspect),
    });
  }

  /**
   * Get available questions for a suspect
   */
  public static getAvailableQuestions(suspect: SuspectData): QuestionData[] {
    const caseId = CaseLoader.getCurrentCaseId();
    if (!caseId) return suspect.questions;

    const saveData = SaveSystem.load(caseId);
    if (!saveData) return [suspect.questions[0]]; // Only first question initially

    // Get base questions (first question always available)
    const available: QuestionData[] = [];
    const askedIds = saveData.askedQuestions[suspect.id] || [];
    const unlockedIds = saveData.unlockedQuestions[suspect.id] || [];

    suspect.questions.forEach((q, index) => {
      // First question always available
      if (index === 0) {
        available.push(q);
      }
      // Others need to be unlocked
      else if (unlockedIds.includes(q.id)) {
        available.push(q);
      }
    });

    return available;
  }

  /**
   * Check if question has been asked
   */
  public static hasAskedQuestion(
    suspectId: string,
    questionId: string
  ): boolean {
    const caseId = CaseLoader.getCurrentCaseId();
    if (!caseId) return false;

    const saveData = SaveSystem.load(caseId);
    return saveData?.askedQuestions[suspectId]?.includes(questionId) ?? false;
  }

  /**
   * Ask a question
   */
  public static askQuestion(question: QuestionData): void {
    if (!this.currentSuspect) return;

    const caseId = CaseLoader.getCurrentCaseId();
    if (!caseId) return;

    // Save as asked
    SaveSystem.addAskedQuestion(caseId, this.currentSuspect.id, question.id);

    // Add to notebook
    NotebookSystem.addEvent({
      id: `dialogue_${this.currentSuspect.id}_${question.id}_${Date.now()}`,
      timestamp: Date.now(),
      type: 'dialogue',
      title: `Asked ${this.currentSuspect.name}`,
      description: question.text,
    });

    // Process unlocks
    if (question.unlocks) {
      // Unlock new questions
      if (question.unlocks.questions && question.unlocks.questions.length > 0) {
        SaveSystem.unlockQuestions(
          caseId,
          this.currentSuspect.id,
          question.unlocks.questions
        );
        EventBus.emit('toast:show', {
          message: '❓ New question unlocked',
          type: 'info',
        });
      }

      // Unlock clues
      if (question.unlocks.clues && question.unlocks.clues.length > 0) {
        const caseData = CaseLoader.getCurrentCase();
        question.unlocks.clues.forEach((clueId) => {
          const clue = caseData?.clues.find((c) => c.id === clueId);
          if (clue && !ClueSystem.hasClue(clueId)) {
            ClueSystem.collectClue(clue);
          }
        });
      }
    }

    // Emit for UI update
    EventBus.emit('dialogue:question', {
      question,
      answer: question.answer,
    });
  }

  /**
   * End current dialogue
   */
  public static endDialogue(): void {
    this.currentSuspect = null;

    // Resume game input
    EventBus.emit('input:resume');

    // Close dialogue UI
    EventBus.emit('dialogue:end');
  }

  /**
   * Get current suspect
   */
  public static getCurrentSuspect(): SuspectData | null {
    return this.currentSuspect;
  }
}
