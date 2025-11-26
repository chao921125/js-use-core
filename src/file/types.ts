/**
 * 文件操作相关类型定义
 *
 * @description 包含文件操作相关的类型定义
 * @author chao921125
 * @date 2024-07-17
 */

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

