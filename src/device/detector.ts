/**
 * 设备检测核心功能
 */

import type { MobileDetectOptions } from './types';
import { DeviceType, OSType, BrowserType } from './types';

// 缓存检测结果
const detectionCache = new Map<string, { result: boolean; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

/**
 * 清理过期的缓存项
 */
function cleanupCache(): void {
  const now = Date.now();
  for (const [key, value] of detectionCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      detectionCache.delete(key);
    }
  }
}

/**
 * 获取缓存的检测结果
 */
function getCachedResult(key: string): boolean | null {
  cleanupCache();
  const cached = detectionCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }
  return null;
}

/**
 * 设置缓存的检测结果
 */
function setCachedResult(key: string, result: boolean): void {
  detectionCache.set(key, { result, timestamp: Date.now() });
}

/**
 * 判断是否是手机
 * 基于 `https://github.com/matthewhudson/current-device` 并进行了优化
 * @param opts 配置选项
 * @returns 是否是手机
 */
export function isMobile(opts?: MobileDetectOptions): boolean {
  if (!opts) opts = {};
  let ua = opts.ua;
  if (!ua && typeof navigator !== "undefined") ua = navigator.userAgent;
  if (ua && typeof ua === 'object' && ua.headers && typeof ua.headers["user-agent"] === "string") {
    ua = ua.headers["user-agent"];
  }
  if (typeof ua !== "string") return false;

  // 生成缓存键
  const cacheKey = `mobile_${ua}_${!!opts.tablet}_${!!opts.featureDetect}`;
  const cached = getCachedResult(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // 更精确的移动设备正则表达式
  const mobileRE = /(android|bb\d+|meego).+mobile|armv7l|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series[46]0|samsungbrowser.*mobile|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android.+mobile/i;
  
  // 排除的设备（如Chrome OS）
  const notMobileRE = /CrOS|Windows NT/;
  
  // 平板设备检测
  const tabletRE = /android(?!.*mobile)|ipad|playbook|silk|kindle/i;
  
  let result = (mobileRE.test(ua) && !notMobileRE.test(ua)) || (!!opts.tablet && tabletRE.test(ua));

  // 增强的iPad Pro检测
  if (!result && opts.featureDetect && typeof navigator !== "undefined") {
    // 检测iPad Pro（在macOS上使用Safari时）
    if (navigator.maxTouchPoints > 1 && 
        ua.indexOf("Macintosh") !== -1 && 
        ua.indexOf("Safari") !== -1 &&
        !ua.indexOf("Chrome") !== -1) {
      result = !!opts.tablet;
    }
    
    // 检测其他触摸设备
    if (!result && navigator.maxTouchPoints > 0) {
      // 检查屏幕尺寸来区分手机和平板
      if (typeof window !== 'undefined') {
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const minDimension = Math.min(screenWidth, screenHeight);
        const maxDimension = Math.max(screenWidth, screenHeight);
        
        // 手机通常较小
        if (minDimension < 768 && maxDimension < 1024) {
          result = true;
        }
        // 平板尺寸
        else if (opts.tablet && minDimension >= 768) {
          result = true;
        }
      }
    }
  }

  // 缓存结果
  setCachedResult(cacheKey, result);
  return result;
}

/**
 * 判断是否是平板
 * @param opts 配置选项
 * @returns 是否是平板
 */
export function isTablet(opts?: Omit<MobileDetectOptions, 'tablet'>): boolean {
  return isMobile({ ...opts, tablet: true }) && !isMobile(opts);
}

/**
 * 判断是否是桌面设备
 * @param opts 配置选项
 * @returns 是否是桌面设备
 */
export function isDesktop(opts?: MobileDetectOptions): boolean {
  return !isMobile({ ...opts, tablet: true });
}

/**
 * 获取设备类型
 * @param opts 配置选项
 * @returns 设备类型
 */
export function getDeviceType(opts?: MobileDetectOptions): DeviceType {
  if (isTablet(opts)) return DeviceType.TABLET;
  if (isMobile(opts)) return DeviceType.MOBILE;
  return DeviceType.DESKTOP;
}

/**
 * 检测操作系统
 * @param ua 用户代理字符串
 * @returns 操作系统类型
 */
export function detectOS(ua?: string): OSType {
  const userAgent = ua || (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  
  // 生成缓存键
  const cacheKey = `os_${userAgent}`;
  const cached = getCachedResult(cacheKey);
  if (cached !== null) {
    return cached as OSType;
  }
  
  let result: OSType;
  
  // 更精确的操作系统检测
  // 先检测移动设备操作系统，避免被 macOS 匹配
  if (/iphone|ipad|ipod/i.test(userAgent)) {
    result = OSType.IOS;
  } else if (/android/i.test(userAgent)) {
    result = OSType.ANDROID;
  }
  // 检测桌面操作系统
  else if (/windows nt|win32|win64|wow64/i.test(userAgent)) {
    result = OSType.WINDOWS;
  } else if (/macintosh|mac os x|darwin/i.test(userAgent)) {
    // 排除iOS设备伪装成macOS的情况
    if (!/iphone|ipad|ipod/i.test(userAgent)) {
      result = OSType.MACOS;
    } else {
      result = OSType.IOS;
    }
  } else if (/linux|x11/i.test(userAgent) && !/android/i.test(userAgent)) {
    result = OSType.LINUX;
  } else if (/cros/i.test(userAgent)) {
    // Chrome OS 特殊处理
    result = OSType.LINUX;
  } else {
    result = OSType.UNKNOWN;
  }
  
  // 缓存结果（使用字符串形式缓存）
  detectionCache.set(cacheKey, { result: result as any, timestamp: Date.now() });
  return result;
}

/**
 * 检测浏览器类型
 * @param ua 用户代理字符串
 * @returns 浏览器类型
 */
export function detectBrowser(ua?: string): BrowserType {
  const userAgent = ua || (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  
  // 生成缓存键
  const cacheKey = `browser_${userAgent}`;
  const cached = getCachedResult(cacheKey);
  if (cached !== null) {
    return cached as BrowserType;
  }
  
  let result: BrowserType;
  
  // 更精确的浏览器检测，按优先级排序
  if (/edg(?:e|ios|a)?/i.test(userAgent)) {
    result = BrowserType.EDGE;
  } else if (/opr\/|opera/i.test(userAgent)) {
    result = BrowserType.OPERA;
  } else if (/chrome|crios|crmo/i.test(userAgent) && !/edg/i.test(userAgent)) {
    result = BrowserType.CHROME;
  } else if (/firefox|fxios/i.test(userAgent)) {
    result = BrowserType.FIREFOX;
  } else if (/safari/i.test(userAgent) && !/chrome|crios|crmo|edg|opr|opera/i.test(userAgent)) {
    result = BrowserType.SAFARI;
  } else if (/msie|trident/i.test(userAgent)) {
    result = BrowserType.IE;
  } else {
    result = BrowserType.UNKNOWN;
  }
  
  // 缓存结果
  detectionCache.set(cacheKey, { result: result as any, timestamp: Date.now() });
  return result;
}

/**
 * 检测是否为触摸设备
 * @returns 是否支持触摸
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
}

/**
 * 检测是否为 Retina 屏幕
 * @returns 是否为高分辨率屏幕
 */
export function isRetinaDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.devicePixelRatio > 1;
}

/**
 * 检测是否为暗色主题
 * @returns 是否为暗色主题
 */
export function isDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * 检测是否支持 WebP 格式
 * @returns Promise<boolean> 是否支持 WebP
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * 检测是否支持 AVIF 格式
 * @returns Promise<boolean> 是否支持 AVIF
 */
export function supportsAVIF(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    
    const avif = new Image();
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2);
    };
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
}

