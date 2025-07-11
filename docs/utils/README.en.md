🚩 Supports JS (Browser), Vue (Vue2 Compatible), React, Node.js Multi-platform Environment

The utility functions module provides common DOM operations and browser compatibility handling functions, providing foundational support for other feature modules.

English | [简体中文](./readme.md)

# Features

- 🚀 **Cross-browser Compatibility** - Automatically handles prefix differences across different browsers
- 📦 **Modular Design** - Supports on-demand imports, reducing bundle size
- 🔧 **TypeScript Support** - Complete type definitions and intelligent hints
- 🎯 **Easy to Use** - Clean API design, quick to get started
- 🛡️ **Feature Detection** - Comprehensive browser feature detection mechanisms
- 📱 **Event Management** - Unified event listener management

# Functions

- Browser feature detection
- Dynamic API retrieval
- Event listener management
- Event emitter
- Prefix handling

# Usage

## Installation

```bash
npm install js-use-core
```

## Usage Examples

### ES6 Module Import

```javascript
// Import utility functions
import { utils } from 'js-use-core';

// Or import separately
import utils from 'js-use-core/src/utils';
```

### CommonJS Import

```javascript
// Import utility functions
const { utils } = require('js-use-core');

// Or import separately
const utils = require('js-use-core/src/utils').default;
```

### Basic Usage

```javascript
import { utils } from 'js-use-core';

// Check browser support
if (utils.isSupported('fullscreen')) {
  // Browser supports fullscreen functionality
}

// Get prefixed property name
const fullscreenElement = utils.getPrefixedProperty('fullscreenElement');

// Add event listener
utils.addEventListener(document, 'fullscreenchange', () => {
  console.log('Fullscreen state changed');
});

// Remove event listener
utils.removeEventListener(document, 'fullscreenchange', handler);
```

# API

## Methods

### `isSupported(feature)`

Check if the browser supports the specified feature.

**Parameters:**
- `feature`: `string` - Feature name, such as 'fullscreen', 'clipboard'

**Returns:** `boolean`

**Example:**
```javascript
// Check fullscreen support
if (utils.isSupported('fullscreen')) {
  console.log('Browser supports fullscreen functionality');
}

// Check clipboard support
if (utils.isSupported('clipboard')) {
  console.log('Browser supports clipboard functionality');
}
```

### `getPrefixedProperty(property)`

Get property name with browser prefix.

**Parameters:**
- `property`: `string` - Property name

**Returns:** `string | undefined`

**Example:**
```javascript
// Get fullscreen element property name
const fullscreenElement = utils.getPrefixedProperty('fullscreenElement');
// Returns: 'fullscreenElement' or 'webkitFullscreenElement' etc.

// Get fullscreen method name
const requestFullscreen = utils.getPrefixedProperty('requestFullscreen');
// Returns: 'requestFullscreen' or 'webkitRequestFullscreen' etc.
```

### `getPrefixedMethod(element, method)`

Get method with browser prefix.

**Parameters:**
- `element`: `Element` - DOM element
- `method`: `string` - Method name

**Returns:** `Function | undefined`

**Example:**
```javascript
const element = document.documentElement;
const requestFullscreen = utils.getPrefixedMethod(element, 'requestFullscreen');

if (requestFullscreen) {
  requestFullscreen.call(element);
}
```

### `addEventListener(element, event, handler, options?)`

Add event listener, supports prefixed event names.

**Parameters:**
- `element`: `EventTarget` - Event target
- `event`: `string` - Event name
- `handler`: `EventListener` - Event handler function
- `options` (optional): `AddEventListenerOptions` - Event options

**Returns:** `void`

**Example:**
```javascript
// Listen for fullscreen change event
utils.addEventListener(document, 'fullscreenchange', () => {
  console.log('Fullscreen state changed');
});

// Listen for clipboard change event
utils.addEventListener(navigator.clipboard, 'clipboardchange', () => {
  console.log('Clipboard content changed');
});
```

### `removeEventListener(element, event, handler, options?)`

Remove event listener, supports prefixed event names.

**Parameters:**
- `element`: `EventTarget` - Event target
- `event`: `string` - Event name
- `handler`: `EventListener` - Event handler function
- `options` (optional): `EventListenerOptions` - Event options

**Returns:** `void`

**Example:**
```javascript
const handler = () => console.log('Fullscreen changed');
utils.addEventListener(document, 'fullscreenchange', handler);
utils.removeEventListener(document, 'fullscreenchange', handler);
```

### `createEventEmitter()`

Create an event emitter instance.

**Returns:** `EventEmitter`

**Example:**
```javascript
const emitter = utils.createEventEmitter();

// Add event listener
emitter.on('customEvent', (data) => {
  console.log('Custom event received:', data);
});

// Emit event
emitter.emit('customEvent', { message: 'Hello World' });

// Remove event listener
emitter.off('customEvent', handler);
```

## Type Definitions

