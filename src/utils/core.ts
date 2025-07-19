/**
 * 核心工具函数
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
 * URL解析结果对象
 */
export interface UrlParseResult {
  /** URL参数键值对 */
  [key: string]: string;
}

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
 * 将URL转为对象
 * @param url URL字符串
 * @returns 解析后的对象
 */
export function urlToObj(url: string): UrlParseResult {
  const obj: UrlParseResult = {};
  if (!url) return obj;

  // 提取查询参数
  url.replace(/([^?=&#]+)=([^?=&#]+)/g, (_, key, value) => {
    // 解码URI组件，处理编码字符
    obj[decodeURIComponent(key)] = decodeURIComponent(value);
    return '';
  });

  // 提取哈希值
  url.replace(/#([^?=&#]+)/g, (_, hash) => {
    obj["HASH"] = decodeURIComponent(hash);
    return '';
  });
  
  return obj;
}

/**
 * 将对象转为URL查询字符串
 * @param obj 要转换的对象
 * @param prefix 前缀，默认为'?'
 * @returns URL查询字符串
 */
export function objToUrl(obj: Record<string, any>, prefix: string = '?'): string {
  if (!obj || typeof obj !== 'object' || Object.keys(obj).length === 0) {
    return '';
  }

  const parts: string[] = [];
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && key !== 'HASH') {
      const value = obj[key];
      if (value !== undefined && value !== null) {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
      }
    }
  }
  
  const queryString = parts.length > 0 ? `${prefix}${parts.join('&')}` : '';
  const hash = obj.HASH ? `#${encodeURIComponent(obj.HASH)}` : '';
  
  return `${queryString}${hash}`;
}