/**
 * 清除检测缓存
 */
export function clearDetectionCache(): void {
  detectionCache.clear();
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats(): { size: number; keys: string[] } {
  cleanupCache();
  return {
    size: detectionCache.size,
    keys: Array.from(detectionCache.keys())
  };
}

/**
 * 改进的移动设备检测逻辑
 * 结合用户代理和特征检测
 */
export function enhancedMobileDetection(opts?: MobileDetectOptions): {
  isMobile: boolean;
  isTablet: boolean;
  confidence: number;
  method: 'userAgent' | 'featureDetection' | 'hybrid';
} {
  if (!opts) opts = {};
  
  let ua = opts.ua;
  if (!ua && typeof navigator !== "undefined") ua = navigator.userAgent;
  if (ua && typeof ua === 'object' && ua.headers && typeof ua.headers["user-agent"] === "string") {
    ua = ua.headers["user-agent"];
  }
  if (typeof ua !== "string") {
    return { isMobile: false, isTablet: false, confidence: 0, method: 'userAgent' };
  }

  // 基于用户代理的检测
  const uaResult = {
    isMobile: isMobile(opts),
    isTablet: isTablet(opts)
  };

  // 如果不启用特征检测，直接返回用户代理结果
  if (!opts.featureDetect || typeof window === 'undefined') {
    return {
      ...uaResult,
      confidence: 0.8,
      method: 'userAgent'
    };
  }

  // 特征检测
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const minDimension = Math.min(screenWidth, screenHeight);
  const maxDimension = Math.max(screenWidth, screenHeight);
  const pixelRatio = window.devicePixelRatio || 1;

  // 基于屏幕尺寸的判断
  let featureResult = {
    isMobile: false,
    isTablet: false
  };

  if (hasTouch) {
    // 手机尺寸范围
    if (minDimension <= 480 && maxDimension <= 896) {
      featureResult.isMobile = true;
    }
    // 平板尺寸范围
    else if (minDimension >= 768 && minDimension <= 1024) {
      featureResult.isTablet = true;
    }
    // 大屏手机或小平板的边界情况
    else if (minDimension > 480 && minDimension < 768) {
      // 根据像素密度判断
      if (pixelRatio >= 2) {
        featureResult.isMobile = true;
      } else {
        featureResult.isTablet = true;
      }
    }
  }

  // 混合判断
  const finalResult = {
    isMobile: uaResult.isMobile || featureResult.isMobile,
    isTablet: uaResult.isTablet || featureResult.isTablet,
    confidence: 0.9,
    method: 'hybrid' as const
  };

  // 如果用户代理和特征检测结果一致，提高置信度
  if (uaResult.isMobile === featureResult.isMobile && 
      uaResult.isTablet === featureResult.isTablet) {
    finalResult.confidence = 0.95;
  }

  return finalResult;
}