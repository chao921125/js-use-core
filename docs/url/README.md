# URL 功能模块

URL 功能模块提供了全面的 URL 解析、操作和相关功能，帮助开发者更便捷地处理 URL 相关操作。

## 功能特性

- 🔍 **URL 解析**: 解析 URL 的各个组成部分
- 📝 **查询参数处理**: 解析和构建查询参数
- 🔧 **URL 构建**: 灵活构建 URL
- ✅ **URL 验证**: 验证 URL 的有效性
- 🛠️ **工具函数**: 丰富的 URL 操作工具

## 快速开始

```javascript
import { url, getUrl, UrlManager } from 'js-use-core';

// 获取当前页面 URL 信息
const { url: currentUrl, origin, pathname } = getUrl();

// 创建 URL 管理器
const urlManager = new UrlManager('https://example.com?name=test&id=123');

// 获取查询参数
const query = urlManager.getQuery();
console.log(query); // { name: 'test', id: '123' }
```

## API 文档

### getUrl(url?)

获取 URL 的详细信息。

**参数:**
- `url` (string, 可选): 要解析的 URL，默认使用当前页面 URL

**返回值:**
- `UrlInfo`: URL 信息对象

```javascript
const urlInfo = getUrl('https://example.com:8080/path?name=test#section');
console.log(urlInfo);
// {
//   url: 'https://example.com:8080/path?name=test#section',
//   protocol: 'https:',
//   hostname: 'example.com',
//   port: '8080',
//   origin: 'https://example.com:8080',
//   pathname: '/path',
//   search: '?name=test',
//   hash: '#section',
//   host: 'example.com:8080'
// }
```

### UrlManager

URL 管理类，提供链式操作。

```javascript
const manager = new UrlManager('https://example.com');

manager
  .setPathname('/api/users')
  .addQuery({ page: 1, limit: 10 })
  .setHash('results');

console.log(manager.toString()); 
// 'https://example.com/api/users?page=1&limit=10#results'
```

#### 方法

- `getUrlInfo()`: 获取 URL 信息
- `getQuery()`: 获取查询参数
- `setQuery(params)`: 设置查询参数
- `addQuery(params)`: 添加查询参数
- `removeQuery(keys)`: 移除查询参数
- `setHash(hash)`: 设置哈希值
- `setPathname(pathname)`: 设置路径
- `toString()`: 获取完整 URL
- `reset(url)`: 重置为新 URL

### buildUrl(options)

构建 URL。

**参数:**
- `options` (UrlBuildOptions): 构建选项

```javascript
const url = buildUrl({
  base: 'https://api.example.com',
  pathname: '/users',
  query: { page: 1, limit: 10 },
  hash: 'results'
});
console.log(url); // 'https://api.example.com/users?page=1&limit=10#results'
```

### 查询参数处理

#### parseQuery(search)

解析查询字符串为对象。

```javascript
import { parseQuery } from 'js-use-core';

const params = parseQuery('?name=test&tags[]=js&tags[]=web&id=123');
console.log(params);
// { name: 'test', 'tags[]': ['js', 'web'], id: '123' }
```

#### stringifyQuery(params, prefix?)

将查询参数对象转换为查询字符串。

```javascript
import { stringifyQuery } from 'js-use-core';

const queryString = stringifyQuery({ 
  name: 'test', 
  tags: ['js', 'web'] 
});
console.log(queryString); // '?name=test&tags[]=js&tags[]=web'
```

#### urlToObj(url)

将 URL 转为对象（兼容旧版本）。

```javascript
import { urlToObj } from 'js-use-core';

const params = urlToObj('https://example.com?name=test&id=123#section');
console.log(params); // { name: 'test', id: '123', HASH: 'section' }
```

### URL 验证和工具

#### isValidUrl(url, options?)

验证 URL 是否有效。

```javascript
import { isValidUrl } from 'js-use-core';

console.log(isValidUrl('https://example.com')); // true
console.log(isValidUrl('invalid-url')); // false

// 自定义验证选项
console.log(isValidUrl('http://localhost:3000', {
  allowLocalhost: true,
  protocols: ['http:', 'https:']
})); // true
```

#### 其他工具函数

```javascript
import { 
  normalizeUrl, 
  joinPath, 
  getFileExtensionFromUrl, 
  getFileNameFromUrl,
  addQuery,
  removeQuery,
  isRelativeUrl,
  isAbsoluteUrl,
  isSameOrigin
} from 'js-use-core';

// 规范化 URL
const normalized = normalizeUrl('/path/../file.txt', 'https://example.com');

// 连接路径
const fullPath = joinPath('/api', 'v1', 'users');

// 获取文件扩展名
const ext = getFileExtensionFromUrl('https://example.com/file.pdf'); // 'pdf'

// 获取文件名
const fileName = getFileNameFromUrl('https://example.com/path/file.pdf'); // 'file.pdf'

// 添加查询参数
const urlWithQuery = addQuery('https://example.com', { page: 1 });

// 移除查询参数
const urlWithoutQuery = removeQuery('https://example.com?page=1&limit=10', 'page');

// URL 类型检查
console.log(isRelativeUrl('/path/to/file')); // true
console.log(isAbsoluteUrl('https://example.com')); // true

// 同源检查
console.log(isSameOrigin('https://example.com/a', 'https://example.com/b')); // true
```

## 使用示例

### 获取当前页面信息

```javascript
import { getUrl, getQuery, getHash } from 'js-use-core';

// 获取完整 URL 信息
const { url, origin, pathname, search, hash } = getUrl();

// 获取查询参数
const queryParams = getQuery();

// 获取哈希值
const hashValue = getHash();
```

### 动态构建 API URL

```javascript
import { UrlManager } from 'js-use-core';

const apiUrl = new UrlManager('https://api.example.com')
  .setPathname('/users')
  .addQuery({ 
    page: 1, 
    limit: 20, 
    sort: 'created_at',
    filters: ['active', 'verified']
  })
  .toString();

console.log(apiUrl);
// 'https://api.example.com/users?page=1&limit=20&sort=created_at&filters[]=active&filters[]=verified'
```

### 处理表单查询参数

```javascript
import { parseQuery, stringifyQuery } from 'js-use-core';

// 从 URL 解析表单数据
const formData = parseQuery(window.location.search);

// 更新表单数据
formData.page = '2';
formData.newField = 'value';

// 构建新的查询字符串
const newSearch = stringifyQuery(formData);

// 更新 URL
window.history.pushState({}, '', `${window.location.pathname}${newSearch}`);
```

## 类型定义

```typescript
interface UrlInfo {
  url: string;
  protocol: string;
  hostname: string;
  port: string;
  origin: string;
  pathname: string;
  search: string;
  hash: string;
  host: string;
}

interface QueryParams {
  [key: string]: string | string[] | undefined;
}

interface UrlBuildOptions {
  base?: string;
  pathname?: string;
  query?: QueryParams;
  hash?: string;
}

interface UrlValidateOptions {
  protocols?: string[];
  requireProtocol?: boolean;
  allowLocalhost?: boolean;
  allowIp?: boolean;
}
```

## 浏览器兼容性

- Chrome 51+
- Firefox 54+
- Safari 10+
- Edge 15+

## 注意事项

1. 在 Node.js 环境中，某些依赖 `window` 对象的功能可能不可用
2. URL 解析基于标准的 `URL` API，确保在目标环境中可用
3. 查询参数支持数组格式 (`key[]=value1&key[]=value2`)
4. 所有 URL 操作都会自动处理编码和解码