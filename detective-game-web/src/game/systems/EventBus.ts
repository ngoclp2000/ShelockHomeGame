import { GameEventType } from '../data/types';

type EventCallback = (data?: unknown) => void;

/**
 * Simple typed event bus for game-wide communication
 */
class EventBusClass {
  private listeners: Map<GameEventType, EventCallback[]> = new Map();

  /**
   * Subscribe to an event
   */
  public on(event: GameEventType, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Unsubscribe from an event
   */
  public off(event: GameEventType, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event
   */
  public emit(event: GameEventType, data?: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }

  /**
   * Clear all listeners
   */
  public clear(): void {
    this.listeners.clear();
  }
}

// Singleton instance
export const EventBus = new EventBusClass();
