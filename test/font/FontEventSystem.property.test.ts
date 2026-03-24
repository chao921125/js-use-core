/**
 * Property-based tests for FontEventSystem
 * **Feature: font-loading-timing-fix, Property 4: Progress event emission**
 */

import * as fc from 'fast-check';
import { FontEventSystem, FontProgressEvent, FontCompletionEvent, FontErrorEvent, FontTimeoutEvent, BatchCompletionEvent, BatchTimeoutEvent } from '../../src/font/FontEventSystem';
import { FontLoadingStateManager } from '../../src/font/FontLoadingStateManager';
import { FontLoadObserver } from '../../src/font/FontLoadObserver';

describe('FontEventSystem Property Tests', () => {
  let eventSystem: FontEventSystem;
  let stateManager: FontLoadingStateManager;
  let observer: FontLoadObserver;

  beforeEach(() => {
    eventSystem = new FontEventSystem();
    stateManager = new FontLoadingStateManager(eventSystem);
    observer = new FontLoadObserver(undefined, eventSystem);
  });

  afterEach(() => {
    eventSystem.removeAllListeners();
    stateManager.clear();
    stateManager.removeAllListeners();
    observer.stopAll();
    observer.removeAllListeners();
  });

  /**
   * **Feature: font-loading-timing-fix, Property 4: Progress event emission**
   * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
   * 
   * For any font loading operation, the system should emit appropriate progress, 
   * completion, error, and timeout events with accurate information
   */
  test('Property 4: Progress event emission - system should emit appropriate events during font loading', () => {
    fc.assert(
      fc.property(
        // Generate font names
        fc.array(
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          { minLength: 1, maxLength: 5 }
        ),
        // Generate font loading scenarios
        fc.array(
          fc.record({
            fontIndex: fc.integer({ min: 0, max: 4 }),
            status: fc.constantFrom('pending', 'loading', 'loaded', 'error', 'timeout'),
            hasError: fc.boolean(),
            hasLoadTime: fc.boolean(),
            progress: fc.integer({ min: 0, max: 100 })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (fontNames, scenarios) => {
          // Ensure unique font names
          const uniqueFontNames = [...new Set(fontNames)].filter(name => name.trim().length > 0);
          if (uniqueFontNames.length === 0) return true;

          // Track events
          const progressEvents: FontProgressEvent[] = [];
          const completionEvents: FontCompletionEvent[] = [];
          const errorEvents: FontErrorEvent[] = [];
          const timeoutEvents: FontTimeoutEvent[] = [];

          // Set up event listeners
          eventSystem.on('fontProgress', (event: FontProgressEvent) => {
            progressEvents.push(event);
          });

          eventSystem.on('fontCompleted', (event: FontCompletionEvent) => {
            completionEvents.push(event);
          });

          eventSystem.on('fontError', (event: FontErrorEvent) => {
            errorEvents.push(event);
          });

          eventSystem.on('fontTimeout', (event: FontTimeoutEvent) => {
            timeoutEvents.push(event);
          });

          // Track fonts and simulate loading scenarios
          uniqueFontNames.forEach(fontName => {
            stateManager.trackFont(fontName);
          });

          scenarios.forEach(scenario => {
            const fontIndex = scenario.fontIndex % uniqueFontNames.length;
            const fontName = uniqueFontNames[fontIndex];

            // Emit progress event directly
            eventSystem.emitProgress({
              fontName,
              progress: scenario.progress,
              status: scenario.status,
              loadTime: scenario.hasLoadTime ? 100 : undefined,
              error: scenario.hasError && scenario.status === 'error' ? new Error(`Test error for ${fontName}`) : undefined
            });

            // Update state to trigger state-based events
            const stateUpdate: any = { status: scenario.status };
            if (scenario.hasError && scenario.status === 'error') {
              stateUpdate.error = new Error(`Test error for ${fontName}`);
            }
            if (scenario.hasLoadTime && (scenario.status === 'loaded' || scenario.status === 'error' || scenario.status === 'timeout')) {
              stateUpdate.endTime = Date.now();
            }

            stateManager.updateFontState(fontName, stateUpdate);
          });

          // Verify progress events
          expect(progressEvents.length).toBeGreaterThan(0);
          progressEvents.forEach(event => {
            expect(uniqueFontNames).toContain(event.fontName);
            expect(event.progress).toBeGreaterThanOrEqual(0);
            expect(event.progress).toBeLessThanOrEqual(100);
            expect(['pending', 'loading', 'loaded', 'error', 'timeout']).toContain(event.status);
            
            // Only check error consistency if error is present
            if (event.error) {
              expect(event.error).toBeInstanceOf(Error);
              // Don't enforce status to be 'error' since we might emit progress with error but different status
            }
            
            if (event.loadTime !== undefined) {
              expect(event.loadTime).toBeGreaterThanOrEqual(0);
            }
          });

          // Verify completion events for final states
          completionEvents.forEach(event => {
            expect(uniqueFontNames).toContain(event.fontName);
            expect(['loaded', 'error', 'timeout']).toContain(event.status);
            expect(typeof event.loadTime).toBe('number');
            expect(event.loadTime).toBeGreaterThanOrEqual(0);
            expect(typeof event.retryCount).toBe('number');
            expect(event.retryCount).toBeGreaterThanOrEqual(0);
            
            // Only check error consistency for error status
            if (event.status === 'error' && event.error) {
              expect(event.error).toBeInstanceOf(Error);
            }
          });

          // Verify error events
          errorEvents.forEach(event => {
            expect(uniqueFontNames).toContain(event.fontName);
            expect(event.error).toBeInstanceOf(Error);
            expect(typeof event.retryCount).toBe('number');
            expect(event.retryCount).toBeGreaterThanOrEqual(0);
            expect(typeof event.willRetry).toBe('boolean');
            
            if (event.nextRetryIn !== undefined) {
              expect(event.nextRetryIn).toBeGreaterThan(0);
            }
          });

          // Verify timeout events
          timeoutEvents.forEach(event => {
            expect(uniqueFontNames).toContain(event.fontName);
            expect(typeof event.timeout).toBe('number');
            expect(event.timeout).toBeGreaterThan(0);
            expect(typeof event.retryCount).toBe('number');
            expect(event.retryCount).toBeGreaterThanOrEqual(0);
            expect(typeof event.willRetry).toBe('boolean');
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 4a: Batch operations should emit appropriate batch events', () => {
    fc.assert(
      fc.property(
        // Generate batch of font names
        fc.array(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          { minLength: 2, maxLength: 8 }
        ),
        // Generate batch completion scenarios
        fc.array(
          fc.record({
            fontIndex: fc.integer({ min: 0, max: 7 }),
            status: fc.constantFrom('loaded', 'error', 'timeout'),
            loadTime: fc.integer({ min: 10, max: 1000 }),
            hasError: fc.boolean()
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (fontNames, completionScenarios) => {
          const uniqueFontNames = [...new Set(fontNames)].filter(name => name.trim().length > 0);
          if (uniqueFontNames.length < 2) return true;

          // Track batch events
          const batchCompletionEvents: BatchCompletionEvent[] = [];
          const batchTimeoutEvents: BatchTimeoutEvent[] = [];

          eventSystem.on('batchCompleted', (event: BatchCompletionEvent) => {
            batchCompletionEvents.push(event);
          });

          eventSystem.on('batchTimeout', (event: BatchTimeoutEvent) => {
            batchTimeoutEvents.push(event);
          });

          // Start batch operation
          const batchId = `batch_${Date.now()}`;
          eventSystem.startBatchOperation(batchId, uniqueFontNames);

          // Simulate font completions
          completionScenarios.forEach(scenario => {
            const fontIndex = scenario.fontIndex % uniqueFontNames.length;
            const fontName = uniqueFontNames[fontIndex];

            const completionEvent: FontCompletionEvent = {
              fontName,
              status: scenario.status,
              loadTime: scenario.loadTime,
              retryCount: 0,
              error: scenario.hasError && scenario.status === 'error' ? new Error(`Test error for ${fontName}`) : undefined
            };

            eventSystem.emitCompletion(completionEvent);
          });

          // End batch operation
          eventSystem.endBatchOperation(batchId);

          // Verify batch completion events
          expect(batchCompletionEvents.length).toBeGreaterThan(0);
          batchCompletionEvents.forEach(event => {
            expect(event.totalFonts).toBe(uniqueFontNames.length);
            expect(event.loadedFonts + event.failedFonts).toBeLessThanOrEqual(event.totalFonts);
            expect(typeof event.totalTime).toBe('number');
            expect(event.totalTime).toBeGreaterThanOrEqual(0);
            expect(Array.isArray(event.results)).toBe(true);
            
            // Verify individual results
            event.results.forEach(result => {
              expect(uniqueFontNames).toContain(result.fontName);
              expect(['loaded', 'error', 'timeout']).toContain(result.status);
              expect(typeof result.loadTime).toBe('number');
              expect(result.loadTime).toBeGreaterThanOrEqual(0);
              expect(typeof result.retryCount).toBe('number');
              expect(result.retryCount).toBeGreaterThanOrEqual(0);
            });
          });

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 4b: Event system should handle batch timeouts correctly', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          { minLength: 2, maxLength: 6 }
        ),
        fc.integer({ min: 100, max: 2000 }), // timeout value
        fc.integer({ min: 0, max: 5 }), // number of fonts to complete before timeout
        (fontNames, timeout, completedCount) => {
          const uniqueFontNames = [...new Set(fontNames)].filter(name => name.trim().length > 0);
          if (uniqueFontNames.length < 2) return true;

          const actualCompletedCount = Math.min(completedCount, uniqueFontNames.length);
          const batchTimeoutEvents: BatchTimeoutEvent[] = [];

          eventSystem.on('batchTimeout', (event: BatchTimeoutEvent) => {
            batchTimeoutEvents.push(event);
          });

          // Start batch operation
          const batchId = `timeout_batch_${Date.now()}`;
          eventSystem.startBatchOperation(batchId, uniqueFontNames);

          // Complete some fonts
          for (let i = 0; i < actualCompletedCount; i++) {
            const completionEvent: FontCompletionEvent = {
              fontName: uniqueFontNames[i],
              status: 'loaded',
              loadTime: 100,
              retryCount: 0
            };
            eventSystem.emitCompletion(completionEvent);
          }

          // Trigger batch timeout
          eventSystem.handleBatchTimeout(batchId, timeout);

          // Verify batch timeout events - only expect events if there are actually timed out fonts
          const expectedTimedOutFonts = uniqueFontNames.length - actualCompletedCount;
          if (expectedTimedOutFonts > 0) {
            expect(batchTimeoutEvents.length).toBeGreaterThan(0);
            batchTimeoutEvents.forEach(event => {
              expect(event.totalFonts).toBe(uniqueFontNames.length);
              expect(event.completedFonts).toBe(actualCompletedCount);
              expect(event.timedOutFonts.length).toBe(expectedTimedOutFonts);
              expect(event.timeout).toBe(timeout);
              
              // Verify timed out fonts are from the original list
              event.timedOutFonts.forEach(fontName => {
                expect(uniqueFontNames).toContain(fontName);
              });
            });
          } else {
            // If all fonts were completed, no timeout event should be emitted
            expect(batchTimeoutEvents.length).toBe(0);
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 4c: Progress tracker should emit consistent events', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        fc.array(
          fc.record({
            progress: fc.integer({ min: 0, max: 100 }),
            status: fc.constantFrom('pending', 'loading', 'loaded', 'error', 'timeout')
          }),
          { minLength: 1, maxLength: 10 }
        ),
        fc.constantFrom('loaded', 'error', 'timeout'),
        fc.integer({ min: 10, max: 1000 }),
        (fontName, progressUpdates, finalStatus, loadTime) => {
          const progressEvents: FontProgressEvent[] = [];
          const completionEvents: FontCompletionEvent[] = [];

          eventSystem.on('fontProgress', (event: FontProgressEvent) => {
            progressEvents.push(event);
          });

          eventSystem.on('fontCompleted', (event: FontCompletionEvent) => {
            completionEvents.push(event);
          });

          // Create progress tracker
          const tracker = eventSystem.createProgressTracker(fontName);

          // Send progress updates
          progressUpdates.forEach(update => {
            tracker.updateProgress(update.progress, update.status);
          });

          // Complete the font
          tracker.complete(finalStatus, loadTime, finalStatus === 'error' ? new Error('Test error') : undefined);

          // Verify progress events
          expect(progressEvents.length).toBe(progressUpdates.length);
          progressEvents.forEach((event, index) => {
            expect(event.fontName).toBe(fontName);
            expect(event.progress).toBe(progressUpdates[index].progress);
            expect(event.status).toBe(progressUpdates[index].status);
          });

          // Verify completion event
          expect(completionEvents.length).toBe(1);
          const completionEvent = completionEvents[0];
          expect(completionEvent.fontName).toBe(fontName);
          expect(completionEvent.status).toBe(finalStatus);
          expect(completionEvent.loadTime).toBe(loadTime);
          expect(completionEvent.retryCount).toBe(0); // Default from tracker

          if (finalStatus === 'error') {
            expect(completionEvent.error).toBeInstanceOf(Error);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 4d: Font-specific event listeners should receive correct events', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          { minLength: 2, maxLength: 5 }
        ),
        fc.array(
          fc.record({
            fontIndex: fc.integer({ min: 0, max: 4 }),
            eventType: fc.constantFrom('progress', 'completion', 'error', 'timeout'),
            progress: fc.integer({ min: 0, max: 100 }),
            status: fc.constantFrom('pending', 'loading', 'loaded', 'error', 'timeout')
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (fontNames, eventScenarios) => {
          const uniqueFontNames = [...new Set(fontNames)].filter(name => name.trim().length > 0);
          if (uniqueFontNames.length < 2) return true;

          // Track events per font
          const fontEvents: Record<string, any[]> = {};
          uniqueFontNames.forEach(fontName => {
            fontEvents[fontName] = [];

            // Set up font-specific listeners
            eventSystem.onProgress(fontName, (event) => {
              fontEvents[fontName].push({ type: 'progress', event });
            });

            eventSystem.onCompletion(fontName, (event) => {
              fontEvents[fontName].push({ type: 'completion', event });
            });

            eventSystem.onError(fontName, (event) => {
              fontEvents[fontName].push({ type: 'error', event });
            });

            eventSystem.onTimeout(fontName, (event) => {
              fontEvents[fontName].push({ type: 'timeout', event });
            });
          });

          // Emit events based on scenarios
          eventScenarios.forEach(scenario => {
            const fontIndex = scenario.fontIndex % uniqueFontNames.length;
            const fontName = uniqueFontNames[fontIndex];

            switch (scenario.eventType) {
              case 'progress':
                eventSystem.emitProgress({
                  fontName,
                  progress: scenario.progress,
                  status: scenario.status
                });
                break;
              case 'completion':
                eventSystem.emitCompletion({
                  fontName,
                  status: scenario.status === 'loaded' ? 'loaded' : scenario.status === 'timeout' ? 'timeout' : 'error',
                  loadTime: 100,
                  retryCount: 0
                });
                break;
              case 'error':
                eventSystem.emitError({
                  fontName,
                  error: new Error('Test error'),
                  retryCount: 0,
                  willRetry: false
                });
                break;
              case 'timeout':
                eventSystem.emitTimeout({
                  fontName,
                  timeout: 1000,
                  retryCount: 0,
                  willRetry: false
                });
                break;
            }
          });

          // Verify that each font only received events for itself
          uniqueFontNames.forEach(fontName => {
            const events = fontEvents[fontName];
            events.forEach(eventWrapper => {
              expect(eventWrapper.event.fontName).toBe(fontName);
            });
          });

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 4e: Batch status tracking should be accurate', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          { minLength: 1, maxLength: 8 }
        ),
        fc.array(
          fc.record({
            fontIndex: fc.integer({ min: 0, max: 7 }),
            complete: fc.boolean()
          }),
          { minLength: 1, maxLength: 15 }
        ),
        (fontNames, completionActions) => {
          const uniqueFontNames = [...new Set(fontNames)].filter(name => name.trim().length > 0);
          if (uniqueFontNames.length === 0) return true;

          const batchId = `status_batch_${Date.now()}`;
          eventSystem.startBatchOperation(batchId, uniqueFontNames);

          // Track which fonts we've completed
          const completedFonts = new Set<string>();

          // Process completion actions
          completionActions.forEach(action => {
            const fontIndex = action.fontIndex % uniqueFontNames.length;
            const fontName = uniqueFontNames[fontIndex];

            if (action.complete && !completedFonts.has(fontName)) {
              completedFonts.add(fontName);
              eventSystem.emitCompletion({
                fontName,
                status: 'loaded',
                loadTime: 100,
                retryCount: 0
              });
            }
          });

          // Check batch status
          const status = eventSystem.getBatchStatus(batchId);
          
          if (status) {
            expect(status.totalFonts).toBe(uniqueFontNames.length);
            expect(status.completedFonts).toBe(completedFonts.size);
            expect(status.pendingFonts).toBe(uniqueFontNames.length - completedFonts.size);
            expect(status.progress).toBeGreaterThanOrEqual(0);
            expect(status.progress).toBeLessThanOrEqual(100);
            
            // Progress should match completion ratio
            const expectedProgress = uniqueFontNames.length > 0 ? 
              (completedFonts.size / uniqueFontNames.length) * 100 : 100;
            expect(status.progress).toBe(expectedProgress);
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});