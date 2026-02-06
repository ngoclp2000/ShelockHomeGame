import { DialogueSystem } from '../../game/systems/DialogueSystem';
import { EventBus } from '../../game/systems/EventBus';
import { SuspectData, QuestionData } from '../../game/data/types';

/**
 * Dialogue Modal - NPC conversation overlay
 */
export const DialogueModal = {
  currentSuspect: null as SuspectData | null,
  currentAnswer: null as string | null,

  init(): void {
    // Will be populated when dialogue starts
  },

  show(data: unknown): void {
    const { suspect, questions } = data as { suspect: SuspectData; questions: QuestionData[] };
    this.currentSuspect = suspect;
    this.currentAnswer = null;
    this.render(suspect, questions);
  },

  render(suspect: SuspectData, questions: QuestionData[]): void {
    const container = document.getElementById('dialogue-modal');
    if (!container) return;

    container.classList.remove('hidden');
    container.classList.add('show');

    container.innerHTML = `
      <div class="modal-content dialogue-content">
        <div class="dialogue-header">
          <div class="npc-avatar">👤</div>
          <div class="npc-name">${suspect.name}</div>
          <button class="close-btn" id="close-dialogue">×</button>
        </div>
        
        <div class="dialogue-body">
          ${this.currentAnswer 
            ? `<div class="answer-box"><p>${this.currentAnswer}</p></div>`
            : `<div class="intro-text"><p>"What would you like to ask?"</p></div>`
          }
        </div>
        
        <div class="dialogue-questions">
          ${questions.map((q) => `
            <button class="question-btn ${DialogueSystem.hasAskedQuestion(suspect.id, q.id) ? 'asked' : ''}" 
                    data-qid="${q.id}">
              ${q.text}
            </button>
          `).join('')}
          
          ${this.currentAnswer ? `
            <button class="btn btn-secondary" id="dialogue-continue">
              Continue
            </button>
          ` : ''}
        </div>
      </div>
    `;

    // Event handlers
    document.getElementById('close-dialogue')?.addEventListener('click', () => {
      this.hide();
    });

    document.getElementById('dialogue-continue')?.addEventListener('click', () => {
      this.currentAnswer = null;
      this.render(suspect, DialogueSystem.getAvailableQuestions(suspect));
    });

    const questionBtns = container.querySelectorAll('.question-btn');
    questionBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const qId = (btn as HTMLElement).dataset.qid;
        const question = suspect.questions.find((q) => q.id === qId);
        if (question) {
          this.currentAnswer = question.answer;
          DialogueSystem.askQuestion(question);
          this.render(suspect, DialogueSystem.getAvailableQuestions(suspect));
        }
      });
    });
  },

  hide(): void {
    const container = document.getElementById('dialogue-modal');
    if (container) {
      container.classList.remove('show');
      container.classList.add('hidden');
    }
    this.currentSuspect = null;
    this.currentAnswer = null;
    DialogueSystem.endDialogue();
  },
};
