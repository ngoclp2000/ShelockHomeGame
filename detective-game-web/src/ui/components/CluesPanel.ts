import { ClueSystem } from '../../game/systems/ClueSystem';
import { EventBus } from '../../game/systems/EventBus';
import { ClueData } from '../../game/data/types';

/**
 * Clues Panel - Shows collected clues
 */
export const CluesPanel = {
  init(): void {
    this.refresh();
  },

  refresh(): void {
    const container = document.getElementById('clues-panel');
    if (!container) return;

    const clues = ClueSystem.getCollectedClues();

    if (clues.length === 0) {
      container.innerHTML = `
        <div class="panel-header">
          <h2>📋 Collected Clues</h2>
          <button class="close-btn" onclick="document.getElementById('clues-panel').classList.add('hidden')">×</button>
        </div>
        <div class="panel-content empty">
          <p>No clues collected yet.<br>Explore the scene to find evidence!</p>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="panel-header">
          <h2>📋 Collected Clues (${clues.length})</h2>
          <button class="close-btn" id="close-clues">×</button>
        </div>
        <div class="panel-content">
          <div class="clue-list">
            ${clues.map((clue) => this.renderClue(clue)).join('')}
          </div>
        </div>
      `;

      // Add click handlers
      const closeBtn = document.getElementById('close-clues');
      closeBtn?.addEventListener('click', () => EventBus.emit('ui:close'));

      const clueItems = container.querySelectorAll('.clue-item');
      clueItems.forEach((item) => {
        item.addEventListener('click', () => {
          const clueId = (item as HTMLElement).dataset.id;
          this.showDetail(clueId);
        });
      });
    }
  },

  renderClue(clue: ClueData): string {
    const isImportant = ClueSystem.isImportant(clue.id);
    return `
      <div class="clue-item ${isImportant ? 'important' : ''}" data-id="${clue.id}">
        <div class="clue-icon">🔍</div>
        <div class="clue-info">
          <h3>${clue.name} ${isImportant ? '⭐' : ''}</h3>
          <p>${clue.description.substring(0, 60)}...</p>
        </div>
      </div>
    `;
  },

  showDetail(clueId: string | undefined): void {
    if (!clueId) return;

    const clues = ClueSystem.getCollectedClues();
    const clue = clues.find((c) => c.id === clueId);
    if (!clue) return;

    const isImportant = ClueSystem.isImportant(clueId);

    const container = document.getElementById('clues-panel');
    if (!container) return;

    container.innerHTML = `
      <div class="panel-header">
        <button class="back-btn" id="back-to-clues">← Back</button>
        <h2>${clue.name}</h2>
      </div>
      <div class="panel-content clue-detail">
        <div class="clue-image">🔍</div>
        <p class="clue-description">${clue.description}</p>
        ${clue.tags ? `<div class="tags">${clue.tags.map((t) => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
        <button class="btn ${isImportant ? 'btn-active' : ''}" id="toggle-important">
          ${isImportant ? '⭐ Marked Important' : '☆ Mark as Important'}
        </button>
      </div>
    `;

    // Event handlers
    document.getElementById('back-to-clues')?.addEventListener('click', () => {
      this.refresh();
    });

    document.getElementById('toggle-important')?.addEventListener('click', () => {
      ClueSystem.toggleImportant(clueId);
      this.showDetail(clueId);
    });
  },
};
