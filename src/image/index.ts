/**
 * 图像处理模块
 * 
 * @description 提供统一的图像压缩、转换和处理功能，基于BaseManager架构
 * @author js-use-core
 * @date 2024-07-20
 */

import { BaseManager } from '../core/BaseManager';
import { BaseOptions } from '../types/core';
import { 
  ImageCompressOptions, 
  ImageConvertOptions, 
  ImageFormat, 
  ImageDimensions,
  FileInfo
} from '../types';
import { 
  getExtensionFromMimeType, 
  getMimeTypeFromExtension, 
  generateRandomFileName,
  checkFileType,
  isFile
} from '../utils/file';

/**
 * 图像管理器配置选项
 */
export interface ImageManagerOptions extends BaseOptions {
  /** 最大图像尺寸（像素），默认4096x4096 */
  maxImageSize?: number;
  /** 默认压缩质量 */
  defaultQuality?: number;
  /** 默认输出格式 */
  defaultFormat?: ImageFormat;
  /** 是否启用图像尺寸验证 */
  enableSizeValidation?: boolean;
  /** 支持的图像格式 */
  supportedFormats?: ImageFormat[];
  /** Canvas渲染上下文选项 */
  canvasContextOptions?: CanvasRenderingContext2DSettings;
}

/**
 * 图像处理结果
 */
export interface ImageProcessResult<T = any> {
  /** 处理结果 */
  result: T;
  /** 原始图像信息 */
  originalInfo?: ImageInfo;
  /** 处理后图像信息 */
  processedInfo?: ImageInfo;
  /** 处理耗时 */
  duration: number;
  /** 是否使用了缓存 */
  fromCache: boolean;
  /** 压缩比例（仅压缩操作） */
  compressionRatio?: number;
}

/**
 * 图像信息
 */
export interface ImageInfo extends FileInfo {
  /** 图像尺寸 */
  dimensions: ImageDimensions;
  /** 是否为动画图像 */
  isAnimated?: boolean;
  /** 颜色深度 */
  colorDepth?: number;
}

/**
 * 图像管理器类
 * 
 * @description 提供统一的图像处理功能，包括压缩、转换、尺寸调整等
 */
export class ImageManager extends BaseManager<ImageManagerOptions> {
  private canvas?: HTMLCanvasElement;
  private context?: CanvasRenderingContext2D;

  /**
   * 获取默认配置
   */
  protected getDefaultOptions(): Required<ImageManagerOptions> {
    return {
      debug: false,
      timeout: 60000, // 图像处理可能需要更长时间
      retries: 1,
      cache: true,
      maxImageSize: 4096,
      defaultQuality: 0.8,
      defaultFormat: 'jpeg',
      enableSizeValidation: true,
      supportedFormats: ['jpeg', 'png', 'webp', 'gif', 'bmp'],
      canvasContextOptions: {
        alpha: true,
        desynchronized: false,
        colorSpace: 'srgb'
      }
    };
  }

  /**
   * 初始化图像管理器
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // 检查浏览器支持
      this.checkBrowserSupport();
      
      // 初始化Canvas
      this.initializeCanvas();
      
      this.initialized = true;
      this.emit('initialized');
      
      this.logger.info('ImageManager initialized successfully');
    } catch (error) {
      const processedError = this.handleError(error as Error, 'initialize');
      throw processedError;
    }
  }

  /**
   * 销毁图像管理器
   */
  destroy(): void {
    // 清理Canvas资源
    if (this.canvas) {
      this.canvas.width = 0;
      this.canvas.height = 0;
      this.canvas = undefined;
      this.context = undefined;
    }
    
    this.baseDestroy();
    this.logger.info('ImageManager destroyed');
  }

