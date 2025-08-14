# URL 管理 API 文档

## UrlManager 类

URL 管理和操作的核心类，提供 URL 解析、构建、查询参数处理等功能。

### 构造函数

```typescript
constructor(url: string, options?: UrlManagerOptions)
```

**参数**：
- `url`: 要处理的 URL 字符串
- `options`: 配置选项

**选项**：

```typescript
interface UrlManagerOptions extends BaseOptions {
  enableValidation?: boolean;      // 启用 URL 验证
  enableEncoding?: boolean;        // 启用自动编码
  enableNormalization?: boolean;   // 启用 URL 标准化
  strictMode?: boolean;           // 严格模式
  baseUrl?: string;               // 基础 URL
}
```

**示例**：

```javascript
import { UrlManager } from 'js-use-core';

// 基础用法
const url = new UrlManager('https://example.com/path?param=value');

// 带选项
const url = new UrlManager('https://example.com', {
  enableValidation: true,
  enableEncoding: true,
  strictMode: true
});
```

### 属性

#### url

当前的 URL 字符串。

```typescript
readonly url: string
```

#### isValid

URL 是否有效。

```typescript
readonly isValid: boolean
```

#### protocol

协议部分（如 'https:'）。

```typescript
readonly protocol: string
```

#### hostname

主机名部分。

```typescript
readonly hostname: string
```

#### port

端口号。

```typescript
readonly port: string
```

#### pathname

路径部分。

```typescript
readonly pathname: string
```

#### search

查询字符串部分（包含 '?'）。

```typescript
readonly search: string
```

#### hash

哈希部分（包含 '#'）。

```typescript
readonly hash: string
```

#### origin

源部分（协议 + 主机名 + 端口）。

```typescript
readonly origin: string
```

### 方法

#### getUrlInfo()

获取 URL 的详细信息。

```typescript
getUrlInfo(): UrlInfo
```

**返回值**：

```typescript
interface UrlInfo {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  searchParams: URLSearchParams;
  isValid: boolean;
  isAbsolute: boolean;
  isRelative: boolean;
  isSecure: boolean;
  domain: string;
  subdomain: string;
  tld: string;
}
```

**示例**：

```javascript
const url = new UrlManager('https://www.example.com:8080/path?param=value#section');
const info = url.getUrlInfo();

console.log(info.protocol);   // 'https:'
console.log(info.hostname);   // 'www.example.com'
console.log(info.port);       // '8080'
console.log(info.pathname);   // '/path'
console.log(info.isSecure);   // true
console.log(info.domain);     // 'example.com'
console.log(info.subdomain);  // 'www'
console.log(info.tld);        // 'com'
```

#### setProtocol()

设置协议。

```typescript
setProtocol(protocol: string): this
```

**示例**：

```javascript
const url = new UrlManager('http://example.com');
url.setProtocol('https');
console.log(url.toString()); // 'https://example.com'
```

#### setHostname()

设置主机名。

```typescript
setHostname(hostname: string): this
```

#### setPort()

设置端口。

```typescript
setPort(port: string | number): this
```

#### setPathname()

设置路径。

```typescript
setPathname(pathname: string): this
```

**示例**：

```javascript
const url = new UrlManager('https://example.com');
url.setPathname('/api/users');
console.log(url.toString()); // 'https://example.com/api/users'
```

#### setHash()

设置哈希。

```typescript
setHash(hash: string): this
```

**示例**：

```javascript
const url = new UrlManager('https://example.com/page');
url.setHash('section1');
console.log(url.toString()); // 'https://example.com/page#section1'
```

### 查询参数方法

#### getQuery()

获取所有查询参数。

```typescript
getQuery(): QueryParams
```

**返回值**：

```typescript
type QueryParams = Record<string, string | string[] | number | boolean | null>;
```

**示例**：

```javascript
const url = new UrlManager('https://example.com?name=john&age=25&tags=js&tags=web');
const params = url.getQuery();

console.log(params);
// { name: 'john', age: '25', tags: ['js', 'web'] }
```

#### setQuery()

设置查询参数（替换所有现有参数）。

```typescript
setQuery(params: QueryParams): this
```

