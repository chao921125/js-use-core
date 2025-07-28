/**
 * 设备检测模块
 * 提供设备类型检测和相关功能
 */

export * from './types';
export * from './detector';
export * from './utils';
export { default } from './device';

// 便捷导出常用功能
export { 
  DeviceDetector,
  getDeviceInfo,
  getDeviceInfoSync,
  createDeviceDetector,
  isDeviceType
} from './device';

export {
  isMobile,
  isTablet,
  isDesktop,
  getDeviceType,
  detectOS,
  detectBrowser,
  isTouchDevice,
  enhancedMobileDetection,
  clearDetectionCache,
  getCacheStats
} from './detector';

export {
  getScreenSize,
  getDetailedScreenInfo,
  getViewportSize,
  getActualViewportSize,
  getScreenSizeCategory,
  getDevicePerformanceInfo,
  getDeviceCapabilities,
  isEnhancedTouchDevice,
  runPerformanceBenchmark,
  monitorDevicePerformance,
  isLowPerformanceMode,
  getDeviceThermalState,
  getPerformanceOptimizationSuggestions,
  supportsFeature,
  getCompatibilityReport
} from './utils';