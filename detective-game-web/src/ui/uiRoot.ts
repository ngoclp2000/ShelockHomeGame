import { EventBus } from '../game/systems/EventBus';
import { CluesPanel } from './components/CluesPanel';
import { SuspectsPanel } from './components/SuspectsPanel';
import { NotebookPanel } from './components/NotebookPanel';
import { DeductionPanel } from './components/DeductionPanel';
import { ResultModal } from './components/ResultModal';
import { Toast } from './components/Toast';

/**
 * UI Root - Initializes and manages HTML/CSS overlay
 */
export function initUI(): void {
  const root = document.getElementById('ui-root');
  if (!root) {
    console.error('UI root element not found');
    return;
  }

  // Create UI structure
  root.innerHTML = `
    <div id="panels-container" class="panels-container">
      <div id="clues-panel" class="panel hidden"></div>
      <div id="suspects-panel" class="panel hidden"></div>
      <div id="notebook-panel" class="panel hidden"></div>
      <div id="deduction-panel" class="panel hidden"></div>
    </div>
    
    <!-- Dialogue Modal removed in favor of DialogueHUD -->
    <div id="result-modal" class="modal hidden"></div>
    
    <div id="toast-container" class="toast-container"></div>
  `;

  // Initialize components
  CluesPanel.init();
  SuspectsPanel.init();
  NotebookPanel.init();
  DeductionPanel.init();
  ResultModal.init();
  Toast.init();

  // Setup event listeners
  setupEventListeners();
}

function setupEventListeners(): void {
  // Tab changes
  EventBus.on('ui:open', (data) => {
    const { panel } = data as { panel: string };
    showPanel(panel);
    EventBus.emit('input:pause');
  });

  EventBus.on('ui:close', () => {
    hideAllPanels();
    EventBus.emit('input:resume');
  });

  // Toast messages
  EventBus.on('toast:show', (data) => {
    const { message, type } = data as { message: string; type: string };
    Toast.show(message, type as 'info' | 'success' | 'warning' | 'error');
  });

  // Deduction result
  EventBus.on('deduction:result', (data) => {
    ResultModal.show(data);
  });

  // Clue updates
  EventBus.on('clue:collected', () => {
    CluesPanel.refresh();
    NotebookPanel.refresh();
  });
}

function showPanel(panelId: string): void {
  hideAllPanels();
  const panel = document.getElementById(`${panelId}-panel`);
  if (panel) {
    panel.classList.remove('hidden');
    panel.classList.add('show');
  }
}

function hideAllPanels(): void {
  const panels = document.querySelectorAll('.panel');
  panels.forEach((panel) => {
    panel.classList.remove('show');
    panel.classList.add('hidden');
  });
}
