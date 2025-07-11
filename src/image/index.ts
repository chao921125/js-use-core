/**
 * 图片操作相关函数
 */
import { ImageCompressOptions, ImageConvertOptions, ImageFormat } from '../types';
import { getExtensionFromMimeType, getMimeTypeFromExtension, generateRandomFileName } from '../utils/file';
import { base64ToBlob, blobToFile } from '../file';

/**
 * Blob转DataURL
 * @param blob Blob对象
 * @returns Promise<string> DataURL字符串
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('FileReader结果不是字符串'));
      }
    };
    reader.onerror = () => reject(new Error('Blob转DataURL失败'));
    reader.readAsDataURL(blob);
  });
}

/**
 * 图片转DataURL
 * @param image HTMLImageElement对象
 * @param format 输出格式，默认为'jpeg'
 * @param quality 输出质量，范围0-1，默认为0.9
 * @returns DataURL字符串
 */
export function imageToDataURL(
  image: HTMLImageElement,
  format: ImageFormat = 'jpeg',
  quality: number = 0.9
): string {
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

/**
 * DataURL转图片
 * @param dataURL DataURL字符串
 * @returns Promise<HTMLImageElement> 图片元素
 */
export function dataURLToImage(dataURL: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('DataURL转图片失败'));
    img.src = dataURL;
  });
}

/**
 * DataURL转Blob
 * @param dataURL DataURL字符串
 * @returns Blob对象
 */
export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * DataURL转图片Blob
 * @param dataURL DataURL字符串
 * @returns Blob对象，MIME类型为图片类型
 */
export function dataURLtoImgBlob(dataURL: string): Blob {
  const blob = dataURLtoBlob(dataURL);
  if (!blob.type.startsWith('image/')) {
    throw new Error('提供的DataURL不是图片格式');
  }
  return blob;
}

/**
 * DataURL转文件
 * @param dataURL DataURL字符串
 * @param filename 文件名（可选，如果不提供则生成随机文件名）
 * @returns File对象
 */
export function dataURLtoFile(dataURL: string, filename?: string): File {
  const blob = dataURLtoBlob(dataURL);
  let mimeType = blob.type || 'application/octet-stream';
  let extension = getExtensionFromMimeType(mimeType);
  
  // 如果没有提供文件名，则生成随机文件名
  if (!filename) {
    filename = generateRandomFileName(extension);
  } else if (!filename.includes('.') && extension) {
    // 如果提供的文件名没有扩展名，则添加扩展名
    filename = `${filename}.${extension}`;
  }
  
  return new File([blob], filename, { type: mimeType });
}

/**
 * 图片格式转换
 * @param imageFile 图片文件
 * @param options 转换选项
 * @returns Promise<File> 转换后的文件
 */
export async function imgConvert(
  imageFile: File,
  options: ImageConvertOptions
): Promise<File> {
  if (!imageFile.type.startsWith('image/')) {
    throw new Error('提供的文件不是图片格式');
  }
  
  const { format, quality = 0.9 } = options;
  const mimeType = getMimeTypeFromExtension(format);
  
  if (!mimeType) {
    throw new Error(`不支持的图片格式: ${format}`);
  }
  
  // 创建图片元素
  const img = await createImageFromFile(imageFile);
  
  // 创建canvas并绘制图片
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建canvas 2d上下文');
  }
  
  ctx.drawImage(img, 0, 0);
  
  // 转换为指定格式
  const dataURL = canvas.toDataURL(mimeType, quality);
  
  // 生成新文件名，保持原文件名但更改扩展名
  let newFilename = imageFile.name;
  const dotIndex = newFilename.lastIndexOf('.');
  if (dotIndex !== -1) {
    newFilename = newFilename.substring(0, dotIndex);
  }
  newFilename = `${newFilename}.${format}`;
  
  // 转换为文件
  return dataURLtoFile(dataURL, newFilename);
}

/**
 * 图片压缩
 * @param imageFile 图片文件
 * @param options 压缩选项
 * @returns Promise<File> 压缩后的文件
 */
export async function imgCompress(
  imageFile: File,
  options: ImageCompressOptions = {}
): Promise<File> {
  if (!imageFile.type.startsWith('image/')) {
    throw new Error('提供的文件不是图片格式');
  }
  
  const {
    quality = 0.8,
    maxWidth,
    maxHeight,
    format
  } = options;
  
  // 确定输出MIME类型
  let outputMimeType = imageFile.type;
  if (format) {
    outputMimeType = getMimeTypeFromExtension(format) || imageFile.type;
  }
  
  // 创建图片元素
  const img = await createImageFromFile(imageFile);
  
  // 计算新尺寸
  let width = img.naturalWidth;
  let height = img.naturalHeight;
  
  if (maxWidth && width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  
  if (maxHeight && height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }
  
  // 创建canvas并绘制图片
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建canvas 2d上下文');
  }
  
  ctx.drawImage(img, 0, 0, width, height);
  
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
  return dataURLtoFile(dataURL, newFilename);
}

/**
 * 从文件创建图片元素
 * @param file 图片文件
 * @returns Promise<HTMLImageElement> 图片元素
 */
async function createImageFromFile(file: File): Promise<HTMLImageElement> {
  const dataURL = await blobToDataURL(file);
  return await dataURLToImage(dataURL);
}