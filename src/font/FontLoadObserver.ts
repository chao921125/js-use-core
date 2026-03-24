/**
 * FontLoadObserver - Monitors font loading progress using multiple detection methods
 */

import { EventEmitter } from '../core/EventEmitter';
import { FontLoadingState } from './FontLoadingStateManager';
import { TimingController } from './TimingController';
import { FontEventSystem, FontProgressEvent } from './FontEventSystem';

export interface ObserverOptions {
  timeout?: number;
  retries?: number;
  method?: 'auto' | 'fontface' | 'document' | 'detection';
  pollInterval?: number;
}

export class FontLoadObserver extends EventEmitter {
  private timingController: TimingController;
  private observedFonts: Map<string, AbortController> = new Map();
  private defaultOptions: Required<ObserverOptions>;
  private eventSystem: FontEventSystem;

  constructor(timingController?: TimingController, eventSystem?: FontEventSystem) {
    super();
    this.timingController = timingController || new TimingController();
    this.eventSystem = eventSystem || new FontEventSystem();
    this.defaultOptions = {
      timeout: 5000,
      retries: 3,
      method: 'auto',
      pollInterval: 100
    };
  }

  /**
   * Observe a single font loading
   */
  async observeFont(fontName: string, options: ObserverOptions = {}): Promise<FontLoadingState> {
    const opts = { ...this.defaultOptions, ...options };
    const abortController = new AbortController();
    
    // Store abort controller for cleanup
    this.observedFonts.set(fontName, abortController);

    try {
      const state = await this.performFontObservation(fontName, opts, abortController.signal);
      this.observedFonts.delete(fontName);
      return state;
    } catch (error) {
      this.observedFonts.delete(fontName);
      throw error;
    }
  }

  /**
   * Observe multiple fonts loading
   */
  async observeMultipleFonts(
    fontNames: string[], 
    options: ObserverOptions = {}
  ): Promise<FontLoadingState[]> {
    if (fontNames.length === 0) {
      return [];
    }

    // Start batch operation for tracking
    const batchId = `observeMultiple_${Date.now()}`;
    this.eventSystem.startBatchOperation(batchId, fontNames);

    try {
      const opts = { ...this.defaultOptions, ...options };
      
      // Set up batch timeout if specified
      let batchTimeoutId: NodeJS.Timeout | undefined;
      if (opts.timeout > 0) {
        batchTimeoutId = setTimeout(() => {
          this.eventSystem.handleBatchTimeout(batchId, opts.timeout);
        }, opts.timeout);
      }

      const promises = fontNames.map(fontName => 
        this.observeFont(fontName, options).catch(error => ({
          family: fontName,
          status: 'error' as const,
          startTime: Date.now(),
          endTime: Date.now(),
          error: error as Error,
          retryCount: 0
        }))
      );

      const results = await Promise.all(promises);

      // Clear batch timeout if it was set
      if (batchTimeoutId) {
        clearTimeout(batchTimeoutId);
      }

      // End batch operation (this will emit batch completion event)
      this.eventSystem.endBatchOperation(batchId);

      return results;
    } catch (error) {
      // Handle any errors and still end the batch operation
      this.eventSystem.endBatchOperation(batchId);
      throw error;
    }
  }

  /**
   * Stop observing a specific font
   */
  stopObserving(fontName: string): void {
    const abortController = this.observedFonts.get(fontName);
    if (abortController) {
      abortController.abort();
      this.observedFonts.delete(fontName);
      this.emit('observationStopped', { fontName });
    }
  }

  /**
   * Stop observing all fonts
   */
  stopAll(): void {
    for (const [fontName, abortController] of this.observedFonts) {
      abortController.abort();
      this.emit('observationStopped', { fontName });
    }
    this.observedFonts.clear();
  }

  /**
   * Perform font observation using the specified method
   */
  private async performFontObservation(
    fontName: string,
    options: Required<ObserverOptions>,
    signal: AbortSignal
  ): Promise<FontLoadingState> {
    const startTime = Date.now();
    
    const state: FontLoadingState = {
      family: fontName,
      status: 'loading',
      startTime,
      retryCount: 0
    };

    this.emit('observationStarted', { fontName, options });

    // Emit initial progress event
    this.eventSystem.emitProgress({
      fontName,
      progress: 0,
      status: 'loading'
    });

    try {
      let method = options.method;
      
      // Auto-detect best method
      if (method === 'auto') {
        method = this.selectBestMethod(fontName);
      }

      // Emit progress update for method selection
      this.eventSystem.emitProgress({
        fontName,
        progress: 25,
        status: 'loading'
      });

      const result = await this.observeWithMethod(fontName, method, options, signal);
      
      const finalState = {
        ...state,
        ...result,
        endTime: Date.now(),
        loadTime: Date.now() - startTime
      };

      // Emit final progress event
      this.eventSystem.emitProgress({
        fontName,
        progress: 100,
        status: finalState.status,
        loadTime: finalState.loadTime
      });

      return finalState;
    } catch (error) {
      const errorState = {
        ...state,
        status: 'error' as const,
        endTime: Date.now(),
        loadTime: Date.now() - startTime,
        error: error as Error
      };

      // Emit error progress event
      this.eventSystem.emitProgress({
        fontName,
        progress: 100,
        status: 'error',
        loadTime: errorState.loadTime,
        error: error as Error
      });

      return errorState;
    }
  }

