/**
 * 工具函数测试
 */
import {
  isBase64,
  isBlob,
  isFile,
  getFileExtension,
  getMimeTypeFromExtension,
  getExtensionFromMimeType,
  checkFileType,
  generateRandomFileName,
  getMimeTypeFromDataURL,
  getBase64FromDataURL,
  delay
} from '../src/utils';

describe('工具函数测试', () => {
  describe('类型检查函数', () => {
    test('isBase64 应该正确识别Base64字符串', () => {
      expect(isBase64('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD')).toBe(true);
      expect(isBase64('not a base64 string')).toBe(false);
      expect(isBase64('')).toBe(false);
      expect(isBase64(null as any)).toBe(false);
    });

    test('isBlob 应该正确识别Blob对象', () => {
      const blob = new Blob(['test']);
      expect(isBlob(blob)).toBe(true);
      expect(isBlob({})).toBe(false);
      expect(isBlob(null)).toBe(false);
    });

    test('isFile 应该正确识别File对象', () => {
      const file = new File(['test'], 'test.txt');
      expect(isFile(file)).toBe(true);
      expect(isFile({})).toBe(false);
      expect(isFile(null)).toBe(false);
    });
  });

  describe('文件扩展名和MIME类型函数', () => {
    test('getFileExtension 应该返回正确的文件扩展名', () => {
      expect(getFileExtension('test.jpg')).toBe('jpg');
      expect(getFileExtension('test.file.png')).toBe('png');
      expect(getFileExtension('test')).toBe('');
      expect(getFileExtension('')).toBe('');
    });

    test('getMimeTypeFromExtension 应该返回正确的MIME类型', () => {
      expect(getMimeTypeFromExtension('jpg')).toBe('image/jpeg');
      expect(getMimeTypeFromExtension('png')).toBe('image/png');
      expect(getMimeTypeFromExtension('unknown')).toBe('application/octet-stream');
    });

    test('getExtensionFromMimeType 应该返回正确的扩展名', () => {
      expect(getExtensionFromMimeType('image/jpeg')).toBe('jpg');
      expect(getExtensionFromMimeType('image/png')).toBe('png');
      expect(getExtensionFromMimeType('unknown/type')).toBe('');
    });
  });

  describe('文件类型检查函数', () => {
    test('checkFileType 应该正确检查文件类型 (字符串参数)', () => {
      const result = checkFileType('test.jpg');
      expect(result.isImage).toBe(true);
      expect(result.isAudio).toBe(false);
      expect(result.isVideo).toBe(false);
      expect(result.mimeType).toBe('image/jpeg');
      expect(result.extension).toBe('jpg');
    });

    test('checkFileType 应该正确检查文件类型 (File参数)', () => {
      const file = new File(['test'], 'test.mp3', { type: 'audio/mpeg' });
      const result = checkFileType(file);
      expect(result.isImage).toBe(false);
      expect(result.isAudio).toBe(true);
      expect(result.isVideo).toBe(false);
      expect(result.mimeType).toBe('audio/mpeg');
      expect(result.extension).toBe('mp3');
    });
  });

  describe('其他工具函数', () => {
    test('generateRandomFileName 应该生成随机文件名', () => {
      const filename1 = generateRandomFileName('jpg');
      const filename2 = generateRandomFileName('jpg');
      
      expect(filename1).not.toBe(filename2); // 确保随机性
      expect(filename1).toMatch(/file_\d+_\d+\.jpg/);
      
      const filenameNoExt = generateRandomFileName();
      expect(filenameNoExt).toMatch(/file_\d+_\d+$/);
    });

    test('getMimeTypeFromDataURL 应该从DataURL中提取MIME类型', () => {
      expect(getMimeTypeFromDataURL('data:image/png;base64,abc')).toBe('image/png');
      expect(getMimeTypeFromDataURL('data:application/pdf;base64,abc')).toBe('application/pdf');
      expect(getMimeTypeFromDataURL('invalid')).toBe('');
    });

    test('getBase64FromDataURL 应该从DataURL中提取Base64数据', () => {
      expect(getBase64FromDataURL('data:image/png;base64,abc123')).toBe('abc123');
      expect(getBase64FromDataURL('invalid')).toBe('');
    });
  });
});