/**
 * FontLoadingStateManager - Manages font loading states and tracking
 */

import { EventEmitter } from '../core/EventEmitter';
import { FontEventSystem, FontProgressEvent, FontCompletionEvent, FontErrorEvent } from './FontEventSystem';

export interface FontLoadingState {
  family: string;
  status: 'pending' | 'loading' | 'loaded' | 'error' | 'timeout';
  startTime: number;
  endTime?: number;
  loadTime?: number;
  error?: Error;
  retryCount: number;
  source?: 'system' | 'web' | 'dynamic';
  loadMethod?: 'css' | 'fontface' | 'preload' | 'document' | 'detection';
}

export interface FontLoadProgress {
  total: number;
  loaded: number;
  failed: number;
  pending: number;
  progress: number; // 0-100 percentage
  fonts: Map<string, FontLoadingState>;
}

export class FontLoadingStateManager extends EventEmitter {
  private fontStates: Map<string, FontLoadingState> = new Map();
  private trackedFonts: Set<string> = new Set();
  private eventSystem: FontEventSystem;

  constructor(eventSystem?: FontEventSystem) {
    super();
    this.eventSystem = eventSystem || new FontEventSystem();
  }

  /**
   * Track a font for loading state management
   */
  trackFont(fontName: string, source?: 'system' | 'web' | 'dynamic'): void {
    if (!this.fontStates.has(fontName)) {
      const state: FontLoadingState = {
        family: fontName,
        status: 'pending',
        startTime: Date.now(),
        retryCount: 0,
        source
      };
      
      this.fontStates.set(fontName, state);
      this.trackedFonts.add(fontName);
      this.emit('fontTracked', { fontName, state });
    }
  }

  /**
   * Get loading state for a specific font
   */
  getLoadingState(fontName: string): FontLoadingState | undefined {
    return this.fontStates.get(fontName);
  }

  /**
   * Update font loading state
   */
  updateFontState(fontName: string, updates: Partial<FontLoadingState>): void {
    const currentState = this.fontStates.get(fontName);
    if (!currentState) {
      return;
    }

    const newState = { ...currentState, ...updates };
    
    // Calculate load time if endTime is provided and loadTime is not already set
    if (updates.endTime && !newState.loadTime) {
      newState.loadTime = updates.endTime - newState.startTime;
    }

    this.fontStates.set(fontName, newState);
    this.emit('fontStateChanged', { fontName, state: newState, previousState: currentState });

    // Emit progress events through the event system
    this.emitProgressEvents(fontName, currentState, newState);
  }

  /**
   * Wait for a specific font to load
   */
  async waitForFont(fontName: string, timeout: number = 5000): Promise<FontLoadingState> {
    const existingState = this.fontStates.get(fontName);
    
    if (existingState?.status === 'loaded') {
      return existingState;
    }

    if (existingState?.status === 'error' || existingState?.status === 'timeout') {
      return existingState;
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        const state = this.fontStates.get(fontName);
        if (state && state.status !== 'loaded') {
          this.updateFontState(fontName, { status: 'timeout', endTime: Date.now() });
          resolve(this.fontStates.get(fontName)!);
        }
      }, timeout);

      const onStateChange = (event: { fontName: string; state: FontLoadingState }) => {
        if (event.fontName === fontName) {
          if (event.state.status === 'loaded' || event.state.status === 'error') {
            clearTimeout(timeoutId);
            this.off('fontStateChanged', onStateChange);
            resolve(event.state);
          }
        }
      };

