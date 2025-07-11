🚩 Supports JS (Browser), Vue (Vue2 Compatible), React, Node.js Multi-platform Environment

The fullscreen feature provides cross-browser compatible fullscreen API encapsulation, supporting fullscreen operations for pages and elements, automatically handling prefix differences across different browsers.

English | [简体中文](./readme.md)

# Features

- 🚀 **Cross-browser Compatibility** - Automatically handles prefix differences across different browsers
- 📦 **Modular Design** - Supports on-demand imports, reducing bundle size
- 🔧 **TypeScript Support** - Complete type definitions and intelligent hints
- 🎯 **Easy to Use** - Clean API design, quick to get started
- 🛡️ **Error Handling** - Comprehensive error handling and fallback solutions
- 📱 **Mobile Support** - Compatible with mainstream mobile browsers

# Functions

- Page and element fullscreen toggle
- Fullscreen state monitoring
- Browser compatibility handling
- Event management
- Automatic prefix processing

# Usage

## Installation

```bash
npm install js-use-core
```

## Usage Examples

### ES6 Module Import

```javascript
// Import fullscreen functionality
import { fullscreen } from 'js-use-core';

// Or import separately
import fullscreen from 'js-use-core/src/fullscreen';
```

### CommonJS Import

```javascript
// Import fullscreen functionality
const { fullscreen } = require('js-use-core');

// Or import separately
const fullscreen = require('js-use-core/src/fullscreen').default;
```

### Basic Usage

```javascript
import { fullscreen } from 'js-use-core';

// Check if fullscreen is supported
if (fullscreen.isEnabled) {
  // Page fullscreen
  await fullscreen.request();
  
  // Exit fullscreen
  await fullscreen.exit();
  
  // Toggle fullscreen state
  await fullscreen.toggle();
}
```

# API

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `isEnabled` | `boolean` | Check if the browser supports fullscreen functionality |
| `isFullscreen` | `boolean` | Check if currently in fullscreen state |
| `element` | `Element \| undefined` | Get the currently fullscreen element |

## Methods

### `request(element?, options?)`

Enter fullscreen mode.

**Parameters:**
- `element` (optional): `Element` - Element to make fullscreen, defaults to `<html>` element
- `options` (optional): `FullscreenOptions` - Fullscreen options

**Returns:** `Promise<void>`

**Example:**
```javascript
// Page fullscreen
await fullscreen.request();

// Element fullscreen
const element = document.getElementById('myElement');
await fullscreen.request(element);

// Fullscreen with options
await fullscreen.request(element, { navigationUI: 'hide' });
```

### `exit()`

Exit fullscreen mode.

**Returns:** `Promise<void>`

**Example:**
```javascript
await fullscreen.exit();
```

### `toggle(element?, options?)`

Toggle fullscreen state.

**Parameters:**
- `element` (optional): `Element` - Element to make fullscreen
- `options` (optional): `FullscreenOptions` - Fullscreen options

**Returns:** `Promise<void>`

**Example:**
```javascript
await fullscreen.toggle();
```

### `on(event, listener)`

Add event listener.

**Parameters:**
- `event`: `'change' \| 'error'` - Event type
- `listener`: `(event?: Event) => void` - Event handler function

**Example:**
```javascript
// Listen for fullscreen state changes
fullscreen.on('change', (event) => {
  console.log('Fullscreen state changed:', fullscreen.isFullscreen);
});

// Listen for fullscreen errors
fullscreen.on('error', (event) => {
  console.error('Fullscreen operation failed:', event);
});
```

### `off(event, listener)`

Remove event listener.

**Parameters:**
- `event`: `'change' \| 'error'` - Event type
- `listener`: `(event?: Event) => void` - Event handler function

**Example:**
```javascript
const listener = (event) => console.log('Fullscreen changed');
fullscreen.on('change', listener);
fullscreen.off('change', listener);
```

### `offAll(event?)`

Remove all event listeners.

