/**
 * 统一类型定义系统
 * 
 * @description 提供完整的基础类型定义，包括核心架构、错误处理和功能模块相关类型
 * @author js-use-core
 * @date 2024-07-20
 */

// 导出核心架构类型
export * from './core';
export * from './errors';

// ============================================================================
// 基础数据类型
// ============================================================================

/**
 * 基础回调函数类型
 */
export type Callback<T = any> = (error?: Error, result?: T) => void;

/**
 * 异步回调函数类型
 */
export type AsyncCallback<T = any> = (error?: Error, result?: T) => Promise<void>;

/**
 * 事件处理函数类型
 */
export type EventHandler<T = Event> = (event: T) => void | Promise<void>;

/**
 * 可选的键类型
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 必需的键类型
 */
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * 深度可选类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 深度只读类型
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * 键值对类型
 */
export type KeyValuePair<K = string, V = any> = {
  key: K;
  value: V;
};

/**
 * 字典类型
 */
export type Dictionary<T = any> = Record<string, T>;

/**
 * 可序列化的值类型
 */
export type SerializableValue = 
  | string 
  | number 
  | boolean 
  | null 
  | undefined
  | SerializableObject 
  | SerializableArray;

/**
 * 可序列化的对象类型
 */
export type SerializableObject = {
  [key: string]: SerializableValue;
};

/**
 * 可序列化的数组类型
 */
export type SerializableArray = SerializableValue[];

// ============================================================================
// 文件和媒体相关类型
// ============================================================================

/**
 * 图片格式类型
 */
export type ImageFormat = 'jpeg' | 'png' | 'gif' | 'webp' | 'bmp' | 'svg' | 'ico';

/**
 * 音频格式类型
 */
export type AudioFormat = 'mp3' | 'wav' | 'ogg' | 'aac' | 'flac' | 'm4a';

/**
 * 视频格式类型
 */
export type VideoFormat = 'mp4' | 'webm' | 'ogg' | 'avi' | 'mov' | 'wmv' | 'flv';

/**
 * 文档格式类型
 */
export type DocumentFormat = 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx' | 'txt' | 'rtf';

/**
 * 支持的文件格式联合类型
 */
export type SupportedFormat = ImageFormat | AudioFormat | VideoFormat | DocumentFormat;

/**
 * 文件类型枚举
 */
export enum FileType {
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  DOCUMENT = 'document',
  ARCHIVE = 'archive',
  CODE = 'code',
  OTHER = 'other'
}

/**
 * 图片压缩选项
 */
export interface ImageCompressOptions {
  /** 压缩质量，范围0-1，默认0.8 */
  quality?: number;
  /** 最大宽度，如果指定则按比例缩放 */
  maxWidth?: number;
  /** 最大高度，如果指定则按比例缩放 */
  maxHeight?: number;
  /** 输出格式，默认与原图相同 */
  format?: ImageFormat;
  /** 是否保持宽高比 */
  maintainAspectRatio?: boolean;
  /** 背景颜色（用于透明图片转换） */
  backgroundColor?: string;
}

/**
 * 图片转换选项
 */
export interface ImageConvertOptions {
  /** 输出格式 */
  format: ImageFormat;
  /** 输出质量，范围0-1，默认0.9 */
  quality?: number;
  /** 是否保持元数据 */
  preserveMetadata?: boolean;
}

/**
 * 图片尺寸信息
 */
export interface ImageDimensions {
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** 宽高比 */
  aspectRatio: number;
}

/**
 * 文件信息接口
 */
export interface FileInfo {
  /** 文件名 */
  name: string;
  /** 文件大小（字节） */
  size: number;
  /** 文件类型 */
  type: FileType;
  /** MIME类型 */
  mimeType: string;
  /** 文件扩展名 */
  extension: string;
  /** 最后修改时间 */
  lastModified: number;
  /** 文件路径（如果可用） */
  path?: string;
}

/**
 * 文件类型检查结果
 */
export interface FileTypeResult {
  /** 是否为图片 */
  isImage: boolean;
  /** 是否为音频 */
  isAudio: boolean;
  /** 是否为视频 */
  isVideo: boolean;
  /** 是否为文档 */
  isDocument: boolean;
  /** 文件类型 */
  type: FileType;
  /** 文件MIME类型 */
  mimeType: string;
  /** 文件扩展名 */
  extension: string;
  /** 是否为支持的格式 */
  isSupported: boolean;
}

/**
 * 文件读取选项
 */
