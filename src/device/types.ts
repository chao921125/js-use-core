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
 * 设备检测器配置选项
 */
export interface DeviceDetectorOptions extends MobileDetectOptions {
  /** 是否启用调试模式 */
  debug?: boolean;
  /** 操作超时时间（毫秒） */
  timeout?: number;
  /** 失败重试次数 */
  retries?: number;
  /** 是否启用缓存 */
  cache?: boolean;
  /** 缓存过期时间（毫秒） */
  cacheTTL?: number;
  /** 是否启用性能监控 */
  enablePerformanceMonitoring?: boolean;
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

/**
 * 设备性能信息
 */
export interface DevicePerformanceInfo {
  /** 性能等级 */
  level: 'low' | 'medium' | 'high' | 'unknown';
  /** 性能分数 */
  score: number;
  /** 内存大小（GB） */
  memory: number;
  /** CPU核心数 */
  cores: number;
  /** GPU信息 */
  gpu: {
    vendor: string;
    renderer: string;
  } | null;
}

/**
 * 设备能力信息
 */
export interface DeviceCapabilities {
  /** 触摸支持 */
  touch: boolean;
  /** WebGL支持 */
  webgl: boolean;
  /** WebGL2支持 */
  webgl2: boolean;
  /** WebAssembly支持 */
  webassembly: boolean;
  /** Service Worker支持 */
  serviceWorker: boolean;
  /** Web Workers支持 */
  webWorkers: boolean;
  /** 地理位置支持 */
  geolocation: boolean;
  /** 摄像头支持 */
  camera: boolean;
  /** 麦克风支持 */
  microphone: boolean;
  /** 通知支持 */
  notifications: boolean;
  /** 震动支持 */
  vibration: boolean;
  /** 电池API支持 */
  battery: boolean;
  /** 设备运动支持 */
  deviceMotion: boolean;
  /** 设备方向支持 */
  deviceOrientation: boolean;
}