**示例**：

```javascript
const url = new UrlManager('https://example.com?old=value');
url.setQuery({ name: 'john', age: 25 });
console.log(url.toString()); // 'https://example.com?name=john&age=25'
```

#### addQuery()

添加查询参数（保留现有参数）。

```typescript
addQuery(params: QueryParams): this
```

**示例**：

```javascript
const url = new UrlManager('https://example.com?existing=value');
url.addQuery({ name: 'john', age: 25 });
console.log(url.toString()); 
// 'https://example.com?existing=value&name=john&age=25'
```

#### removeQuery()

移除指定的查询参数。

```typescript
removeQuery(keys: string | string[]): this
```

**示例**：

```javascript
const url = new UrlManager('https://example.com?name=john&age=25&city=ny');
url.removeQuery(['age', 'city']);
console.log(url.toString()); // 'https://example.com?name=john'
```

#### hasQuery()

检查是否存在指定的查询参数。

```typescript
hasQuery(key: string): boolean
```

#### getQueryValue()

获取指定查询参数的值。

```typescript
getQueryValue(key: string): string | string[] | null
```

#### setQueryValue()

设置指定查询参数的值。

```typescript
setQueryValue(key: string, value: string | number | boolean | string[]): this
```

### 路径操作方法

#### appendPath()

追加路径段。

```typescript
appendPath(path: string): this
```

**示例**：

```javascript
const url = new UrlManager('https://example.com/api');
url.appendPath('users').appendPath('123');
console.log(url.toString()); // 'https://example.com/api/users/123'
```

#### prependPath()

前置路径段。

```typescript
prependPath(path: string): this
```

#### getPathSegments()

获取路径段数组。

```typescript
getPathSegments(): string[]
```

**示例**：

```javascript
const url = new UrlManager('https://example.com/api/users/123');
const segments = url.getPathSegments();
console.log(segments); // ['api', 'users', '123']
```

#### setPathSegments()

设置路径段。

```typescript
setPathSegments(segments: string[]): this
```

### 验证和工具方法

#### isValid()

检查 URL 是否有效。

```typescript
isValid(): boolean
```

#### isAbsolute()

检查是否为绝对 URL。

```typescript
isAbsolute(): boolean
```

#### isRelative()

检查是否为相对 URL。

```typescript
isRelative(): boolean
```

#### isSecure()

检查是否为安全连接（HTTPS）。

```typescript
isSecure(): boolean
```

#### isSameOrigin()

检查是否与指定 URL 同源。

```typescript
isSameOrigin(otherUrl: string | UrlManager): boolean
```

#### resolve()

解析相对 URL。

```typescript
resolve(relativeUrl: string): UrlManager
```

**示例**：

```javascript
const baseUrl = new UrlManager('https://example.com/api/');
const resolved = baseUrl.resolve('../users/123');
console.log(resolved.toString()); // 'https://example.com/users/123'
```

#### normalize()

标准化 URL。

```typescript
normalize(): this
```

#### clone()

克隆 URL 管理器。

```typescript
clone(): UrlManager
```

#### toString()

转换为字符串。

```typescript
toString(): string
```

#### toJSON()

转换为 JSON 对象。

```typescript
toJSON(): UrlInfo
```

## 便捷函数

### parseUrl()

解析 URL 的便捷函数。

```typescript
function parseUrl(url: string): UrlInfo
```

### buildUrl()

构建 URL 的便捷函数。

```typescript
function buildUrl(base: string, options: UrlBuildOptions): string
```

**选项**：

```typescript
interface UrlBuildOptions {
  pathname?: string;
  query?: QueryParams;
  hash?: string;
  protocol?: string;
  hostname?: string;
  port?: string | number;
}
```

**示例**：

```javascript
import { buildUrl } from 'js-use-core';

const url = buildUrl('https://example.com', {
  pathname: '/api/users',
  query: { page: 1, limit: 10 },
  hash: 'results'
});

console.log(url); // 'https://example.com/api/users?page=1&limit=10#results'
```

### isValidUrl()

检查 URL 是否有效。

```typescript
function isValidUrl(url: string): boolean
```

