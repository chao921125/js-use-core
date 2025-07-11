[中文](./README.md) | English

A comprehensive font management utility for web applications, providing font loading, validation, and optimization capabilities.

## Features

- **Font Loading**: Load fonts dynamically with loading status tracking
- **Font Validation**: Validate font availability and loading status
- **Font Optimization**: Optimize font loading performance
- **Cross-browser Support**: Works across all modern browsers
- **TypeScript Support**: Full TypeScript type definitions

## Installation

```bash
npm install js-use-core
```

## Quick Start

```javascript
import { Font } from 'js-use-core';

// Load a font
const font = new Font('Roboto', 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
await font.load();

// Check if font is loaded
if (font.isLoaded()) {
  console.log('Font loaded successfully');
}
```

## API

See [API Documentation](./api.en.md) for detailed API reference.

## Examples

```javascript
import { Font } from 'js-use-core';

// Basic font loading
const font = new Font('Arial', 'https://example.com/fonts/arial.css');
await font.load();

// Font with custom options
const customFont = new Font('CustomFont', 'https://example.com/fonts/custom.css', {
  timeout: 5000,
  fallback: 'sans-serif'
});

// Check font availability
const isAvailable = await Font.isFontAvailable('Arial');
console.log('Arial available:', isAvailable);
```

## Contributing

See [Contributing Guide](./CONTRIBUTING.en.md) for development guidelines. 
