import { CaseLoader } from '../../game/data/caseLoader';
import { EventBus } from '../../game/systems/EventBus';
import { DialogueSystem } from '../../game/systems/DialogueSystem';
import { SuspectData } from '../../game/data/types';

/**
 * Suspects Panel - Shows all suspects
 */
export const SuspectsPanel = {
  init(): void {
    this.refresh();
  },

  refresh(): void {
    const container = document.getElementById('suspects-panel');
    if (!container) return;

    const caseData = CaseLoader.getCurrentCase();
    if (!caseData) {
      container.innerHTML = '<div class="panel-content empty"><p>No case loaded</p></div>';
      return;
    }

    container.innerHTML = `
      <div class="panel-header">
        <h2>👤 Suspects</h2>
        <button class="close-btn" id="close-suspects">×</button>
      </div>
      <div class="panel-content">
        <div class="suspect-list">
          ${caseData.suspects.map((s) => this.renderSuspect(s)).join('')}
        </div>
      </div>
    `;

    // Event handlers
    document.getElementById('close-suspects')?.addEventListener('click', () => {
      EventBus.emit('ui:close');
    });

    const suspectItems = container.querySelectorAll('.suspect-item');
    suspectItems.forEach((item) => {
      item.addEventListener('click', () => {
        const suspectId = (item as HTMLElement).dataset.id;
        this.showDetail(suspectId);
      });
    });
  },

  renderSuspect(suspect: SuspectData): string {
    return `
      <div class="suspect-item" data-id="${suspect.id}">
        <div class="suspect-avatar">👤</div>
        <div class="suspect-info">
          <h3>${suspect.name}</h3>
          <p>${suspect.bio}</p>
        </div>
      </div>
    `;
  },

  showDetail(suspectId: string | undefined): void {
    if (!suspectId) return;

    const suspect = CaseLoader.getSuspect(suspectId);
    if (!suspect) return;

    const container = document.getElementById('suspects-panel');
    if (!container) return;

    const questions = DialogueSystem.getAvailableQuestions(suspect);

    container.innerHTML = `
      <div class="panel-header">
        <button class="back-btn" id="back-to-suspects">← Back</button>
        <h2>${suspect.name}</h2>
      </div>
      <div class="panel-content suspect-detail">
        <div class="suspect-profile">
          <div class="suspect-avatar-large">👤</div>
          <p class="suspect-bio">${suspect.bio}</p>
        </div>
        <div class="questions-section">
          <h3>Available Questions</h3>
          <div class="question-list">
            ${questions
              .map(
                (q) => `
              <button class="question-btn ${DialogueSystem.hasAskedQuestion(suspectId, q.id) ? 'asked' : ''}" 
                      data-qid="${q.id}" data-sid="${suspectId}">
                ${q.text}
              </button>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;

    // Event handlers
    document.getElementById('back-to-suspects')?.addEventListener('click', () => {
      this.refresh();
    });

    const questionBtns = container.querySelectorAll('.question-btn');
    questionBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const qId = (btn as HTMLElement).dataset.qid;
        const question = suspect.questions.find((q) => q.id === qId);
        if (question) {
          DialogueSystem.askQuestion(question);
          this.showDetail(suspectId); // Refresh
        }
      });
    });
  },
};
