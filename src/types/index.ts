/**
 * 类型定义
 */

/**
 * 图片格式类型
 */
export type ImageFormat = 'jpeg' | 'png' | 'gif' | 'webp';

/**
 * 图片压缩选项
 */
export interface ImageCompressOptions {
  /** 压缩质量，范围0-1，默认0.8 */
  quality?: number;
  /** 最大宽度，如果指定则按比例缩放 */
  maxWidth?: number;
  /** 最大高度，如果指定则按比例缩放 */
  maxHeight?: number;
  /** 输出格式，默认与原图相同 */
  format?: ImageFormat;
}

/**
 * 图片转换选项
 */
export interface ImageConvertOptions {
  /** 输出格式 */
  format: ImageFormat;
  /** 输出质量，范围0-1，默认0.9 */
  quality?: number;
}

/**
 * 文件类型检查结果
 */
export interface FileTypeResult {
  /** 是否为图片 */
  isImage: boolean;
  /** 是否为音频 */
  isAudio: boolean;
  /** 是否为视频 */
  isVideo: boolean;
  /** 文件MIME类型 */
  mimeType: string;
  /** 文件扩展名 */
  extension: string;
}