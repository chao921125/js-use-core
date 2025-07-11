# Clipboard

[中文](./README.md) | English

A comprehensive clipboard management utility for web applications, providing cross-browser clipboard API support with enhanced features.

## Features

- **Cross-browser Support**: Works across all modern browsers
- **Text Copy/Paste**: Copy and paste text content
- **Image Support**: Copy and paste images
- **Event Handling**: Built-in clipboard event listeners
- **TypeScript Support**: Full TypeScript type definitions
- **Zero Dependencies**: Lightweight with no external dependencies

## Installation

```bash
npm install js-use-core
```

## Quick Start

```javascript
import { Clipboard } from 'js-use-core';

// Copy text to clipboard
const clipboard = new Clipboard();
await clipboard.copy('Hello, World!');

// Read text from clipboard
const text = await clipboard.read();

// Copy image to clipboard
const imageBlob = await fetch('image.png').then(r => r.blob());
await clipboard.copyImage(imageBlob);
```

## API

See [API Documentation](./api.en.md) for detailed API reference.

## Examples

```javascript
import { Clipboard } from 'js-use-core';

// Basic text operations
const clipboard = new Clipboard();

// Copy with success callback
await clipboard.copy('Text to copy', {
  onSuccess: () => console.log('Copied successfully'),
  onError: (error) => console.error('Copy failed:', error)
});

// Read clipboard content
const content = await clipboard.read();
console.log('Clipboard content:', content);

// Listen to clipboard changes
clipboard.onChange((event) => {
  console.log('Clipboard changed:', event);
});
```

## Contributing

See [Contributing Guide](./CONTRIBUTING.en.md) for development guidelines. 