      this.on('fontStateChanged', onStateChange);
    });
  }

  /**
   * Wait for all tracked fonts to complete loading
   */
  async waitForAllFonts(timeout: number = 10000): Promise<Map<string, FontLoadingState>> {
    const pendingFonts = Array.from(this.fontStates.entries())
      .filter(([, state]) => state.status === 'pending' || state.status === 'loading')
      .map(([fontName]) => fontName);

    if (pendingFonts.length === 0) {
      return new Map(this.fontStates);
    }

    // Start batch operation for tracking
    const batchId = `waitForAll_${Date.now()}`;
    this.startBatchOperation(batchId, pendingFonts);

    try {
      const promises = pendingFonts.map(fontName => 
        this.waitForFont(fontName, timeout).catch(() => this.fontStates.get(fontName)!)
      );

      // Set up timeout for the entire batch
      const batchTimeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          this.handleBatchTimeout(batchId, timeout);
          resolve();
        }, timeout);
      });

      // Wait for either all fonts to complete or batch timeout
      await Promise.race([
        Promise.allSettled(promises),
        batchTimeoutPromise
      ]);

      // End batch operation (this will emit batch completion event)
      this.endBatchOperation(batchId);

      return new Map(this.fontStates);
    } catch (error) {
      // Handle any errors and still end the batch operation
      this.endBatchOperation(batchId);
      throw error;
    }
  }

  /**
   * Get current loading progress
   */
  getProgress(): FontLoadProgress {
    const states = Array.from(this.fontStates.values());
    const total = states.length;
    const loaded = states.filter(s => s.status === 'loaded').length;
    const failed = states.filter(s => s.status === 'error' || s.status === 'timeout').length;
    const pending = states.filter(s => s.status === 'pending' || s.status === 'loading').length;
    
    const progress = total > 0 ? Math.round(((loaded + failed) / total) * 100) : 100;

    return {
      total,
      loaded,
      failed,
      pending,
      progress,
      fonts: new Map(this.fontStates)
    };
  }

  /**
   * Clear all font states
   */
  clear(): void {
    this.fontStates.clear();
    this.trackedFonts.clear();
    this.emit('statesCleared');
  }

  /**
   * Remove a specific font from tracking
   */
  untrackFont(fontName: string): boolean {
    const removed = this.fontStates.delete(fontName);
    this.trackedFonts.delete(fontName);
    
    if (removed) {
      this.emit('fontUntracked', { fontName });
    }
    
    return removed;
  }

  /**
   * Get all tracked font names
   */
  getTrackedFonts(): string[] {
    return Array.from(this.trackedFonts);
  }

  /**
   * Check if a font is being tracked
   */
  isTracked(fontName: string): boolean {
    return this.trackedFonts.has(fontName);
  }

  /**
   * Get the event system instance
   */
  getEventSystem(): FontEventSystem {
    return this.eventSystem;
  }

  /**
   * Emit progress events based on state changes
   */
  private emitProgressEvents(fontName: string, previousState: FontLoadingState, newState: FontLoadingState): void {
    // Calculate progress percentage based on status
    const progress = this.calculateProgress(newState.status);

    // Emit progress event for status changes
    if (previousState.status !== newState.status) {
      const progressEvent: FontProgressEvent = {
        fontName,
        progress,
        status: newState.status,
        loadTime: newState.loadTime
      };
      this.eventSystem.emitProgress(progressEvent);
    }

    // Emit completion event for final states
    if (newState.status === 'loaded' || newState.status === 'error' || newState.status === 'timeout') {
      const completionEvent: FontCompletionEvent = {
        fontName,
        status: newState.status === 'loaded' ? 'loaded' : newState.status === 'timeout' ? 'timeout' : 'error',
        loadTime: newState.loadTime || 0,
        retryCount: newState.retryCount,
        error: newState.error
      };
      this.eventSystem.emitCompletion(completionEvent);
    }

    // Emit error event for error states
    if (newState.status === 'error' && newState.error) {
      const errorEvent: FontErrorEvent = {
        fontName,
        error: newState.error,
        retryCount: newState.retryCount,
        willRetry: false // This could be enhanced to support retry logic
      };
      this.eventSystem.emitError(errorEvent);
    }
  }

  /**
   * Calculate progress percentage based on font loading status
   */
  private calculateProgress(status: FontLoadingState['status']): number {
    switch (status) {
      case 'pending':
        return 0;
      case 'loading':
        return 50;
      case 'loaded':
        return 100;
      case 'error':
      case 'timeout':
        return 100; // Consider failed states as "complete"
      default:
        return 0;
    }
  }

  /**
   * Start batch operation for multiple fonts
   */
  startBatchOperation(batchId: string, fontNames: string[]): void {
    this.eventSystem.startBatchOperation(batchId, fontNames);
  }

  /**
   * End batch operation
   */
  endBatchOperation(batchId: string): void {
    this.eventSystem.endBatchOperation(batchId);
  }

  /**
   * Handle batch timeout
   */
  handleBatchTimeout(batchId: string, timeout: number): void {
    this.eventSystem.handleBatchTimeout(batchId, timeout);
  }
}