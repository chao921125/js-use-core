import {
  createFont,
  checkFont,
  checkFonts,
  addFont,
  addFontFace,
  deleteFont,
  clearFonts,
  isFontLoaded,
  waitForFonts
} from '../../src/font/utils';

// Mock document.fonts
const mockFonts = {
  add: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  check: jest.fn(),
  load: jest.fn(),
  ready: Promise.resolve(),
  forEach: jest.fn()
};

// Mock FontFace
(global as any).FontFace = jest.fn().mockImplementation((family, source, descriptors) => ({
  family,
  source,
  descriptors,
  load: jest.fn().mockResolvedValue({ family, status: 'loaded' })
}));

describe('fontUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock document.fonts
    Object.defineProperty(document, 'fonts', {
      value: mockFonts,
      writable: true
    });

    // Mock document.body for font detection tests
    if (!document.body) {
      document.body = document.createElement('body');
    }

    // Mock canvas for font detection
    const mockCanvas = {
      getContext: jest.fn().mockReturnValue({
        font: '',
        measureText: jest.fn().mockReturnValue({ width: 100 })
      })
    };
    
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'canvas') {
        return mockCanvas as any;
      }
      if (tagName === 'div') {
        return {
          style: {},
          textContent: '',
          offsetWidth: 100,
          appendChild: jest.fn(),
          removeChild: jest.fn()
        } as any;
      }
      return document.createElement(tagName);
    });

    // Mock appendChild and removeChild
    jest.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    jest.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

    // 重置 mock 返回值
    mockFonts.add.mockReturnValue(undefined);
    mockFonts.delete.mockReturnValue(true);
    mockFonts.clear.mockReturnValue(undefined);
    mockFonts.check.mockReturnValue(true);
  });

  describe('createFont', () => {
    it('应该创建一个新的FontManager实例', async () => {
      const manager = await createFont();
      expect(manager).toBeDefined();
      expect(typeof manager.check).toBe('function');
      expect(typeof manager.initialize).toBe('function');
      expect(typeof manager.destroy).toBe('function');
    });

    it('应该使用提供的选项创建实例', async () => {
      const options = { timeout: 5000 };
      const manager = await createFont(options);
      expect(manager).toBeDefined();
    });

    it('应该为不同选项创建新实例', async () => {
      const manager1 = await createFont();
      const manager2 = await createFont({ timeout: 5000 });
      expect(manager1).not.toBe(manager2);
    });
  });

  describe('checkFont', () => {
    it('应该检查单个字体', async () => {
      const result = await checkFont('Arial');
      expect(result).toBeDefined();
      expect(result.name).toBe('Arial');
      expect(typeof result.loaded).toBe('boolean');
      expect(typeof result.status).toBe('string');
    });

    it('应该处理字体检查失败的情况', async () => {
      mockFonts.check.mockReturnValue(false);
      
      const result = await checkFont('NonExistentFont');
      expect(result.loaded).toBe(false);
    });
  });

  describe('checkFonts', () => {
    it('应该检查多个字体', async () => {
      const result = await checkFonts(['Arial', 'Helvetica']);
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(Array.isArray(result.allFonts)).toBe(true);
      expect(result.allFonts.length).toBe(2);
      expect(result.allFonts.every(font => typeof font.loaded === 'boolean')).toBe(true);
    });

    it('应该处理部分字体失败的情况', async () => {
      mockFonts.check.mockImplementation((fontString) => {
        return !fontString.includes('NonExistentFont');
      });
      
      const result = await checkFonts(['Arial', 'NonExistentFont']);
      expect(result).toBeDefined();
      expect(result.allFonts).toBeDefined();
      expect(result.allFonts.length).toBe(2);
      expect(result.allFonts.find(f => f.name === 'NonExistentFont')?.loaded).toBe(false);
    });
  });

  describe('addFont', () => {
    it('应该添加字体', async () => {
      const result = await addFont('TestFont', '/test.woff2');
      expect(result).toBe(true);
      expect(mockFonts.add).toHaveBeenCalled();
    });

    it('应该处理添加字体失败的情况', async () => {
      mockFonts.add.mockImplementation(() => {
        throw new Error('Add font failed');
      });
      const result = await addFont('TestFont', '/test.woff2');
      expect(result).toBe(false);
    });
  });

  describe('addFontFace', () => {
    it('应该添加FontFace对象', async () => {
      const fontFace = new (global as any).FontFace('TestFont', 'url(/test.woff2)');
      const result = await addFontFace(fontFace);
      expect(result).toBe(true);
      expect(mockFonts.add).toHaveBeenCalledWith(fontFace);
    });

    it('应该处理添加FontFace失败的情况', async () => {
      mockFonts.add.mockImplementation(() => {
        throw new Error('Add font failed');
      });
      const fontFace = new (global as any).FontFace('TestFont', 'url(/test.woff2)');
      const result = await addFontFace(fontFace);
      expect(result).toBe(false);
    });
  });

  describe('deleteFont', () => {
    it('应该删除字体（使用FontFace对象）', async () => {
      const fontFace = new (global as any).FontFace('TestFont', 'url(/test.woff2)');
      const result = await deleteFont(fontFace);
      expect(result).toBe(true);
      expect(mockFonts.delete).toHaveBeenCalledWith(fontFace);
    });

    it('应该删除字体（使用字体名称）', async () => {
      const fontFace = new (global as any).FontFace('TestFont', 'url(/test.woff2)');
      const manager = await createFont();
      manager.addFontFace(fontFace);
      
      const result = await deleteFont('TestFont');
      expect(result).toBe(true);
      expect(mockFonts.delete).toHaveBeenCalled();
    });

    it('应该处理删除字体失败的情况', async () => {
      mockFonts.delete.mockImplementation(() => {
        throw new Error('Delete font failed');
      });
      const fontFace = new (global as any).FontFace('TestFont', 'url(/test.woff2)');
      const result = await deleteFont(fontFace);
      expect(result).toBe(false);
    });
  });

  describe('clearFonts', () => {
    it('应该清除所有字体', async () => {
      mockFonts.delete.mockReturnValue(true);
      
      // Add fonts first
      await addFont('Font1', '/1.woff2');
      await addFont('Font2', '/2.woff2');
      
      const result = await clearFonts();
      expect(result).toBe(true);
      // The delete should be called for each font added
      expect(mockFonts.delete).toHaveBeenCalled();
    });

    it('应该处理清除字体失败的情况', async () => {
      mockFonts.delete.mockImplementation(() => {
        throw new Error('Delete font failed');
      });
      
      // Add a font first
      await addFont('Font1', '/1.woff2');
      
      const result = await clearFonts();
      expect(result).toBe(false);
    });
  });

  describe('isFontLoaded', () => {
    it('应该同步检查字体是否已加载', () => {
      const result = isFontLoaded('Arial');
      expect(result).toBe(true);
      expect(mockFonts.check).toHaveBeenCalledWith("12px 'Arial'");
    });

    it('应该处理document.fonts不存在的情况', () => {
      const originalFonts = document.fonts;
      Object.defineProperty(document, 'fonts', {
        value: undefined,
        writable: true
      });
      
      const result = isFontLoaded('Arial');
      expect(result).toBe(false);
      
      // 恢复原始值
      Object.defineProperty(document, 'fonts', {
        value: originalFonts,
        writable: true
      });
    });
  });

  describe('waitForFonts', () => {
    it('应该等待字体加载完成', async () => {
      const result = await waitForFonts(['Arial', 'Helvetica']);
      expect(result).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(Array.isArray(result.allFonts)).toBe(true);
    });

    it('应该使用提供的超时时间', async () => {
      const timeout = 5000;
      await waitForFonts(['Arial'], timeout);
      // 这里可以验证超时设置是否正确应用
    });
  });

  describe('batch operations', () => {
    it('应该支持批量添加字体', async () => {
      const { addFonts } = await import('../../src/font/utils');
      
      const fonts = [
        { name: 'Font1', url: '/font1.woff2' },
        { name: 'Font2', url: '/font2.woff2' }
      ];
      
      const results = await addFonts(fonts);
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(2);
      expect(results.every(r => typeof r.success === 'boolean')).toBe(true);
    });

    it('应该支持字体预加载', async () => {
      const { preloadFonts } = await import('../../src/font/utils');
      
      const result = await preloadFonts(['Arial', 'Helvetica', 'NonExistentFont']);
      expect(result).toBeDefined();
      expect(Array.isArray(result.available)).toBe(true);
      expect(Array.isArray(result.unavailable)).toBe(true);
      expect(Array.isArray(result.cached)).toBe(true);
    });

    it('应该提供性能统计信息', async () => {
      const { getFontPerformanceStats } = await import('../../src/font/utils');
      
      const stats = await getFontPerformanceStats();
      expect(stats).toBeDefined();
      expect(typeof stats.totalFontsChecked).toBe('number');
      expect(typeof stats.cacheHitRate).toBe('number');
      expect(typeof stats.averageCheckTime).toBe('number');
      expect(typeof stats.loadingFonts).toBe('number');
      expect(typeof stats.loadedFonts).toBe('number');
      expect(typeof stats.failedFonts).toBe('number');
    });

    it('应该支持清理功能', async () => {
      const { cleanupFontManager } = await import('../../src/font/utils');
      
      // 应该不抛出错误
      await expect(cleanupFontManager()).resolves.toBeUndefined();
    });
  });
}); 