import { CaseLoader } from '../../game/data/caseLoader';
import { DeductionSystem } from '../../game/systems/DeductionSystem';
import { ClueSystem } from '../../game/systems/ClueSystem';
import { EventBus } from '../../game/systems/EventBus';
import { DeductionDraft } from '../../game/data/types';

/**
 * Deduction Panel - Final case solution selection
 */
export const DeductionPanel = {
  draft: {} as DeductionDraft,

  init(): void {
    this.draft = DeductionSystem.getDraft();
    this.refresh();
  },

  refresh(): void {
    const container = document.getElementById('deduction-panel');
    if (!container) return;

    const caseData = CaseLoader.getCurrentCase();
    if (!caseData) return;

    const collectedClues = ClueSystem.getCollectedClues();

    container.innerHTML = `
      <div class="panel-header">
        <h2>💡 Case Deduction</h2>
        <button class="close-btn" id="close-deduction">×</button>
      </div>
      <div class="panel-content deduction-form">
        <div class="form-group">
          <label>Who is the killer?</label>
          <select id="killer-select">
            <option value="">-- Select Suspect --</option>
            ${caseData.suspects.map((s) => `
              <option value="${s.id}" ${this.draft.killerId === s.id ? 'selected' : ''}>
                ${s.name}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label>What was the motive?</label>
          <select id="motive-select">
            <option value="">-- Select Motive --</option>
            ${caseData.motives.map((m) => `
              <option value="${m.id}" ${this.draft.motiveId === m.id ? 'selected' : ''}>
                ${m.text}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label>What was the weapon/method?</label>
          <select id="weapon-select">
            <option value="">-- Select Weapon --</option>
            ${caseData.weapons.map((w) => `
              <option value="${w.id}" ${this.draft.weaponId === w.id ? 'selected' : ''}>
                ${w.text}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label>Key evidence?</label>
          <select id="evidence-select">
            <option value="">-- Select Evidence --</option>
            ${collectedClues.map((c) => `
              <option value="${c.id}" ${this.draft.keyEvidenceId === c.id ? 'selected' : ''}>
                ${c.name}
              </option>
            `).join('')}
          </select>
        </div>

        <button class="btn btn-primary" id="submit-deduction">
          Submit Deduction
        </button>
      </div>
    `;

    // Event handlers
    document.getElementById('close-deduction')?.addEventListener('click', () => {
      EventBus.emit('ui:close');
    });

    // Select handlers
    ['killer', 'motive', 'weapon', 'evidence'].forEach((field) => {
      document.getElementById(`${field}-select`)?.addEventListener('change', (e) => {
        const value = (e.target as HTMLSelectElement).value;
        this.updateDraft(field, value);
      });
    });

    // Submit handler
    document.getElementById('submit-deduction')?.addEventListener('click', () => {
      this.submit();
    });
  },

  updateDraft(field: string, value: string): void {
    const fieldMap: Record<string, keyof DeductionDraft> = {
      killer: 'killerId',
      motive: 'motiveId',
      weapon: 'weaponId',
      evidence: 'keyEvidenceId',
    };

    const key = fieldMap[field];
    if (key) {
      this.draft[key] = value;
      DeductionSystem.saveDraft(this.draft);
    }
  },

  submit(): void {
    if (!DeductionSystem.isComplete(this.draft)) {
      EventBus.emit('toast:show', {
        message: 'Please fill all fields',
        type: 'warning',
      });
      return;
    }

    const result = DeductionSystem.submit(this.draft);
    // ResultModal will be opened by event listener
  },
};
