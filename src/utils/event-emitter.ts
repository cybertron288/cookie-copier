/**
 * Simple event emitter for component communication
 */

import { EventCallback, EventEmitter } from '@/types';

export class SimpleEventEmitter implements EventEmitter {
  private listeners: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback): void {
    const eventCallbacks = this.listeners.get(event);
    if (eventCallbacks) {
      const index = eventCallbacks.indexOf(callback);
      if (index > -1) {
        eventCallbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, data?: any): void {
    const eventCallbacks = this.listeners.get(event);
    if (eventCallbacks) {
      eventCallbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for event '${event}':`, error);
        }
      });
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  getListenerCount(event: string): number {
    return this.listeners.get(event)?.length ?? 0;
  }
}