export interface FileReadOptions {
  /** 读取方式 */
  readAs?: 'text' | 'dataURL' | 'arrayBuffer' | 'binaryString';
  /** 文本编码（仅用于文本读取） */
  encoding?: string;
  /** 是否启用进度回调 */
  enableProgress?: boolean;
  /** 进度回调函数 */
  onProgress?: (progress: number) => void;
}

/**
 * 文件读取结果
 */
export interface FileReadResult<T = any> {
  /** 读取结果 */
  result: T;
  /** 文件信息 */
  fileInfo: FileInfo;
  /** 读取耗时 */
  duration: number;
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
}

// ============================================================================
// 设备和浏览器相关类型
// ============================================================================

/**
 * 设备类型枚举
 */
export enum DeviceType {
  DESKTOP = 'desktop',
  MOBILE = 'mobile',
  TABLET = 'tablet',
  TV = 'tv',
  WEARABLE = 'wearable',
  UNKNOWN = 'unknown'
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
  /** 操作系统版本 */
  osVersion: string;
  /** 浏览器类型 */
  browser: BrowserType;
  /** 浏览器版本 */
  browserVersion: string;
  /** 是否为移动设备 */
  isMobile: boolean;
  /** 是否为平板设备 */
  isTablet: boolean;
  /** 是否为桌面设备 */
  isDesktop: boolean;
  /** 是否支持触摸 */
  isTouchDevice: boolean;
  /** 屏幕信息 */
  screen: ScreenInfo;
  /** 用户代理字符串 */
  userAgent: string;
}

/**
 * 屏幕信息接口
 */
export interface ScreenInfo {
  /** 屏幕宽度 */
  width: number;
  /** 屏幕高度 */
  height: number;
  /** 可用宽度 */
  availWidth: number;
  /** 可用高度 */
  availHeight: number;
  /** 像素密度 */
  pixelRatio: number;
  /** 颜色深度 */
  colorDepth: number;
  /** 屏幕方向 */
  orientation: 'portrait' | 'landscape';
}

/**
 * 浏览器能力检测结果
 */
export interface BrowserCapabilities {
  /** 是否支持WebGL */
  webgl: boolean;
  /** 是否支持WebGL2 */
  webgl2: boolean;
  /** 是否支持Canvas */
  canvas: boolean;
  /** 是否支持SVG */
  svg: boolean;
  /** 是否支持本地存储 */
  localStorage: boolean;
  /** 是否支持会话存储 */
  sessionStorage: boolean;
  /** 是否支持IndexedDB */
  indexedDB: boolean;
  /** 是否支持WebWorker */
  webWorker: boolean;
  /** 是否支持ServiceWorker */
  serviceWorker: boolean;
  /** 是否支持WebSocket */
  webSocket: boolean;
  /** 是否支持Fetch API */
  fetch: boolean;
  /** 是否支持Geolocation */
  geolocation: boolean;
  /** 是否支持摄像头 */
  camera: boolean;
  /** 是否支持麦克风 */
  microphone: boolean;
  /** 是否支持通知 */
  notifications: boolean;
  /** 是否支持全屏 */
  fullscreen: boolean;
  /** 是否支持剪贴板 */
  clipboard: boolean;
}

// ============================================================================
// URL和网络相关类型
// ============================================================================

/**
 * URL组件接口
 */
export interface URLComponents {
  /** 协议 */
  protocol: string;
  /** 主机名 */
  hostname: string;
  /** 端口 */
  port: string;
  /** 路径 */
  pathname: string;
  /** 查询字符串 */
  search: string;
  /** 哈希 */
  hash: string;
  /** 用户名 */
  username?: string;
  /** 密码 */
  password?: string;
}

/**
 * 查询参数类型
 */
export type QueryParams = Record<string, string | string[] | undefined>;

/**
 * URL构建选项
 */
export interface URLBuildOptions {
  /** 基础URL */
  base?: string;
  /** 查询参数 */
  params?: QueryParams;
  /** 哈希值 */
  hash?: string;
  /** 是否编码查询参数 */
  encodeParams?: boolean;
  /** 是否保留空值参数 */
  keepEmptyParams?: boolean;
}

/**
 * URL验证结果
 */
export interface URLValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息 */
  errors: string[];
  /** 标准化后的URL */
  normalizedURL?: string;
  /** URL组件 */
  components?: URLComponents;
}

// ============================================================================
// 字体相关类型
// ============================================================================

/**
 * 字体格式类型
 */
export type FontFormat = 'woff' | 'woff2' | 'ttf' | 'otf' | 'eot' | 'svg';

/**
 * 字体样式
 */
export enum FontStyle {
  NORMAL = 'normal',
  ITALIC = 'italic',
  OBLIQUE = 'oblique'
}

/**
 * 字体粗细
 */
