import clipboard, { ClipboardManager } from '../src/clipboard';

// Mock navigator.clipboard
const mockClipboard = {
  writeText: jest.fn(),
  readText: jest.fn(),
  write: jest.fn(),
  read: jest.fn()
};

// Mock document
const mockDocument = {
  createElement: jest.fn(),
  execCommand: jest.fn(),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  },
  createRange: jest.fn(),
  getSelection: jest.fn()
};

// Mock window
const mockWindow = {
  getSelection: jest.fn()
};

// Mock global objects
Object.defineProperty(global, 'navigator', {
  value: { clipboard: mockClipboard },
  writable: true
});

Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true
});

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

describe('ClipboardManager', () => {
  let manager: ClipboardManager;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new ClipboardManager();
  });

  describe('isSupported', () => {
    it('should return true when clipboard API is supported', () => {
      expect(manager.isSupported).toBe(true);
    });

    it('should return false when clipboard API is not supported', () => {
      delete (global as any).navigator.clipboard;
      expect(manager.isSupported).toBe(false);
    });
  });

  describe('canRead', () => {
    it('should return true when clipboard reading is supported', () => {
      expect(manager.canRead).toBe(true);
    });

    it('should return false when clipboard reading is not supported', () => {
      delete (global as any).navigator.clipboard.readText;
      expect(manager.canRead).toBe(false);
    });
  });

  describe('copyText', () => {
    it('should copy text using modern API', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);
      
      const result = await manager.copyText('test text');
      
      expect(result).toBe(true);
      expect(mockClipboard.writeText).toHaveBeenCalledWith('test text');
    });

    it('should fallback to execCommand when modern API fails', async () => {
      mockClipboard.writeText.mockRejectedValue(new Error('Permission denied'));
      mockDocument.execCommand.mockReturnValue(true);
      
      const mockTextArea = {
        value: '',
        style: {},
        focus: jest.fn(),
        select: jest.fn()
      };
      mockDocument.createElement.mockReturnValue(mockTextArea);
      
      const result = await manager.copyText('test text');
      
      expect(result).toBe(true);
      expect(mockDocument.execCommand).toHaveBeenCalledWith('copy');
    });
  });

  describe('copyHTML', () => {
    it('should copy HTML using modern API', async () => {
      mockClipboard.write.mockResolvedValue(undefined);
      
      const result = await manager.copyHTML('<p>test</p>');
      
      expect(result).toBe(true);
      expect(mockClipboard.write).toHaveBeenCalled();
    });

    it('should fallback to execCommand when modern API fails', async () => {
      mockClipboard.write.mockRejectedValue(new Error('Permission denied'));
      mockDocument.execCommand.mockReturnValue(true);
      
      const mockTextArea = {
        innerHTML: '',
        style: {},
        focus: jest.fn(),
        select: jest.fn()
      };
      mockDocument.createElement.mockReturnValue(mockTextArea);
      
      const result = await manager.copyHTML('<p>test</p>');
      
      expect(result).toBe(true);
      expect(mockDocument.execCommand).toHaveBeenCalledWith('copy');
    });
  });

  describe('copyElement', () => {
    it('should copy element text content', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);
      
      const mockElement = {
        textContent: 'element text',
        innerHTML: '<span>element text</span>'
      };
      
      const result = await manager.copyElement(mockElement as any);
      
      expect(result).toBe(true);
      expect(mockClipboard.writeText).toHaveBeenCalledWith('element text');
    });

    it('should copy element HTML content', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);
      
      const mockElement = {
        textContent: 'element text',
        innerHTML: '<span>element text</span>'
      };
      
      const result = await manager.copyElement(mockElement as any, { format: 'html' });
      
      expect(result).toBe(true);
      expect(mockClipboard.writeText).toHaveBeenCalledWith('<span>element text</span>');
    });

    it('should throw error for invalid element', async () => {
      await expect(manager.copyElement(null as any)).rejects.toThrow('Invalid element provided');
    });
  });

  describe('readText', () => {
    it('should read text from clipboard', async () => {
      mockClipboard.readText.mockResolvedValue('clipboard text');
      
      const result = await manager.readText();
      
      expect(result).toBe('clipboard text');
      expect(mockClipboard.readText).toHaveBeenCalled();
    });

    it('should throw error when reading is not supported', async () => {
      delete (global as any).navigator.clipboard.readText;
      
      await expect(manager.readText()).rejects.toThrow('Clipboard reading not supported');
    });
  });

  describe('readHTML', () => {
    it('should read HTML from clipboard', async () => {
      const mockBlob = {
        text: jest.fn().mockResolvedValue('<p>clipboard html</p>')
      };
      const mockItem = {
        types: ['text/html'],
        getType: jest.fn().mockResolvedValue(mockBlob)
      };
      mockClipboard.read.mockResolvedValue([mockItem]);
      
      const result = await manager.readHTML();
      
      expect(result).toBe('<p>clipboard html</p>');
      expect(mockClipboard.read).toHaveBeenCalled();
    });

    it('should throw error when no HTML content', async () => {
      const mockItem = {
        types: ['text/plain']
      };
      mockClipboard.read.mockResolvedValue([mockItem]);
      
      await expect(manager.readHTML()).rejects.toThrow('No HTML content in clipboard');
    });
  });

  describe('read', () => {
    it('should read text by default', async () => {
      mockClipboard.readText.mockResolvedValue('clipboard text');
      
      const result = await manager.read();
      
      expect(result).toEqual({ type: 'text', data: 'clipboard text' });
    });

    it('should read HTML when format specified', async () => {
      const mockBlob = {
        text: jest.fn().mockResolvedValue('<p>clipboard html</p>')
      };
      const mockItem = {
        types: ['text/html'],
        getType: jest.fn().mockResolvedValue(mockBlob)
      };
      mockClipboard.read.mockResolvedValue([mockItem]);
      
      const result = await manager.read({ format: 'html' });
      
      expect(result).toEqual({ type: 'html', data: '<p>clipboard html</p>' });
    });
  });

  describe('event listeners', () => {
    it('should add copy event listener', () => {
      const callback = jest.fn();
      manager.onCopy(callback);
      
      // Simulate copy event
      const copyEvent = new Event('copy');
      document.dispatchEvent(copyEvent);
      
      expect(callback).toHaveBeenCalled();
    });

    it('should add paste event listener', () => {
      const callback = jest.fn();
      manager.onPaste(callback);
      
      // Simulate paste event
      const pasteEvent = new Event('paste');
      (pasteEvent as any).clipboardData = {
        types: ['text/plain'],
        getData: jest.fn().mockReturnValue('pasted text')
      };
      document.dispatchEvent(pasteEvent);
      
      expect(callback).toHaveBeenCalled();
    });
  });
});

describe('clipboard singleton', () => {
  it('should be an instance of ClipboardManager', () => {
    expect(clipboard).toBeInstanceOf(ClipboardManager);
  });
}); 