/**
 * TimingController - Manages timing operations for font loading
 */

export interface TimingOptions {
  timeout?: number;
  retryDelay?: number;
  maxRetries?: number;
}

export class TimingController {
  private defaultTimeout: number;
  private defaultRetryDelay: number;
  private defaultMaxRetries: number;

  constructor(options: TimingOptions = {}) {
    this.defaultTimeout = options.timeout || 5000;
    this.defaultRetryDelay = options.retryDelay || 1000;
    this.defaultMaxRetries = options.maxRetries || 3;
  }

  /**
   * Wait for document.fonts.ready with timeout
   */
  async waitForDocumentFontsReady(timeout?: number): Promise<void> {
    const timeoutMs = timeout || this.defaultTimeout;
    
    if (!document.fonts || !document.fonts.ready) {
      // Fallback for browsers without Font Loading API
      return Promise.resolve();
    }

    return Promise.race([
      document.fonts.ready.then(() => undefined),
      this.createTimeout(timeoutMs, 'Document fonts ready timeout')
    ]);
  }

  /**
   * Create a timeout promise that rejects after specified time
   */
  createFontLoadTimeout(fontName: string, timeout: number): Promise<never> {
    return this.createTimeout(timeout, `Font load timeout for ${fontName}`);
  }

  /**
   * Schedule a retry with exponential backoff
   */
  async scheduleRetry(fontName: string, attempt: number): Promise<void> {
    const delay = this.calculateRetryDelay(attempt);
    return new Promise(resolve => {
      setTimeout(() => resolve(), delay);
    });
  }

  /**
   * Create a delay promise
   */
  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Race multiple promises with timeout
   */
  async raceWithTimeout<T>(
    promises: Promise<T>[],
    timeout: number,
    timeoutMessage?: string
  ): Promise<T> {
    return Promise.race([
      Promise.all(promises).then(results => results[0]),
      this.createTimeout(timeout, timeoutMessage || 'Operation timeout')
    ]);
  }

  /**
   * Execute function with retry logic
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries?: number,
    retryDelay?: number
  ): Promise<T> {
    const maxAttempts = (maxRetries ?? this.defaultMaxRetries) + 1;
    const delay = retryDelay ?? this.defaultRetryDelay;
    
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        // Wait before retry with exponential backoff
        await this.delay(this.calculateRetryDelay(attempt, delay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Create a timeout promise
   */
  private createTimeout(ms: number, message: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(message));
      }, ms);
    });
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number, baseDelay?: number): number {
    const base = baseDelay ?? this.defaultRetryDelay;
    return Math.min(base * Math.pow(2, attempt - 1), 10000); // Cap at 10 seconds
  }

  /**
   * Check if an error is a timeout error
   */
  isTimeoutError(error: Error): boolean {
    return error.message.includes('timeout') || error.message.includes('Timeout');
  }

  /**
   * Create a debounced function
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * Create a throttled function
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}