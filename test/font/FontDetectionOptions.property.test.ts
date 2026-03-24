/**
 * Property-based tests for FontDetectionOptions configuration support
 * **Feature: font-loading-timing-fix, Property 5: Configuration support**
 */

import * as fc from 'fast-check';
import { FontManager, FontDetectionOptions } from '../../src/font/index';

// Mock DOM environment for testing
const mockDocument = {
  fonts: {
    ready: Promise.resolve(),
    check: jest.fn(() => true),
    forEach: jest.fn(),
    add: jest.fn(),
    delete: jest.fn()
  },
  createElement: jest.fn(() => ({
    style: {},
    offsetWidth: 100,
    textContent: ''
  })),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  }
};

const mockWindow = {
  location: {
    hostname: 'localhost',
    port: '3000',
    protocol: 'http:'
  }
};

// Setup DOM mocks
Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true
});

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

Object.defineProperty(global, 'FontFace', {
  value: class MockFontFace {
    family: string;
    source: string;
    
    constructor(family: string, source: string) {
      this.family = family;
      this.source = source;
    }
    
    load() {
      return Promise.resolve(this);
    }
  },
  writable: true
});

describe('FontDetectionOptions Property Tests', () => {
  let fontManager: FontManager;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (fontManager) {
      fontManager.destroy();
    }
  });

  /**
   * **Feature: font-loading-timing-fix, Property 5: Configuration support**
   * **Validates: Requirements 3.1, 3.2, 3.3**
   * 
   * For any font manager initialization or detection request, the system should accept 
   * and properly apply configuration options for timeout, retry attempts, and detection modes
   */
  test('Property 5: Configuration support - font manager should accept and apply all configuration options', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary configuration options
        fc.record({
          waitForLoad: fc.boolean(),
          timeout: fc.integer({ min: 100, max: 10000 }),
          retries: fc.integer({ min: 0, max: 10 }),
          immediate: fc.boolean(),
          strategy: fc.constantFrom('comprehensive', 'fast', 'system-only')
        }),
        fc.record({
          debug: fc.boolean(),
          cache: fc.boolean(),
          concurrency: fc.integer({ min: 1, max: 20 }),
          detectionThreshold: fc.float({ min: 0.1, max: 10 })
        }),
        (detectionOptions, baseOptions) => {
          // Create font manager with configuration
          const options = {
            ...baseOptions,
            detection: detectionOptions
          };
          
          fontManager = new FontManager(options);
          
          // Verify configuration is properly stored and accessible
          const retrievedOptions = fontManager.getDetectionOptions();
          
          expect(retrievedOptions.waitForLoad).toBe(detectionOptions.waitForLoad);
          expect(retrievedOptions.timeout).toBe(detectionOptions.timeout);
          expect(retrievedOptions.retries).toBe(detectionOptions.retries);
          expect(retrievedOptions.immediate).toBe(detectionOptions.immediate);
          expect(retrievedOptions.strategy).toBe(detectionOptions.strategy);
          
          // Verify base options are also applied
          expect(fontManager.options.debug).toBe(baseOptions.debug);
          expect(fontManager.options.cache).toBe(baseOptions.cache);
          expect(fontManager.options.concurrency).toBe(baseOptions.concurrency);
          expect(fontManager.options.detectionThreshold).toBe(baseOptions.detectionThreshold);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 5a: Configuration updates should be applied correctly', () => {
    fc.assert(
      fc.property(
        // Initial configuration
        fc.record({
          waitForLoad: fc.boolean(),
          timeout: fc.integer({ min: 100, max: 5000 }),
          retries: fc.integer({ min: 0, max: 5 }),
          immediate: fc.boolean(),
          strategy: fc.constantFrom('comprehensive', 'fast', 'system-only')
        }),
        // Updated configuration (partial)
        fc.record({
          waitForLoad: fc.option(fc.boolean()),
          timeout: fc.option(fc.integer({ min: 100, max: 5000 })),
          retries: fc.option(fc.integer({ min: 0, max: 5 })),
          immediate: fc.option(fc.boolean()),
          strategy: fc.option(fc.constantFrom('comprehensive', 'fast', 'system-only'))
        }),
        (initialOptions, updateOptions) => {
          // Create font manager with initial configuration
          fontManager = new FontManager({ detection: initialOptions });
          
          // Apply partial update
          const cleanUpdateOptions: Partial<FontDetectionOptions> = {};
          if (updateOptions.waitForLoad !== null) cleanUpdateOptions.waitForLoad = updateOptions.waitForLoad;
          if (updateOptions.timeout !== null) cleanUpdateOptions.timeout = updateOptions.timeout;
          if (updateOptions.retries !== null) cleanUpdateOptions.retries = updateOptions.retries;
          if (updateOptions.immediate !== null) cleanUpdateOptions.immediate = updateOptions.immediate;
          if (updateOptions.strategy !== null) cleanUpdateOptions.strategy = updateOptions.strategy;
          
          fontManager.updateDetectionOptions(cleanUpdateOptions);
          
          // Verify updated configuration
          const retrievedOptions = fontManager.getDetectionOptions();
          
          // Check that updated values are applied
          if (cleanUpdateOptions.waitForLoad !== undefined) {
            expect(retrievedOptions.waitForLoad).toBe(cleanUpdateOptions.waitForLoad);
          } else {
            expect(retrievedOptions.waitForLoad).toBe(initialOptions.waitForLoad);
          }
          
          if (cleanUpdateOptions.timeout !== undefined) {
            expect(retrievedOptions.timeout).toBe(cleanUpdateOptions.timeout);
          } else {
            expect(retrievedOptions.timeout).toBe(initialOptions.timeout);
          }
          
          if (cleanUpdateOptions.retries !== undefined) {
            expect(retrievedOptions.retries).toBe(cleanUpdateOptions.retries);
          } else {
            expect(retrievedOptions.retries).toBe(initialOptions.retries);
          }
          
          if (cleanUpdateOptions.immediate !== undefined) {
            expect(retrievedOptions.immediate).toBe(cleanUpdateOptions.immediate);
          } else {
            expect(retrievedOptions.immediate).toBe(initialOptions.immediate);
          }
          
          if (cleanUpdateOptions.strategy !== undefined) {
            expect(retrievedOptions.strategy).toBe(cleanUpdateOptions.strategy);
          } else {
            expect(retrievedOptions.strategy).toBe(initialOptions.strategy);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 5b: Default configuration should be applied when options are not provided', () => {
    fc.assert(
      fc.property(
        // Generate various combinations of missing options
        fc.record({
          includeWaitForLoad: fc.boolean(),
          includeTimeout: fc.boolean(),
          includeRetries: fc.boolean(),
          includeImmediate: fc.boolean(),
          includeStrategy: fc.boolean()
        }),
        (optionFlags) => {
          // Build partial options based on flags
          const partialOptions: Partial<FontDetectionOptions> = {};
          
          if (optionFlags.includeWaitForLoad) partialOptions.waitForLoad = true;
          if (optionFlags.includeTimeout) partialOptions.timeout = 2000;
          if (optionFlags.includeRetries) partialOptions.retries = 1;
          if (optionFlags.includeImmediate) partialOptions.immediate = true;
          if (optionFlags.includeStrategy) partialOptions.strategy = 'fast';
          
          fontManager = new FontManager({ detection: partialOptions });
          
          const retrievedOptions = fontManager.getDetectionOptions();
          
          // Verify that provided options are used
          if (optionFlags.includeWaitForLoad) {
            expect(retrievedOptions.waitForLoad).toBe(true);
          } else {
            // Should use default
            expect(retrievedOptions.waitForLoad).toBe(true); // Default is true
          }
          
          if (optionFlags.includeTimeout) {
            expect(retrievedOptions.timeout).toBe(2000);
          } else {
            // Should use default
            expect(retrievedOptions.timeout).toBe(3000); // Default timeout
          }
          
          if (optionFlags.includeRetries) {
            expect(retrievedOptions.retries).toBe(1);
          } else {
            // Should use default
            expect(retrievedOptions.retries).toBe(2); // Default retries
          }
          
          if (optionFlags.includeImmediate) {
            expect(retrievedOptions.immediate).toBe(true);
          } else {
            // Should use default
            expect(retrievedOptions.immediate).toBe(false); // Default is false
          }
          
          if (optionFlags.includeStrategy) {
            expect(retrievedOptions.strategy).toBe('fast');
          } else {
            // Should use default
            expect(retrievedOptions.strategy).toBe('comprehensive'); // Default strategy
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 5c: Configuration should be immutable when retrieved', () => {
    fc.assert(
      fc.property(
        fc.record({
          waitForLoad: fc.boolean(),
          timeout: fc.integer({ min: 100, max: 5000 }),
          retries: fc.integer({ min: 0, max: 5 }),
          immediate: fc.boolean(),
          strategy: fc.constantFrom('comprehensive', 'fast', 'system-only')
        }),
        (detectionOptions) => {
          fontManager = new FontManager({ detection: detectionOptions });
          
          // Get options and try to modify them
          const retrievedOptions = fontManager.getDetectionOptions();
          const originalTimeout = retrievedOptions.timeout;
          
          // Attempt to modify retrieved options
          retrievedOptions.timeout = 99999;
          retrievedOptions.waitForLoad = !retrievedOptions.waitForLoad;
          retrievedOptions.strategy = 'system-only';
          
          // Get options again and verify they weren't affected
          const retrievedOptionsAgain = fontManager.getDetectionOptions();
          
          expect(retrievedOptionsAgain.timeout).toBe(originalTimeout);
          expect(retrievedOptionsAgain.waitForLoad).toBe(detectionOptions.waitForLoad);
          expect(retrievedOptionsAgain.strategy).toBe(detectionOptions.strategy);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 5d: Configuration validation should handle edge cases', () => {
    fc.assert(
      fc.property(
        // Generate edge case values
        fc.record({
          timeout: fc.oneof(
            fc.integer({ min: 0, max: 50 }), // Very small timeouts
            fc.integer({ min: 50000, max: 100000 }) // Very large timeouts
          ),
          retries: fc.oneof(
            fc.integer({ min: 0, max: 0 }), // No retries
            fc.integer({ min: 20, max: 50 }) // Many retries
          )
        }),
        (edgeOptions) => {
          // Should not throw when creating with edge case values
          expect(() => {
            fontManager = new FontManager({ 
              detection: {
                timeout: edgeOptions.timeout,
                retries: edgeOptions.retries
              }
            });
          }).not.toThrow();
          
          const retrievedOptions = fontManager.getDetectionOptions();
          
          // Values should be stored as provided (no automatic clamping in this test)
          expect(retrievedOptions.timeout).toBe(edgeOptions.timeout);
          expect(retrievedOptions.retries).toBe(edgeOptions.retries);
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});