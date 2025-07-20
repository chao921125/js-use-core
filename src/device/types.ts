/**
 * 设备检测相关类型定义
 */

/**
 * 移动设备检测选项
 */
export interface MobileDetectOptions {
  /** 自定义用户代理字符串或包含user-agent的headers对象 */
  ua?: string | { headers: { 'user-agent': string } };
  /** 是否将平板视为移动设备 */
  tablet?: boolean;
  /** 是否使用特性检测（如触摸点检测） */
  featureDetect?: boolean;
}

/**
 * 设备类型枚举
 */
export enum DeviceType {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop'
}

/**
 * 操作系统类型
 */
export enum OSType {
  WINDOWS = 'windows',
  MACOS = 'macos',
  LINUX = 'linux',
  ANDROID = 'android',
  IOS = 'ios',
  UNKNOWN = 'unknown'
}

/**
 * 浏览器类型
 */
export enum BrowserType {
  CHROME = 'chrome',
  FIREFOX = 'firefox',
  SAFARI = 'safari',
  EDGE = 'edge',
  IE = 'ie',
  OPERA = 'opera',
  UNKNOWN = 'unknown'
}

/**
 * 设备信息接口
 */
export interface DeviceInfo {
  /** 设备类型 */
  type: DeviceType;
  /** 操作系统 */
  os: OSType;
  /** 浏览器类型 */
  browser: BrowserType;
  /** 是否为移动设备 */
  isMobile: boolean;
  /** 是否为平板设备 */
  isTablet: boolean;
  /** 是否为桌面设备 */
  isDesktop: boolean;
  /** 是否支持触摸 */
  isTouchDevice: boolean;
  /** 用户代理字符串 */
  userAgent: string;
  /** 屏幕信息 */
  screen: {
    width: number;
    height: number;
    pixelRatio: number;
  };
}

/**
 * 屏幕方向
 */
export enum ScreenOrientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape'
}

/**
 * 网络连接类型
 */
export enum NetworkType {
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  ETHERNET = 'ethernet',
  UNKNOWN = 'unknown'
}