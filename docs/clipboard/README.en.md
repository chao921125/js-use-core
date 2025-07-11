🚩 Supports JS (Browser), Vue (Vue2 Compatible), React, Node.js Multi-platform Environment

The clipboard feature provides cross-browser compatible clipboard API encapsulation, supporting text copy and read operations, automatically handling compatibility issues across different browsers.

English | [简体中文](./readme.md)

# Features

- 🚀 **Cross-browser Compatibility** - Automatically handles compatibility issues across different browsers
- 📦 **Modular Design** - Supports on-demand imports, reducing bundle size
- 🔧 **TypeScript Support** - Complete type definitions and intelligent hints
- 🎯 **Easy to Use** - Clean API design, quick to get started
- 🛡️ **Permission Management** - Comprehensive permission checking and request mechanisms
- 📱 **Mobile Support** - Compatible with mainstream mobile browsers

# Functions

- Copy text to clipboard
- Read text from clipboard
- Permission management and checking
- Clipboard change monitoring
- Error handling and fallback solutions

# Usage

## Installation

```bash
npm install js-use-core
```

## Usage Examples

### ES6 Module Import

```javascript
// Import clipboard functionality
import { clipboard } from 'js-use-core';

// Or import separately
import clipboard from 'js-use-core/src/clipboard';
```

### CommonJS Import

```javascript
// Import clipboard functionality
const { clipboard } = require('js-use-core');

// Or import separately
const clipboard = require('js-use-core/src/clipboard').default;
```

### Basic Usage

```javascript
import { clipboard } from 'js-use-core';

// Check if clipboard is supported
if (clipboard.isEnabled) {
  // Copy text to clipboard
  await clipboard.writeText('Text to copy');
  
  // Read text from clipboard
  const text = await clipboard.readText();
  
  // Check clipboard permission
  const hasPermission = await clipboard.hasPermission();
}
```

# API

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `isEnabled` | `boolean` | Check if the browser supports clipboard functionality |

## Methods

### `writeText(text)`

Copy text to clipboard.

**Parameters:**
- `text`: `string` - Text to copy

**Returns:** `Promise<void>`

**Example:**
```javascript
try {
  await clipboard.writeText('Hello World!');
  console.log('Text copied to clipboard');
} catch (error) {
  console.error('Copy failed:', error);
}
```

### `readText()`

Read text from clipboard.

**Returns:** `Promise<string>`

**Example:**
```javascript
try {
  const text = await clipboard.readText();
  console.log('Clipboard content:', text);
} catch (error) {
  console.error('Read failed:', error);
}
```

### `hasPermission()`

Check clipboard permission.

**Returns:** `Promise<boolean>`

**Example:**
```javascript
const hasPermission = await clipboard.hasPermission();
if (hasPermission) {
  // Can access clipboard
} else {
  // Need to request permission
}
```

### `requestPermission()`

Request clipboard permission.

**Returns:** `Promise<boolean>`

**Example:**
```javascript
const granted = await clipboard.requestPermission();
if (granted) {
  console.log('Clipboard permission granted');
} else {
  console.log('Clipboard permission denied');
}
```

### `on(event, listener)`

Add event listener.

**Parameters:**
- `event`: `'change'` - Event type
- `listener`: `(event?: ClipboardEvent) => void` - Event handler function

**Example:**
```javascript
// Listen for clipboard changes
clipboard.on('change', (event) => {
  console.log('Clipboard content changed');
});
```

### `off(event, listener)`

Remove event listener.

**Parameters:**
- `event`: `'change'` - Event type
- `listener`: `(event?: ClipboardEvent) => void` - Event handler function

**Example:**
```javascript
const listener = (event) => console.log('Clipboard changed');
clipboard.on('change', listener);
clipboard.off('change', listener);
```

### `offAll(event?)`

Remove all event listeners.

**Parameters:**
- `event` (optional): `'change'` - Event type, if not specified removes all

**Example:**
```javascript
// Remove all change event listeners
clipboard.offAll('change');

// Remove all event listeners
clipboard.offAll();
```

### `destroy()`

Destroy instance, clean up event listeners.

**Example:**
```javascript
clipboard.destroy();
```

## Type Definitions

```typescript
interface ClipboardAPI {
  readonly isEnabled: boolean;
  
  writeText(text: string): Promise<void>;
  readText(): Promise<string>;
  hasPermission(): Promise<boolean>;
  requestPermission(): Promise<boolean>;
  
  on(event: 'change', listener: (event?: ClipboardEvent) => void): void;
  off(event: 'change', listener: (event?: ClipboardEvent) => void): void;
  offAll(event?: 'change'): void;
  destroy(): void;
}
```

# Examples

## Usage in Vue.js

