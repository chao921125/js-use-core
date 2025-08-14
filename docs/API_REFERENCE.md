# API 参考文档

## 🎉 自动初始化 API

### ready() 方法

等待管理器初始化完成的便捷方法。

```typescript
async ready(): Promise<void>
```

**示例**：

```javascript
const clipboard = new ClipboardManager();
await clipboard.ready(); // 等待初始化完成
// 现在可以安全使用所有功能
```

### getStatus() 方法

获取管理器的详细状态信息。

```typescript
getStatus(): {
  initialized: boolean;
  destroyed: boolean;
  eventListeners: number;
  cacheSize?: number;
  initializing: boolean; // v1.3.0 新增
}
```

**示例**：
```javascript
const clipboard = new ClipboardManager();
const status = clipboard.getStatus();

console.log({
  initialized: status.initialized,    // 是否已初始化
  initializing: status.initializing,  // 是否正在初始化
  destroyed: status.destroyed,        // 是否已销毁
  eventListeners: status.eventListeners, // 事件监听器数量
  cacheSize: status.cacheSize         // 缓存大小
});
```

## 📋 ClipboardManager API

### 构造函数

```typescript
constructor(options?: ClipboardManagerOptions)
```

**选项**：
```typescript
interface ClipboardManagerOptions extends BaseOptions {
  enablePermissionCheck?: boolean;    // 启用权限检查
  enableFallback?: boolean;          // 启用降级方案
  enableDataValidation?: boolean;    // 启用数据验证
  maxDataSize?: number;              // 最大数据大小
  allowedMimeTypes?: string[];       // 允许的 MIME 类型
  sanitizeHTML?: boolean;            // 清理 HTML
}
```

### 方法

#### copyText()

复制文本到剪贴板。

```typescript
async copyText(text: string, options?: CopyOptions): Promise<boolean>
```

**示例**：

```javascript
const clipboard = new ClipboardManager();
await clipboard.copyText('Hello World!');
```

#### readText()

从剪贴板读取文本。

```typescript
async readText(options?: PasteOptions): Promise<string>
```

**示例**：

```javascript
const clipboard = new ClipboardManager();
const text = await clipboard.readText();
console.log('剪贴板内容:', text);
```

#### copyHTML()

复制 HTML 内容到剪贴板。

```typescript
async copyHTML(html: string, options?: CopyOptions): Promise<boolean>
```

#### readHTML()

从剪贴板读取 HTML 内容。

```typescript
async readHTML(options?: PasteOptions): Promise<string>
```

#### copyFiles()

复制文件到剪贴板。

```typescript
async copyFiles(files: File[], options?: CopyOptions): Promise<boolean>
```

#### readFiles()

从剪贴板读取文件。

```typescript
async readFiles(options?: PasteOptions): Promise<File[]>
```

#### checkPermissions()

检查剪贴板权限。

```typescript
async checkPermissions(): Promise<{
  write: ClipboardPermissionState;
  read: ClipboardPermissionState;
}>
```

#### requestPermissions()

请求剪贴板权限。

```typescript
async requestPermissions(): Promise<boolean>
```

## 🖥️ FullscreenManager API

### 构造函数

```typescript
constructor(options?: FullscreenOptions)
```

**选项**：
```typescript
interface FullscreenOptions extends BaseOptions {
  navigationUI?: 'auto' | 'hide' | 'show';
  enablePerformanceMonitoring?: boolean;
  requestTimeout?: number;
  allowKeyboardInput?: boolean;
}
```

### 方法

#### request()
请求进入全屏模式。

```typescript
async request(element?: Element, options?: {
  navigationUI?: 'auto' | 'hide' | 'show'
}): Promise<void>
```

**示例**：
```javascript
const fullscreen = new FullscreenManager();
await fullscreen.request(document.getElementById('video'));
```

#### exit()
退出全屏模式。

```typescript
async exit(): Promise<void>
```

#### toggle()
切换全屏状态。

```typescript
async toggle(element?: Element, options?: {
  navigationUI?: 'auto' | 'hide' | 'show'
}): Promise<void>
```

### 属性

#### isFullscreen
当前是否处于全屏状态。

```typescript
readonly isFullscreen: boolean
```

#### isSupported
浏览器是否支持全屏 API。

```typescript
readonly isSupported: boolean
```

#### currentElement
当前全屏元素。

```typescript
readonly currentElement: Element | null
```

## 🔤 FontManager API

### 构造函数

```typescript
constructor(options?: FontOptions)
```

**选项**：
```typescript
interface FontOptions extends BaseOptions {
  concurrency?: number;           // 并发数
  detectionThreshold?: number;    // 检测阈值
}
```

### 方法

#### addFont()
动态添加字体。

```typescript
async addFont(
  fontName: string, 
  url: string, 
  options?: FontFaceDescriptors
): Promise<boolean>
```

