/**
 * Request batching utility to combine multiple API calls
 * Reduces network overhead by batching requests within a time window
 */

interface BatchRequest<T = any> {
  key: string;
  resolver: (value: T) => void;
  rejecter: (error: any) => void;
}

class RequestBatcher {
  private batches: Map<string, BatchRequest[]> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private batchDelay = 50; // ms

  /**
   * Add request to batch queue
   */
  batch<T>(
    batchKey: string,
    requestKey: string,
    executor: (keys: string[]) => Promise<Map<string, T>>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const batch = this.batches.get(batchKey) || [];
      batch.push({ key: requestKey, resolver: resolve, rejecter: reject });
      this.batches.set(batchKey, batch);

      // Clear existing timer
      if (this.timers.has(batchKey)) {
        clearTimeout(this.timers.get(batchKey)!);
      }

      // Set new timer to execute batch
      const timer = setTimeout(() => {
        this.executeBatch(batchKey, executor);
      }, this.batchDelay);

      this.timers.set(batchKey, timer);
    });
  }

  private async executeBatch<T>(
    batchKey: string,
    executor: (keys: string[]) => Promise<Map<string, T>>
  ) {
    const batch = this.batches.get(batchKey);
    if (!batch || batch.length === 0) return;

    this.batches.delete(batchKey);
    this.timers.delete(batchKey);

    const keys = batch.map(req => req.key);

    try {
      const results = await executor(keys);
      
      batch.forEach(req => {
        const result = results.get(req.key);
        if (result !== undefined) {
          req.resolver(result);
        } else {
          req.rejecter(new Error(`No result for key: ${req.key}`));
        }
      });
    } catch (error) {
      batch.forEach(req => req.rejecter(error));
    }
  }
}

export const requestBatcher = new RequestBatcher();