```vue
<template>
  <div>
    <button @click="copyText">Copy Text</button>
    <button @click="pasteText">Paste Text</button>
    <div>{{ clipboardContent }}</div>
  </div>
</template>

<script>
import { clipboard } from 'js-use-core';

export default {
  data() {
    return {
      clipboardContent: ''
    };
  },
  
  mounted() {
    // Listen for clipboard changes
    clipboard.on('change', () => {
      this.updateClipboardContent();
    });
  },
  
  beforeDestroy() {
    // Clean up event listeners
    clipboard.offAll();
  },
  
  methods: {
    async copyText() {
      try {
        await clipboard.writeText('Text to copy');
        this.$message.success('Text copied successfully');
      } catch (error) {
        this.$message.error('Copy failed: ' + error.message);
      }
    },
    
    async pasteText() {
      try {
        const text = await clipboard.readText();
        this.clipboardContent = text;
      } catch (error) {
        this.$message.error('Paste failed: ' + error.message);
      }
    },
    
    async updateClipboardContent() {
      try {
        this.clipboardContent = await clipboard.readText();
      } catch (error) {
        console.error('Failed to read clipboard:', error);
      }
    }
  }
}
</script>
```

## Usage in React

```jsx
import React, { useEffect, useState, useCallback } from 'react';
import { clipboard } from 'js-use-core';

function ClipboardComponent() {
  const [clipboardContent, setClipboardContent] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  
  useEffect(() => {
    // Listen for clipboard changes
    const handleChange = () => {
      updateClipboardContent();
    };
    
    clipboard.on('change', handleChange);
    
    return () => {
      clipboard.off('change', handleChange);
    };
  }, []);
  
  const updateClipboardContent = useCallback(async () => {
    try {
      const text = await clipboard.readText();
      setClipboardContent(text);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  }, []);
  
  const handleCopy = useCallback(async () => {
    try {
      await clipboard.writeText('Text to copy');
      setCopyStatus('Copied successfully!');
      setTimeout(() => setCopyStatus(''), 2000);
    } catch (error) {
      setCopyStatus('Copy failed: ' + error.message);
    }
  }, []);
  
  const handlePaste = useCallback(async () => {
    try {
      const text = await clipboard.readText();
      setClipboardContent(text);
    } catch (error) {
      console.error('Paste failed:', error);
    }
  }, []);
  
  return (
    <div>
      <button onClick={handleCopy}>Copy Text</button>
      <button onClick={handlePaste}>Paste Text</button>
      <div>Clipboard Content: {clipboardContent}</div>
      {copyStatus && <div>{copyStatus}</div>}
    </div>
  );
}
```

## Usage in Native JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>Clipboard Feature Example</title>
</head>
<body>
  <button id="copyBtn">Copy Text</button>
  <button id="pasteBtn">Paste Text</button>
  <div id="content"></div>
  
  <script type="module">
    import { clipboard } from './dist/index.esm.js';
    
    // Check support
    if (!clipboard.isEnabled) {
      console.warn('Browser does not support clipboard functionality');
      document.getElementById('copyBtn').disabled = true;
      document.getElementById('pasteBtn').disabled = true;
    }
    
    // Listen for clipboard changes
    clipboard.on('change', () => {
      updateContent();
    });
    
    // Bind button events
    document.getElementById('copyBtn').addEventListener('click', async () => {
      try {
        await clipboard.writeText('Hello from js-use-core!');
        console.log('Text copied successfully');
      } catch (error) {
        console.error('Copy failed:', error);
      }
    });
    
    document.getElementById('pasteBtn').addEventListener('click', async () => {
      try {
        const text = await clipboard.readText();
        document.getElementById('content').textContent = text;
      } catch (error) {
        console.error('Paste failed:', error);
      }
    });
    
    async function updateContent() {
      try {
        const text = await clipboard.readText();
        document.getElementById('content').textContent = text;
      } catch (error) {
        console.error('Failed to read clipboard:', error);
      }
    }
  </script>
</body>
</html>
```

# Browser Compatibility

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| Chrome | 66+ | ✅ | Full support |
| Firefox | 63+ | ✅ | Full support |
| Safari | 13.1+ | ✅ | Limited support |
| Edge | 79+ | ✅ | Full support |
| IE | - | ❌ | Not supported |

**Important Notes:**
- Clipboard API requires HTTPS in most browsers
- Some browsers require user gesture for clipboard access
- Safari has limited clipboard reading support

# Contributing

Welcome to contribute code! Please see [CONTRIBUTING.en.md](./CONTRIBUTING.en.md) for details.

# Security

If you discover a security vulnerability, please email security@example.com.

# License

MIT License - See [LICENSE](../../LICENSE) file for details 