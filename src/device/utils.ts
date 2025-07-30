/**
 * 设备相关工具函数
 */

import { ScreenOrientation, NetworkType, DevicePerformanceInfo, DeviceCapabilities } from './types';

// 这些函数在 detector.ts 中不存在，所以在这里直接实现

// 缓存屏幕信息以提高性能
let cachedScreenInfo: { width: number; height: number; pixelRatio: number } | null = null;
let screenInfoCacheTime = 0;
const SCREEN_CACHE_TTL = 30000; // 30秒缓存

/**
 * 获取屏幕尺寸信息（优化版本，支持缓存）
 * @param forceRefresh 是否强制刷新缓存
 * @returns 屏幕尺寸对象
 */
export function getScreenSize(forceRefresh = false) {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0, pixelRatio: 1 };
  }
  
  const now = Date.now();
  
  // 如果缓存有效且不强制刷新，返回缓存结果
  if (!forceRefresh && cachedScreenInfo && (now - screenInfoCacheTime) < SCREEN_CACHE_TTL) {
    return cachedScreenInfo;
  }
  
  // 获取更准确的屏幕信息
  const screenInfo = {
    width: window.screen.width,
    height: window.screen.height,
    pixelRatio: window.devicePixelRatio || 1
  };
  
  // 更新缓存
  cachedScreenInfo = screenInfo;
  screenInfoCacheTime = now;
  
  return screenInfo;
}

/**
 * 获取详细的屏幕信息
 * @returns 详细屏幕信息
 */
export function getDetailedScreenInfo() {
  if (typeof window === 'undefined') {
    return {
      width: 0,
      height: 0,
      availWidth: 0,
      availHeight: 0,
      pixelRatio: 1,
      colorDepth: 24,
      pixelDepth: 24,
      orientation: 0
    };
  }
  
  const screen = window.screen;
  return {
    width: screen.width,
    height: screen.height,
    availWidth: screen.availWidth,
    availHeight: screen.availHeight,
    pixelRatio: window.devicePixelRatio || 1,
    colorDepth: screen.colorDepth || 24,
    pixelDepth: screen.pixelDepth || 24,
    orientation: (screen as any).orientation?.angle || 0
  };
}

/**
 * 获取视口尺寸（优化版本）
 * @param includeScrollbar 是否包含滚动条
 * @returns 视口尺寸对象
 */
export function getViewportSize(includeScrollbar = false) {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  
  if (includeScrollbar) {
    return {
      width: window.outerWidth || window.innerWidth || document.documentElement.clientWidth,
      height: window.outerHeight || window.innerHeight || document.documentElement.clientHeight
    };
  }
  
  return {
    width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
  };
}

/**
 * 获取实际可用的视口尺寸（排除浏览器UI）
 * @returns 实际视口尺寸
 */
export function getActualViewportSize() {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  
  // 使用 visualViewport API（如果可用）
  if ('visualViewport' in window && window.visualViewport) {
    return {
      width: window.visualViewport.width,
      height: window.visualViewport.height
    };
  }
  
  // 回退到标准方法
  return getViewportSize();
}

/**
 * 检测屏幕尺寸类别
 * @returns 屏幕尺寸类别
 */
export function getScreenSizeCategory(): 'small' | 'medium' | 'large' | 'xlarge' {
  const { width } = getViewportSize();
  
  if (width < 576) return 'small';      // 手机
  if (width < 768) return 'medium';     // 大屏手机/小平板
  if (width < 1200) return 'large';     // 平板/小桌面
  return 'xlarge';                      // 大桌面
}

/**
 * 获取屏幕方向
 * @returns 屏幕方向
 */
export function getScreenOrientation(): ScreenOrientation {
  if (typeof window === 'undefined') {
    return ScreenOrientation.PORTRAIT;
  }
  
  const { width, height } = getViewportSize();
  return width > height ? ScreenOrientation.LANDSCAPE : ScreenOrientation.PORTRAIT;
}

/**
 * 监听屏幕方向变化
 * @param callback 回调函数
 * @returns 取消监听的函数
 */
export function onOrientationChange(callback: (orientation: ScreenOrientation) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  
  const handler = () => {
    callback(getScreenOrientation());
  };
  
  window.addEventListener('orientationchange', handler);
  window.addEventListener('resize', handler);
  
  return () => {
    window.removeEventListener('orientationchange', handler);
    window.removeEventListener('resize', handler);
  };
}

