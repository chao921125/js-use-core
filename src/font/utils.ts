import FontManager from './index';

// 重新定义这些类型以避免循环依赖
export interface FontOptions {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  concurrency?: number;
  detectionThreshold?: number;
}

export interface FontCheckResult {
  name: string;
  loaded: boolean;
  status: string;
  loadTime?: number;
  error?: string;
}

export interface FontLoadResult {
  success: boolean;
  allFonts: FontCheckResult[];
  failedFonts?: FontCheckResult[];
  totalLoadTime?: number;
}

// 全局字体管理器实例
let globalFontManager: FontManager | null = null;

/**
 * 获取或创建全局字体管理器实例
 */
async function getGlobalFontManager(options?: FontOptions): Promise<FontManager> {
  if (!globalFontManager) {
    globalFontManager = new FontManager(options);
    // 自动初始化已在构造函数中处理，但我们等待它完成
    await globalFontManager.ready();
  } else if (options) {
    // 如果已有实例但传入了新的选项，则更新实例的选项
    globalFontManager.updateOptions(options);
  }
  return globalFontManager;
}

/**
 * 创建字体管理器实例
 */
export async function createFont(options?: FontOptions): Promise<FontManager> {
  const fontManager = new FontManager(options);
  // 自动初始化已在构造函数中处理，但我们等待它完成
  await fontManager.ready();
  return fontManager;
}

/**
 * 检查单个字体是否已加载
 */
export async function checkFont(fontName: string, options?: FontOptions): Promise<FontCheckResult> {
  const manager = await getGlobalFontManager(options);
  const result = await manager.check(fontName);
  
  // 从allFonts中查找对应字体的结果
  const fontResult = result.allFonts.find(font => font.name === fontName);
  if (fontResult) {
    return fontResult;
  }
  
  // 如果没有找到字体结果，返回默认结果
  return { name: fontName, loaded: false, status: 'not-found' };
}

/**
 * 检查多个字体是否已加载
 */
export async function checkFonts(fontNames: string[], options?: FontOptions): Promise<FontLoadResult> {
  const manager = await getGlobalFontManager(options);
  return await manager.check(fontNames);
}

/**
 * 动态添加字体
 * @param fontName 字体名称
 * @param url 字体文件URL地址
 * @param options 可选的FontFace配置选项
 * @returns 布尔值，表示是否添加成功
 */
export async function addFont(fontName: string, url: string, options?: FontFaceDescriptors, checkerOptions?: FontOptions): Promise<boolean> {
  const manager = await getGlobalFontManager(checkerOptions);
  return manager.addFont(fontName, url, options);
}

/**
 * 动态添加字体（使用FontFace对象）
 * @param font FontFace 对象
 * @returns 布尔值，表示是否添加成功
 */
export async function addFontFace(font: FontFace, options?: FontOptions): Promise<boolean> {
  const manager = await getGlobalFontManager(options);
  return manager.addFontFace(font);
}

/**
 * 删除字体
 * @param font FontFace对象或字体名称
 * @param options 字体管理器选项
 * @returns 布尔值，表示是否删除成功
 */
export async function deleteFont(font: FontFace | string, options?: FontOptions): Promise<boolean> {
  const manager = await getGlobalFontManager(options);
  return manager.deleteFont(font);
}

/**
 * 清除所有动态添加的字体
 */
export async function clearFonts(options?: FontOptions): Promise<boolean> {
  const manager = await getGlobalFontManager(options);
  return manager.clearFonts();
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
  const manager = await getGlobalFontManager({ timeout });
  return await manager.check(fontNames);
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
export async function loadFont(
  fontName: string, 
  url: string, 
  options?: FontFaceDescriptors, 
  onSuccess?: () => void,
  onError?: (error: any, isCORSError: boolean) => void
): Promise<boolean> {
  try {
    const manager = await getGlobalFontManager();
    
    // 监听字体加载事件
    if (onSuccess) {
      manager.once('fontLoaded', (event) => {
        if (event.fontName === fontName) {
          onSuccess();
        }
      });
    }
    
    if (onError) {
      manager.once('fontLoadError', (event) => {
        if (event.fontName === fontName) {
          onError(event.error, event.type === 'cors');
        }
      });
    }
    
    return manager.addFont(fontName, url, options);
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

/**
 * 批量添加字体
 * @param fonts 字体配置数组
 * @returns 添加结果数组
 */
export async function addFonts(fonts: Array<{
  name: string;
  url: string;
  options?: FontFaceDescriptors;
}>, managerOptions?: FontOptions): Promise<Array<{ name: string; success: boolean; error?: string }>> {
  const manager = await getGlobalFontManager(managerOptions);
  return await manager.addFonts(fonts);
}

/**
 * 预加载字体（检测可用性但不添加到文档）
 * @param fontNames 字体名称数组
 * @param options 字体管理器选项
 * @returns 预加载结果
 */
export async function preloadFonts(fontNames: string[], options?: FontOptions): Promise<{
  available: string[];
  unavailable: string[];
  cached: string[];
}> {
  const manager = await getGlobalFontManager(options);
  return await manager.preloadFonts(fontNames);
}

/**
 * 获取字体管理器性能统计
 * @param options 字体管理器选项
 * @returns 性能统计信息
 */
export async function getFontPerformanceStats(options?: FontOptions): Promise<{
  totalFontsChecked: number;
  cacheHitRate: number;
  averageCheckTime: number;
  loadingFonts: number;
  loadedFonts: number;
  failedFonts: number;
}> {
  const manager = await getGlobalFontManager(options);
  return manager.getPerformanceStats();
}

/**
 * 清理字体管理器缓存和过期状态
 * @param options 字体管理器选项
 */
export async function cleanupFontManager(options?: FontOptions): Promise<void> {
  const manager = await getGlobalFontManager(options);
  manager.cleanup();
}