**示例**：
```javascript
const fontManager = new FontManager();
await fontManager.addFont('CustomFont', '/fonts/custom.woff2');
```

#### check()
检查字体是否可用。

```typescript
async check(fontNames?: string | string[]): Promise<FontLoadResult>
```

**示例**：
```javascript
const fontManager = new FontManager();
const result = await fontManager.check(['Arial', 'Helvetica']);
console.log('字体检查结果:', result);
```

#### addFontFace()
添加 FontFace 对象。

```typescript
addFontFace(font: FontFace): boolean
```

#### deleteFont()
删除字体。

```typescript
deleteFont(font: FontFace | string): boolean
```

## 📁 FileManager API

### 构造函数

```typescript
constructor(options?: FileManagerOptions)
```

### 方法

#### readFile()
读取文件内容。

```typescript
async readFile(file: File, options?: FileReadOptions): Promise<FileReadResult>
```

#### urlToBase64()
将 URL 转换为 Base64。

```typescript
async urlToBase64(url: string): Promise<FileConversionResult<string>>
```

#### fileToBase64()
将文件转换为 Base64。

```typescript
async fileToBase64(file: File): Promise<FileConversionResult<string>>
```

#### base64ToBlob()
将 Base64 转换为 Blob。

```typescript
base64ToBlob(base64: string): FileConversionResult<Blob>
```

#### base64ToFile()
将 Base64 转换为 File。

```typescript
base64ToFile(base64: string, filename?: string): FileConversionResult<File>
```

## 🖼️ ImageManager API

### 构造函数

```typescript
constructor(options?: ImageManagerOptions)
```

**选项**：
```typescript
interface ImageManagerOptions extends BaseOptions {
  defaultQuality?: number;        // 默认质量
  maxWidth?: number;             // 最大宽度
  maxHeight?: number;            // 最大高度
}
```

### 方法

#### imgCompress()
压缩图像。

```typescript
async imgCompress(
  imageFile: File, 
  options?: ImageCompressOptions
): Promise<ImageProcessResult<File>>
```

#### imgConvert()
转换图像格式。

```typescript
async imgConvert(
  imageFile: File, 
  options: ImageConvertOptions
): Promise<ImageProcessResult<File>>
```

#### getImageDimensions()
获取图像尺寸。

```typescript
async getImageDimensions(imageFile: File): Promise<ImageDimensions>
```

## 🌐 UrlManager API

### 构造函数

```typescript
constructor(url: string, options?: UrlManagerOptions)
```

### 方法

#### getUrlInfo()
获取 URL 信息。

```typescript
getUrlInfo(): UrlInfo
```

#### getQuery()
获取查询参数。

```typescript
getQuery(): QueryParams
```

#### setQuery()
设置查询参数。

```typescript
setQuery(params: QueryParams): this
```

#### addQuery()
添加查询参数。

```typescript
addQuery(params: QueryParams): this
```

#### removeQuery()
移除查询参数。

```typescript
removeQuery(keys: string | string[]): this
```

#### setHash()
设置 hash。

```typescript
setHash(hash: string): this
```

#### setPathname()
设置路径名。

```typescript
setPathname(pathname: string): this
```

#### toString()
转换为字符串。

```typescript
toString(): string
```

## 📱 DeviceDetector API

### 构造函数

```typescript
constructor(options?: DeviceDetectorOptions)
```

### 方法

#### getDeviceInfo()
获取设备信息。

```typescript
async getDeviceInfo(): Promise<DeviceInfo>
```

#### refresh()
刷新设备信息。

```typescript
async refresh(): Promise<DeviceInfo>
```

### 静态方法

#### isMobile()
检查是否为移动设备。

```typescript
static isMobile(): boolean
```

#### isTablet()
检查是否为平板设备。

```typescript
static isTablet(): boolean
```

#### isDesktop()
检查是否为桌面设备。

```typescript
static isDesktop(): boolean
```

## 🔍 UAManager API

### 构造函数

```typescript
constructor(options?: UAManagerOptions)
```

### 方法

#### parse()
解析 User Agent。

```typescript
async parse(ua?: string): Promise<Readonly<ParsedUA>>
```

#### parseSync()
同步解析 User Agent。

```typescript
parseSync(ua?: string): Readonly<ParsedUA>
```

#### stringify()
生成 User Agent 字符串。

```typescript
stringify(spec: UAGenerateSpec): string
```

#### satisfies()
检查版本是否满足条件。

```typescript
satisfies(ua: ParsedUA | string, range: string): boolean
```

#### isModern()
检查是否为现代浏览器。

```typescript
isModern(ua: ParsedUA, opts?: ModernBrowserOptions): boolean
```

### 静态方法

#### parse()
静态解析方法。

```typescript
static parse(ua?: string): ParsedUA
```

#### compareVersions()
比较版本号。

