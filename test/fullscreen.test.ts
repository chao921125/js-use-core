import fullscreen, { FullscreenManager } from '../src/fullscreen';

// Mock DOM APIs
const mockDocument = {
  documentElement: {
    requestFullscreen: jest.fn(),
    webkitRequestFullscreen: jest.fn(),
    mozRequestFullScreen: jest.fn(),
    msRequestFullscreen: jest.fn()
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
  removeEventListener: jest.fn()
};

const mockElement = {
  nodeType: 1,
  requestFullscreen: jest.fn(),
  webkitRequestFullscreen: jest.fn(),
  mozRequestFullScreen: jest.fn(),
  msRequestFullscreen: jest.fn()
};

// Mock global objects
global.document = mockDocument as any;
global.Element = {
  ALLOW_KEYBOARD_INPUT: 1
} as any;

describe('FullscreenManager', () => {
  let manager: FullscreenManager;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new FullscreenManager();
  });

  afterEach(() => {
    manager.destroy();
  });

  describe('isEnabled', () => {
    it('should return true when fullscreen is enabled', () => {
      expect(manager.isEnabled).toBe(true);
    });

    it('should return false when fullscreen is disabled', () => {
      mockDocument.fullscreenEnabled = false;
      mockDocument.webkitFullscreenEnabled = false;
      mockDocument.mozFullScreenEnabled = false;
      mockDocument.msFullscreenEnabled = false;
      
      expect(manager.isEnabled).toBe(false);
    });
  });

  describe('isFullscreen', () => {
    it('should return false when not in fullscreen', () => {
      expect(manager.isFullscreen).toBe(false);
    });

    it('should return true when in fullscreen', () => {
      mockDocument.fullscreenElement = mockElement;
      expect(manager.isFullscreen).toBe(true);
    });
  });

  describe('element', () => {
    it('should return undefined when not in fullscreen', () => {
      expect(manager.element).toBeUndefined();
    });

    it('should return the fullscreen element', () => {
      mockDocument.fullscreenElement = mockElement;
      expect(manager.element).toBe(mockElement);
    });
  });

  describe('request', () => {
    it('should request fullscreen for document element when no element provided', async () => {
      mockDocument.documentElement.requestFullscreen.mockResolvedValue(undefined);
      
      await manager.request();
      
      expect(mockDocument.documentElement.requestFullscreen).toHaveBeenCalled();
    });

    it('should request fullscreen for provided element', async () => {
      mockElement.requestFullscreen.mockResolvedValue(undefined);
      
      await manager.request(mockElement as any);
      
      expect(mockElement.requestFullscreen).toHaveBeenCalled();
    });

    it('should throw error when fullscreen is not enabled', async () => {
      mockDocument.fullscreenEnabled = false;
      
      await expect(manager.request()).rejects.toThrow('Fullscreen is not supported or not enabled');
    });

    it('should throw error when invalid element provided', async () => {
      await expect(manager.request(null as any)).rejects.toThrow('Invalid element provided');
    });
  });

  describe('exit', () => {
    it('should exit fullscreen', async () => {
      mockDocument.exitFullscreen.mockResolvedValue(undefined);
      
      await manager.exit();
      
      expect(mockDocument.exitFullscreen).toHaveBeenCalled();
    });

    it('should not exit if not in fullscreen', async () => {
      await manager.exit();
      
      expect(mockDocument.exitFullscreen).not.toHaveBeenCalled();
    });
  });

  describe('toggle', () => {
    it('should request fullscreen when not in fullscreen', async () => {
      mockDocument.documentElement.requestFullscreen.mockResolvedValue(undefined);
      
      await manager.toggle();
      
      expect(mockDocument.documentElement.requestFullscreen).toHaveBeenCalled();
    });

    it('should exit fullscreen when in fullscreen', async () => {
      mockDocument.fullscreenElement = mockElement;
      mockDocument.exitFullscreen.mockResolvedValue(undefined);
      
      await manager.toggle();
      
      expect(mockDocument.exitFullscreen).toHaveBeenCalled();
    });
  });

  describe('event listeners', () => {
    it('should add change event listener', () => {
      const listener = jest.fn();
      manager.on('change', listener);
      
      // Simulate fullscreen change event
      const changeEvent = new Event('fullscreenchange');
      document.dispatchEvent(changeEvent);
      
      expect(listener).toHaveBeenCalledWith(changeEvent);
    });

    it('should add error event listener', () => {
      const listener = jest.fn();
      manager.on('error', listener);
      
      // Simulate fullscreen error event
      const errorEvent = new Event('fullscreenerror');
      document.dispatchEvent(errorEvent);
      
      expect(listener).toHaveBeenCalledWith(errorEvent);
    });

    it('should remove event listener', () => {
      const listener = jest.fn();
      manager.on('change', listener);
      manager.off('change', listener);
      
      // Simulate fullscreen change event
      const changeEvent = new Event('fullscreenchange');
      document.dispatchEvent(changeEvent);
      
      expect(listener).not.toHaveBeenCalled();
    });
  });
});

describe('fullscreen singleton', () => {
  it('should be an instance of FullscreenManager', () => {
    expect(fullscreen).toBeInstanceOf(FullscreenManager);
  });
}); 