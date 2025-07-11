/**
 * file 类型定义文件
 *
 * @description 包含库中所有公开的类型定义
 * @author chao921125
 * @date 2024-07-17
 */

// 全局类型声明
declare global {
  var global: any;
}

// 图片格式类型
export type ImageFormat = 'jpeg' | 'jpg' | 'png' | 'webp' | 'gif';

// 图片压缩选项
export interface ImageCompressOptions {
  /**
   * 压缩质量，范围 0-1，默认 0.8
   */
  quality?: number;
  
  /**
   * 最大宽度，如果指定则按比例缩放
   */
  maxWidth?: number;
  
  /**
   * 最大高度，如果指定则按比例缩放
   */
  maxHeight?: number;
  
  /**
   * 输出格式，默认与原图相同
   */
  format?: ImageFormat;
}

// 图片转换选项
export interface ImageConvertOptions {
  /**
   * 输出格式
   */
  format: ImageFormat;
  
  /**
   * 输出质量，范围 0-1，默认 0.9
   */
  quality?: number;
}

// 文件类型检查结果
export interface FileTypeResult {
  /**
   * 是否为图片文件
   */
  isImage: boolean;
  
  /**
   * 是否为音频文件
   */
  isAudio: boolean;
  
  /**
   * 是否为视频文件
   */
  isVideo: boolean;
  
  /**
   * MIME 类型
   */
  mimeType: string;
  
  /**
   * 文件扩展名
   */
  extension: string;
}

// 文件操作函数
export declare function urlToBase64(url: string): Promise<string>;
export declare function blobToBase64(blob: Blob): Promise<string>;
export declare function fileToBase64(file: File): Promise<string>;
export declare function base64ToBlob(base64: string): Blob;
export declare function base64ToFile(base64: string, filename?: string): File;
export declare function fileToBlob(file: File): Blob;
export declare function blobToFile(blob: Blob, filename?: string): File;

// 图片操作函数
export declare function blobToDataURL(blob: Blob): Promise<string>;
export declare function imageToDataURL(image: HTMLImageElement, format?: ImageFormat, quality?: number): string;
export declare function dataURLToImage(dataURL: string): Promise<HTMLImageElement>;
export declare function dataURLtoBlob(dataURL: string): Blob;
export declare function dataURLtoImgBlob(dataURL: string): Blob;
export declare function dataURLtoFile(dataURL: string, filename?: string): File;
export declare function imgConvert(imageFile: File, options: ImageConvertOptions): Promise<File>;
export declare function imgCompress(imageFile: File, options?: ImageCompressOptions): Promise<File>;

// 工具函数
export declare function isBase64(str: string): boolean;
export declare function isBlob(obj: any): obj is Blob;
export declare function isFile(obj: any): obj is File;
export declare function getFileExtension(filename: string): string;
export declare function getMimeTypeFromExtension(extension: string): string;
export declare function getExtensionFromMimeType(mimeType: string): string;
export declare function checkFileType(file: File | string): FileTypeResult;
export declare function generateRandomFileName(extension?: string): string;
export declare function getMimeTypeFromDataURL(dataURL: string): string;
export declare function getBase64FromDataURL(dataURL: string): string;
export declare function delay(ms: number): Promise<void>;