```typescript
static compareVersions(version1: string, version2: string): number
```

## 🏗️ BaseManager API

所有管理器都继承自 BaseManager，提供统一的基础功能。

### 通用选项

```typescript
interface BaseOptions {
  debug?: boolean;        // 调试模式
  timeout?: number;       // 超时时间
  retries?: number;       // 重试次数
  cache?: boolean;        // 启用缓存
  cacheTTL?: number;      // 缓存过期时间
}
```

### 通用方法

#### initialize()
初始化管理器（v1.3.0+ 自动调用）。

```typescript
abstract initialize(): Promise<void>
```

#### ready()
等待初始化完成。

```typescript
async ready(): Promise<void>
```

#### destroy()
销毁管理器。

```typescript
abstract destroy(): void
```

#### on()
添加事件监听器。

```typescript
on(event: string, listener: Function, options?: {
  once?: boolean;
  priority?: number;
}): this
```

#### off()
移除事件监听器。

```typescript
off(event: string, listener?: Function): this
```

#### once()
添加一次性事件监听器。

```typescript
once(event: string, listener: Function, priority?: number): this
```

#### emit()
触发事件。

```typescript
emit(event: string, ...args: any[]): boolean
```

#### getStatus()
获取管理器状态。

```typescript
getStatus(): {
  initialized: boolean;
  destroyed: boolean;
  eventListeners: number;
  cacheSize?: number;
  initializing: boolean;
}
```

#### updateOptions()
更新配置选项。

```typescript
updateOptions(newOptions: Partial<T>): void
```

## 🎯 类型定义

### 通用类型

```typescript
// 错误类型
enum ErrorType {
  USER_ERROR = 'USER_ERROR',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR'
}

// 处理结果
interface ProcessResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  metadata?: Record<string, any>;
}
```

### 剪贴板类型

```typescript
// 剪贴板数据类型
enum ClipboardDataType {
  TEXT = 'text/plain',
  HTML = 'text/html',
  IMAGE = 'image',
  FILE = 'file'
}

// 权限状态
enum ClipboardPermissionState {
  GRANTED = 'granted',
  DENIED = 'denied',
  PROMPT = 'prompt',
  UNKNOWN = 'unknown'
}

// 复制选项
interface CopyOptions {
  format?: ClipboardDataType;
  timeout?: number;
  fallback?: boolean;
}

// 粘贴选项
interface PasteOptions {
  format?: ClipboardDataType;
  timeout?: number;
  sanitize?: boolean;
}
```

### 字体类型

```typescript
// 字体检查结果
interface FontCheckResult {
  name: string;
  loaded: boolean;
  status: string;
  loadTime?: number;
  error?: string;
}

// 字体加载结果
interface FontLoadResult {
  success: boolean;
  allFonts: FontCheckResult[];
  failedFonts?: FontCheckResult[];
  totalLoadTime?: number;
}
```

### 文件类型

```typescript
// 文件转换结果
interface FileConversionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  size?: number;
  mimeType?: string;
}

// 文件读取结果
interface FileReadResult {
  content: string | ArrayBuffer;
  size: number;
  type: string;
  lastModified: number;
}
```

### 图像类型

```typescript
// 图像处理结果
interface ImageProcessResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  originalSize?: number;
  processedSize?: number;
  compressionRatio?: number;
}

// 图像压缩选项
interface ImageCompressOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: ImageFormat;
}

// 图像格式
enum ImageFormat {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  WEBP = 'image/webp'
}
```

### URL 类型

```typescript
// URL 信息
interface UrlInfo {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
}

// 查询参数
type QueryParams = Record<string, string | string[] | number | boolean>;
```

### 设备类型

```typescript
// 设备信息
interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  isRetinaDisplay: boolean;
  os: OSInfo;
  browser: BrowserInfo;
  screen: ScreenInfo;
}

// 操作系统信息
interface OSInfo {
  name: string;
  version: string;
  platform: string;
}

// 浏览器信息
interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
}
```

### User Agent 类型

```typescript
// 解析的 UA
interface ParsedUA {
  browser: {
    name: string;
    version: string;
    major: string;
  };
  engine: {
    name: string;
    version: string;
  };
  os: {
    name: string;
    version: string;
  };
  device: {
    type?: string;
    model?: string;
    vendor?: string;
  };
}

// UA 生成规范
interface UAGenerateSpec {
  browser: {
    name: string;
    version: string;
  };
  os: {
    name: string;
    version: string;
  };
  device?: {
    type: string;
    model?: string;
  };
}
```

## 📚 相关文档

- [自动初始化功能](./AUTO_INITIALIZATION.md)
- [最佳实践](./BEST_PRACTICES.md)
- [故障排除](./TROUBLESHOOTING.md)
- [迁移指南](../MIGRATION_GUIDE.md)
- [更新日志](../CHANGELOG.md)