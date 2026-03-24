/**
 * FontEventSystem - Enhanced event system for font loading progress notifications
 */

import { EventEmitter } from '../core/EventEmitter';
import { FontLoadingState, FontLoadProgress } from './FontLoadingStateManager';

export interface FontProgressEvent {
  fontName: string;
  progress: number; // 0-100
  status: FontLoadingState['status'];
  loadTime?: number;
  error?: Error;
}

export interface FontCompletionEvent {
  fontName: string;
  status: 'loaded' | 'error' | 'timeout';
  loadTime: number;
  retryCount: number;
  error?: Error;
}

export interface FontErrorEvent {
  fontName: string;
  error: Error;
  retryCount: number;
  willRetry: boolean;
  nextRetryIn?: number;
}

export interface FontTimeoutEvent {
  fontName: string;
  timeout: number;
  retryCount: number;
  willRetry: boolean;
}

export interface BatchCompletionEvent {
  totalFonts: number;
  loadedFonts: number;
  failedFonts: number;
  totalTime: number;
  results: FontCompletionEvent[];
}

export interface BatchTimeoutEvent {
  totalFonts: number;
  completedFonts: number;
  timedOutFonts: string[];
  timeout: number;
}

export class FontEventSystem extends EventEmitter {
  private batchOperations: Map<string, {
    startTime: number;
    totalFonts: number;
    completedFonts: FontCompletionEvent[];
    pendingFonts: Set<string>;
  }> = new Map();

  constructor() {
    super();
    this.setMaxListeners(50); // Allow more listeners for font events
  }

  /**
   * Emit progress event for font loading
   */
  emitProgress(event: FontProgressEvent): void {
    this.emit('fontProgress', event);
    this.emit(`fontProgress:${event.fontName}`, event);
  }

  /**
   * Emit completion event for font loading
   */
  emitCompletion(event: FontCompletionEvent): void {
    this.emit('fontCompleted', event);
    this.emit(`fontCompleted:${event.fontName}`, event);
    
    // Check if this completion is part of a batch operation
    this.checkBatchCompletion(event);
  }

  /**
   * Emit error event for font loading
   */
  emitError(event: FontErrorEvent): void {
    this.emit('fontError', event);
    this.emit(`fontError:${event.fontName}`, event);
  }

  /**
   * Emit timeout event for font loading
   */
  emitTimeout(event: FontTimeoutEvent): void {
    this.emit('fontTimeout', event);
    this.emit(`fontTimeout:${event.fontName}`, event);
  }

  /**
   * Emit batch completion event
   */
  emitBatchCompletion(event: BatchCompletionEvent): void {
    this.emit('batchCompleted', event);
  }

  /**
   * Emit batch timeout event
   */
  emitBatchTimeout(event: BatchTimeoutEvent): void {
    this.emit('batchTimeout', event);
  }

  /**
   * Start tracking a batch operation
   */
  startBatchOperation(batchId: string, fontNames: string[]): void {
    this.batchOperations.set(batchId, {
      startTime: Date.now(),
      totalFonts: fontNames.length,
      completedFonts: [],
      pendingFonts: new Set(fontNames)
    });
  }

  /**
   * End batch operation tracking
   */
  endBatchOperation(batchId: string): void {
    const batch = this.batchOperations.get(batchId);
    if (batch) {
      const totalTime = Date.now() - batch.startTime;
      const loadedFonts = batch.completedFonts.filter(f => f.status === 'loaded').length;
      const failedFonts = batch.completedFonts.filter(f => f.status !== 'loaded').length;

      this.emitBatchCompletion({
        totalFonts: batch.totalFonts,
        loadedFonts,
        failedFonts,
        totalTime,
        results: batch.completedFonts
      });

      this.batchOperations.delete(batchId);
    }
  }

