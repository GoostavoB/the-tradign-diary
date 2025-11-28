// Typed event system for Trade Station widgets

export type TradeStationEvent = 
  | { type: 'risk:updated'; payload: { riskValue: number; currency: string } }
  | { type: 'preflight:completed'; payload: { sessionId: string; timestamp: Date } }
  | { type: 'preflight:bypassed'; payload: { date: string } }
  | { type: 'error:added'; payload: { id: string; text: string } }
  | { type: 'error:expired'; payload: { id: string } }
  | { type: 'dailyLock:triggered'; payload: { limit: number } }
  | { type: 'dailyLock:overridden'; payload: { until: Date } };

type EventCallback = (payload: any) => void;

class TradeStationEventBus {
  private listeners: Map<string, EventCallback[]> = new Map();

  emit(event: TradeStationEvent): void {
    const callbacks = this.listeners.get(event.type) || [];
    callbacks.forEach(callback => callback(event.payload));
    
    // Log in dev mode
    if (import.meta.env.DEV) {
      console.log('[TradeStation Event]', event.type, event.payload);
    }
  }

  on(eventType: string, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const tradeStationEvents = new TradeStationEventBus();