### isAbsoluteUrl()

检查是否为绝对 URL。

```typescript
function isAbsoluteUrl(url: string): boolean
```

### isRelativeUrl()

检查是否为相对 URL。

```typescript
function isRelativeUrl(url: string): boolean
```

### isSameOrigin()

检查两个 URL 是否同源。

```typescript
function isSameOrigin(url1: string, url2: string): boolean
```

### resolveUrl()

解析相对 URL。

```typescript
function resolveUrl(base: string, relative: string): string
```

### normalizeUrl()

标准化 URL。

```typescript
function normalizeUrl(url: string, options?: NormalizeOptions): string
```

**选项**：

```typescript
interface NormalizeOptions {
  stripWWW?: boolean;           // 移除 www
  stripTrailingSlash?: boolean; // 移除尾部斜杠
  stripHash?: boolean;          // 移除哈希
  stripQuery?: boolean;         // 移除查询参数
  sortQuery?: boolean;          // 排序查询参数
  lowercaseHostname?: boolean;  // 小写主机名
}
```

### getQueryParams()

获取查询参数。

```typescript
function getQueryParams(url: string): QueryParams
```

### setQueryParams()

设置查询参数。

```typescript
function setQueryParams(url: string, params: QueryParams): string
```

### addQueryParams()

添加查询参数。

```typescript
function addQueryParams(url: string, params: QueryParams): string
```

### removeQueryParams()

移除查询参数。

```typescript
function removeQueryParams(url: string, keys: string | string[]): string
```

## URL 构建器

### UrlBuilder 类

提供链式调用的 URL 构建功能。

```typescript
class UrlBuilder {
  static create(base?: string): UrlBuilder;
  
  protocol(protocol: string): this;
  hostname(hostname: string): this;
  port(port: string | number): this;
  pathname(pathname: string): this;
  appendPath(path: string): this;
  query(params: QueryParams): this;
  addQuery(params: QueryParams): this;
  hash(hash: string): this;
  
  build(): string;
  toUrlManager(): UrlManager;
}
```

**示例**：

```javascript
import { UrlBuilder } from 'js-use-core';

const url = UrlBuilder
  .create('https://example.com')
  .appendPath('api')
  .appendPath('users')
  .addQuery({ page: 1, limit: 10 })
  .hash('results')
  .build();

console.log(url); // 'https://example.com/api/users?page=1&limit=10#results'
```

## 查询字符串处理

### QueryString 类

专门处理查询字符串的工具类。

```typescript
class QueryString {
  static parse(query: string): QueryParams;
  static stringify(params: QueryParams, options?: StringifyOptions): string;
  static append(query: string, params: QueryParams): string;
  static remove(query: string, keys: string | string[]): string;
  static has(query: string, key: string): boolean;
  static get(query: string, key: string): string | string[] | null;
  static set(query: string, key: string, value: any): string;
}
```

**StringifyOptions**：

```typescript
interface StringifyOptions {
  encode?: boolean;        // 是否编码
  arrayFormat?: 'bracket' | 'index' | 'comma' | 'repeat'; // 数组格式
  sort?: boolean;          // 是否排序
  skipNull?: boolean;      // 跳过 null 值
  skipEmptyString?: boolean; // 跳过空字符串
}
```

**示例**：

```javascript
import { QueryString } from 'js-use-core';

// 解析查询字符串
const params = QueryString.parse('name=john&age=25&tags=js&tags=web');
console.log(params); // { name: 'john', age: '25', tags: ['js', 'web'] }

// 生成查询字符串
const query = QueryString.stringify({ 
  name: 'john', 
  age: 25, 
  tags: ['js', 'web'] 
}, {
  arrayFormat: 'bracket'
});
console.log(query); // 'name=john&age=25&tags[]=js&tags[]=web'
```

## 使用示例

### 基础 URL 操作

```javascript
import { UrlManager } from 'js-use-core';

// 创建和修改 URL
const url = new UrlManager('https://api.example.com/v1');

url.appendPath('users')
   .addQuery({ page: 1, limit: 20 })
   .setHash('results');

console.log(url.toString()); 
// 'https://api.example.com/v1/users?page=1&limit=20#results'
```

