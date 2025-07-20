# js-use-core

[中文](./README.md) | English

A comprehensive JavaScript utility library providing essential tools for modern web development, including font management, fullscreen operations, clipboard handling, file operations, and utility functions.

## Features

- **Font Management**: Load, validate, and manage web fonts
- **Fullscreen Operations**: Cross-browser fullscreen API support
- **Clipboard Handling**: Copy and paste text and images
- **File Operations**: Read, write, download, and upload files
- **Utility Functions**: Common helper functions and tools
- **TypeScript Support**: Full TypeScript type definitions
- **Zero Dependencies**: Lightweight with no external dependencies

## Installation

```bash
npm install js-use-core
```

## Quick Start

```javascript
import { Font, Fullscreen, Clipboard, File, isString, debounce } from 'js-use-core';

// Font management
const font = new Font('Roboto', 'https://fonts.googleapis.com/css2?family=Roboto&display=swap');
await font.load();

// Fullscreen operations
const fullscreen = new Fullscreen(document.getElementById('video'));
await fullscreen.enter();

// Clipboard operations
const clipboard = new Clipboard();
await clipboard.copy('Hello, World!');

// File operations
const file = new File('example.txt');
const content = await file.read();

// Utility functions
if (isString(value)) {
  console.log('Value is a string');
}

const debouncedSearch = debounce(searchFunction, 300);
```

## Modules

### [Font](./docs/font/README.en.md)
Comprehensive font management utility for web applications.

```javascript
import { Font } from 'js-use-core';

const font = new Font('Arial', 'https://example.com/fonts/arial.css');
await font.load();
```

### [Fullscreen](./docs/fullscreen/README.en.md)
Cross-browser fullscreen API support with enhanced features.

```javascript
import { Fullscreen } from 'js-use-core';

const fullscreen = new Fullscreen(element);
await fullscreen.toggle();
```

### [Clipboard](./docs/clipboard/README.en.md)
Clipboard management with text and image support.

```javascript
import { Clipboard } from 'js-use-core';

const clipboard = new Clipboard();
await clipboard.copy('Text to copy');
```

### [File](./docs/file/README.en.md)
File operations including read, write, download, and upload.

```javascript
import { File } from 'js-use-core';

const file = new File('document.txt');
await file.write('Content to write');
```

### [Utils](./docs/utils/README.en.md)
Common utility functions for everyday development tasks.

```javascript
import { isString, deepClone, debounce } from 'js-use-core';

if (isString(value)) {
  const cloned = deepClone(value);
}
```

### [URL](./docs/url/README.en.md)
Comprehensive URL parsing, manipulation, and related functionality.

```javascript
import { getUrl, UrlManager } from 'js-use-core';

const { url, origin } = getUrl();
const manager = new UrlManager('https://example.com').addQuery({ page: 1 });
```

### [Device](./docs/device/README.en.md)
Comprehensive device detection, operating system identification, and browser detection.

```javascript
import { getDeviceInfo, isMobile, isTablet } from 'js-use-core';

const deviceInfo = getDeviceInfo();
console.log('Is mobile:', isMobile());
console.log('Is tablet:', isTablet());
```

### [User Agent](./docs/ua/README.en.md)
Comprehensive User Agent parsing, generation, comparison, and caching functionality.

```javascript
import { UA, parseUserAgent, getCurrentUA } from 'js-use-core';

const current = getCurrentUA();
const isModern = UA.satisfies(current, 'Chrome >= 100');
console.log('Browser:', current.browser.name);
```

## API Documentation

- [Font API](./docs/font/api.en.md)
- [Fullscreen API](./docs/fullscreen/api.en.md)
- [Clipboard API](./docs/clipboard/api.en.md)
- [File API](./docs/file/api.en.md)
- [Utils API](./docs/utils/api.en.md)

## Examples

See individual module documentation for detailed examples:

- [Font Examples](./docs/font/README.en.md#examples)
- [Fullscreen Examples](./docs/fullscreen/README.en.md#examples)
- [Clipboard Examples](./docs/clipboard/README.en.md#examples)
- [File Examples](./docs/file/README.en.md#examples)
- [Utils Examples](./docs/utils/README.en.md#examples)

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 66+ | ✅ |
| Firefox | 63+ | ✅ |
| Safari | 13.1+ | ✅ |
| Edge | 79+ | ✅ |

## Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.en.md) for details.

### Module-Specific Contributing

- [Font Contributing](./docs/font/CONTRIBUTING.en.md)
- [Fullscreen Contributing](./docs/fullscreen/CONTRIBUTING.en.md)
- [Clipboard Contributing](./docs/clipboard/CONTRIBUTING.en.md)
- [File Contributing](./docs/file/CONTRIBUTING.en.md)
- [Utils Contributing](./docs/utils/CONTRIBUTING.en.md)

## License

MIT License - see [LICENSE](./LICENSE) file for details. 