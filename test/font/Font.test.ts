import Font from '../../src/font';

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

describe('Font', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock document.fonts
    Object.defineProperty(document, 'fonts', {
      value: mockFonts,
      writable: true
    });

    // 重置 mock 返回值
    mockFonts.add.mockReturnValue(undefined);
    mockFonts.delete.mockReturnValue(true);
    mockFonts.clear.mockReturnValue(undefined);
    mockFonts.check.mockReturnValue(true);
  });

  describe('constructor', () => {
    it('应该使用默认选项创建实例', () => {
      const font = new Font();
      expect(font).toBeInstanceOf(Font);
    });

    it('应该使用自定义选项创建实例', () => {
      const font = new Font({ timeout: 5000 });
      expect(font).toBeInstanceOf(Font);
    });
  });

  describe('addFont', () => {
    it('应该添加字体', () => {
      const font = new Font();
      const result = font.addFont('TestFont', '/test.woff2');
      expect(result).toBe(true);
      expect(mockFonts.add).toHaveBeenCalled();
    });

    it('应该处理添加字体失败的情况', () => {
      mockFonts.add.mockImplementation(() => {
        throw new Error('Add font failed');
      });
      const font = new Font();
      const result = font.addFont('TestFont', '/test.woff2');
      expect(result).toBe(false);
    });
  });

  describe('addFontFace', () => {
    it('应该添加FontFace对象', () => {
      const font = new Font();
      const fontFace = new (global as any).FontFace('TestFont', 'url(/test.woff2)');
      const result = font.addFontFace(fontFace);
      expect(result).toBe(true);
      expect(mockFonts.add).toHaveBeenCalledWith(fontFace);
    });

    it('应该处理添加FontFace失败的情况', () => {
      mockFonts.add.mockImplementation(() => {
        throw new Error('Add font failed');
      });
      const font = new Font();
      const fontFace = new (global as any).FontFace('TestFont', 'url(/test.woff2)');
      const result = font.addFontFace(fontFace);
      expect(result).toBe(false);
    });
  });

  describe('deleteFont', () => {
    it('应该删除字体（使用FontFace对象）', () => {
      const font = new Font();
      const fontFace = new (global as any).FontFace('TestFont', 'url(/test.woff2)');
      const result = font.deleteFont(fontFace);
      expect(result).toBe(true);
      expect(mockFonts.delete).toHaveBeenCalledWith(fontFace);
    });

    it('应该删除字体（使用字体名称）', () => {
      const font = new Font();
      const fontFace = new (global as any).FontFace('TestFont', 'url(/test.woff2)');
      // 模拟字体已被添加
      (font as any).addedFonts.add(fontFace);
      
      const result = font.deleteFont('TestFont');
      expect(result).toBe(true);
      expect(mockFonts.delete).toHaveBeenCalled();
    });

    it('应该处理删除字体失败的情况', () => {
      mockFonts.delete.mockImplementation(() => {
        throw new Error('Delete font failed');
      });
      const font = new Font();
      const fontFace = new (global as any).FontFace('TestFont', 'url(/test.woff2)');
      const result = font.deleteFont(fontFace);
      expect(result).toBe(false);
    });
  });

  describe('clearFonts', () => {
    it('应该清除所有字体', () => {
      const font = new Font();
      const font1 = new (global as any).FontFace('Font1', 'url(/1.woff2)');
      const font2 = new (global as any).FontFace('Font2', 'url(/2.woff2)');
      // 模拟字体已被添加
      (font as any).addedFonts.add(font1);
      (font as any).addedFonts.add(font2);
      
      const result = font.clearFonts();
      expect(result).toBe(true);
      expect(mockFonts.delete).toHaveBeenCalledTimes(2);
    });

    it('应该处理清除字体失败的情况', () => {
      mockFonts.delete.mockImplementation(() => {
        throw new Error('Delete font failed');
      });
      const font = new Font();
      const font1 = new (global as any).FontFace('Font1', 'url(/1.woff2)');
      // 模拟字体已被添加
      (font as any).addedFonts.add(font1);
      
      const result = font.clearFonts();
      expect(result).toBe(false);
    });
  });

  describe('check', () => {
    it('应该检查单个字体', async () => {
      const font = new Font();
      const result = await font.check('Arial');
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.allFonts).toHaveLength(1);
    });

    it('应该检查多个字体', async () => {
      const font = new Font();
      const result = await font.check(['Arial', 'Helvetica']);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.allFonts).toHaveLength(2);
    });

    it('应该检查所有字体', async () => {
      mockFonts.forEach.mockImplementation((callback) => {
        callback({ family: 'Arial' });
        callback({ family: 'Helvetica' });
      });
      const font = new Font();
      const result = await font.check();
      expect(result).toBeDefined();
      expect(result.allFonts).toHaveLength(2);
    });
  });
}); 