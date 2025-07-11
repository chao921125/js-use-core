# API 文档

> 返回 [主说明文档](../README.md)

## 核心类

### FontChecker

字体检查器的主类，提供字体加载检测和管理功能。

#### 构造函数

```typescript
constructor(options?: FontCheckerOptions)
```

**参数：**
- `options` (可选): 配置选项
  - `timeout`: 字体加载超时时间（毫秒），默认为 3000

**示例：**
```typescript
import FontChecker from 'font-load-check';

// 使用默认配置
const checker = new FontChecker();

// 使用自定义配置
const checker = new FontChecker({ timeout: 5000 });
```

#### 方法

##### check(fontNames?: string | string[]): Promise<FontLoadResult>

检查字体是否已加载。

**参数：**
- `fontNames` (可选): 字体名称或字体名称数组，如果不提供则检查所有已加载字体

**返回值：**
- `Promise<FontLoadResult>`: 字体加载结果

**示例：**
```typescript
// 检查单个字体
const result = await checker.check('Arial');

// 检查多个字体
const result = await checker.check(['Arial', 'Helvetica', 'Times New Roman']);

// 检查所有字体
const result = await checker.check();
```

##### addFont(font: FontFace): boolean

动态添加字体。

**参数：**
- `font`: FontFace 对象

**返回值：**
- `boolean`: 是否添加成功

**示例：**
```typescript
const fontFace = new FontFace('MyFont', 'url(/path/to/font.woff2)');
const success = checker.addFont(fontFace);
```

##### deleteFont(font: FontFace): boolean

删除之前添加的字体。

**参数：**
- `font`: FontFace 对象

**返回值：**
- `boolean`: 是否删除成功

**示例：**
```typescript
const success = checker.deleteFont(fontFace);
```

##### clearFonts(): boolean

清除所有动态添加的字体。

**返回值：**
- `boolean`: 是否清除成功

**示例：**
```typescript
const success = checker.clearFonts();
```

## 工具函数

### createFontChecker(options?: FontCheckerOptions): FontChecker

创建字体检查器实例。

**参数：**
- `options` (可选): 配置选项

**返回值：**
- `FontChecker`: 字体检查器实例

**示例：**
```typescript
import { createFontChecker } from 'font-load-check';

const checker = createFontChecker({ timeout: 5000 });
```

### checkFont(fontName: string, options?: FontCheckerOptions): Promise<FontCheckResult>

检查单个字体是否已加载。

**参数：**
- `fontName`: 字体名称
- `options` (可选): 配置选项

**返回值：**
- `Promise<FontCheckResult>`: 字体检查结果

**示例：**
```typescript
import { checkFont } from 'font-load-check';

const result = await checkFont('Arial');
console.log(result.loaded); // true/false
```

### checkFonts(fontNames: string[], options?: FontCheckerOptions): Promise<FontLoadResult>

检查多个字体是否已加载。

**参数：**
- `fontNames`: 字体名称数组
- `options` (可选): 配置选项

**返回值：**
- `Promise<FontLoadResult>`: 字体加载结果

**示例：**
```typescript
import { checkFonts } from 'font-load-check';

const result = await checkFonts(['Arial', 'Helvetica']);
if (result.success) {
  console.log('所有字体已加载');
} else {
  console.log('部分字体加载失败:', result.failedFonts);
}
```

### addFont(font: FontFace, options?: FontCheckerOptions): boolean

动态添加字体。

**参数：**
- `font`: FontFace 对象
- `options` (可选): 配置选项

**返回值：**
- `boolean`: 是否添加成功

**示例：**
```typescript
import { addFont } from 'font-load-check';

const fontFace = new FontFace('MyFont', 'url(/path/to/font.woff2)');
const success = addFont(fontFace);
```

### deleteFont(font: FontFace, options?: FontCheckerOptions): boolean

删除字体。

**参数：**
- `font`: FontFace 对象
- `options` (可选): 配置选项

**返回值：**
- `boolean`: 是否删除成功

**示例：**
```typescript
import { deleteFont } from 'font-load-check';

const success = deleteFont(fontFace);
```

### clearFonts(options?: FontCheckerOptions): boolean

清除所有动态添加的字体。

**参数：**
- `options` (可选): 配置选项

**返回值：**
- `boolean`: 是否清除成功

**示例：**
```typescript
import { clearFonts } from 'font-load-check';

const success = clearFonts();
```

### isFontLoaded(fontName: string): boolean

检查字体是否已加载（同步方法）。

**参数：**
- `fontName`: 字体名称

**返回值：**
- `boolean`: 是否已加载

**示例：**
```typescript
import { isFontLoaded } from 'font-load-check';

const loaded = isFontLoaded('Arial');
console.log(loaded); // true/false
```

### waitForFonts(fontNames: string[], timeout?: number): Promise<FontLoadResult>

等待字体加载完成。

**参数：**
- `fontNames`: 字体名称数组
- `timeout` (可选): 超时时间（毫秒）

**返回值：**
- `Promise<FontLoadResult>`: 字体加载结果

**示例：**
```typescript
import { waitForFonts } from 'font-load-check';

const result = await waitForFonts(['Arial', 'Helvetica'], 5000);
```

## 类型定义

### FontCheckerOptions

```typescript
interface FontCheckerOptions {
  timeout?: number; // 字体加载超时时间（毫秒），默认为 3000
}
```

### FontCheckResult

```typescript
interface FontCheckResult {
  name: string;      // 字体名称
  loaded: boolean;   // 是否已加载
  status: string;    // 加载状态：'loaded' | 'unloaded' | 'error' | 'fallback'
}
```

### FontLoadResult

```typescript
interface FontLoadResult {
  success: boolean;                    // 是否全部加载成功
  failedFonts?: FontCheckResult[];     // 失败的字体列表（仅在 success 为 false 时存在）
}
```

## 错误处理

库中的方法可能会抛出以下类型的错误：

- **TypeError**: 当浏览器不支持 CSS Font Loading API 时
- **Error**: 当字体加载超时时
- **NetworkError**: 当字体文件加载失败时

**示例：**
```typescript
try {
  const result = await checker.check('MyFont');
} catch (error) {
  if (error instanceof TypeError) {
    console.error('浏览器不支持字体加载API');
  } else if (error.message === 'Font load timeout') {
    console.error('字体加载超时');
  } else {
    console.error('字体加载失败:', error);
  }
}
```

## 浏览器兼容性

该库依赖于 [CSS Font Loading API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API)，支持以下浏览器：

- Chrome 35+
- Firefox 41+
- Safari 10+
- Edge 79+

对于不支持 CSS Font Loading API 的浏览器，库会回退到使用传统的字体检测方法。 