/**
 * 获取网络连接类型
 * @returns 网络类型
 */
export function getNetworkType(): NetworkType {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return NetworkType.UNKNOWN;
  }
  
  // @ts-ignore
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) return NetworkType.UNKNOWN;
  
  const type = connection.type || connection.effectiveType;
  
  if (type === 'wifi') return NetworkType.WIFI;
  if (type === 'cellular' || /^[2-4]g$/.test(type)) return NetworkType.CELLULAR;
  if (type === 'ethernet') return NetworkType.ETHERNET;
  
  return NetworkType.UNKNOWN;
}

/**
 * 获取网络连接速度
 * @returns 网络速度信息
 */
export function getNetworkSpeed() {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return { downlink: 0, rtt: 0, effectiveType: 'unknown' };
  }
  
  // @ts-ignore
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) {
    return { downlink: 0, rtt: 0, effectiveType: 'unknown' };
  }
  
  return {
    downlink: connection.downlink || 0, // Mbps
    rtt: connection.rtt || 0, // ms
    effectiveType: connection.effectiveType || 'unknown'
  };
}

/**
 * 检测是否在线
 * @returns 是否在线
 */
export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

/**
 * 监听网络状态变化
 * @param callback 回调函数
 * @returns 取消监听的函数
 */
export function onNetworkChange(callback: (isOnline: boolean) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  
  const onlineHandler = () => callback(true);
  const offlineHandler = () => callback(false);
  
  window.addEventListener('online', onlineHandler);
  window.addEventListener('offline', offlineHandler);
  
  return () => {
    window.removeEventListener('online', onlineHandler);
    window.removeEventListener('offline', offlineHandler);
  };
}

/**
 * 获取电池信息
 * @returns Promise<BatteryManager | null> 电池信息
 */
export async function getBatteryInfo(): Promise<any> {
  if (typeof navigator === 'undefined' || !('getBattery' in navigator)) {
    return null;
  }
  
  try {
    // @ts-ignore
    const battery = await navigator.getBattery();
    return {
      charging: battery.charging,
      level: battery.level,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime
    };
  } catch {
    return null;
  }
}

/**
 * 获取内存信息
 * @returns 内存信息
 */
export function getMemoryInfo() {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    if (memory) {
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }
  }
  
  return null;
}

/**
 * 检测是否支持 Service Worker
 * @returns 是否支持 Service Worker
 */
export function supportsServiceWorker(): boolean {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * 检测是否支持 Web Workers
 * @returns 是否支持 Web Workers
 */
export function supportsWebWorkers(): boolean {
  return typeof Worker !== 'undefined';
}

/**
 * 检测是否支持 WebAssembly
 * @returns 是否支持 WebAssembly
 */
export function supportsWebAssembly(): boolean {
  return typeof WebAssembly !== 'undefined';
}

/**
 * 检测是否支持 WebGL
 * @returns 是否支持 WebGL
 */
export function supportsWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!context;
  } catch {
    return false;
  }
}

/**
 * 检测是否支持 WebGL2
 * @returns 是否支持 WebGL2
 */
export function supportsWebGL2(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2');
    return !!context;
  } catch {
    return false;
  }
}



/**
 * 获取 GPU 信息
 * @returns GPU 信息
 */
