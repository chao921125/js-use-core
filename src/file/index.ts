/**
 * 文件处理模块
 * 
 * @description 提供统一的文件转换、处理和验证功能，基于BaseManager架构
 * @author js-use-core
 * @date 2024-07-20
 */

import { BaseManager } from '../core/BaseManager';
import { BaseOptions } from '../types/core';
import { FileInfo, FileReadOptions, FileReadResult, FileTypeResult } from '../types';
import { 
  getExtensionFromMimeType, 
  getMimeTypeFromDataURL, 
  generateRandomFileName,
  checkFileType,
  isBase64,
  isBlob,
  isFile,
  getFileExtension,
  getMimeTypeFromExtension
} from './utils';

/**
 * 文件管理器配置选项
 */
export interface FileManagerOptions extends BaseOptions {
  /** 最大文件大小（字节），默认10MB */
  maxFileSize?: number;
  /** 支持的文件类型，默认支持所有类型 */
  allowedTypes?: string[];
  /** 是否启用文件类型验证 */
  enableTypeValidation?: boolean;
  /** 是否启用文件大小验证 */
  enableSizeValidation?: boolean;
  /** 默认文件读取方式 */
  defaultReadAs?: 'text' | 'dataURL' | 'arrayBuffer' | 'binaryString';
}

/**
 * 文件转换结果
 */
export interface FileConversionResult<T = any> {
  /** 转换结果 */
  result: T;
  /** 原始文件信息 */
  originalInfo?: FileInfo;
  /** 转换后文件信息 */
  convertedInfo?: FileInfo;
  /** 转换耗时 */
  duration: number;
  /** 是否使用了缓存 */
  fromCache: boolean;
}

/**
 * 文件管理器类
 * 
 * @description 提供统一的文件处理功能，包括格式转换、类型检测、安全验证等
 */
export class FileManager extends BaseManager<FileManagerOptions> {
  private readonly CHUNK_SIZE = 512; // Base64转换时的块大小

  /**
   * 获取默认配置
   */
  protected getDefaultOptions(): Required<FileManagerOptions> {
    return {
      debug: false,
      timeout: 30000,
      retries: 2,
      cache: true,
      cacheTTL: 300000, // 5分钟
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [],
      enableTypeValidation: true,
      enableSizeValidation: true,
      defaultReadAs: 'dataURL'
    };
  }

  /**
   * 初始化文件管理器
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // 检查浏览器支持
      this.checkBrowserSupport();
      
      this.initialized = true;
      this.emit('initialized');
      
      this.logger.info('FileManager initialized successfully');
    } catch (error) {
      const processedError = this.handleError(error as Error, 'initialize');
      throw processedError;
    }
  }

  /**
   * 销毁文件管理器
   */
  destroy(): void {
    this.baseDestroy();
    this.logger.info('FileManager destroyed');
  }

