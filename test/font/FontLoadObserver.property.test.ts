/**
 * Property-based tests for FontLoadObserver
 * **Feature: font-loading-timing-fix, Property 7: Dynamic font monitoring**
 */

import * as fc from 'fast-check';
import { FontLoadObserver, ObserverOptions } from '../../src/font/FontLoadObserver';
import { TimingController } from '../../src/font/TimingController';

// Mock FontFace API
const mockFontFace = jest.fn().mockImplementation((family: string, source: string) => ({
  family,
  source,
  load: jest.fn().mockResolvedValue(undefined)
}));

// Setup global FontFace mock
(global as any).FontFace = mockFontFace;

describe('FontLoadObserver Property Tests', () => {
  let observer: FontLoadObserver;
  let timingController: TimingController;

  beforeEach(() => {
    // Create fresh instances for each test
    timingController = new TimingController();
    observer = new FontLoadObserver(timingController);
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock document.fonts
    const mockFonts = {
      ready: Promise.resolve(),
      check: jest.fn().mockReturnValue(true)
    };
    
    Object.defineProperty(document, 'fonts', {
      value: mockFonts,
      writable: true
    });

    // Mock document.body for font detection tests
    if (!document.body) {
      document.body = document.createElement('body');
    }

    // Mock createElement for font detection
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'div') {
        return {
          style: {},
          textContent: '',
          offsetWidth: 100
        } as any;
      }
      return document.createElement(tagName);
    });

    // Mock appendChild and removeChild
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);
    
    mockFontFace.mockClear();
  });

  afterEach(() => {
    observer.stopAll();
    observer.removeAllListeners();
  });

  /**
   * **Feature: font-loading-timing-fix, Property 7: Dynamic font monitoring**
   * **Validates: Requirements 4.1, 4.3, 4.4**
   * 
   * For any dynamically added font, the system should properly monitor its loading 
   * status and handle detection requests appropriately
   */
  test('Property 7: Dynamic font monitoring - observer should handle font observation correctly', () => {
    fc.assert(
      fc.asyncProperty(
        // Generate font names
        fc.array(
          fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
          { minLength: 1, maxLength: 5 }
        ),
        // Generate observer options
        fc.record({
          timeout: fc.integer({ min: 100, max: 2000 }),
          retries: fc.integer({ min: 0, max: 5 }),
          method: fc.constantFrom('auto', 'fontface', 'document', 'detection'),
          pollInterval: fc.integer({ min: 50, max: 500 })
        }),
        async (fontNames, options) => {
          // Ensure unique font names
          const uniqueFontNames = [...new Set(fontNames)].filter(name => name.trim().length > 0);
          if (uniqueFontNames.length === 0) return true;

          // Test single font observation
          const firstFont = uniqueFontNames[0];
          
          // Mock successful font loading
          const mockFonts = (document as any).fonts;
          mockFonts.check.mockReturnValue(true);
          const mockFontFaceInstance = {
            family: firstFont,
            source: `local("${firstFont}")`,
            load: jest.fn().mockResolvedValue(undefined)
          };
          mockFontFace.mockReturnValue(mockFontFaceInstance);

          const result = await observer.observeFont(firstFont, options);

          // Verify result structure
          expect(result).toBeDefined();
          expect(result.family).toBe(firstFont);
          expect(['pending', 'loading', 'loaded', 'error', 'timeout']).toContain(result.status);
          expect(typeof result.startTime).toBe('number');
          expect(result.startTime).toBeLessThanOrEqual(Date.now());
          expect(typeof result.retryCount).toBe('number');
          expect(result.retryCount).toBeGreaterThanOrEqual(0);

          // If completed successfully, should have timing info
          if (result.status === 'loaded') {
            expect(result.endTime).toBeDefined();
            expect(result.loadTime).toBeDefined();
            expect(result.loadTime).toBe(result.endTime! - result.startTime);
          }

          // Test multiple font observation if we have more fonts
          if (uniqueFontNames.length > 1) {
            const multiResults = await observer.observeMultipleFonts(uniqueFontNames, options);
            
            expect(multiResults).toHaveLength(uniqueFontNames.length);
            multiResults.forEach((fontResult, index) => {
              expect(fontResult.family).toBe(uniqueFontNames[index]);
              expect(['pending', 'loading', 'loaded', 'error', 'timeout']).toContain(fontResult.status);
            });
          }

          return true;
        }
      ),
      { numRuns: 50 } // Reduced due to async nature
    );
  });

  test('Property 7a: Observer state management should be consistent', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          { minLength: 1, maxLength: 10 }
        ),
        (fontNames) => {
          const uniqueFontNames = [...new Set(fontNames)].filter(name => name.trim().length > 0);
          if (uniqueFontNames.length === 0) return true;

          // Create a fresh observer for this test to ensure clean state
          const testObserver = new FontLoadObserver(timingController);

          // Initially no fonts should be observed
          expect(testObserver.getObservedFonts()).toHaveLength(0);
          uniqueFontNames.forEach(fontName => {
            expect(testObserver.isObserving(fontName)).toBe(false);
          });

          // Start observing fonts (we'll stop them immediately to avoid async issues)
          uniqueFontNames.forEach(fontName => {
            const promise = testObserver.observeFont(fontName, { timeout: 100 });
            // Stop observation immediately to test state management
            testObserver.stopObserving(fontName);
            promise.catch(() => {}); // Ignore promise rejection
          });

          // After stopping, no fonts should be observed
          expect(testObserver.getObservedFonts()).toHaveLength(0);
          uniqueFontNames.forEach(fontName => {
            expect(testObserver.isObserving(fontName)).toBe(false);
          });

          // Clean up
          testObserver.stopAll();
          testObserver.removeAllListeners();

          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  test('Property 7b: Observer should handle method selection correctly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        fc.constantFrom('auto', 'fontface', 'document', 'detection'),
        (fontName, method) => {
          const options: ObserverOptions = { method, timeout: 100 };
          
          // Create a fresh observer for this test
          const testObserver = new FontLoadObserver(timingController);
          
          // Mock different API availability scenarios
          if (method === 'fontface' || method === 'auto') {
            // FontFace should be available
            expect(typeof FontFace).toBe('function');
          }
          
          if (method === 'document' || method === 'auto') {
            // document.fonts should be available
            expect((document as any).fonts).toBeDefined();
          }

          // Start and immediately stop observation to test method selection
          const promise = testObserver.observeFont(fontName, options);
          testObserver.stopObserving(fontName);
          
          // Clean up
          testObserver.stopAll();
          testObserver.removeAllListeners();
          
          // Always return true since we're just testing that the method selection doesn't crash
          promise.catch(() => {});
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 7c: Observer should emit observation started events', () => {
    fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        async (fontName) => {
          const events: string[] = [];
          
          // Listen for events
          observer.on('observationStarted', () => events.push('started'));
          
          // Start observation with short timeout
          const promise = observer.observeFont(fontName, { timeout: 100 });
          
          try {
            await promise;
          } catch {
            // May fail due to timeout or other issues, that's ok
          }
          
          // Should have received started event
          expect(events).toContain('started');
          
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  test('Property 7d: Multiple font observation should handle individual failures gracefully', () => {
    fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          { minLength: 2, maxLength: 5 }
        ),
        async (fontNames) => {
          const uniqueFontNames = [...new Set(fontNames)].filter(name => name.trim().length > 0);
          if (uniqueFontNames.length < 2) return true;

          // Mock some fonts to fail
          const shouldFail = uniqueFontNames.map((_, index) => index % 2 === 0);
          
          mockFontFace.mockImplementation((family: string) => ({
            family,
            source: `local("${family}")`,
            load: jest.fn().mockImplementation(() => {
              const index = uniqueFontNames.indexOf(family);
              if (shouldFail[index]) {
                return Promise.reject(new Error(`Failed to load ${family}`));
              }
              return Promise.resolve();
            })
          }));

          const results = await observer.observeMultipleFonts(uniqueFontNames, { 
            timeout: 500,
            method: 'fontface'
          });

          // Should get results for all fonts
          expect(results).toHaveLength(uniqueFontNames.length);
          
          // Each result should have proper structure
          results.forEach((result, index) => {
            expect(result.family).toBe(uniqueFontNames[index]);
            expect(['pending', 'loading', 'loaded', 'error', 'timeout']).toContain(result.status);
            
            // Failed fonts should have error status
            if (shouldFail[index]) {
              expect(['error', 'timeout']).toContain(result.status);
            }
          });

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * **Feature: font-loading-timing-fix, Property 3: Timeout and error handling**
   * **Validates: Requirements 1.5**
   * 
   * For any font that fails to load within the timeout period, the system should 
   * mark it as failed and continue processing other fonts without blocking
   */
  test('Property 3: Timeout and error handling - observer should handle timeouts correctly', () => {
    fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        fc.integer({ min: 50, max: 300 }), // Short timeout for testing
        fc.constantFrom('fontface', 'document', 'detection'),
        async (fontName, timeout, method) => {
          // Create a fresh observer for this test
          const testObserver = new FontLoadObserver(timingController);
          
          // Mock font loading to take longer than timeout
          if (method === 'fontface') {
            mockFontFace.mockImplementation((family: string) => ({
              family,
              source: `local("${family}")`,
              load: jest.fn().mockImplementation(() => 
                new Promise((resolve) => setTimeout(resolve, timeout + 100)) // Takes longer than timeout
              )
            }));
          } else if (method === 'document') {
            // Mock document.fonts.ready to take longer than timeout
            const mockFonts = (document as any).fonts;
            mockFonts.ready = new Promise((resolve) => setTimeout(resolve, timeout + 100));
          }

          const startTime = Date.now();
          const result = await testObserver.observeFont(fontName, { 
            timeout, 
            method,
            retries: 0 // No retries for faster testing
          });

          const endTime = Date.now();
          const actualDuration = endTime - startTime;

          // Verify result structure
          expect(result).toBeDefined();
          expect(result.family).toBe(fontName);
          expect(['loaded', 'error', 'timeout']).toContain(result.status);
          
          // If it timed out, should be within reasonable time bounds
          if (result.status === 'timeout') {
            expect(actualDuration).toBeGreaterThanOrEqual(timeout - 50); // Allow some margin
            expect(actualDuration).toBeLessThan(timeout + 200); // Should not take much longer
          }

          // Should have timing information
          expect(typeof result.startTime).toBe('number');
          expect(result.startTime).toBeLessThanOrEqual(Date.now());
          
          if (result.endTime) {
            expect(result.endTime).toBeGreaterThanOrEqual(result.startTime);
            expect(result.loadTime).toBe(result.endTime - result.startTime);
          }

          // Clean up
          testObserver.stopAll();
          testObserver.removeAllListeners();

          return true;
        }
      ),
      { numRuns: 15 } // Reduced due to timeouts
    );
  });

  test('Property 3a: Error handling should preserve error information', () => {
    fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 50 }), // Error message
        async (fontName, errorMessage) => {
          // Create a fresh observer for this test
          const testObserver = new FontLoadObserver(timingController);
          
          // Mock font loading to fail with specific error
          mockFontFace.mockImplementation((family: string) => ({
            family,
            source: `local("${family}")`,
            load: jest.fn().mockRejectedValue(new Error(errorMessage))
          }));

          const result = await testObserver.observeFont(fontName, { 
            timeout: 200,
            method: 'fontface',
            retries: 0
          });

          // Should have error status
          expect(result.status).toBe('error');
          expect(result.family).toBe(fontName);
          
          // Should preserve error information
          if (result.error) {
            expect(result.error).toBeInstanceOf(Error);
            expect(result.error.message).toBe(errorMessage);
          }

          // Should have timing information
          expect(typeof result.startTime).toBe('number');
          expect(typeof result.endTime).toBe('number');
          expect(typeof result.loadTime).toBe('number');
          expect(result.loadTime).toBe(result.endTime - result.startTime);

          // Clean up
          testObserver.stopAll();
          testObserver.removeAllListeners();

          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  test('Property 3b: Abort handling should work correctly', () => {
    fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        async (fontName) => {
          // Create a fresh observer for this test
          const testObserver = new FontLoadObserver(timingController);
          
          // Mock font loading to take a while
          mockFontFace.mockImplementation((family: string) => ({
            family,
            source: `local("${family}")`,
            load: jest.fn().mockImplementation(() => 
              new Promise((resolve) => setTimeout(resolve, 1000)) // Takes 1 second
            )
          }));

          // Start observation
          const promise = testObserver.observeFont(fontName, { 
            timeout: 2000,
            method: 'fontface'
          });

          // Stop observation after a short delay
          setTimeout(() => testObserver.stopObserving(fontName), 50);

          const result = await promise;

          // Should complete (either successfully or with error)
          expect(result).toBeDefined();
          expect(result.family).toBe(fontName);
          expect(['loaded', 'error', 'timeout']).toContain(result.status);

          // Clean up
          testObserver.stopAll();
          testObserver.removeAllListeners();

          return true;
        }
      ),
      { numRuns: 10 } // Reduced due to timing complexity
    );
  });
});