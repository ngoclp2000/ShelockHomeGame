import { NotebookSystem } from '../../game/systems/NotebookSystem';
import { EventBus } from '../../game/systems/EventBus';

/**
 * Notebook Panel - Shows investigation timeline
 */
export const NotebookPanel = {
  init(): void {
    this.refresh();
  },

  refresh(): void {
    const container = document.getElementById('notebook-panel');
    if (!container) return;

    const events = NotebookSystem.getSortedEvents();

    container.innerHTML = `
      <div class="panel-header">
        <h2>📓 Investigation Notes</h2>
        <button class="close-btn" id="close-notebook">×</button>
      </div>
      <div class="panel-content">
        ${events.length === 0
          ? '<div class="empty"><p>Your investigation notes will appear here.</p></div>'
          : `<div class="timeline">${events.map((e) => this.renderEvent(e)).join('')}</div>`
        }
      </div>
    `;

    document.getElementById('close-notebook')?.addEventListener('click', () => {
      EventBus.emit('ui:close');
    });
  },

  renderEvent(event: { type: string; title: string; description: string; timestamp: number }): string {
    const time = new Date(event.timestamp).toLocaleTimeString();
    const icons: Record<string, string> = {
      clue: '🔍',
      dialogue: '💬',
      deduction: '💡',
      scene: '📍',
    };

    return `
      <div class="timeline-item ${event.type}">
        <div class="timeline-icon">${icons[event.type] || '📝'}</div>
        <div class="timeline-content">
          <div class="timeline-time">${time}</div>
          <h4>${event.title}</h4>
          <p>${event.description}</p>
        </div>
      </div>
    `;
  },
};
