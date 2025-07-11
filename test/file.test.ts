/**
 * 文件操作函数测试
 */
import { base64ToBlob, blobToBase64, blobToFile, fileToBlob, fileToBase64, base64ToFile, urlToBase64 } from '../src/file';

// 模拟浏览器环境中的Blob和File对象
class MockBlob {
  private data: any[];
  private options: any;

  constructor(data: any[], options: any = {}) {
    this.data = data;
    this.options = options;
  }

  get type() {
    return this.options.type || '';
  }

  get size() {
    return 1024; // 模拟文件大小
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(this.size));
  }

  slice(start?: number, end?: number, contentType?: string): Blob {
    return new MockBlob(this.data, { type: contentType || this.type });
  }

  stream(): ReadableStream {
    return new ReadableStream() as any;
  }

  text(): Promise<string> {
    return Promise.resolve(this.data.join(''));
  }

  async bytes(): Promise<Uint8Array> {
    // 简单模拟，返回 data 的 Uint8Array
    return new Uint8Array(Buffer.from(this.data.join('')));
  }
};

global.Blob = MockBlob as any;

class MockFile extends global.Blob {
  private fileName: string;
  public lastModified: number = Date.now();
  public webkitRelativePath: string = '';

  constructor(data: any[], fileName: string, options: any = {}) {
    super(data, options);
    this.fileName = fileName;
  }

  get name() {
    return this.fileName;
  }
};

global.File = MockFile as any;

// 模拟FileReader
class MockFileReader {
  private onloadCallback: any = null;
  private onerrorCallback: any = null;
  public result: string | null = null;
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
        this.onloadCallback();
      }
    }, 0);
  }
};

global.FileReader = MockFileReader as any;

// 模拟atob和btoa函数
global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
global.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');

// 模拟fetch函数
global.fetch = jest.fn().mockImplementation((url) => {
  return Promise.resolve({
    blob: () => Promise.resolve(new Blob(['test'], { type: 'image/jpeg' }))
  });
});

describe('文件操作函数测试', () => {
  const testBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD';
  const testBlob = new Blob(['test'], { type: 'image/jpeg' });
  const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

  test('blobToBase64 应该将Blob转换为Base64字符串', async () => {
    const result = await blobToBase64(testBlob);
    expect(result).toBe(testBase64);
  });

  test('base64ToBlob 应该将Base64字符串转换为Blob', () => {
    const result = base64ToBlob(testBase64);
    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('image/jpeg');
  });

  test('fileToBlob 应该将File转换为Blob', () => {
    const result = fileToBlob(testFile);
    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('image/jpeg');
  });

  test('blobToFile 应该将Blob转换为File', () => {
    const result = blobToFile(testBlob, 'test.jpg');
    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('test.jpg');
    expect(result.type).toBe('image/jpeg');
  });

  test('blobToFile 应该在没有提供文件名时生成随机文件名', () => {
    const result = blobToFile(testBlob);
    expect(result).toBeInstanceOf(File);
    expect(result.name).toMatch(/file_\d+_\d+\.jpg/);
    expect(result.type).toBe('image/jpeg');
  });

  test('fileToBase64 应该将File转换为Base64字符串', async () => {
    const result = await fileToBase64(testFile);
    expect(result).toBe(testBase64);
  });

  test('base64ToFile 应该将Base64字符串转换为File', () => {
    const result = base64ToFile(testBase64, 'test.jpg');
    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('test.jpg');
    expect(result.type).toBe('image/jpeg');
  });

  test('base64ToFile 应该在没有提供文件名时生成随机文件名', () => {
    const result = base64ToFile(testBase64);
    expect(result).toBeInstanceOf(File);
    expect(result.name).toMatch(/file_\d+_\d+\.jpg/);
    expect(result.type).toBe('image/jpeg');
  });

  test('urlToBase64 应该将URL转换为Base64字符串', async () => {
    const result = await urlToBase64('https://example.com/image.jpg');
    expect(result).toBe(testBase64);
    expect(global.fetch).toHaveBeenCalledWith('https://example.com/image.jpg');
  });
});