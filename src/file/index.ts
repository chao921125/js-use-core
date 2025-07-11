/**
 * 文件操作相关函数
 */
import { getExtensionFromMimeType, getMimeTypeFromDataURL, generateRandomFileName } from '../utils';

/**
 * URL转Base64
 * @param url 文件URL
 * @returns Promise<string> Base64字符串
 */
export async function urlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await blobToBase64(blob);
  } catch (error) {
    throw new Error(`URL转Base64失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Blob转Base64
 * @param blob Blob对象
 * @returns Promise<string> Base64字符串
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('FileReader结果不是字符串'));
      }
    };
    reader.onerror = () => reject(new Error('Blob转Base64失败'));
    reader.readAsDataURL(blob);
  });
}

/**
 * 文件转Base64
 * @param file 文件对象
 * @returns Promise<string> Base64字符串
 */
export function fileToBase64(file: File): Promise<string> {
  return blobToBase64(file);
}

/**
 * Base64转Blob
 * @param base64 Base64字符串
 * @returns Blob对象
 */
export function base64ToBlob(base64: string): Blob {
  // 如果是DataURL格式，提取MIME类型和Base64数据
  let contentType = 'application/octet-stream';
  let b64Data = base64;
  
  if (base64.startsWith('data:')) {
    contentType = getMimeTypeFromDataURL(base64) || contentType;
    const parts = base64.split(',');
    b64Data = parts[1];
  }
  
  const byteCharacters = atob(b64Data);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: contentType });
}

/**
 * Base64转文件
 * @param base64 Base64字符串
 * @param filename 文件名（可选，如果不提供则生成随机文件名）
 * @returns File对象
 */
export function base64ToFile(base64: string, filename?: string): File {
  const blob = base64ToBlob(base64);
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
 * 文件转Blob
 * @param file 文件对象
 * @returns Blob对象
 */
export function fileToBlob(file: File): Blob {
  return new Blob([file], { type: file.type });
}

/**
 * Blob转文件
 * @param blob Blob对象
 * @param filename 文件名（可选，如果不提供则生成随机文件名）
 * @returns File对象
 */
export function blobToFile(blob: Blob, filename?: string): File {
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