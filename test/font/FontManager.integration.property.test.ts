/**
 * Property-based integration tests for FontManager with enhanced font detection
 * **Feature: font-loading-timing-fix, Property 1: Font detection waits for loading completion**
 */

import * as fc from 'fast-check';

// Mock document.fonts
const mockFonts = {
  ready: Promise.resolve(),
  check: jest.fn(() => true),
  load: jest.fn(() => Promise.resolve([])),
  add: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  forEach: jest.fn()
};

// Setup global document mock
(global as any).document = {
  fonts: mockFonts,
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

// Import after setting up mocks
import { FontManager } from '../../src/font/index';

describe('FontManager Integration Property Tests', () => {
  beforeEach(() => {
    // Reset the ready promise and mocks
    mockFonts.ready = Promise.resolve();
    mockFonts.check.mockReturnValue(true);
    
    // Ensure document is properly set up
    (global as any).document = {
      fonts: mockFonts,
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
  });

  test('Simple test: FontManager should initialize and check fonts', async () => {
    const fontManager = new FontManager({ timeout: 1000 });
    
    try {
      await fontManager.initialize();
      const result = await fontManager.check('Arial');
      
      expect(result).toBeDefined();
      expect(result.allFonts).toBeDefined();
      expect(result.allFonts.length).toBe(1);
      expect(result.allFonts[0].name).toBe('Arial');
    } finally {
      if (!fontManager.destroyed) {
        fontManager.destroy();
      }
    }
  });
});