  /**
   * Blob转DataURL
   * @param blob Blob对象
   * @returns Promise<ImageProcessResult<string>> 转换结果
   */
  async blobToDataURL(blob: Blob): Promise<ImageProcessResult<string>> {
    this.ensureInitialized();
    this.ensureNotDestroyed();

    // 输入验证
    if (!blob || typeof blob.size !== 'number') {
      throw this.handleError(new Error('Invalid Blob object'), 'blobToDataURL');
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
          
          reader.onerror = () => reject(new Error('Failed to convert Blob to DataURL'));
          reader.readAsDataURL(blob);
        });
      }, 'blobToDataURL');

      return {
        result,
        duration: Date.now() - startTime,
        fromCache: false
      };
    } catch (error) {
      throw this.handleError(error as Error, 'blobToDataURL');
    }
  }

  /**
   * 图片转DataURL
   * @param image HTMLImageElement对象
   * @param format 输出格式
   * @param quality 输出质量
   * @returns ImageProcessResult<string> 转换结果
   */
  imageToDataURL(
    image: HTMLImageElement,
    format: ImageFormat = this.options.defaultFormat,
    quality: number = this.options.defaultQuality
  ): ImageProcessResult<string> {
    this.ensureInitialized();
    this.ensureNotDestroyed();

    // 输入验证
    if (!image || !image.naturalWidth || !image.naturalHeight) {
      throw this.handleError(new Error('Invalid or unloaded image element'), 'imageToDataURL');
    }

    const startTime = Date.now();

    try {
      // 验证格式支持
      if (!this.options.supportedFormats.includes(format)) {
        throw new Error(`Unsupported image format: ${format}`);
      }

      // 创建临时canvas
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;
      
      const ctx = canvas.getContext('2d', this.options.canvasContextOptions);
      if (!ctx) {
        throw new Error('Failed to create canvas 2d context');
      }
      
      // 绘制图像
      ctx.drawImage(image, 0, 0);
      
      // 转换为DataURL
      const mimeType = `image/${format}`;
      const result = canvas.toDataURL(mimeType, quality);

      return {
        result,
        originalInfo: this.extractImageInfo(image),
        duration: Date.now() - startTime,
        fromCache: false
      };
    } catch (error) {
      throw this.handleError(error as Error, 'imageToDataURL');
    }
  }

  /**
   * DataURL转图片
   * @param dataURL DataURL字符串
   * @returns Promise<ImageProcessResult<HTMLImageElement>> 转换结果
   */
  async dataURLToImage(dataURL: string): Promise<ImageProcessResult<HTMLImageElement>> {
    this.ensureInitialized();
    this.ensureNotDestroyed();

    // 输入验证
    if (!this.validateInput(dataURL, { type: 'string', required: true })) {
      throw this.handleError(new Error('Invalid DataURL parameter'), 'dataURLToImage');
    }

    if (!dataURL.startsWith('data:image/')) {
      throw this.handleError(new Error('DataURL is not an image format'), 'dataURLToImage');
    }

    const startTime = Date.now();
    const cacheKey = `dataurl_to_image_${this.hashString(dataURL)}`;

    try {
      // 尝试从缓存获取
      const cached = this.getCached<HTMLImageElement>(cacheKey);
      if (cached) {
        return {
          result: cached,
          duration: Date.now() - startTime,
          fromCache: true
        };
      }

      const result = await this.safeExecute(() => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          
          img.onload = () => {
            // 验证图像尺寸
            if (this.options.enableSizeValidation) {
              const maxSize = this.options.maxImageSize;
              if (img.naturalWidth > maxSize || img.naturalHeight > maxSize) {
                reject(new Error(`Image size ${img.naturalWidth}x${img.naturalHeight} exceeds maximum ${maxSize}x${maxSize}`));
                return;
              }
            }
            
            resolve(img);
          };
          
          img.onerror = () => reject(new Error('Failed to load image from DataURL'));
          img.src = dataURL;
        });
      }, 'dataURLToImage');

      // 缓存结果
      this.setCached(cacheKey, result, 300000); // 5分钟缓存

      return {
        result,
        processedInfo: this.extractImageInfo(result),
        duration: Date.now() - startTime,
        fromCache: false
      };
    } catch (error) {
      throw this.handleError(error as Error, 'dataURLToImage');
    }
  }

  /**
   * DataURL转Blob
   * @param dataURL DataURL字符串
   * @returns ImageProcessResult<Blob> 转换结果
   */
  dataURLtoBlob(dataURL: string): ImageProcessResult<Blob> {
    this.ensureInitialized();
    this.ensureNotDestroyed();

    // 输入验证
    if (!this.validateInput(dataURL, { type: 'string', required: true })) {
      throw this.handleError(new Error('Invalid DataURL parameter'), 'dataURLtoBlob');
    }

    const startTime = Date.now();

    try {
      const arr = dataURL.split(',');
      if (arr.length !== 2) {
        throw new Error('Invalid DataURL format');
      }

      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      
      const blob = new Blob([u8arr], { type: mime });

      return {
        result: blob,
        duration: Date.now() - startTime,
        fromCache: false
      };
    } catch (error) {
      throw this.handleError(error as Error, 'dataURLtoBlob');
    }
  }

  /**
   * DataURL转图片Blob（验证图片格式）
   * @param dataURL DataURL字符串
   * @returns ImageProcessResult<Blob> 转换结果
   */
  dataURLtoImgBlob(dataURL: string): ImageProcessResult<Blob> {
    const result = this.dataURLtoBlob(dataURL);
    
    if (!result.result.type.startsWith('image/')) {
      throw this.handleError(new Error('DataURL is not an image format'), 'dataURLtoImgBlob');
    }
    
    return result;
  }

  /**
   * DataURL转文件
   * @param dataURL DataURL字符串
   * @param filename 文件名（可选）
   * @returns ImageProcessResult<File> 转换结果
   */
  dataURLtoFile(dataURL: string, filename?: string): ImageProcessResult<File> {
    this.ensureInitialized();
    this.ensureNotDestroyed();

    const blobResult = this.dataURLtoBlob(dataURL);
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
        duration: blobResult.duration + (Date.now() - startTime),
        fromCache: false
      };
    } catch (error) {
      throw this.handleError(error as Error, 'dataURLtoFile');
    }
  }

  /**
   * 图片格式转换
   * @param imageFile 图片文件
   * @param options 转换选项
   * @returns Promise<ImageProcessResult<File>> 转换结果
   */
  async imgConvert(
    imageFile: File,
    options: ImageConvertOptions
  ): Promise<ImageProcessResult<File>> {
    this.ensureInitialized();
    this.ensureNotDestroyed();

    // 输入验证
    if (!isFile(imageFile)) {
      throw this.handleError(new Error('Parameter must be a File object'), 'imgConvert');
    }

    if (!imageFile.type.startsWith('image/')) {
      throw this.handleError(new Error('File is not an image format'), 'imgConvert');
    }

    const { format, quality = this.options.defaultQuality, preserveMetadata = false } = options;
    
    // 验证格式支持
    if (!this.options.supportedFormats.includes(format)) {
      throw this.handleError(new Error(`Unsupported image format: ${format}`), 'imgConvert');
    }

    const startTime = Date.now();
    const cacheKey = `img_convert_${imageFile.name}_${imageFile.size}_${format}_${quality}`;

    try {
      // 尝试从缓存获取
      const cached = this.getCached<File>(cacheKey);
      if (cached) {
        return {
          result: cached,
          duration: Date.now() - startTime,
          fromCache: true
        };
      }

      const result = await this.safeExecute(async () => {
        const mimeType = getMimeTypeFromExtension(format);
        
        if (!mimeType) {
          throw new Error(`Unsupported image format: ${format}`);
        }
        
        // 创建图片元素
        const img = await this.createImageFromFile(imageFile);
        
        // 获取原始图像信息
        const originalInfo = this.extractImageInfo(img, imageFile);
        
        // 创建canvas并绘制图片
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        const ctx = canvas.getContext('2d', this.options.canvasContextOptions);
        if (!ctx) {
          throw new Error('Failed to create canvas 2d context');
        }
        
        // 如果转换为JPEG且原图有透明度，设置白色背景
        if (format === 'jpeg' && (imageFile.type === 'image/png' || imageFile.type === 'image/gif')) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0);
        
        // 转换为指定格式
        const dataURL = canvas.toDataURL(mimeType, quality);
        
        // 生成新文件名
        let newFilename = imageFile.name;
        const dotIndex = newFilename.lastIndexOf('.');
        if (dotIndex !== -1) {
          newFilename = newFilename.substring(0, dotIndex);
        }
        newFilename = `${newFilename}.${format}`;
        
        // 转换为文件
        const convertedFile = this.dataURLtoFile(dataURL, newFilename).result;
        
        return {
          file: convertedFile,
          originalInfo,
          processedInfo: this.extractImageInfo(img, convertedFile)
        };
      }, 'imgConvert');

      // 缓存结果
      this.setCached(cacheKey, result.file, 600000); // 10分钟缓存

      return {
        result: result.file,
        originalInfo: result.originalInfo,
        processedInfo: result.processedInfo,
        duration: Date.now() - startTime,
        fromCache: false
      };
    } catch (error) {
      throw this.handleError(error as Error, 'imgConvert');
    }
  }

  /**
   * 图片压缩
   * @param imageFile 图片文件
   * @param options 压缩选项
   * @returns Promise<ImageProcessResult<File>> 压缩结果
   */
  async imgCompress(
    imageFile: File,
    options: ImageCompressOptions = {}
  ): Promise<ImageProcessResult<File>> {
    this.ensureInitialized();
    this.ensureNotDestroyed();

    // 输入验证
    if (!isFile(imageFile)) {
      throw this.handleError(new Error('Parameter must be a File object'), 'imgCompress');
    }

    if (!imageFile.type.startsWith('image/')) {
      throw this.handleError(new Error('File is not an image format'), 'imgCompress');
    }

    const {
      quality = this.options.defaultQuality,
      maxWidth,
      maxHeight,
      format,
      maintainAspectRatio = true,
      backgroundColor = '#FFFFFF'
    } = options;

    const startTime = Date.now();
    const cacheKey = `img_compress_${imageFile.name}_${imageFile.size}_${quality}_${maxWidth}_${maxHeight}_${format}`;

    try {
      // 尝试从缓存获取
      const cached = this.getCached<File>(cacheKey);
      if (cached) {
        return {
          result: cached,
          duration: Date.now() - startTime,
          fromCache: true,
          compressionRatio: cached.size / imageFile.size
        };
      }

      const result = await this.safeExecute(async () => {
        // 确定输出MIME类型
        let outputMimeType = imageFile.type;
        if (format) {
          outputMimeType = getMimeTypeFromExtension(format) || imageFile.type;
        }
        
        // 创建图片元素
        const img = await this.createImageFromFile(imageFile);
        
        // 获取原始图像信息
        const originalInfo = this.extractImageInfo(img, imageFile);
        
        // 计算新尺寸
        let width = img.naturalWidth;
        let height = img.naturalHeight;
        
        if (maxWidth && width > maxWidth) {
          if (maintainAspectRatio) {
            height = (height * maxWidth) / width;
          }
          width = maxWidth;
        }
        
        if (maxHeight && height > maxHeight) {
          if (maintainAspectRatio) {
            width = (width * maxHeight) / height;
          }
          height = maxHeight;
        }
        
        // 创建canvas并绘制图片
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        
        const ctx = canvas.getContext('2d', this.options.canvasContextOptions);
        if (!ctx) {
          throw new Error('Failed to create canvas 2d context');
        }
        
        // 设置图像渲染质量
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 如果输出格式不支持透明度，设置背景色
        if (outputMimeType === 'image/jpeg') {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // 转换为DataURL
        const dataURL = canvas.toDataURL(outputMimeType, quality);
        
        // 生成新文件名
        let newFilename = imageFile.name;
        if (format) {
          const dotIndex = newFilename.lastIndexOf('.');
          if (dotIndex !== -1) {
            newFilename = newFilename.substring(0, dotIndex);
          }
          newFilename = `${newFilename}.${format}`;
        }
        
        // 转换为文件
        const compressedFile = this.dataURLtoFile(dataURL, newFilename).result;
        
        return {
          file: compressedFile,
          originalInfo,
          processedInfo: this.extractImageInfo(img, compressedFile)
        };
      }, 'imgCompress');

      // 缓存结果
      this.setCached(cacheKey, result.file, 600000); // 10分钟缓存

      const compressionRatio = result.file.size / imageFile.size;

      return {
        result: result.file,
        originalInfo: result.originalInfo,
        processedInfo: result.processedInfo,
        duration: Date.now() - startTime,
        fromCache: false,
        compressionRatio
      };
    } catch (error) {
      throw this.handleError(error as Error, 'imgCompress');
    }
  }

  /**
   * 获取图像尺寸
   * @param imageFile 图片文件
   * @returns Promise<ImageDimensions> 图像尺寸信息
   */
  async getImageDimensions(imageFile: File): Promise<ImageDimensions> {
    this.ensureInitialized();
    this.ensureNotDestroyed();

    if (!isFile(imageFile) || !imageFile.type.startsWith('image/')) {
      throw this.handleError(new Error('Parameter must be an image file'), 'getImageDimensions');
    }

    try {
      const img = await this.createImageFromFile(imageFile);
      
      return {
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight
      };
    } catch (error) {
      throw this.handleError(error as Error, 'getImageDimensions');
    }
  }

  /**
   * 检查浏览器支持
   */
  private checkBrowserSupport(): void {
    const requiredAPIs = [
      { name: 'Canvas', api: typeof HTMLCanvasElement !== 'undefined' },
      { name: 'CanvasRenderingContext2D', api: typeof CanvasRenderingContext2D !== 'undefined' },
      { name: 'Image', api: typeof Image !== 'undefined' },
      { name: 'FileReader', api: typeof FileReader !== 'undefined' }
    ];

    const unsupported = requiredAPIs.filter(api => !api.api);
    
    if (unsupported.length > 0) {
      throw new Error(`Unsupported browser APIs: ${unsupported.map(api => api.name).join(', ')}`);
    }
  }

  /**
   * 初始化Canvas
   */
  private initializeCanvas(): void {
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d', this.options.canvasContextOptions) || undefined;
      
      if (!this.context) {
        throw new Error('Failed to create canvas 2d context');
      }
    }
  }

  /**
   * 从文件创建图片元素
   */
  private async createImageFromFile(file: File): Promise<HTMLImageElement> {
    const dataURL = await this.blobToDataURL(file);
    const result = await this.dataURLToImage(dataURL.result);
    return result.result;
  }

  /**
   * 提取图像信息
   */
  private extractImageInfo(img: HTMLImageElement, file?: File): ImageInfo {
    const typeResult = file ? checkFileType(file) : { type: 'image' as any, mimeType: 'image/jpeg', extension: 'jpg' };

    return {
      name: file?.name || 'image',
      size: file?.size || 0,
      type: typeResult.type,
      mimeType: file?.type || 'image/jpeg',
      extension: typeResult.extension,
      lastModified: file?.lastModified || Date.now(),
      dimensions: {
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight
      }
    };
  }

  /**
   * 生成字符串哈希
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(36);
  }
}

// 创建默认实例
const defaultImageManager = new ImageManager();

// 导出便捷函数（保持向后兼容）
export async function blobToDataURL(blob: Blob): Promise<string> {
  if (!defaultImageManager.getStatus().initialized) {
    await defaultImageManager.initialize();
  }
  const result = await defaultImageManager.blobToDataURL(blob);
  return result.result;
}

export function imageToDataURL(
  image: HTMLImageElement,
  format: ImageFormat = 'jpeg',
  quality: number = 0.9
): string {
  // 简化实现，不依赖管理器（向后兼容）
  if (!image || !image.naturalWidth || !image.naturalHeight) {
    throw new Error('Invalid or unloaded image element');
  }

  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建canvas 2d上下文');
  }
  
  ctx.drawImage(image, 0, 0);
  return canvas.toDataURL(`image/${format}`, quality);
}

export async function dataURLToImage(dataURL: string): Promise<HTMLImageElement> {
  if (!defaultImageManager.getStatus().initialized) {
    await defaultImageManager.initialize();
  }
  const result = await defaultImageManager.dataURLToImage(dataURL);
  return result.result;
}

export function dataURLtoBlob(dataURL: string): Blob {
  // 简化实现，不依赖管理器（向后兼容）
  const arr = dataURL.split(',');
  if (arr.length !== 2) {
    throw new Error('Invalid DataURL format');
  }

  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

export function dataURLtoImgBlob(dataURL: string): Blob {
  // 简化实现，不依赖管理器（向后兼容）
  const blob = dataURLtoBlob(dataURL);
  if (!blob.type.startsWith('image/')) {
    throw new Error('提供的DataURL不是图片格式');
  }
  return blob;
}

export function dataURLtoFile(dataURL: string, filename?: string): File {
  // 简化实现，不依赖管理器（向后兼容）
  const blob = dataURLtoBlob(dataURL);
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
  
  return new File([blob], finalFilename, { type: mimeType });
}

export async function imgConvert(
  imageFile: File,
  options: ImageConvertOptions
): Promise<File> {
  if (!defaultImageManager.getStatus().initialized) {
    await defaultImageManager.initialize();
  }
  const result = await defaultImageManager.imgConvert(imageFile, options);
  return result.result;
}

export async function imgCompress(
  imageFile: File,
  options: ImageCompressOptions = {}
): Promise<File> {
  if (!defaultImageManager.getStatus().initialized) {
    await defaultImageManager.initialize();
  }
  const result = await defaultImageManager.imgCompress(imageFile, options);
  return result.result;
}

// 导出类和类型
export { ImageManager };
export type { ImageManagerOptions, ImageProcessResult, ImageInfo };