**Parameters:**
- `event` (optional): `'change' \| 'error'` - Event type, if not specified removes all

**Example:**
```javascript
// Remove all change event listeners
fullscreen.offAll('change');

// Remove all event listeners
fullscreen.offAll();
```

### `destroy()`

Destroy instance, clean up event listeners.

**Example:**
```javascript
fullscreen.destroy();
```

## Type Definitions

```typescript
interface FullscreenOptions {
  navigationUI?: 'auto' | 'hide' | 'show';
}

type FullscreenEventType = 'change' | 'error';
type FullscreenEventListener = (event?: Event) => void;
```

# Examples

## Usage in Vue.js

```vue
<template>
  <div>
    <button @click="toggleFullscreen">Toggle Fullscreen</button>
    <div ref="fullscreenElement">Content that can be fullscreen</div>
  </div>
</template>

<script>
import { fullscreen } from 'js-use-core';

export default {
  mounted() {
    // Listen for fullscreen state changes
    fullscreen.on('change', () => {
      this.$forceUpdate();
    });
  },
  
  beforeDestroy() {
    // Clean up event listeners
    fullscreen.offAll();
  },
  
  methods: {
    async toggleFullscreen() {
      try {
        await fullscreen.toggle();
      } catch (error) {
        console.error('Fullscreen operation failed:', error);
      }
    },
    
    async toggleElementFullscreen() {
      try {
        await fullscreen.toggle(this.$refs.fullscreenElement);
      } catch (error) {
        console.error('Element fullscreen failed:', error);
      }
    }
  }
}
</script>
```

## Usage in React

```jsx
import React, { useEffect, useCallback } from 'react';
import { fullscreen } from 'js-use-core';

function FullscreenComponent() {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  
  useEffect(() => {
    // Listen for fullscreen state changes
    const handleChange = () => {
      setIsFullscreen(fullscreen.isFullscreen);
    };
    
    fullscreen.on('change', handleChange);
    
    return () => {
      fullscreen.off('change', handleChange);
    };
  }, []);
  
  const handleToggle = useCallback(async () => {
    try {
      await fullscreen.toggle();
    } catch (error) {
      console.error('Fullscreen operation failed:', error);
    }
  }, []);
  
  return (
    <div>
      <button onClick={handleToggle}>
        {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      </button>
    </div>
  );
}
```

## Usage in Native JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>Fullscreen Feature Example</title>
</head>
<body>
  <button id="fullscreenBtn">Toggle Fullscreen</button>
  <div id="content">Page Content</div>
  
  <script type="module">
    import { fullscreen } from './dist/index.esm.js';
    
    // Check support
    if (!fullscreen.isEnabled) {
      console.warn('Browser does not support fullscreen functionality');
      document.getElementById('fullscreenBtn').disabled = true;
    }
    
    // Listen for fullscreen state changes
    fullscreen.on('change', () => {
      const btn = document.getElementById('fullscreenBtn');
      btn.textContent = fullscreen.isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen';
    });
    
    // Listen for errors
    fullscreen.on('error', (event) => {
      console.error('Fullscreen operation failed:', event);
    });
    
    // Bind button event
    document.getElementById('fullscreenBtn').addEventListener('click', async () => {
      try {
        await fullscreen.toggle();
      } catch (error) {
        console.error('Fullscreen failed:', error);
      }
    });
  </script>
</body>
</html>
```

# Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 15+ | ✅ |
| Firefox | 10+ | ✅ |
| Safari | 5.1+ | ✅ (Desktop) |
| Edge | 12+ | ✅ |
| IE | 11+ | ✅ |

**Note:** Safari on iPhone does not support fullscreen functionality.

# Contributing

Welcome to contribute code! Please see [CONTRIBUTING.en.md](./CONTRIBUTING.en.md) for details.

# Security

If you discover a security vulnerability, please email security@example.com.

# License

MIT License - See [LICENSE](../../LICENSE) file for details 