  /**
   * Handle batch timeout
   */
  handleBatchTimeout(batchId: string, timeout: number): void {
    const batch = this.batchOperations.get(batchId);
    if (batch) {
      const timedOutFonts = Array.from(batch.pendingFonts);
      
      this.emitBatchTimeout({
        totalFonts: batch.totalFonts,
        completedFonts: batch.completedFonts.length,
        timedOutFonts,
        timeout
      });
    }
  }

  /**
   * Check if batch operation is complete
   */
  private checkBatchCompletion(completionEvent: FontCompletionEvent): void {
    for (const [batchId, batch] of this.batchOperations) {
      if (batch.pendingFonts.has(completionEvent.fontName)) {
        batch.pendingFonts.delete(completionEvent.fontName);
        batch.completedFonts.push(completionEvent);

        // Check if batch is complete
        if (batch.pendingFonts.size === 0) {
          this.endBatchOperation(batchId);
        }
        break;
      }
    }
  }

  /**
   * Create progress tracker for font loading
   */
  createProgressTracker(fontName: string): {
    updateProgress: (progress: number, status: FontLoadingState['status']) => void;
    complete: (status: 'loaded' | 'error' | 'timeout', loadTime: number, error?: Error) => void;
    error: (error: Error, retryCount: number, willRetry: boolean, nextRetryIn?: number) => void;
    timeout: (timeout: number, retryCount: number, willRetry: boolean) => void;
  } {
    return {
      updateProgress: (progress: number, status: FontLoadingState['status']) => {
        this.emitProgress({ fontName, progress, status });
      },
      
      complete: (status: 'loaded' | 'error' | 'timeout', loadTime: number, error?: Error) => {
        this.emitCompletion({
          fontName,
          status,
          loadTime,
          retryCount: 0, // This should be passed from the caller
          error
        });
      },
      
      error: (error: Error, retryCount: number, willRetry: boolean, nextRetryIn?: number) => {
        this.emitError({
          fontName,
          error,
          retryCount,
          willRetry,
          nextRetryIn
        });
      },
      
      timeout: (timeout: number, retryCount: number, willRetry: boolean) => {
        this.emitTimeout({
          fontName,
          timeout,
          retryCount,
          willRetry
        });
      }
    };
  }

  /**
   * Listen to font progress events
   */
  onProgress(fontName: string, listener: (event: FontProgressEvent) => void): this {
    return this.on(`fontProgress:${fontName}`, listener);
  }

  /**
   * Listen to font completion events
   */
  onCompletion(fontName: string, listener: (event: FontCompletionEvent) => void): this {
    return this.on(`fontCompleted:${fontName}`, listener);
  }

  /**
   * Listen to font error events
   */
  onError(fontName: string, listener: (event: FontErrorEvent) => void): this {
    return this.on(`fontError:${fontName}`, listener);
  }

  /**
   * Listen to font timeout events
   */
  onTimeout(fontName: string, listener: (event: FontTimeoutEvent) => void): this {
    return this.on(`fontTimeout:${fontName}`, listener);
  }

  /**
   * Listen to batch completion events
   */
  onBatchCompletion(listener: (event: BatchCompletionEvent) => void): this {
    return this.on('batchCompleted', listener);
  }

  /**
   * Listen to batch timeout events
   */
  onBatchTimeout(listener: (event: BatchTimeoutEvent) => void): this {
    return this.on('batchTimeout', listener);
  }

  /**
   * Get active batch operations
   */
  getActiveBatches(): string[] {
    return Array.from(this.batchOperations.keys());
  }

  /**
   * Get batch status
   */
  getBatchStatus(batchId: string): {
    totalFonts: number;
    completedFonts: number;
    pendingFonts: number;
    progress: number;
  } | null {
    const batch = this.batchOperations.get(batchId);
    if (!batch) {
      return null;
    }

    const completedFonts = batch.completedFonts.length;
    const pendingFonts = batch.pendingFonts.size;
    const progress = batch.totalFonts > 0 ? (completedFonts / batch.totalFonts) * 100 : 100;

    return {
      totalFonts: batch.totalFonts,
      completedFonts,
      pendingFonts,
      progress
    };
  }
}