import { EventBus } from '../../game/systems/EventBus';
import { DeductionResult } from '../../game/systems/DeductionSystem';

/**
 * Result Modal - Shows deduction result
 */
export const ResultModal = {
  init(): void {
    // Will be populated when result is shown
  },

  show(data: unknown): void {
    const result = data as DeductionResult;
    const container = document.getElementById('result-modal');
    if (!container) return;

    container.classList.remove('hidden');
    container.classList.add('show');

    container.innerHTML = `
      <div class="modal-content result-content ${result.correct ? 'success' : 'failure'}">
        <div class="result-header">
          <div class="result-icon">${result.correct ? '🎉' : '❌'}</div>
          <h2>${result.correct ? 'Case Solved!' : 'Not Quite Right...'}</h2>
        </div>
        
        <div class="result-body">
          <div class="result-breakdown">
            <div class="result-item ${result.killerCorrect ? 'correct' : 'incorrect'}">
              ${result.killerCorrect ? '✅' : '❌'} Killer
            </div>
            <div class="result-item ${result.motiveCorrect ? 'correct' : 'incorrect'}">
              ${result.motiveCorrect ? '✅' : '❌'} Motive
            </div>
            <div class="result-item ${result.weaponCorrect ? 'correct' : 'incorrect'}">
              ${result.weaponCorrect ? '✅' : '❌'} Weapon
            </div>
            <div class="result-item ${result.evidenceCorrect ? 'correct' : 'incorrect'}">
              ${result.evidenceCorrect ? '✅' : '❌'} Evidence
            </div>
          </div>
          
          <div class="explanation">
            <p>${result.explanation}</p>
          </div>
        </div>
        
        <div class="result-actions">
          ${result.correct 
            ? `<button class="btn btn-primary" id="result-menu">Back to Menu</button>`
            : `<button class="btn btn-primary" id="result-retry">Try Again</button>`
          }
        </div>
      </div>
    `;

    // Event handlers
    document.getElementById('result-menu')?.addEventListener('click', () => {
      window.location.reload();
    });

    document.getElementById('result-retry')?.addEventListener('click', () => {
      this.hide();
    });
  },

  hide(): void {
    const container = document.getElementById('result-modal');
    if (container) {
      container.classList.remove('show');
      container.classList.add('hidden');
    }
    EventBus.emit('ui:close');
  },
};