export enum FontWeight {
  THIN = 100,
  EXTRA_LIGHT = 200,
  LIGHT = 300,
  NORMAL = 400,
  MEDIUM = 500,
  SEMI_BOLD = 600,
  BOLD = 700,
  EXTRA_BOLD = 800,
  BLACK = 900
}

/**
 * 字体信息接口
 */
export interface FontInfo {
  /** 字体族名称 */
  family: string;
  /** 字体样式 */
  style: FontStyle;
  /** 字体粗细 */
  weight: FontWeight;
  /** 字体格式 */
  format?: FontFormat;
  /** 字体文件URL */
  url?: string;
  /** 是否为系统字体 */
  isSystemFont: boolean;
  /** 是否已加载 */
  isLoaded: boolean;
}

/**
 * 字体加载选项
 */
export interface FontLoadOptions {
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 字体显示策略 */
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  /** 是否预加载 */
  preload?: boolean;
  /** 回调函数 */
  onLoad?: (font: FontInfo) => void;
  /** 错误回调 */
  onError?: (error: Error) => void;
}

/**
 * 字体检测结果
 */
export interface FontDetectionResult {
  /** 字体是否可用 */
  available: boolean;
  /** 检测方法 */
  method: 'canvas' | 'dom' | 'fontface';
  /** 检测耗时 */
  duration: number;
  /** 字体信息 */
  fontInfo: FontInfo;
}

// ============================================================================
// 全屏相关类型
// ============================================================================

/**
 * 全屏选项
 */
export interface FullscreenOptions {
  /** 导航UI */
  navigationUI?: 'auto' | 'show' | 'hide';
  /** 是否允许键盘输入 */
  allowKeyboardInput?: boolean;
}

/**
 * 全屏状态
 */
export interface FullscreenState {
  /** 是否处于全屏状态 */
  isFullscreen: boolean;
  /** 全屏元素 */
  element: Element | null;
  /** 是否支持全屏 */
  isSupported: boolean;
  /** 全屏API前缀 */
  prefix?: string;
}

// ============================================================================
// 剪贴板相关类型
// ============================================================================

/**
 * 剪贴板数据类型
 */
export enum ClipboardDataType {
  TEXT = 'text/plain',
  HTML = 'text/html',
  RTF = 'text/rtf',
  IMAGE = 'image/png',
  JSON = 'application/json'
}

/**
 * 剪贴板项目
 */
export interface ClipboardItem {
  /** 数据类型 */
  type: ClipboardDataType;
  /** 数据内容 */
  data: string | Blob;
  /** 数据大小 */
  size: number;
}

/**
 * 剪贴板操作选项
 */
export interface ClipboardOptions {
  /** 数据类型 */
  type?: ClipboardDataType;
  /** 是否使用传统API */
  useLegacyAPI?: boolean;
  /** 超时时间 */
  timeout?: number;
}

/**
 * 剪贴板操作结果
 */
export interface ClipboardResult<T = any> {
  /** 是否成功 */
  success: boolean;
  /** 结果数据 */
  data?: T;
  /** 错误信息 */
  error?: string;
  /** 使用的API类型 */
  apiType: 'modern' | 'legacy' | 'fallback';
}

// ============================================================================
// 事件相关类型
// ============================================================================

/**
 * 自定义事件数据
 */
export interface CustomEventData<T = any> {
  /** 事件类型 */
  type: string;
  /** 事件数据 */
  detail: T;
  /** 时间戳 */
  timestamp: number;
  /** 事件源 */
  source?: string;
}

/**
 * 事件监听器选项
 */
export interface EventListenerOptions extends AddEventListenerOptions {
  /** 是否只执行一次 */
  once?: boolean;
  /** 是否在捕获阶段执行 */
  capture?: boolean;
  /** 是否为被动监听器 */
  passive?: boolean;
  /** 信号对象（用于取消监听） */
  signal?: AbortSignal;
}

// ============================================================================
// 工具类型
// ============================================================================

/**
 * 构造函数类型
 */
export type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * 抽象构造函数类型
 */
export type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T;

/**
 * 混入类型
 */
export type Mixin<T extends Constructor> = T & Constructor;

/**
 * 函数参数类型
 */
export type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

/**
 * 函数返回类型
 */
export type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

/**
 * Promise解析类型
 */
export type Awaited<T> = T extends PromiseLike<infer U> ? U : T;

/**
 * 非空类型
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * 提取数组元素类型
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * 提取对象值类型
 */
export type ValueOf<T> = T[keyof T];

/**
 * 条件类型
 */
export type If<C extends boolean, T, F> = C extends true ? T : F;