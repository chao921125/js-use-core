// 导出核心基础架构
export * from "./src/core";

// 导出全屏功能
export { default as fullscreen } from "./src/fullscreen";
export { FullscreenManager } from "./src/fullscreen";
export type {
  FullscreenOptions,
  FullscreenEventType,
} from "./src/fullscreen";

// 导出剪贴板功能
export { default as clipboard } from "./src/clipboard";
export { ClipboardManager } from "./src/clipboard";
export type {
  ClipboardDataType,
  ClipboardData,
  CopyOptions,
  PasteOptions,
} from "./src/clipboard";

// 导出工具方法
export * from "./src/utils/dom";

// file 文件操作相关导出
export * from "./src/file";
export * from "./src/image";
// Export specific types to avoid conflicts
export type { 
  QueryParams,
  FileTypeResult,
  ImageCompressOptions,
  ImageConvertOptions,
  ImageFormat,
  EventListenerOptions
} from "./src/types";
// Export specific utils to avoid conflicts
export { getBrowserAdapter } from "./src/utils";

// font 字体功能相关导出
export { default as font } from "./src/font";
export { FontManager } from "./src/font";
export type { FontCheckResult, FontLoadResult, FontOptions } from "./src/font";
export * from "./src/font/utils";

// url URL功能相关导出
export { default as url } from "./src/url";
// Export specific URL functions
export { 
  UrlManager,
  createUrlManager
} from "./src/url";

// device 设备检测功能相关导出
export { default as device } from "./src/device";
// Export specific device functions to avoid conflicts
export { 
  DeviceDetector,
  getDeviceInfo,
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
  isRetinaDisplay,
  getDevicePerformanceInfo,
  getPerformanceOptimizationSuggestions
} from "./src/device";

// ua User Agent功能相关导出
export { default as ua } from "./src/ua";
// Export specific UA functions to avoid conflicts
export { 
  parseUA,
  generateUA,
  compareVersions,
  UAManager
} from "./src/ua";

// 默认导出
import * as core from "./src/core";
import fullscreen from "./src/fullscreen";
import clipboard from "./src/clipboard";
import font from "./src/font";
import url from "./src/url";
import device from "./src/device";
import ua from "./src/ua";
import * as fileFile from "./src/file";
import * as fileImage from "./src/image";
import * as fileUtils from "./src/utils";
import * as fileTypes from "./src/types";

export default {
  core,
  fullscreen,
  clipboard,
  file: {
    ...fileFile,
    ...fileImage,
    ...fileUtils,
    ...fileTypes,
  },
  font,
  url,
  device,
  ua,
};
