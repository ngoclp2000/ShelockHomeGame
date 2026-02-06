import { EventBus } from '../../game/systems/EventBus';

/**
 * Bottom navigation tabs
 */
export const BottomTabs = {
  currentTab: 'scene',

  init(): void {
    const container = document.getElementById('bottom-tabs');
    if (!container) return;

    container.innerHTML = `
      <button class="tab active" data-tab="scene">
        <span class="tab-icon">🔍</span>
        <span class="tab-label">Scene</span>
      </button>
      <button class="tab" data-tab="clues">
        <span class="tab-icon">📋</span>
        <span class="tab-label">Clues</span>
        <span class="badge hidden" id="clues-badge">0</span>
      </button>
      <button class="tab" data-tab="suspects">
        <span class="tab-icon">👤</span>
        <span class="tab-label">Suspects</span>
      </button>
      <button class="tab" data-tab="notebook">
        <span class="tab-icon">📓</span>
        <span class="tab-label">Notes</span>
      </button>
      <button class="tab" data-tab="deduction">
        <span class="tab-icon">💡</span>
        <span class="tab-label">Solve</span>
      </button>
    `;

    // Add click handlers
    const tabs = container.querySelectorAll('.tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const tabId = (tab as HTMLElement).dataset.tab;
        if (tabId) {
          this.selectTab(tabId);
        }
      });
    });
  },

  selectTab(tabId: string): void {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach((tab) => {
      const id = (tab as HTMLElement).dataset.tab;
      if (id === tabId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    this.currentTab = tabId;

    if (tabId === 'scene') {
      EventBus.emit('ui:close');
    } else {
      EventBus.emit('ui:open', { panel: tabId });
    }
  },

  updateBadge(tabId: string, count: number): void {
    const badge = document.getElementById(`${tabId}-badge`);
    if (badge) {
      if (count > 0) {
        badge.textContent = count.toString();
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  },
};
