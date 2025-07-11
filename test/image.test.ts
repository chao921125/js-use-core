/**
 * 图片操作函数测试
 */
import { dataURLtoBlob, dataURLtoFile, imgConvert, imgCompress, blobToDataURL, imageToDataURL, dataURLToImage, dataURLtoImgBlob } from '../src/image';
import { ImageFormat } from '../src/types';

// 模拟浏览器环境中的HTMLImageElement
class MockImage {
  private _src: string = '';
  public naturalWidth: number = 100;
  public naturalHeight: number = 100;
  public width: number = 100;
  public height: number = 100;
  private onloadCallback: any = null;
  private onerrorCallback: any = null;

  get src(): string {
    return this._src;
  }

  set src(value: string) {
    this._src = value;
    // 模拟图片加载完成
    if (this._src && this.onloadCallback) {
      setTimeout(() => {
        if (this.onloadCallback) {
          this.onloadCallback.call(this);
        }
      }, 0);
    }
  }
  
  set onload(callback: any) {
    this.onloadCallback = callback;
  }

  set onerror(callback: any) {
    this.onerrorCallback = callback;
  }
};

// 使用 as any 绕过类型检查
global.HTMLImageElement = MockImage as any;

// 模拟canvas
const mockContext = {
  drawImage: jest.fn(),
};

// 模拟 FileReader
class MockFileReader {
  public result: string | null = null;
  private onloadCallback: any = null;
  private onerrorCallback: any = null;
  static DONE = 2;
  static EMPTY = 0;
  static LOADING = 1;

  set onload(callback: any) {
    this.onloadCallback = callback;
  }

  set onerror(callback: any) {
    this.onerrorCallback = callback;
  }

  readAsDataURL(blob: Blob) {
    // 模拟异步读取
    setTimeout(() => {
      this.result = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD';
      if (this.onloadCallback) {
        this.onloadCallback.call(this);
      }
    }, 0);
  }
}

global.FileReader = MockFileReader as any;

global.document = {
  createElement: (tagName: string) => {
    if (tagName === 'canvas') {
      return {
        width: 0,
        height: 0,
        getContext: () => mockContext,
        toDataURL: (mimeType: string, quality: number) => {
          return `data:${mimeType};base64,/9j/4AAQSkZJRgABAQEAYABgAAD`;
        },
      };
    }
    return {};
  },
} as any;

// 模拟Image构造函数
global.Image = function() {
  return new global.HTMLImageElement();
} as any;

