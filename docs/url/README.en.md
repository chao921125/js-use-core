# URL Module

The URL module provides comprehensive URL parsing, manipulation, and related functionality to help developers handle URL operations more conveniently.

## Features

- 🔍 **URL Parsing**: Parse various components of URLs
- 📝 **Query Parameter Handling**: Parse and build query parameters
- 🔧 **URL Building**: Flexible URL construction
- ✅ **URL Validation**: Validate URL validity
- 🛠️ **Utility Functions**: Rich URL manipulation tools

## Quick Start

```javascript
import { url, getUrl, UrlManager } from 'js-use-core';

// Get current page URL information
const { url: currentUrl, origin, pathname } = getUrl();

// Create URL manager
const urlManager = new UrlManager('https://example.com?name=test&id=123');

// Get query parameters
const query = urlManager.getQuery();
console.log(query); // { name: 'test', id: '123' }
```

## API Documentation

### getUrl(url?)

Get detailed URL information.

**Parameters:**
- `url` (string, optional): URL to parse, defaults to current page URL

**Returns:**
- `UrlInfo`: URL information object

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

URL management class with chainable operations.

```javascript
const manager = new UrlManager('https://example.com');

manager
  .setPathname('/api/users')
  .addQuery({ page: 1, limit: 10 })
  .setHash('results');

console.log(manager.toString()); 
// 'https://example.com/api/users?page=1&limit=10#results'
```

#### Methods

- `getUrlInfo()`: Get URL information
- `getQuery()`: Get query parameters
- `setQuery(params)`: Set query parameters
- `addQuery(params)`: Add query parameters
- `removeQuery(keys)`: Remove query parameters
- `setHash(hash)`: Set hash value
- `setPathname(pathname)`: Set pathname
- `toString()`: Get complete URL
- `reset(url)`: Reset to new URL

### buildUrl(options)

Build URL.

**Parameters:**
- `options` (UrlBuildOptions): Build options

```javascript
const url = buildUrl({
  base: 'https://api.example.com',
  pathname: '/users',
  query: { page: 1, limit: 10 },
  hash: 'results'
});
console.log(url); // 'https://api.example.com/users?page=1&limit=10#results'
```

### Query Parameter Handling

#### parseQuery(search)

Parse query string to object.

```javascript
import { parseQuery } from 'js-use-core';

const params = parseQuery('?name=test&tags[]=js&tags[]=web&id=123');
console.log(params);
// { name: 'test', 'tags[]': ['js', 'web'], id: '123' }
```

#### stringifyQuery(params, prefix?)

Convert query parameter object to query string.

```javascript
import { stringifyQuery } from 'js-use-core';

const queryString = stringifyQuery({ 
  name: 'test', 
  tags: ['js', 'web'] 
});
console.log(queryString); // '?name=test&tags[]=js&tags[]=web'
```

#### urlToObj(url)

Convert URL to object (backward compatibility).

```javascript
import { urlToObj } from 'js-use-core';

const params = urlToObj('https://example.com?name=test&id=123#section');
console.log(params); // { name: 'test', id: '123', HASH: 'section' }
```

### URL Validation and Utilities

#### isValidUrl(url, options?)

Validate if URL is valid.

```javascript
import { isValidUrl } from 'js-use-core';

console.log(isValidUrl('https://example.com')); // true
console.log(isValidUrl('invalid-url')); // false

// Custom validation options
console.log(isValidUrl('http://localhost:3000', {
  allowLocalhost: true,
  protocols: ['http:', 'https:']
})); // true
```

#### Other Utility Functions

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

// Normalize URL
const normalized = normalizeUrl('/path/../file.txt', 'https://example.com');

// Join paths
const fullPath = joinPath('/api', 'v1', 'users');

// Get file extension
const ext = getFileExtensionFromUrl('https://example.com/file.pdf'); // 'pdf'

// Get filename
const fileName = getFileNameFromUrl('https://example.com/path/file.pdf'); // 'file.pdf'

// Add query parameters
const urlWithQuery = addQuery('https://example.com', { page: 1 });

// Remove query parameters
const urlWithoutQuery = removeQuery('https://example.com?page=1&limit=10', 'page');

// URL type checking
console.log(isRelativeUrl('/path/to/file')); // true
console.log(isAbsoluteUrl('https://example.com')); // true

// Same origin check
console.log(isSameOrigin('https://example.com/a', 'https://example.com/b')); // true
```

## Usage Examples

### Get Current Page Information

```javascript
import { getUrl, getQuery, getHash } from 'js-use-core';

// Get complete URL information
const { url, origin, pathname, search, hash } = getUrl();

// Get query parameters
const queryParams = getQuery();

// Get hash value
const hashValue = getHash();
```

### Dynamic API URL Building

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

### Handle Form Query Parameters

```javascript
import { parseQuery, stringifyQuery } from 'js-use-core';

// Parse form data from URL
const formData = parseQuery(window.location.search);

// Update form data
formData.page = '2';
formData.newField = 'value';

// Build new query string
const newSearch = stringifyQuery(formData);

// Update URL
window.history.pushState({}, '', `${window.location.pathname}${newSearch}`);
```

## Type Definitions

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

## Browser Compatibility

- Chrome 51+
- Firefox 54+
- Safari 10+
- Edge 15+

## Notes

1. In Node.js environment, some features depending on `window` object may not be available
2. URL parsing is based on standard `URL` API, ensure it's available in target environment
3. Query parameters support array format (`key[]=value1&key[]=value2`)
4. All URL operations automatically handle encoding and decoding