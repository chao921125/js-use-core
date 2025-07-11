import Font, { FontOptions, FontCheckResult, FontLoadResult } from '../font';

// 全局字体检查器实例
let globalFont: Font | null = null;

/**
 * 获取或创建全局字体检查器实例
 */
function getGlobalFont(options?: FontOptions): Font {
  if (!globalFont) {
    globalFont = new Font(options);
  } else if (options) {
    // 如果已有实例但传入了新的选项，则更新实例的选项
    if (options.timeout && options.timeout !== globalFont['options'].timeout) {
      // 创建一个新的实例，使用新的超时设置
      globalFont = new Font(options);
    }
  }
  return globalFont;
}

/**
 * 创建字体检查器实例
 */
export function createFont(options?: FontOptions): Font {
  return new Font(options);
}

/**
 * 检查单个字体是否已加载
 */
export async function checkFont(fontName: string, options?: FontOptions): Promise<FontCheckResult> {
  const checker = getGlobalFont(options);
  const result = await checker.check(fontName);
  
  // 从allFonts中查找对应字体的结果
  const fontResult = result.allFonts.find(font => font.name === fontName);
  if (fontResult) {
    return fontResult;
  }
  
  // 额外检查：如果document.fonts.check返回false，则认为字体未加载
  if (document.fonts && !document.fonts.check(`12px '${fontName}'`)) {
    return { name: fontName, loaded: false, status: 'unloaded' };
  }
  
  // 如果没有找到字体结果，说明字体已加载
  return { name: fontName, loaded: true, status: 'loaded' };
}

/**
 * 检查多个字体是否已加载
 */
export async function checkFonts(fontNames: string[], options?: FontOptions): Promise<FontLoadResult> {
  // 单独检查每个字体
  const results = await Promise.all(fontNames.map(name => checkFont(name, options)));
  
  // 查找加载失败的字体
  const failedFonts = results.filter(font => !font.loaded);
  
  return {
    success: failedFonts.length === 0,
    allFonts: results,
    ...(failedFonts.length > 0 ? { failedFonts } : {})
  };
}

/**
 * 动态添加字体
 * @param fontName 字体名称
 * @param url 字体文件URL地址
 * @param options 可选的FontFace配置选项
 * @returns 布尔值，表示是否添加成功
 */
export function addFont(fontName: string, url: string, options?: FontFaceDescriptors, checkerOptions?: FontOptions): boolean {
  const checker = getGlobalFont(checkerOptions);
  return checker.addFont(fontName, url, options);
}

/**
 * 动态添加字体（使用FontFace对象）
 * @param font FontFace 对象
 * @returns 布尔值，表示是否添加成功
 */
export function addFontFace(font: FontFace, options?: FontOptions): boolean {
  const checker = getGlobalFont(options);
  return checker.addFontFace(font);
}

/**
 * 删除字体
 * @param font FontFace对象或字体名称
 * @param options 字体检查器选项
 * @returns 布尔值，表示是否删除成功
 */
export function deleteFont(font: FontFace | string, options?: FontOptions): boolean {
  const checker = getGlobalFont(options);
  return checker.deleteFont(font);
}

/**
 * 清除所有动态添加的字体
 */
export function clearFonts(options?: FontOptions): boolean {
  const checker = getGlobalFont(options);
  return checker.clearFonts();
}

/**
 * 检查字体是否已加载（同步方法）
 */
export function isFontLoaded(fontName: string): boolean {
  if (!document.fonts) {
    return false;
  }
  return document.fonts.check(`12px '${fontName}'`);
}

/**
 * 等待字体加载完成
 */
export async function waitForFonts(fontNames: string[], timeout?: number): Promise<FontLoadResult> {
  const checker = getGlobalFont({ timeout });
  return await checker.check(fontNames);
}

/**
 * 添加字体并监听加载状态
 * @param fontName 字体名称
 * @param url 字体文件URL地址
 * @param options 可选的FontFace配置选项
 * @param onSuccess 加载成功回调
 * @param onError 加载失败回调
 * @returns 布尔值，表示是否成功添加字体（注意：这不代表字体已加载成功）
 */
export function loadFont(
  fontName: string, 
  url: string, 
  options?: FontFaceDescriptors, 
  onSuccess?: () => void,
  onError?: (error: any, isCORSError: boolean) => void
): boolean {
  try {
    if (!document.fonts) {
      console.error('当前环境不支持 CSS Font Loading API');
      return false;
    }
    
    if (typeof FontFace !== 'function') {
      console.error('当前环境不支持 FontFace API');
      return false;
    }
    
    // 创建FontFace对象
    const fontFace = new FontFace(fontName, `url(${url})`, options);
    
    // 使用全局Font实例添加字体
    const checker = getGlobalFont();
    const added = checker.addFontFace(fontFace);
    
    if (!added) {
      if (onError) onError(new Error('添加字体失败'), false);
      return false;
    }
    
    // 尝试加载字体
    fontFace.load().then(() => {
      if (onSuccess) onSuccess();
      console.log(`字体 ${fontName} 加载成功`);
    }).catch(error => {
      // 检测是否是跨域错误
      const isCORSError = isFontCORSError(error);
      
      if (isCORSError) {
        console.error(`字体 ${fontName} 加载失败: 跨域资源共享(CORS)错误`);
        console.error('请确保字体服务器设置了正确的CORS头部: Access-Control-Allow-Origin');
      } else {
        console.warn(`字体 ${fontName} 加载失败:`, error);
      }
      
      if (onError) onError(error, isCORSError);
    });
    
    return true;
  } catch (error) {
    console.error('添加字体失败:', error);
    if (onError) onError(error, false);
    return false;
  }
}

/**
 * 检查URL是否可能存在跨域问题
 * @param url 要检查的URL
 * @returns 是否可能存在跨域问题
 */
export function isCrossDomainUrl(url: string): boolean {
  // 如果是相对路径，则不存在跨域问题
  if (url.startsWith('/') && !url.startsWith('//')) {
    return false;
  }
  
  try {
    // 如果是绝对路径，检查域名是否不同
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
      const urlObj = new URL(url.startsWith('//') ? `https:${url}` : url);
      const currentLocation = window.location;
      
      // 比较域名和端口
      return urlObj.hostname !== currentLocation.hostname || 
             urlObj.port !== currentLocation.port || 
             urlObj.protocol !== currentLocation.protocol;
    }
    
    return false;
  } catch (e) {
    // 如果URL解析错误，保守起见返回true
    return true;
  }
}

/**
 * 检查错误是否是CORS相关错误
 * @param error 错误对象
 * @returns 是否是CORS错误
 */
export function isFontCORSError(error: any): boolean {
  if (!error) return false;
  
  // 将错误转换为字符串进行检查
  const errorString = error.toString().toLowerCase();
  
  // 检查常见的CORS错误标识
  return errorString.includes('cors') || 
         errorString.includes('cross-origin') || 
         errorString.includes('cross origin') ||
         errorString.includes('networkerror') ||
         errorString.includes('access-control-allow-origin');
} 