  /**
   * Select the best observation method for a font
   */
  private selectBestMethod(fontName: string): 'fontface' | 'document' | 'detection' {
    // Check if FontFace API is available
    if (typeof FontFace !== 'undefined') {
      return 'fontface';
    }
    
    // Check if document.fonts is available
    if (document.fonts) {
      return 'document';
    }
    
    // Fallback to detection method
    return 'detection';
  }

  /**
   * Observe font using specific method
   */
  private async observeWithMethod(
    fontName: string,
    method: 'fontface' | 'document' | 'detection',
    options: Required<ObserverOptions>,
    signal: AbortSignal
  ): Promise<Partial<FontLoadingState>> {
    switch (method) {
      case 'fontface':
        return this.observeWithFontFace(fontName, options, signal);
      case 'document':
        return this.observeWithDocumentFonts(fontName, options, signal);
      case 'detection':
        return this.observeWithDetection(fontName, options, signal);
      default:
        throw new Error(`Unknown observation method: ${method}`);
    }
  }

  /**
   * Observe font using FontFace API
   */
  private async observeWithFontFace(
    fontName: string,
    options: Required<ObserverOptions>,
    signal: AbortSignal
  ): Promise<Partial<FontLoadingState>> {
    const fontFace = new FontFace(fontName, `local("${fontName}")`);
    
    // Emit progress for FontFace creation
    this.eventSystem.emitProgress({
      fontName,
      progress: 50,
      status: 'loading'
    });
    
    const loadPromise = fontFace.load();
    const timeoutPromise = this.timingController.createFontLoadTimeout(fontName, options.timeout);
    
    try {
      await Promise.race([
        loadPromise,
        timeoutPromise,
        new Promise((_, reject) => {
          signal.addEventListener('abort', () => reject(new Error('Aborted')));
        })
      ]);
      
      return { status: 'loaded', loadMethod: 'fontface' };
    } catch (error) {
      if (signal.aborted) {
        throw new Error('Observation aborted');
      }
      
      if (this.timingController.isTimeoutError(error as Error)) {
        return { status: 'timeout', loadMethod: 'fontface' };
      }
      
      throw error;
    }
  }

  /**
   * Observe font using document.fonts API
   */
  private async observeWithDocumentFonts(
    fontName: string,
    options: Required<ObserverOptions>,
    signal: AbortSignal
  ): Promise<Partial<FontLoadingState>> {
    if (!document.fonts) {
      throw new Error('document.fonts not available');
    }

    // Emit progress for document.fonts waiting
    this.eventSystem.emitProgress({
      fontName,
      progress: 60,
      status: 'loading'
    });

    // Wait for document fonts ready
    await this.timingController.waitForDocumentFontsReady(options.timeout);
    
    if (signal.aborted) {
      throw new Error('Observation aborted');
    }

    // Emit progress for font checking
    this.eventSystem.emitProgress({
      fontName,
      progress: 80,
      status: 'loading'
    });

    // Check if font is loaded
    const isLoaded = document.fonts.check(`12px "${fontName}"`);
    
    return {
      status: isLoaded ? 'loaded' : 'error',
      loadMethod: 'document'
    };
  }

  /**
   * Observe font using detection method (fallback)
   */
  private async observeWithDetection(
    fontName: string,
    options: Required<ObserverOptions>,
    signal: AbortSignal
  ): Promise<Partial<FontLoadingState>> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let lastProgress = 50;
      
      const checkFont = () => {
        if (signal.aborted) {
          reject(new Error('Observation aborted'));
          return;
        }
        
        const elapsed = Date.now() - startTime;
        const progress = Math.min(50 + (elapsed / options.timeout) * 40, 90);
        
        // Emit progress updates during detection
        if (progress > lastProgress + 10) {
          this.eventSystem.emitProgress({
            fontName,
            progress: Math.round(progress),
            status: 'loading'
          });
          lastProgress = progress;
        }
        
        if (elapsed > options.timeout) {
          resolve({ status: 'timeout', loadMethod: 'detection' });
          return;
        }
        
        try {
          const isLoaded = this.performFontDetectionTest(fontName);
          if (isLoaded) {
            resolve({ status: 'loaded', loadMethod: 'detection' });
          } else {
            setTimeout(checkFont, options.pollInterval);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      checkFont();
    });
  }

  /**
   * Perform font detection test using canvas measurement
   */
  private performFontDetectionTest(fontName: string): boolean {
    if (typeof document === 'undefined') {
      return false;
    }

    const testElement = document.createElement('div');
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    testElement.style.top = '-9999px';
    testElement.style.visibility = 'hidden';
    testElement.style.whiteSpace = 'nowrap';
    testElement.style.fontSize = '16px';
    testElement.textContent = 'mmmmmmmmmmlli';

    document.body.appendChild(testElement);

    try {
      // Measure with fallback font
      testElement.style.fontFamily = 'sans-serif';
      const fallbackWidth = testElement.offsetWidth;

      // Measure with target font
      testElement.style.fontFamily = `"${fontName}", sans-serif`;
      const testWidth = testElement.offsetWidth;

      // Calculate difference
      const difference = Math.abs(testWidth - fallbackWidth);
      const threshold = fallbackWidth * 0.02; // 2% threshold

      return difference > threshold;
    } finally {
      document.body.removeChild(testElement);
    }
  }

  /**
   * Get currently observed fonts
   */
  getObservedFonts(): string[] {
    return Array.from(this.observedFonts.keys());
  }

  /**
   * Check if a font is currently being observed
   */
  isObserving(fontName: string): boolean {
    return this.observedFonts.has(fontName);
  }

  /**
   * Get the event system instance
   */
  getEventSystem(): FontEventSystem {
    return this.eventSystem;
  }
}