export function getGPUInfo() {
  if (typeof window === 'undefined') return null;
  
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return null;
    
    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return null;
    
    return {
      vendor: (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
      renderer: (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    };
  } catch {
    return null;
  }
}

/**
 * 检测设备性能等级
 * @returns 设备性能信息
 */
export function getDevicePerformanceInfo(): DevicePerformanceInfo {
  if (typeof window === 'undefined') {
    return {
      level: 'unknown',
      score: 0,
      memory: 0,
      cores: 0,
      gpu: null
    };
  }
  
  let score = 0;
  let level: 'low' | 'medium' | 'high' | 'unknown' = 'unknown';
  
  // 检测CPU核心数
  const cores = navigator.hardwareConcurrency || 1;
  score += Math.min(cores * 10, 40); // 最多40分
  
  // 检测内存
  const memory = (performance as any).memory;
  let memoryGB = 0;
  if (memory) {
    memoryGB = memory.jsHeapSizeLimit / (1024 * 1024 * 1024);
    score += Math.min(memoryGB * 10, 30); // 最多30分
  }
  
  // 检测GPU
  const gpu = getGPUInfo();
  if (gpu) {
    // 简单的GPU性能评估
    const renderer = gpu.renderer.toLowerCase();
    if (renderer.includes('intel') && renderer.includes('hd')) {
      score += 10; // 集成显卡
    } else if (renderer.includes('nvidia') || renderer.includes('amd') || renderer.includes('radeon')) {
      score += 20; // 独立显卡
    } else {
      score += 15; // 其他
    }
  }
  
  // 检测屏幕像素密度（高分屏通常意味着更好的设备）
  const pixelRatio = window.devicePixelRatio || 1;
  score += Math.min(pixelRatio * 5, 10);
  
  // 根据分数确定性能等级
  if (score >= 60) level = 'high';
  else if (score >= 40) level = 'medium';
  else if (score >= 20) level = 'low';
  
  return {
    level,
    score,
    memory: memoryGB,
    cores,
    gpu
  };
}

/**
 * 检测设备能力
 * @returns 设备能力信息
 */
export function getDeviceCapabilities(): DeviceCapabilities {
  if (typeof window === 'undefined') {
    return {
      touch: false,
      webgl: false,
      webgl2: false,
      webassembly: false,
      serviceWorker: false,
      webWorkers: false,
      geolocation: false,
      camera: false,
      microphone: false,
      notifications: false,
      vibration: false,
      battery: false,
      deviceMotion: false,
      deviceOrientation: false
    };
  }
  
  return {
    touch: isEnhancedTouchDevice(),
    webgl: supportsWebGL(),
    webgl2: supportsWebGL2(),
    webassembly: supportsWebAssembly(),
    serviceWorker: supportsServiceWorker(),
    webWorkers: supportsWebWorkers(),
    geolocation: 'geolocation' in navigator,
    camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    microphone: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
    notifications: 'Notification' in window,
    vibration: 'vibrate' in navigator,
    battery: 'getBattery' in navigator,
    deviceMotion: 'DeviceMotionEvent' in window,
    deviceOrientation: 'DeviceOrientationEvent' in window
  };
}

/**
 * 检测设备是否为触摸设备（优化版本）
 * @returns 是否支持触摸
 */
export function isEnhancedTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0 ||
    // 检测CSS媒体查询
    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
  );
}

/**
 * 运行性能基准测试
 * @returns 基准测试结果
 */
export function runPerformanceBenchmark(): Promise<{
  jsPerformance: number;
  renderPerformance: number;
  memoryPerformance: number;
}> {
  return new Promise((resolve) => {
    const results = {
      jsPerformance: 0,
      renderPerformance: 0,
      memoryPerformance: 0
    };
    
    // JavaScript性能测试
    const jsStart = performance.now();
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += Math.random();
    }
    results.jsPerformance = performance.now() - jsStart;
    
    // 渲染性能测试
    if (typeof document !== 'undefined') {
      const renderStart = performance.now();
      const div = document.createElement('div');
      div.style.width = '100px';
      div.style.height = '100px';
      div.style.backgroundColor = 'red';
      document.body.appendChild(div);
      
      requestAnimationFrame(() => {
        results.renderPerformance = performance.now() - renderStart;
        document.body.removeChild(div);
        
        // 内存性能测试
        const memory = (performance as any).memory;
        if (memory) {
          results.memoryPerformance = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        }
        
        resolve(results);
      });
    } else {
      resolve(results);
    }
  });
}

/**
 * 监听设备性能变化
 * @param callback 回调函数
 * @returns 取消监听的函数
 */
export function monitorDevicePerformance(
  callback: (performance: DevicePerformanceInfo) => void,
  interval = 30000
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  
  let isMonitoring = true;
  
  const monitor = async () => {
    while (isMonitoring) {
      const performance = getDevicePerformanceInfo();
      callback(performance);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  };
  
  monitor();
  
  return () => {
    isMonitoring = false;
  };
}

/**
 * 检测设备是否处于低性能模式
 * @returns 是否为低性能模式
 */
export function isLowPerformanceMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  const performance = getDevicePerformanceInfo();
  
  // 检查多个指标
  const indicators = [
    performance.level === 'low',
    performance.cores <= 2,
    performance.memory < 2,
    window.devicePixelRatio <= 1
  ];
  
  // 如果有2个或以上指标表明低性能，则认为是低性能模式
  return indicators.filter(Boolean).length >= 2;
}