describe('图片操作函数测试', () => {
  const testDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('dataURLtoBlob 应该将DataURL转换为Blob', () => {
    const result = dataURLtoBlob(testDataURL);
    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('image/jpeg');
  });

  test('dataURLtoFile 应该将DataURL转换为File', () => {
    const result = dataURLtoFile(testDataURL, 'test.jpg');
    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('test.jpg');
    expect(result.type).toBe('image/jpeg');
  });

  test('dataURLtoFile 应该在没有提供文件名时生成随机文件名', () => {
    const result = dataURLtoFile(testDataURL);
    expect(result).toBeInstanceOf(File);
    expect(result.name).toMatch(/file_\d+_\d+\.jpg/);
    expect(result.type).toBe('image/jpeg');
  });

  test('blobToDataURL 应该将Blob转换为DataURL', async () => {
    // 保存原始的 FileReader
    const originalFileReader = global.FileReader;
    
    // 替换全局 FileReader
    global.FileReader = MockFileReader as any;
    
    try {
      const blob = new Blob(['test'], { type: 'image/jpeg' });
      const result = await blobToDataURL(blob);
      expect(result).toBe(testDataURL);
    } finally {
      // 恢复原始 FileReader
      global.FileReader = originalFileReader;
    }
  });

  test('imageToDataURL 应该将图片转换为DataURL', () => {
    // 重置 mockContext.drawImage 的调用计数
    mockContext.drawImage.mockClear();
    
    const img = new Image();
    img.src = testDataURL;
    const result = imageToDataURL(img, 'jpeg', 0.9);
    expect(result).toBe(testDataURL);
    expect(mockContext.drawImage).toHaveBeenCalled();
  });

  test('dataURLToImage 应该将DataURL转换为图片', async () => {
    // 保存原始的 Image 构造函数
    const originalImage = global.Image;
    
    // 创建一个简单的模拟 Image 构造函数
    global.Image = function() {
      return new MockImage();
    } as any;
    
    try {
      const result = await dataURLToImage(testDataURL);
      expect(result).toBeInstanceOf(global.HTMLImageElement);
      expect(result.src).toBe(testDataURL);
    } finally {
      // 恢复原始 Image 构造函数
      global.Image = originalImage;
    }
  });

  test('dataURLtoImgBlob 应该将DataURL转换为图片Blob', () => {
    // 使用有效的图片 DataURL
    const validImageDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD';
    const result = dataURLtoImgBlob(validImageDataURL);
    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('image/jpeg');
    
    // 测试非图片 DataURL 应该抛出错误
    const invalidDataURL = 'data:application/pdf;base64,/9j/4AAQSkZJRgABAQEAYABgAAD';
    expect(() => dataURLtoImgBlob(invalidDataURL)).toThrow('提供的DataURL不是图片格式');
  });

  test('imgConvert 应该转换图片格式', async () => {
    // 重置 mockContext.drawImage 的调用计数
    mockContext.drawImage.mockClear();
    
    // 保存原始的 FileReader
    const originalFileReader = global.FileReader;
    
    // 替换全局 FileReader
    global.FileReader = MockFileReader as any;
    
    // 保存原始的 Image 构造函数
    const originalImage = global.Image;
    
    // 创建一个简单的模拟 Image 构造函数
    global.Image = function() {
      return new MockImage();
    } as any;
    
    try {
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const format: ImageFormat = 'png';
      
      const result = await imgConvert(testFile, { format });
      
      expect(result).toBeInstanceOf(File);
      expect(result.name).toBe('test.png');
      expect(result.type).toBe('image/png');
      expect(mockContext.drawImage).toHaveBeenCalled();
    } finally {
      global.Image = originalImage;
      global.FileReader = originalFileReader;
    }
  });

  test('imgCompress 应该压缩图片', async () => {
    // 重置 mockContext.drawImage 的调用计数
    mockContext.drawImage.mockClear();
    
    // 保存原始的 FileReader
    const originalFileReader = global.FileReader;
    
    // 替换全局 FileReader
    global.FileReader = MockFileReader as any;
    
    // 保存原始的 Image 构造函数
    const originalImage = global.Image;
    
    // 创建一个简单的模拟 Image 构造函数
    global.Image = function() {
      return new MockImage();
    } as any;
    
    try {
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const result = await imgCompress(testFile, {
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 600
      });
      
      expect(result).toBeInstanceOf(File);
      expect(result.name).toBe('test.jpg');
      expect(result.type).toBe('image/jpeg');
      expect(mockContext.drawImage).toHaveBeenCalled();
    } finally {
      global.Image = originalImage;
      global.FileReader = originalFileReader;
    }
  });

  test('imgCompress 应该在指定格式时转换格式', async () => {
    // 重置 mockContext.drawImage 的调用计数
    mockContext.drawImage.mockClear();
    
    // 保存原始的 FileReader
    const originalFileReader = global.FileReader;
    
    // 替换全局 FileReader
    global.FileReader = MockFileReader as any;
    
    // 保存原始的 Image 构造函数
    const originalImage = global.Image;
    
    // 创建一个简单的模拟 Image 构造函数
    global.Image = function() {
      return new MockImage();
    } as any;
    
    try {
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const result = await imgCompress(testFile, {
        quality: 0.8,
        format: 'webp'
      });
      
      expect(result).toBeInstanceOf(File);
      expect(result.name).toBe('test.webp');
      expect(mockContext.drawImage).toHaveBeenCalled();
    } finally {
      global.Image = originalImage;
      global.FileReader = originalFileReader;
    }
  });

  test('imgCompress 和 imgConvert 应该正确处理非图片文件', async () => {
    // 保存原始的 FileReader
    const originalFileReader = global.FileReader;
    
    // 替换全局 FileReader
    global.FileReader = MockFileReader as any;
    
    // 保存原始的 Image 构造函数
    const originalImage = global.Image;
    
    // 创建一个简单的模拟 Image 构造函数
    global.Image = function() {
      return new MockImage();
    } as any;
    
    try {
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      await expect(imgCompress(testFile)).rejects.toThrow('提供的文件不是图片格式');
      await expect(imgConvert(testFile, { format: 'png' })).rejects.toThrow('提供的文件不是图片格式');
    } finally {
      // 恢复原始 FileReader
      global.FileReader = originalFileReader;
      global.Image = originalImage;
    }
  });

  test('imgConvert 应该处理不支持的格式', async () => {
    // 保存原始的 FileReader
    const originalFileReader = global.FileReader;
    
    // 替换全局 FileReader
    global.FileReader = MockFileReader as any;
    
    // 保存原始的 Image 构造函数
    const originalImage = global.Image;
    
    // 创建一个简单的模拟 Image 构造函数
    global.Image = function() {
      return new MockImage();
    } as any;
    
    // 模拟 blobToDataURL 函数
    const blobToDataURLSpy = jest.spyOn(require('../src/image'), 'blobToDataURL')
      .mockImplementation(() => Promise.resolve('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD'));
    
    // 模拟 getMimeTypeFromExtension 函数返回空字符串
    const getMimeTypeFromExtensionSpy = jest.spyOn(require('../src/utils'), 'getMimeTypeFromExtension')
      .mockImplementation((extension) => {
        if (extension === 'unsupported') {
          return '';
        }
        return 'image/jpeg';
      });
    
    try {
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      await expect(imgConvert(testFile, { format: 'unsupported' as any })).rejects.toThrow('不支持的图片格式');
    } finally {
      // 恢复原始函数
      global.FileReader = originalFileReader;
      global.Image = originalImage;
      blobToDataURLSpy.mockRestore();
      getMimeTypeFromExtensionSpy.mockRestore();
    }
  });
});