### API 端点构建

```javascript
import { UrlBuilder } from 'js-use-core';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  
  buildEndpoint(path, params = {}) {
    return UrlBuilder
      .create(this.baseUrl)
      .appendPath('api')
      .appendPath('v1')
      .appendPath(path)
      .addQuery(params)
      .build();
  }
}

const client = new ApiClient('https://example.com');
const endpoint = client.buildEndpoint('users', { 
  page: 1, 
  filter: 'active' 
});

console.log(endpoint); 
// 'https://example.com/api/v1/users?page=1&filter=active'
```

### 查询参数处理

```javascript
import { UrlManager } from 'js-use-core';

const url = new UrlManager(window.location.href);

// 添加搜索参数
url.addQuery({ 
  search: 'javascript',
  category: 'programming',
  tags: ['web', 'frontend']
});

// 更新浏览器 URL（不刷新页面）
history.pushState(null, '', url.toString());
```

### URL 验证和清理

```javascript
import { UrlManager, normalizeUrl } from 'js-use-core';

function sanitizeUrl(input) {
  try {
    const url = new UrlManager(input);
    
    if (!url.isValid()) {
      throw new Error('Invalid URL');
    }
    
    // 标准化 URL
    return normalizeUrl(url.toString(), {
      stripWWW: true,
      stripTrailingSlash: true,
      sortQuery: true,
      lowercaseHostname: true
    });
  } catch (error) {
    console.error('URL sanitization failed:', error);
    return null;
  }
}

const cleanUrl = sanitizeUrl('HTTPS://WWW.Example.COM/Path/?b=2&a=1#hash');
console.log(cleanUrl); // 'https://example.com/path?a=1&b=2#hash'
```

### 相对 URL 解析

```javascript
import { UrlManager } from 'js-use-core';

const baseUrl = new UrlManager('https://example.com/docs/guide/');

// 解析相对路径
const resolved1 = baseUrl.resolve('../api/reference.html');
console.log(resolved1.toString()); // 'https://example.com/docs/api/reference.html'

const resolved2 = baseUrl.resolve('/absolute/path');
console.log(resolved2.toString()); // 'https://example.com/absolute/path'
```

### 同源检查

```javascript
import { UrlManager } from 'js-use-core';

const currentUrl = new UrlManager(window.location.href);
const targetUrl = 'https://api.example.com/data';

if (currentUrl.isSameOrigin(targetUrl)) {
  // 同源请求，可以直接访问
  fetchData(targetUrl);
} else {
  // 跨源请求，需要 CORS 处理
  fetchDataWithCORS(targetUrl);
}
```

## 类型定义

### QueryParams

```typescript
type QueryParams = Record<string, string | string[] | number | boolean | null>;
```

### UrlInfo

```typescript
interface UrlInfo {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  searchParams: URLSearchParams;
  isValid: boolean;
  isAbsolute: boolean;
  isRelative: boolean;
  isSecure: boolean;
  domain: string;
  subdomain: string;
  tld: string;
}
```

### UrlBuildOptions

```typescript
interface UrlBuildOptions {
  pathname?: string;
  query?: QueryParams;
  hash?: string;
  protocol?: string;
  hostname?: string;
  port?: string | number;
}
```

## 错误处理

```javascript
import { UrlManager } from 'js-use-core';

try {
  const url = new UrlManager('invalid-url');
  
  if (!url.isValid()) {
    throw new Error('Invalid URL provided');
  }
  
  // 使用 URL
} catch (error) {
  console.error('URL processing failed:', error.message);
  // 降级处理
}
```

## 浏览器兼容性

- Chrome 32+
- Firefox 26+
- Safari 7+
- Edge 12+
- IE 不支持（需要 polyfill）

## 注意事项

1. URL 构造函数在旧版浏览器中可能不可用，需要 polyfill
2. 查询参数的编码解码遵循 RFC 3986 标准
3. 相对 URL 解析基于当前页面的 base URL
4. 某些特殊字符在不同浏览器中的处理可能不一致
5. 建议在生产环境中启用 URL 验证以防止安全问题