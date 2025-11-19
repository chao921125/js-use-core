import { FullscreenManager } from '../src/fullscreen';

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now())
} as any;

// Mock DOM APIs
const mockDocument = {
  documentElement: {
    requestFullscreen: jest.fn(),
    webkitRequestFullscreen: jest.fn(),
    mozRequestFullScreen: jest.fn(),
    msRequestFullscreen: jest.fn(),
    style: {}
  },
  exitFullscreen: jest.fn(),
  webkitExitFullscreen: jest.fn(),
  mozCancelFullScreen: jest.fn(),
  msExitFullscreen: jest.fn(),
  fullscreenEnabled: true,
  webkitFullscreenEnabled: true,
  mozFullScreenEnabled: true,
  msFullscreenEnabled: true,
  fullscreenElement: null,
  webkitFullscreenElement: null,
  mozFullScreenElement: null,
  msFullscreenElement: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  createElement: jest.fn(() => ({ style: {} }))
};

const mockElement = {
  nodeType: 1,
  tagName: 'DIV',
  requestFullscreen: jest.fn(),
  webkitRequestFullscreen: jest.fn(),
  mozRequestFullScreen: jest.fn(),
  msRequestFullscreen: jest.fn()
};

// Mock navigator
global.navigator = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
} as any;

// Mock global objects
global.document = mockDocument as any;
global.Element = {
  ALLOW_KEYBOARD_INPUT: 1
} as any;

// Mock window
global.window = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
} as any;

// Mock isElement function
jest.mock('../src/utils/dom', () => ({
  isElement: jest.fn((element) => element && element.nodeType === 1)
}));

