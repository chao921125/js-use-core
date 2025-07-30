/**
 * 文件操作工具函数
 */
import { FileTypeResult, FileType } from '../types';

/**
 * 检查是否为Base64字符串
 * @param str 要检查的字符串
 * @returns 是否为Base64字符串
 */
export function isBase64(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  // Base64字符串通常以data:开头，后面跟着MIME类型和base64标识
  if (str.indexOf('data:') === 0) {
    return str.indexOf('base64') !== -1;
  }
  // 检查是否符合Base64编码规则
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}

/**
 * 检查是否为Blob对象
 * @param obj 要检查的对象
 * @returns 是否为Blob对象
 */
export function isBlob(obj: any): obj is Blob {
  return obj instanceof Blob;
}

/**
 * 检查是否为File对象
 * @param obj 要检查的对象
 * @returns 是否为File对象
 */
export function isFile(obj: any): obj is File {
  return obj instanceof File;
}

/**
 * 获取文件扩展名
 * @param filename 文件名
 * @returns 文件扩展名（小写，不包含点）
 */
export function getFileExtension(filename: string): string {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

/**
 * 根据MIME类型获取文件扩展名
 * @param mimeType MIME类型
 * @returns 文件扩展名（不包含点）
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/ogg': 'ogv',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
    'text/html': 'html',
    'text/css': 'css',
    'text/javascript': 'js',
    'application/json': 'json',
  };
  
  return mimeMap[mimeType] || '';
}

/**
 * 根据文件扩展名获取MIME类型
 * @param extension 文件扩展名（不包含点）
 * @returns MIME类型
 */
export function getMimeTypeFromExtension(extension: string): string {
  const extMap: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogv': 'video/ogg',
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'text/javascript',
    'json': 'application/json',
  };
  
  return extMap[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * 检查文件类型
 * @param file 文件对象或文件名
 * @returns 文件类型检查结果
 */
export function checkFileType(file: File | string): FileTypeResult {
  let mimeType = '';
  let extension = '';
  
  if (typeof file === 'string') {
    // 如果是字符串，当作文件名处理
    extension = getFileExtension(file);
    mimeType = getMimeTypeFromExtension(extension);
  } else {
    // 如果是File对象
    mimeType = file.type || '';
    extension = file.name ? getFileExtension(file.name) : getExtensionFromMimeType(mimeType);
  }
  
  const isImage = mimeType.startsWith('image/');
  const isAudio = mimeType.startsWith('audio/');
  const isVideo = mimeType.startsWith('video/');
  const isDocument = mimeType.startsWith('application/') || mimeType.startsWith('text/');
  
  // 确定文件类型
  let type: FileType;
  if (isImage) {
    type = FileType.IMAGE;
  } else if (isAudio) {
    type = FileType.AUDIO;
  } else if (isVideo) {
    type = FileType.VIDEO;
  } else if (isDocument) {
    type = FileType.DOCUMENT;
  } else if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) {
    type = FileType.ARCHIVE;
  } else if (mimeType.includes('javascript') || mimeType.includes('json') || extension === 'js' || extension === 'ts') {
    type = FileType.CODE;
  } else {
    type = FileType.OTHER;
  }
  
  return {
    isImage,
    isAudio,
    isVideo,
    isDocument,
    type,
    mimeType,
    extension,
    isSupported: true // 默认支持所有类型
  };
}

/**
 * 生成随机文件名
 * @param extension 文件扩展名（不包含点）
 * @returns 随机文件名
 */
export function generateRandomFileName(extension: string = ''): string {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return `file_${timestamp}_${random}${extension ? '.' + extension : ''}`;
}

/**
 * 从DataURL中提取MIME类型
 * @param dataURL DataURL字符串
 * @returns MIME类型
 */
export function getMimeTypeFromDataURL(dataURL: string): string {
  const regex = /^data:([\w\/+]+);base64,/;
  const matches = dataURL.match(regex);
  return matches && matches.length > 1 ? matches[1] : '';
}

/**
 * 从DataURL中提取Base64数据部分
 * @param dataURL DataURL字符串
 * @returns Base64数据部分
 */
export function getBase64FromDataURL(dataURL: string): string {
  return dataURL.split(',')[1] || '';
}

/**
 * 延迟执行函数
 * @param ms 延迟毫秒数
 * @returns Promise对象
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
} 