/**
 * 获取设备热度状态（实验性）
 * @returns 设备热度状态
 */
export function getDeviceThermalState(): 'normal' | 'fair' | 'serious' | 'critical' | 'unknown' {
  if (typeof navigator === 'undefined') return 'unknown';
  
  // 检查实验性的热度API
  const thermal = (navigator as any).thermal;
  if (thermal && thermal.state) {
    return thermal.state;
  }
  
  // 通过性能指标推测
  const performance = getDevicePerformanceInfo();
  if (performance.level === 'low' && performance.score < 30) {
    return 'serious';
  }
  
  return 'normal';
}

/**
 * 优化设备性能设置建议
 * @returns 性能优化建议
 */
export function getPerformanceOptimizationSuggestions(): {
  level: 'low' | 'medium' | 'high';
  suggestions: string[];
  settings: {
    enableAnimations: boolean;
    enableShadows: boolean;
    enableBlur: boolean;
    maxImageQuality: number;
    enableLazyLoading: boolean;
  };
} {
  const performance = getDevicePerformanceInfo();
  const isLowPerf = isLowPerformanceMode();
  
  const suggestions: string[] = [];
  const settings = {
    enableAnimations: true,
    enableShadows: true,
    enableBlur: true,
    maxImageQuality: 1.0,
    enableLazyLoading: false
  };
  
  if (isLowPerf || performance.level === 'low') {
    suggestions.push('禁用复杂动画和过渡效果');
    suggestions.push('降低图片质量');
    suggestions.push('启用懒加载');
    suggestions.push('减少同时渲染的元素数量');
    
    settings.enableAnimations = false;
    settings.enableShadows = false;
    settings.enableBlur = false;
    settings.maxImageQuality = 0.7;
    settings.enableLazyLoading = true;
  } else if (performance.level === 'medium') {
    suggestions.push('适度使用动画效果');
    suggestions.push('优化图片加载');
    
    settings.maxImageQuality = 0.85;
    settings.enableLazyLoading = true;
  } else {
    suggestions.push('可以使用所有视觉效果');
    suggestions.push('启用高质量渲染');
  }
  
  return {
    level: performance.level === 'unknown' ? 'medium' : performance.level,
    suggestions,
    settings
  };
}

/**
 * 检测设备是否支持特定功能
 * @param feature 功能名称
 * @returns 是否支持
 */
export function supportsFeature(feature: keyof DeviceCapabilities): boolean {
  const capabilities = getDeviceCapabilities();
  return capabilities[feature];
}

/**
 * 获取设备兼容性报告
 * @returns 兼容性报告
 */
export function getCompatibilityReport(): {
  score: number;
  issues: string[];
  recommendations: string[];
} {
  const capabilities = getDeviceCapabilities();
  const performance = getDevicePerformanceInfo();
  
  let score = 100;
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // 检查关键功能支持
  if (!capabilities.webgl) {
    score -= 20;
    issues.push('不支持WebGL，3D功能可能无法使用');
    recommendations.push('升级浏览器或使用支持WebGL的浏览器');
  }
  
  if (!capabilities.serviceWorker) {
    score -= 15;
    issues.push('不支持Service Worker，离线功能受限');
    recommendations.push('升级到现代浏览器');
  }
  
  if (!capabilities.webWorkers) {
    score -= 10;
    issues.push('不支持Web Workers，后台处理能力受限');
  }
  
  if (performance.level === 'low') {
    score -= 25;
    issues.push('设备性能较低，可能影响用户体验');
    recommendations.push('启用性能优化模式');
  }
  
  if (!capabilities.touch && getScreenSizeCategory() === 'small') {
    score -= 5;
    issues.push('小屏设备不支持触摸，交互体验可能不佳');
  }
  
  return {
    score: Math.max(0, score),
    issues,
    recommendations
  };
}