# font

A zero-dependency, modern JavaScript/TypeScript library for detecting, managing, and manipulating fonts, based on the latest Web Font API.

English | [简体中文](./README.md)

## Table of Contents
- [Features](#features)
- [Functionality](#functionality)
- [Installation](#installation)
- [Usage](#usage)
  - [JavaScript/TypeScript](#jsts-usage)
  - [Vue/React](#vuereact-usage)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Features
- 🚀 Lightweight, zero dependencies
- 🔄 Font loading status detection
- 📦 Dynamic font management (add, delete, clear)
- 💻 Browser support
- 📱 Full TypeScript definitions
- 🛠️ Rich utility functions
- 🔧 Multiple import methods (ESM, CommonJS, UMD)

## Functionality
- Font loading detection and management
- Dynamically add/delete/clear fonts
- Utility functions for development

## Installation
```bash
npm install js-use-core
# or yarn add js-use-core
# or pnpm add js-use-core
```

## Usage

### JS/TS Usage
```js
import { font, checkFont, isFontLoaded } from 'js-use-core';
const checker = new font();
const result = await checker.check('Arial');
console.log(result.success); // true/false
```

### Vue/React Usage
You can directly import and use font and utility functions in your components.

## API Reference
See [API Documentation](./API.en.md)

## Examples
```js
import { addFont, checkFont } from 'js-use-core';
addFont('MyFont', '/fonts/myfont.woff2');
checkFont('MyFont').then(res => console.log(res.loaded));
```
For more usage, see [API Documentation](./API.en.md)

## Contributing
Contributions are welcome! Please read the [Contributing Guide](./CONTRIBUTING.en.md)

## License
MIT 