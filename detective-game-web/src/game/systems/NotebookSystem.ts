import { NotebookEvent } from '../data/types';
import { EventBus } from './EventBus';
import { SaveSystem } from './SaveSystem';
import { CaseLoader } from '../data/caseLoader';

/**
 * NotebookSystem - Timeline event tracking
 */
export class NotebookSystem {
  /**
   * Add event to notebook
   */
  public static addEvent(event: NotebookEvent): void {
    const caseId = CaseLoader.getCurrentCaseId();
    if (!caseId) return;

    const saveData = SaveSystem.load(caseId);
    const events = saveData?.notebookEvents || [];
    events.push(event);

    SaveSystem.save(caseId, { notebookEvents: events });

    // Emit for UI update
    EventBus.emit('notebook:add', { event });
  }

  /**
   * Get all notebook events
   */
  public static getEvents(): NotebookEvent[] {
    const caseId = CaseLoader.getCurrentCaseId();
    if (!caseId) return [];

    const saveData = SaveSystem.load(caseId);
    return saveData?.notebookEvents || [];
  }

  /**
   * Get events sorted by timestamp
   */
  public static getSortedEvents(): NotebookEvent[] {
    return this.getEvents().sort((a, b) => b.timestamp - a.timestamp);
  }
}
