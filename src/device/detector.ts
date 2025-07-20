/**
 * 设备检测核心功能
 */

import type { MobileDetectOptions } from './types';
import { DeviceType, OSType, BrowserType } from './types';

/**
 * 判断是否是手机
 * 基于 `https://github.com/matthewhudson/current-device`
 * @param opts 配置选项
 * @returns 是否是手机
 */
export function isMobile(opts?: MobileDetectOptions): boolean {
  const mobileRE =
    /(android|bb\d+|meego).+mobile|armv7l|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series[46]0|samsungbrowser.*mobile|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i;
  const notMobileRE = /CrOS/;
  const tabletRE = /android|ipad|playbook|silk/i;
  
  if (!opts) opts = {};
  let ua = opts.ua;
  if (!ua && typeof navigator !== "undefined") ua = navigator.userAgent;
  if (ua && typeof ua === 'object' && ua.headers && typeof ua.headers["user-agent"] === "string") {
    ua = ua.headers["user-agent"];
  }
  if (typeof ua !== "string") return false;

  let result = (mobileRE.test(ua) && !notMobileRE.test(ua)) || (!!opts.tablet && tabletRE.test(ua));

  // iPad Pro的特殊检测：新版iPad在macOS上使用Safari浏览器时，会显示为桌面浏览器
  // 但可以通过触摸点检测识别
  if (!result && opts.tablet && opts.featureDetect && 
      typeof navigator !== "undefined" && 
      navigator.maxTouchPoints > 1 && 
      ua.indexOf("Macintosh") !== -1 && 
      ua.indexOf("Safari") !== -1) {
    result = true;
  }
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
  
  // 先检测移动设备操作系统，避免被 macOS 匹配
  if (/iphone|ipad|ipod/i.test(userAgent)) return OSType.IOS;
  if (/android/i.test(userAgent)) return OSType.ANDROID;
  
  // 再检测桌面操作系统
  if (/windows/i.test(userAgent)) return OSType.WINDOWS;
  if (/macintosh|mac os x/i.test(userAgent)) return OSType.MACOS;
  if (/linux/i.test(userAgent)) return OSType.LINUX;
  
  return OSType.UNKNOWN;
}

/**
 * 检测浏览器类型
 * @param ua 用户代理字符串
 * @returns 浏览器类型
 */
export function detectBrowser(ua?: string): BrowserType {
  const userAgent = ua || (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  
  if (/edg/i.test(userAgent)) return BrowserType.EDGE;
  if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) return BrowserType.CHROME;
  if (/firefox/i.test(userAgent)) return BrowserType.FIREFOX;
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return BrowserType.SAFARI;
  if (/msie|trident/i.test(userAgent)) return BrowserType.IE;
  if (/opera|opr/i.test(userAgent)) return BrowserType.OPERA;
  
  return BrowserType.UNKNOWN;
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