```typescript
interface UtilsAPI {
  isSupported(feature: string): boolean;
  getPrefixedProperty(property: string): string | undefined;
  getPrefixedMethod(element: Element, method: string): Function | undefined;
  addEventListener(element: EventTarget, event: string, handler: EventListener, options?: AddEventListenerOptions): void;
  removeEventListener(element: EventTarget, event: string, handler: EventListener, options?: EventListenerOptions): void;
  createEventEmitter(): EventEmitter;
}

interface EventEmitter {
  on(event: string, listener: Function): void;
  off(event: string, listener: Function): void;
  emit(event: string, ...args: any[]): void;
  once(event: string, listener: Function): void;
  removeAllListeners(event?: string): void;
}
```

# Examples

## Browser Feature Detection

```javascript
import { utils } from 'js-use-core';

// Check various browser features
const features = {
  fullscreen: utils.isSupported('fullscreen'),
  clipboard: utils.isSupported('clipboard'),
  webGL: utils.isSupported('webgl'),
  webRTC: utils.isSupported('webrtc')
};

console.log('Browser features:', features);
```

## Cross-browser Event Handling

```javascript
import { utils } from 'js-use-core';

// Handle fullscreen events across different browsers
function setupFullscreenEvents() {
  const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange'];
  
  events.forEach(event => {
    utils.addEventListener(document, event, () => {
      console.log('Fullscreen state changed');
    });
  });
}
```

## Custom Event Emitter

```javascript
import { utils } from 'js-use-core';

// Create a custom event system
class CustomComponent {
  constructor() {
    this.emitter = utils.createEventEmitter();
  }
  
  on(event, handler) {
    this.emitter.on(event, handler);
  }
  
  off(event, handler) {
    this.emitter.off(event, handler);
  }
  
  trigger(event, data) {
    this.emitter.emit(event, data);
  }
}

// Usage
const component = new CustomComponent();
component.on('dataChange', (data) => {
  console.log('Data changed:', data);
});

component.trigger('dataChange', { value: 'new data' });
```

## Vue.js Integration

```vue
<template>
  <div>
    <button @click="toggleFullscreen">Toggle Fullscreen</button>
  </div>
</template>

<script>
import { utils } from 'js-use-core';

export default {
  mounted() {
    // Check if fullscreen is supported
    if (utils.isSupported('fullscreen')) {
      // Add fullscreen change listener
      utils.addEventListener(document, 'fullscreenchange', this.handleFullscreenChange);
    }
  },
  
  beforeDestroy() {
    // Clean up event listeners
    if (utils.isSupported('fullscreen')) {
      utils.removeEventListener(document, 'fullscreenchange', this.handleFullscreenChange);
    }
  },
  
  methods: {
    handleFullscreenChange() {
      this.$forceUpdate();
    },
    
    async toggleFullscreen() {
      if (utils.isSupported('fullscreen')) {
        const element = document.documentElement;
        const requestFullscreen = utils.getPrefixedMethod(element, 'requestFullscreen');
        
        if (requestFullscreen) {
          try {
            await requestFullscreen.call(element);
          } catch (error) {
            console.error('Fullscreen failed:', error);
          }
        }
      }
    }
  }
}
</script>
```

## React Integration

```jsx
import React, { useEffect, useCallback } from 'react';
import { utils } from 'js-use-core';

function FullscreenComponent() {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  
  const handleFullscreenChange = useCallback(() => {
    const fullscreenElement = utils.getPrefixedProperty('fullscreenElement');
    setIsFullscreen(!!document[fullscreenElement]);
  }, []);
  
  useEffect(() => {
    if (utils.isSupported('fullscreen')) {
      utils.addEventListener(document, 'fullscreenchange', handleFullscreenChange);
      
      return () => {
        utils.removeEventListener(document, 'fullscreenchange', handleFullscreenChange);
      };
    }
  }, [handleFullscreenChange]);
  
  const toggleFullscreen = useCallback(async () => {
    if (utils.isSupported('fullscreen')) {
      const element = document.documentElement;
      const requestFullscreen = utils.getPrefixedMethod(element, 'requestFullscreen');
      const exitFullscreen = utils.getPrefixedMethod(document, 'exitFullscreen');
      
      try {
        if (isFullscreen && exitFullscreen) {
          await exitFullscreen.call(document);
        } else if (requestFullscreen) {
          await requestFullscreen.call(element);
        }
      } catch (error) {
        console.error('Fullscreen operation failed:', error);
      }
    }
  }, [isFullscreen]);
  
  return (
    <div>
      <button onClick={toggleFullscreen}>
        {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      </button>
    </div>
  );
}
```

# Browser Compatibility

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| Chrome | 15+ | ✅ | Full support |
| Firefox | 10+ | ✅ | Full support |
| Safari | 5.1+ | ✅ | Full support |
| Edge | 12+ | ✅ | Full support |
| IE | 11+ | ✅ | Limited support |

**Important Notes:**
- Feature detection works across all supported browsers
- Prefix handling is automatic and transparent
- Event emitter is framework-agnostic

# Contributing

Welcome to contribute code! Please see [CONTRIBUTING.en.md](./CONTRIBUTING.en.md) for details.

# Security

If you discover a security vulnerability, please email security@example.com.

# License

MIT License - See [LICENSE](../../LICENSE) file for details 