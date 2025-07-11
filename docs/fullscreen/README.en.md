# Fullscreen

[中文](./README.md) | English

A comprehensive fullscreen management utility for web applications, providing cross-browser fullscreen API support with enhanced features.

## Features

- **Cross-browser Support**: Works across all modern browsers
- **Element Fullscreen**: Toggle fullscreen for any HTML element
- **Document Fullscreen**: Toggle fullscreen for the entire document
- **Event Handling**: Built-in fullscreen change event listeners
- **TypeScript Support**: Full TypeScript type definitions
- **Zero Dependencies**: Lightweight with no external dependencies

## Installation

```bash
npm install js-use-core
```

## Quick Start

```javascript
import { Fullscreen } from 'js-use-core';

// Toggle fullscreen for an element
const element = document.getElementById('my-video');
const fullscreen = new Fullscreen(element);

// Enter fullscreen
await fullscreen.enter();

// Exit fullscreen
await fullscreen.exit();

// Toggle fullscreen
await fullscreen.toggle();
```

## API

See [API Documentation](./api.en.md) for detailed API reference.

## Examples

```javascript
import { Fullscreen } from 'js-use-core';

// Basic usage
const video = document.querySelector('video');
const fullscreen = new Fullscreen(video);

// Enter fullscreen with options
await fullscreen.enter({
  navigationUI: 'hide'
});

// Listen to fullscreen changes
fullscreen.onChange((event) => {
  console.log('Fullscreen changed:', event);
});

// Check if element is fullscreen
if (fullscreen.isFullscreen()) {
  console.log('Element is in fullscreen mode');
}
```

## Contributing

See [Contributing Guide](./CONTRIBUTING.en.md) for development guidelines. 