// 导出全屏功能
export { default as fullscreen } from './src/fullscreen';
export { FullscreenManager } from './src/fullscreen';
export type { FullscreenOptions, FullscreenEventType, FullscreenEventListener } from './src/fullscreen';

// 导出剪贴板功能
export { default as clipboard } from './src/clipboard';
export { ClipboardManager } from './src/clipboard';
export type { ClipboardDataType, ClipboardData, CopyOptions, PasteOptions } from './src/clipboard';

// 导出工具方法
export * from './src/utils/dom';

// 默认导出
import fullscreen from './src/fullscreen';
import clipboard from './src/clipboard';

export default {
  fullscreen,
  clipboard
}; 