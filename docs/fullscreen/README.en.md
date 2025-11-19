# Fullscreen

[中文](./README.md) | English

A comprehensive fullscreen management utility for web applications, providing cross-browser fullscreen API support with enhanced features and auto-initialization.

## Features

- **Cross-browser Support**: Works across all modern browsers
- **Element Fullscreen**: Toggle fullscreen for any HTML element
- **Document Fullscreen**: Toggle fullscreen for the entire document
- **Event Handling**: Built-in fullscreen change event listeners
- **TypeScript Support**: Full TypeScript type definitions
- **Zero Dependencies**: Lightweight with no external dependencies
- **Auto-initialization**: v1.3.0+ supports automatic initialization

## Installation

```bash
npm install js-use-core
```

## Quick Start

### Auto-initialization (v1.3.0+)

```javascript
import { FullscreenManager } from 'js-use-core';

// Create fullscreen manager (automatically initialized)
const fullscreen = new FullscreenManager();

// Use directly without explicit initialization
await fullscreen.request(); // Auto-handles initialization

// Check support
if (fullscreen.isSupported && fullscreen.isEnabled) {
  console.log('Fullscreen is supported and enabled');
}
```

### Manual Initialization (Legacy)

```javascript
import { FullscreenManager } from 'js-use-core';

// Create fullscreen manager
const fullscreen = new FullscreenManager();

// Manual initialization (optional in v1.3.0+)
await fullscreen.initialize();

// Use fullscreen features
await fullscreen.request();
await fullscreen.exit();
await fullscreen.toggle();
```

### Using Convenience Functions

```javascript
import { 
  requestFullscreen, 
  exitFullscreen, 
  toggleFullscreen,
  isFullscreenSupported,
  isFullscreenEnabled,
  isFullscreen
} from 'js-use-core';

// Check support
if (isFullscreenSupported() && isFullscreenEnabled()) {
  // Request fullscreen
  await requestFullscreen();
  
  // Check current state
  if (isFullscreen()) {
    await exitFullscreen();
  }
  
  // Toggle state
  await toggleFullscreen();
}
```

## Auto-initialization Feature (v1.3.0+)

Starting from v1.3.0, FullscreenManager supports automatic initialization, eliminating the need to manually call the `initialize()` method.

### Benefits

1. **Simplified Usage** - Create instance and use all features directly
2. **Backward Compatible** - Still supports manual initialization
3. **Performance Optimized** - Initialization process doesn't block constructor execution
4. **Better Error Handling** - Initialization errors are thrown when used, providing better debugging experience

### Usage

```javascript
import { FullscreenManager } from 'js-use-core';

// Create instance (auto-initialization starts)
const fullscreen = new FullscreenManager();

// Use directly without waiting for initialization
await fullscreen.request(); // Auto-handles initialization

// If you need to ensure initialization is complete, use ready() method
await fullscreen.ready(); // Wait for initialization to complete
```

### Waiting for Initialization

While you can use features immediately, if you need to ensure initialization is complete, you can use the `ready()` method:

```javascript
const fullscreen = new FullscreenManager();

// Wait for initialization to complete
await fullscreen.ready();

// Now you can safely use all features
console.log('Fullscreen manager is ready');
```

## API

See [API Documentation](./API.en.md) for detailed API reference.

## Examples

### Basic Usage

```javascript
import { FullscreenManager } from 'js-use-core';

// Create fullscreen manager (auto-initialized in v1.3.0+)
const fullscreen = new FullscreenManager();

// Element fullscreen
const video = document.querySelector('video');
await fullscreen.request(video);

// Document fullscreen
await fullscreen.request();

// Exit fullscreen
await fullscreen.exit();

// Toggle fullscreen
await fullscreen.toggle();
```

### Event Handling

```javascript
import { FullscreenManager } from 'js-use-core';

const fullscreen = new FullscreenManager();

// Listen to fullscreen changes
fullscreen.on('change', (data) => {
  console.log('Fullscreen changed:', data.isFullscreen);
});

// Listen to errors
fullscreen.on('error', (error) => {
  console.error('Fullscreen error:', error);
});

// Listen to request events
fullscreen.on('request', (data) => {
  console.log('Fullscreen request started:', data.element);
});
```

### Performance Monitoring

```javascript
import { FullscreenManager } from 'js-use-core';

const fullscreen = new FullscreenManager({
  enablePerformanceMonitoring: true
});

// Request fullscreen
await fullscreen.request();

// Get performance data
const perfData = fullscreen.performanceData;
console.log('Enter time:', perfData.enterTime, 'ms');
console.log('Success count:', perfData.successCount);
```

## Contributing

See [Contributing Guide](./CONTRIBUTING.en.md) for development guidelines.