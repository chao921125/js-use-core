/**
 * Property-based tests for FontLoadingStateManager
 * **Feature: font-loading-timing-fix, Property 2: Loading state accuracy**
 */

import * as fc from 'fast-check';
import { FontLoadingStateManager, FontLoadingState } from '../../src/font/FontLoadingStateManager';

describe('FontLoadingStateManager Property Tests', () => {
  let stateManager: FontLoadingStateManager;

  beforeEach(() => {
    stateManager = new FontLoadingStateManager();
  });

  afterEach(() => {
    stateManager.clear();
    stateManager.removeAllListeners();
  });

  /**
   * **Feature: font-loading-timing-fix, Property 2: Loading state accuracy**
   * **Validates: Requirements 1.2, 1.3**
   * 
   * For any font being checked, the system should return accurate loading state 
   * information that reflects the actual current state of the font
   */
  test('Property 2: Loading state accuracy - font states should accurately reflect current status', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary font names
        fc.array(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), { minLength: 1, maxLength: 10 }),
        // Generate arbitrary font sources
        fc.constantFrom('system', 'web', 'dynamic'),
        // Generate arbitrary status updates
        fc.array(
          fc.record({
            fontIndex: fc.integer({ min: 0, max: 9 }),
            status: fc.constantFrom('pending', 'loading', 'loaded', 'error', 'timeout'),
            hasError: fc.boolean(),
            hasLoadTime: fc.boolean()
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (fontNames, source, statusUpdates) => {
          // Clear state first to ensure clean test
          stateManager.clear();
          
          // Ensure we have valid font names
          const validFontNames = [...new Set(fontNames)].filter(name => name.trim().length > 0);
          if (validFontNames.length === 0) return true;

          // Track fonts with the same source for all
          validFontNames.forEach(fontName => {
            stateManager.trackFont(fontName, source);
          });

          // Apply status updates
          statusUpdates.forEach(update => {
            const fontIndex = update.fontIndex % validFontNames.length;
            const fontName = validFontNames[fontIndex];
            
            const stateUpdate: Partial<FontLoadingState> = {
              status: update.status
            };

            if (update.hasError && update.status === 'error') {
              stateUpdate.error = new Error(`Test error for ${fontName}`);
            }

            if (update.hasLoadTime && (update.status === 'loaded' || update.status === 'error')) {
              stateUpdate.endTime = Date.now();
            }

            stateManager.updateFontState(fontName, stateUpdate);
          });

          // Verify state accuracy
          validFontNames.forEach(fontName => {
            const state = stateManager.getLoadingState(fontName);
            
            // State should exist for tracked fonts
            expect(state).toBeDefined();
            if (!state) return;

            // State should have required properties
            expect(state.family).toBe(fontName);
            expect(state.source).toBe(source);
            expect(typeof state.startTime).toBe('number');
            expect(typeof state.retryCount).toBe('number');
            expect(['pending', 'loading', 'loaded', 'error', 'timeout']).toContain(state.status);

            // If status is loaded or error, endTime should be set if it was updated
            if (state.status === 'loaded' && state.endTime) {
              expect(state.loadTime).toBeDefined();
              expect(state.loadTime).toBe(state.endTime - state.startTime);
            }

            // If status is error, error should be set if it was provided
            if (state.status === 'error' && state.error) {
              expect(state.error).toBeInstanceOf(Error);
            }

            // Start time should be reasonable (not in the future)
            expect(state.startTime).toBeLessThanOrEqual(Date.now());

            // Retry count should be non-negative
            expect(state.retryCount).toBeGreaterThanOrEqual(0);
          });

          // Progress should be consistent
          const progress = stateManager.getProgress();
          expect(progress.total).toBe(validFontNames.length);
          expect(progress.loaded + progress.failed + progress.pending).toBe(progress.total);
          expect(progress.progress).toBeGreaterThanOrEqual(0);
          expect(progress.progress).toBeLessThanOrEqual(100);

          // Font states in progress should match individual states
          expect(progress.fonts.size).toBe(validFontNames.length);
          validFontNames.forEach(fontName => {
            expect(progress.fonts.has(fontName)).toBe(true);
            const progressState = progress.fonts.get(fontName);
            const individualState = stateManager.getLoadingState(fontName);
            expect(progressState).toEqual(individualState);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 2a: State transitions should be valid and consistent', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        fc.array(
          fc.constantFrom('pending', 'loading', 'loaded', 'error', 'timeout'),
          { minLength: 1, maxLength: 10 }
        ),
        (fontName, statusSequence) => {
          // Clear state first
          stateManager.clear();
          stateManager.trackFont(fontName);
          
          let previousState = stateManager.getLoadingState(fontName);
          expect(previousState?.status).toBe('pending');

          statusSequence.forEach(status => {
            stateManager.updateFontState(fontName, { status });
            const currentState = stateManager.getLoadingState(fontName);
            
            expect(currentState).toBeDefined();
            expect(currentState!.status).toBe(status);
            expect(currentState!.family).toBe(fontName);
            
            // Start time should remain constant
            expect(currentState!.startTime).toBe(previousState!.startTime);
            
            // Retry count should not decrease
            expect(currentState!.retryCount).toBeGreaterThanOrEqual(previousState!.retryCount);
            
            previousState = currentState;
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 2b: Untracked fonts should not have states', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0), { minLength: 1, maxLength: 10 }),
        fc.array(fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0), { minLength: 1, maxLength: 10 }),
        (trackedFonts, untrackedFonts) => {
          // Ensure no overlap between tracked and untracked fonts
          const uniqueTracked = [...new Set(trackedFonts)];
          const uniqueUntracked = [...new Set(untrackedFonts)].filter(
            font => !uniqueTracked.includes(font)
          );

          if (uniqueTracked.length === 0 || uniqueUntracked.length === 0) {
            return true;
          }

          // Clear any existing state first
          stateManager.clear();

          // Track only the tracked fonts
          uniqueTracked.forEach(fontName => {
            stateManager.trackFont(fontName);
          });

          // Verify tracked fonts have states
          uniqueTracked.forEach(fontName => {
            const state = stateManager.getLoadingState(fontName);
            expect(state).toBeDefined();
            expect(stateManager.isTracked(fontName)).toBe(true);
          });

          // Verify untracked fonts don't have states
          uniqueUntracked.forEach(fontName => {
            const state = stateManager.getLoadingState(fontName);
            expect(state).toBeUndefined();
            expect(stateManager.isTracked(fontName)).toBe(false);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 2c: Wait operations should respect timeout and completion', () => {
    fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        fc.integer({ min: 100, max: 1000 }),
        fc.constantFrom('loaded', 'error'),
        async (fontName, timeout, finalStatus) => {
          // Clear state first
          stateManager.clear();
          stateManager.trackFont(fontName);
          
          // Start waiting for font
          const waitPromise = stateManager.waitForFont(fontName, timeout);
          
          // Simulate font loading completion after a short delay
          const completionDelay = Math.min(timeout / 3, 200);
          setTimeout(() => {
            stateManager.updateFontState(fontName, { 
              status: finalStatus,
              endTime: Date.now()
            });
          }, completionDelay);
          
          const result = await waitPromise;
          
          expect(result).toBeDefined();
          expect(result.family).toBe(fontName);
          expect(['loaded', 'error', 'timeout']).toContain(result.status);
          
          // If completed before timeout, status should match what we set
          if (result.status !== 'timeout') {
            expect(result.status).toBe(finalStatus);
          }
          
          return true;
        }
      ),
      { numRuns: 20 } // Reduced runs due to async nature and timeouts
    );
  });
});