  /**
   * URL转Base64
   * @param url 文件URL
   * @returns Promise<FileConversionResult<string>> 转换结果
   */
  async urlToBase64(url: string): Promise<FileConversionResult<string>> {
    await this.ensureInitialized();
    this.ensureNotDestroyed();

    // 输入验证
    if (!this.validateInput(url, { type: 'string', required: true })) {
      throw this.handleError(new Error('Invalid URL parameter'), 'urlToBase64');
    }

    const startTime = Date.now();
    const cacheKey = `url_to_base64_${url}`;

    try {
      // 尝试从缓存获取
      const cached = this.getCached<string>(cacheKey);
      if (cached) {
        return {
          result: cached,
          duration: Date.now() - startTime,
          fromCache: true
        };
      }

      // 执行转换
      const result = await this.safeExecute(async () => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        return await this.blobToBase64(blob);
      }, 'urlToBase64');

      // 缓存结果
      this.setCached(cacheKey, result.result, 300000); // 5分钟缓存

      return {
        result: result.result,
        duration: Date.now() - startTime,
        fromCache: false
      };
    } catch (error) {
      throw this.handleError(error as Error, 'urlToBase64');
    }
  }

  /**
   * Blob转Base64
   * @param blob Blob对象
   * @returns Promise<FileConversionResult<string>> 转换结果
   */
  async blobToBase64(blob: Blob): Promise<FileConversionResult<string>> {
    await this.ensureInitialized();
    this.ensureNotDestroyed();

    // 输入验证
    if (!isBlob(blob)) {
      throw this.handleError(new Error('Parameter must be a Blob object'), 'blobToBase64');
    }

    // 文件大小验证
    if (this.options.enableSizeValidation && blob.size > this.options.maxFileSize) {
      throw this.handleError(
        new Error(`File size ${blob.size} exceeds maximum allowed size ${this.options.maxFileSize}`),
        'blobToBase64'
      );
    }

    const startTime = Date.now();

    try {
      const result = await this.safeExecute(() => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              reject(new Error('FileReader result is not a string'));
            }
          };
          
          reader.onerror = () => reject(new Error('Failed to read Blob as Base64'));
          reader.readAsDataURL(blob);
        });
      }, 'blobToBase64');

      return {
        result,
        originalInfo: this.extractFileInfo(blob),
        duration: Date.now() - startTime,
        fromCache: false
      };
    } catch (error) {
      throw this.handleError(error as Error, 'blobToBase64');
    }
  }

  /**
   * 文件转Base64
   * @param file 文件对象
   * @returns Promise<FileConversionResult<string>> 转换结果
   */
  async fileToBase64(file: File): Promise<FileConversionResult<string>> {
    await this.ensureInitialized();
    this.ensureNotDestroyed();

    // 输入验证
    if (!isFile(file)) {
      throw this.handleError(new Error('Parameter must be a File object'), 'fileToBase64');
    }

    // 文件类型验证
    if (this.options.enableTypeValidation && !this.isAllowedFileType(file)) {
      throw this.handleError(
        new Error(`File type ${file.type} is not allowed`),
        'fileToBase64'
      );
    }

    const result = await this.blobToBase64(file);
    result.originalInfo = this.extractFileInfo(file);
    
    return result;
  }

  /**
   * Base64转Blob
   * @param base64 Base64字符串
   * @returns FileConversionResult<Blob> 转换结果
   */
  base64ToBlob(base64: string): FileConversionResult<Blob> {
    this.ensureInitializedSync();
    this.ensureNotDestroyed();

    // 输入验证
    if (!this.validateInput(base64, { type: 'string', required: true })) {
      throw this.handleError(new Error('Invalid Base64 parameter'), 'base64ToBlob');
    }

    if (!isBase64(base64)) {
      throw this.handleError(new Error('Invalid Base64 format'), 'base64ToBlob');
    }

    const startTime = Date.now();

    try {
      // 提取MIME类型和Base64数据
      let contentType = 'application/octet-stream';
      let b64Data = base64;
      
      if (base64.startsWith('data:')) {
        contentType = getMimeTypeFromDataURL(base64) || contentType;
        const parts = base64.split(',');
        if (parts.length !== 2) {
          throw new Error('Invalid DataURL format');
        }
        b64Data = parts[1];
      }
      
      // 解码Base64数据
      const byteCharacters = atob(b64Data);
      const byteArrays: BlobPart[] = [];
      
      // 分块处理以提高性能
      for (let offset = 0; offset < byteCharacters.length; offset += this.CHUNK_SIZE) {
        const slice = byteCharacters.slice(offset, offset + this.CHUNK_SIZE);
        
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        byteArrays.push(new Uint8Array(byteNumbers));
      }
      
      const blob = new Blob(byteArrays, { type: contentType });

      return {
        result: blob,
        convertedInfo: this.extractFileInfo(blob),
        duration: Date.now() - startTime,
        fromCache: false
      };
    } catch (error) {
      throw this.handleError(error as Error, 'base64ToBlob');
    }
  }

  /**
   * Base64转文件
   * @param base64 Base64字符串
   * @param filename 文件名（可选）
   * @returns FileConversionResult<File> 转换结果
   */
  base64ToFile(base64: string, filename?: string): FileConversionResult<File> {
    this.ensureInitializedSync();
    this.ensureNotDestroyed();

    const blobResult = this.base64ToBlob(base64);
    const blob = blobResult.result;
    
    const startTime = Date.now();

    try {
      let mimeType = blob.type || 'application/octet-stream';
      let extension = getExtensionFromMimeType(mimeType);
      
      // 生成或处理文件名
      let finalFilename: string;
      if (!filename) {
        finalFilename = generateRandomFileName(extension);
      } else if (!filename.includes('.') && extension) {
        finalFilename = `${filename}.${extension}`;
      } else {
        finalFilename = filename;
      }
      
      const file = new File([blob], finalFilename, { type: mimeType });

      return {
        result: file,
        originalInfo: blobResult.convertedInfo,
        convertedInfo: this.extractFileInfo(file),
        duration: blobResult.duration + (Date.now() - startTime),
        fromCache: false
      };
    } catch (error) {
      throw this.handleError(error as Error, 'base64ToFile');
    }
  }

  /**
   * 文件转Blob
   * @param file 文件对象
   * @returns FileConversionResult<Blob> 转换结果
   */
  fileToBlob(file: File): FileConversionResult<Blob> {
    this.ensureInitializedSync();
    this.ensureNotDestroyed();

    // 输入验证
    if (!isFile(file)) {
      throw this.handleError(new Error('Parameter must be a File object'), 'fileToBlob');
    }

    const startTime = Date.now();

    try {
      const blob = new Blob([file], { type: file.type });

      return {
        result: blob,
        originalInfo: this.extractFileInfo(file),
        convertedInfo: this.extractFileInfo(blob),
        duration: Date.now() - startTime,
        fromCache: false
      };
    } catch (error) {
      throw this.handleError(error as Error, 'fileToBlob');
    }
  }

  /**
   * Blob转文件
   * @param blob Blob对象
   * @param filename 文件名（可选）
   * @returns FileConversionResult<File> 转换结果
   */
  blobToFile(blob: Blob, filename?: string): FileConversionResult<File> {
    this.ensureInitializedSync();
    this.ensureNotDestroyed();

    // 输入验证
    if (!isBlob(blob)) {
      throw this.handleError(new Error('Parameter must be a Blob object'), 'blobToFile');
    }

    const startTime = Date.now();

    try {
      let mimeType = blob.type || 'application/octet-stream';
      let extension = getExtensionFromMimeType(mimeType);
      
      // 生成或处理文件名
      let finalFilename: string;
      if (!filename) {
        finalFilename = generateRandomFileName(extension);
      } else if (!filename.includes('.') && extension) {
        finalFilename = `${filename}.${extension}`;
      } else {
        finalFilename = filename;
      }
      
      const file = new File([blob], finalFilename, { type: mimeType });

      return {
        result: file,
        originalInfo: this.extractFileInfo(blob),
        convertedInfo: this.extractFileInfo(file),
        duration: Date.now() - startTime,
        fromCache: false
      };
    } catch (error) {
      throw this.handleError(error as Error, 'blobToFile');
    }
  }

  /**
   * 读取文件内容
   * @param file 文件对象
   * @param options 读取选项
   * @returns Promise<FileReadResult> 读取结果
   */
  async readFile(file: File, options?: FileReadOptions): Promise<FileReadResult> {
    await this.ensureInitialized();
    this.ensureNotDestroyed();

    // 输入验证
    if (!isFile(file)) {
      throw this.handleError(new Error('Parameter must be a File object'), 'readFile');
    }

    const opts = { ...{ readAs: this.options.defaultReadAs }, ...options };
    const startTime = Date.now();

    try {
      const result = await this.safeExecute(() => {
        return new Promise<any>((resolve, reject) => {
          const reader = new FileReader();
          
          // 进度处理
          if (opts.enableProgress && opts.onProgress) {
            reader.onprogress = (event) => {
              if (event.lengthComputable) {
                const progress = (event.loaded / event.total) * 100;
                opts.onProgress!(progress);
              }
            };
          }
          
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error(`Failed to read file as ${opts.readAs}`));
          
          // 根据读取方式选择对应的方法
          switch (opts.readAs) {
            case 'text':
              reader.readAsText(file, opts.encoding);
              break;
            case 'dataURL':
              reader.readAsDataURL(file);
              break;
            case 'arrayBuffer':
              reader.readAsArrayBuffer(file);
              break;
            case 'binaryString':
              reader.readAsBinaryString(file);
              break;
            default:
              reader.readAsDataURL(file);
          }
        });
      }, 'readFile');

      return {
        result,
        fileInfo: this.extractFileInfo(file),
        duration: Date.now() - startTime,
        success: true
      };
    } catch (error) {
      return {
        result: null,
        fileInfo: this.extractFileInfo(file),
        duration: Date.now() - startTime,
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * 检查文件类型
   * @param file 文件对象或文件名
   * @returns FileTypeResult 文件类型检查结果
   */
  checkFileType(file: File | string): FileTypeResult {
    this.ensureInitializedSync();
    this.ensureNotDestroyed();

    try {
      return checkFileType(file);
    } catch (error) {
      throw this.handleError(error as Error, 'checkFileType');
    }
  }

  /**
   * 验证文件
   * @param file 文件对象
   * @returns 验证结果
   */
  validateFile(file: File): { valid: boolean; errors: string[] } {
    this.ensureInitializedSync();
    this.ensureNotDestroyed();

    const errors: string[] = [];

    try {
      // 基本验证
      if (!isFile(file)) {
        errors.push('Invalid file object');
        return { valid: false, errors };
      }

      // 大小验证
      if (this.options.enableSizeValidation && file.size > this.options.maxFileSize) {
        errors.push(`File size ${file.size} exceeds maximum allowed size ${this.options.maxFileSize}`);
      }

      // 类型验证
      if (this.options.enableTypeValidation && !this.isAllowedFileType(file)) {
        errors.push(`File type ${file.type} is not allowed`);
      }

      // 文件名验证
      if (!file.name || file.name.trim() === '') {
        errors.push('File name is required');
      }

      return { valid: errors.length === 0, errors };
    } catch (error) {
      throw this.handleError(error as Error, 'validateFile');
    }
  }

  /**
   * 检查浏览器支持
   */
  private checkBrowserSupport(): void {
    const requiredAPIs = [
      { name: 'FileReader', api: typeof FileReader !== 'undefined' },
      { name: 'Blob', api: typeof Blob !== 'undefined' },
      { name: 'File', api: typeof File !== 'undefined' },
      { name: 'atob', api: typeof atob !== 'undefined' },
      { name: 'btoa', api: typeof btoa !== 'undefined' }
    ];

    const unsupported = requiredAPIs.filter(api => !api.api);
    
    if (unsupported.length > 0) {
      throw new Error(`Unsupported browser APIs: ${unsupported.map(api => api.name).join(', ')}`);
    }
  }

  /**
   * 检查文件类型是否允许
   */
  private isAllowedFileType(file: File): boolean {
    if (this.options.allowedTypes.length === 0) {
      return true; // 如果没有限制，则允许所有类型
    }

    return this.options.allowedTypes.some(type => {
      if (type.includes('/')) {
        // MIME类型匹配
        return file.type === type || file.type.startsWith(type.replace('*', ''));
      } else {
        // 扩展名匹配
        const extension = getFileExtension(file.name);
        return extension === type.toLowerCase();
      }
    });
  }

  /**
   * 提取文件信息
   */
  private extractFileInfo(file: File | Blob): FileInfo {
    const isFileObj = isFile(file);
    const typeResult = isFileObj ? checkFileType(file as File) : checkFileType('unknown');

    return {
      name: isFileObj ? (file as File).name : 'blob',
      size: file.size,
      type: typeResult.type,
      mimeType: file.type || 'application/octet-stream',
      extension: typeResult.extension,
      lastModified: isFileObj ? (file as File).lastModified : Date.now()
    };
  }
}

// 创建默认实例
const defaultFileManager = new FileManager();

// 导出便捷函数（保持向后兼容）
export async function urlToBase64(url: string): Promise<string> {
  if (!defaultFileManager.getStatus().initialized) {
    await defaultFileManager.initialize();
  }
  const result = await defaultFileManager.urlToBase64(url);
  return result.result;
}

export async function blobToBase64(blob: Blob): Promise<string> {
  if (!defaultFileManager.getStatus().initialized) {
    await defaultFileManager.initialize();
  }
  const result = await defaultFileManager.blobToBase64(blob);
  return result.result;
}

export async function fileToBase64(file: File): Promise<string> {
  if (!defaultFileManager.getStatus().initialized) {
    await defaultFileManager.initialize();
  }
  const result = await defaultFileManager.fileToBase64(file);
  return result.result;
}

export function base64ToBlob(base64: string): Blob {
  if (!defaultFileManager.getStatus().initialized) {
    // 同步初始化（仅用于向后兼容）
    defaultFileManager.initialize().catch(() => {
      // 忽略初始化错误，让具体方法处理
    });
  }
  const result = defaultFileManager.base64ToBlob(base64);
  return result.result;
}

export function base64ToFile(base64: string, filename?: string): File {
  if (!defaultFileManager.getStatus().initialized) {
    // 同步初始化（仅用于向后兼容）
    defaultFileManager.initialize().catch(() => {
      // 忽略初始化错误，让具体方法处理
    });
  }
  const result = defaultFileManager.base64ToFile(base64, filename);
  return result.result;
}

export function fileToBlob(file: File): Blob {
  if (!defaultFileManager.getStatus().initialized) {
    // 同步初始化（仅用于向后兼容）
    defaultFileManager.initialize().catch(() => {
      // 忽略初始化错误，让具体方法处理
    });
  }
  const result = defaultFileManager.fileToBlob(file);
  return result.result;
}

export function blobToFile(blob: Blob, filename?: string): File {
  if (!defaultFileManager.getStatus().initialized) {
    // 同步初始化（仅用于向后兼容）
    defaultFileManager.initialize().catch(() => {
      // 忽略初始化错误，让具体方法处理
    });
  }
  const result = defaultFileManager.blobToFile(blob, filename);
  return result.result;
}

// 导出类和类型已在上面定义时完成

// 导出工具函数
export * from './utils';
export * from './types';