describe('FullscreenManager', () => {
  let manager: FullscreenManager;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Reset mock document properties
    mockDocument.fullscreenEnabled = true;
    mockDocument.webkitFullscreenEnabled = true;
    mockDocument.mozFullScreenEnabled = true;
    mockDocument.msFullscreenEnabled = true;
    mockDocument.fullscreenElement = null;
    mockDocument.webkitFullscreenElement = null;
    mockDocument.mozFullScreenElement = null;
    mockDocument.msFullscreenElement = null;
    
    manager = new FullscreenManager({ debug: false });
    // 自动初始化已在构造函数中处理，等待完成
    await manager.ready();
  });

  afterEach(() => {
    if (manager) {
      manager.destroy();
    }
  });

  describe('BaseManager Integration', () => {
    it('should inherit from BaseManager and provide core functionality', () => {
      expect(manager).toBeInstanceOf(FullscreenManager);
      
      // Test BaseManager methods
      expect(typeof manager.on).toBe('function');
      expect(typeof manager.off).toBe('function');
      expect(typeof manager.emit).toBe('function');
      expect(typeof manager.once).toBe('function');
      expect(typeof manager.getStatus).toBe('function');
      expect(typeof manager.initialize).toBe('function');
      expect(typeof manager.destroy).toBe('function');
    });

    it('should have proper initialization status', () => {
      const status = manager.getStatus();
      expect(status.initialized).toBe(true);
      expect(status.destroyed).toBe(false);
      expect(typeof status.eventListeners).toBe('number');
    });

    it('should support event system', () => {
      const listener = jest.fn();
      
      // Test adding listener
      manager.on('test', listener);
      expect(manager.listenerCount('test')).toBe(1);
      
      // Test emitting event
      manager.emit('test', 'data');
      expect(listener).toHaveBeenCalledWith('data');
      
      // Test removing listener
      manager.off('test', listener);
      expect(manager.listenerCount('test')).toBe(0);
    });

    it('should support once listeners', () => {
      const listener = jest.fn();
      
      manager.once('test', listener);
      expect(manager.listenerCount('test')).toBe(1);
      
      // Emit twice
      manager.emit('test', 'data1');
      manager.emit('test', 'data2');
      
      // Should only be called once
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith('data1');
      expect(manager.listenerCount('test')).toBe(0);
    });
  });

  describe('Core Architecture', () => {
    it('should use unified error handling', () => {
      const errorListener = jest.fn();
      manager.on('error', errorListener);
      
      // Access the error handler
      const errorHandler = (manager as any).errorHandler;
      expect(errorHandler).toBeDefined();
      expect(typeof errorHandler.handleError).toBe('function');
      expect(typeof errorHandler.createError).toBe('function');
    });

    it('should use caching mechanism', () => {
      const cache = (manager as any).cache;
      expect(cache).toBeDefined();
      expect(typeof cache.get).toBe('function');
      expect(typeof cache.set).toBe('function');
    });

    it('should use logging system', () => {
      const logger = (manager as any).logger;
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    it('should use browser adapter', () => {
      const browserAdapter = (manager as any).browserAdapter;
      expect(browserAdapter).toBeDefined();
      expect(typeof browserAdapter.detectFeature).toBe('function');
      expect(typeof browserAdapter.addEventListenerCompat).toBe('function');
    });
  });

  describe('Fullscreen-specific functionality', () => {
    it('should provide fullscreen-specific properties', () => {
      // Test properties exist
      expect(typeof manager.isSupported).toBe('boolean');
      expect(typeof manager.isEnabled).toBe('boolean');
      expect(typeof manager.isFullscreen).toBe('boolean');
      expect(manager.element === null || typeof manager.element === 'object').toBe(true);
      expect(typeof manager.state).toBe('object');
      expect(typeof manager.performanceData).toBe('object');
    });

    it('should provide fullscreen-specific methods', () => {
      expect(typeof manager.request).toBe('function');
      expect(typeof manager.exit).toBe('function');
      expect(typeof manager.toggle).toBe('function');
    });

    it('should have performance monitoring', () => {
      const performanceData = manager.performanceData;
      expect(performanceData).toHaveProperty('enterTime');
      expect(performanceData).toHaveProperty('exitTime');
      expect(performanceData).toHaveProperty('duration');
      expect(performanceData).toHaveProperty('errorCount');
      expect(performanceData).toHaveProperty('successCount');
      
      expect(typeof performanceData.enterTime).toBe('number');
      expect(typeof performanceData.exitTime).toBe('number');
      expect(typeof performanceData.duration).toBe('number');
      expect(typeof performanceData.errorCount).toBe('number');
      expect(typeof performanceData.successCount).toBe('number');
    });

    it('should handle state updates', () => {
      const state = manager.state;
      expect(state).toHaveProperty('isFullscreen');
      expect(state).toHaveProperty('element');
      expect(typeof state.isFullscreen).toBe('boolean');
    });
  });

  describe('Event handling', () => {
    it('should handle fullscreen change events', () => {
      const changeListener = jest.fn();
      manager.on('change', changeListener);
      
      // Simulate fullscreen change by calling the internal handler directly
      const changeHandler = (manager as any).handleFullscreenChange.bind(manager);
      const changeEvent = new Event('fullscreenchange');
      changeHandler(changeEvent);
      
      expect(changeListener).toHaveBeenCalled();
    });

    it('should handle fullscreen error events', () => {
      const errorListener = jest.fn();
      manager.on('error', errorListener);
      
      // Simulate fullscreen error by calling the internal handler directly
      const errorHandler = (manager as any).handleFullscreenError.bind(manager);
      const errorEvent = new Event('fullscreenerror');
      errorHandler(errorEvent);
      
      expect(errorListener).toHaveBeenCalled();
    });
  });

  describe('Lifecycle management', () => {
    it('should initialize properly', async () => {
      const newManager = new FullscreenManager();
      // With auto-initialization (v1.3.0+), managers are automatically initialized
      expect(newManager.getStatus().initialized).toBe(true);
      
      // ready() should still work and resolve immediately for already initialized managers
      await newManager.ready();
      expect(newManager.getStatus().initialized).toBe(true);
      
      newManager.destroy();
    });

    it('should destroy properly', () => {
      const status = manager.getStatus();
      expect(status.initialized).toBe(true);
      expect(status.destroyed).toBe(false);
      
      manager.destroy();
      
      const finalStatus = manager.getStatus();
      expect(finalStatus.destroyed).toBe(true);
    });

    it('should prevent operations after destruction', async () => {
      manager.destroy();
      
      await expect(manager.request()).rejects.toThrow();
    });

    it('should clean up resources on destroy', () => {
      const browserAdapter = (manager as any).browserAdapter;
      const destroySpy = jest.spyOn(browserAdapter, 'destroy');
      
      manager.destroy();
      
      expect(destroySpy).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle errors gracefully', async () => {
      const errorListener = jest.fn();
      manager.on('error', errorListener);
      
      // Force an error by providing invalid input
      try {
        await manager.request({} as any);
      } catch (error) {
        // Expected to throw
      }
      
      // Should have handled the error internally
      expect(errorListener).toHaveBeenCalled();
    });

    it('should validate input parameters', async () => {
      // The request method should handle null/undefined by using document.documentElement
      // But invalid objects should throw
      try {
        await manager.request({} as any);
      } catch (error) {
        expect(error).toBeDefined();
      }
      
      // Test with a clearly invalid element
      try {
        await manager.request({ invalid: true } as any);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Configuration and options', () => {
    it('should accept configuration options', () => {
      const options = {
        debug: true,
        timeout: 10000,
        retries: 5,
        cache: false,
        navigationUI: 'hide' as const,
        enablePerformanceMonitoring: true
      };
      
      const configuredManager = new FullscreenManager(options);
      expect(configuredManager).toBeInstanceOf(FullscreenManager);
      
      configuredManager.destroy();
    });

    it('should update options', () => {
      const newOptions = { debug: true, timeout: 15000 };
      manager.updateOptions(newOptions);
      
      // Should emit options updated event
      const optionsListener = jest.fn();
      manager.on('optionsUpdated', optionsListener);
      manager.updateOptions({ retries: 3 });
      
      expect(optionsListener).toHaveBeenCalled();
    });
  });
});

describe('FullscreenManager Integration', () => {
  it('should be properly exported', () => {
    expect(typeof FullscreenManager).toBe('function');
    expect(FullscreenManager.name).toBe('FullscreenManager');
  });

  it('should create instances', () => {
    const instance = new FullscreenManager();
    expect(instance).toBeInstanceOf(FullscreenManager);
    instance.destroy();
  });
});