# Migration Guide

This document helps you migrate from the old version of js-use-core to the new refactored version.

## Overview

The new version adopts a unified architectural design where all functional modules are based on the `BaseManager` base class, providing better error handling, performance monitoring, and extensibility.

## Major Changes

### 1. Architecture Changes

**Old Version:**
```javascript
import { fullscreen, clipboard, font } from 'js-use-core';

// Direct usage
await fullscreen.request();
await clipboard.writeText('text');
const result = await font.check('Arial');
```

**New Version:**
```javascript
import { FullscreenManager, ClipboardManager, FontManager } from 'js-use-core';

// Need to create instances and initialize
const fullscreen = new FullscreenManager();
await fullscreen.initialize();
await fullscreen.request();

const clipboard = new ClipboardManager();
await clipboard.initialize();
await clipboard.copyText('text');

const fontManager = new FontManager();
await fontManager.initialize();
const result = await fontManager.check('Arial');
```

### 2. Import Changes

#### Fullscreen

**Old Version:**
```javascript
import { fullscreen } from 'js-use-core';
```

**New Version:**
```javascript
// Method 1: Use manager class
import { FullscreenManager } from 'js-use-core';
const fullscreen = new FullscreenManager();

// Method 2: Use convenience functions
import { requestFullscreen, exitFullscreen } from 'js-use-core';

// Method 3: Use default instance
import { fullscreen } from 'js-use-core';
```

#### Clipboard

**Old Version:**
```javascript
import { clipboard } from 'js-use-core';
await clipboard.writeText('text');
```

**New Version:**
```javascript
// Method 1: Use manager class
import { ClipboardManager } from 'js-use-core';
const clipboard = new ClipboardManager();
await clipboard.initialize();
await clipboard.copyText('text');

// Method 2: Use convenience functions
import { copyText, readText } from 'js-use-core';
await copyText('text');
```

#### Font

**Old Version:**
```javascript
import { font } from 'js-use-core';
const result = await font.check('Arial');
```

**New Version:**
```javascript
// Method 1: Use manager class
import { FontManager } from 'js-use-core';
const fontManager = new FontManager();
await fontManager.initialize();
const result = await fontManager.check('Arial');

// Method 2: Use convenience functions
import { checkFont } from 'js-use-core';
const result = await checkFont('Arial');
```

### 3. API Changes

#### Fullscreen API

**Old Version:**
```javascript
// Properties
fullscreen.isEnabled
fullscreen.isFullscreen
fullscreen.element

// Methods
await fullscreen.request(element);
await fullscreen.exit();
await fullscreen.toggle();

// Events
fullscreen.on('change', handler);
fullscreen.on('error', handler);
```

**New Version:**
```javascript
// Properties (need initialization first)
fullscreen.isSupported  // New: check browser support
fullscreen.isEnabled
fullscreen.isFullscreen
fullscreen.element
fullscreen.state        // New: complete state information
fullscreen.performanceData  // New: performance data

// Methods
await fullscreen.initialize();  // New: must initialize
await fullscreen.request(element, options);
await fullscreen.exit();
await fullscreen.toggle(element, options);
fullscreen.destroy();   // New: destroy instance

// Events (more event types)
fullscreen.on('change', handler);
fullscreen.on('error', handler);
fullscreen.on('request', handler);    // New
fullscreen.on('exit', handler);       // New
fullscreen.on('initialized', handler); // New
```

#### Clipboard API

**Old Version:**
```javascript
await clipboard.writeText(text);
const text = await clipboard.readText();
```

**New Version:**
```javascript
// Initialization
await clipboard.initialize();

// Text operations
await clipboard.copyText(text, options);
const text = await clipboard.readText(options);

// HTML operations (New)
await clipboard.copyHTML(html, options);
const html = await clipboard.readHTML(options);

// File operations (New)
await clipboard.copyFiles(files, options);
const files = await clipboard.readFiles(options);

// Element copying (New)
await clipboard.copyElement(element, options);

// Generic reading (New)
const data = await clipboard.read(options);
```

#### Font API

**Old Version:**
```javascript
const result = await font.check('Arial');
font.addFont(name, url);
font.deleteFont(name);
```

**New Version:**
```javascript
// Initialization
await fontManager.initialize();

// Check fonts (return format changed)
const result = await fontManager.check('Arial');
// result: { success: boolean, allFonts: FontCheckResult[], failedFonts?: FontCheckResult[] }

// Add font (return value changed)
const success = fontManager.addFont(name, url, options);

// Batch add (New)
const results = await fontManager.addFonts([
  { name: 'Font1', url: '/fonts/font1.woff2' },
  { name: 'Font2', url: '/fonts/font2.woff2' }
]);

// Delete font
const deleted = fontManager.deleteFont(name);

// Get loading state (New)
const state = fontManager.getFontLoadState(name);
const allStates = fontManager.getAllFontLoadStates();
```

### 4. Configuration Options Changes

All managers now support unified basic configuration:

```javascript
const options = {
  debug: false,           // Debug mode
  timeout: 5000,         // Operation timeout
  retries: 2,            // Retry count
  cache: true,           // Enable caching
  cacheTTL: 30000       // Cache expiration time
};

// Each manager also has specific configuration options
const fullscreenOptions = {
  ...options,
  enablePerformanceMonitoring: true,
  navigationUI: 'auto',
  allowKeyboardInput: true
};

const clipboardOptions = {
  ...options,
  enablePermissionCheck: true,
  enableFallback: true,
  enableDataValidation: true,
  maxDataSize: 10 * 1024 * 1024
};

const fontOptions = {
  ...options,
  concurrency: 5,
  detectionThreshold: 2
};
```

### 5. Error Handling Changes

**Old Version:**
```javascript
try {
  await fullscreen.request();
} catch (error) {
  console.error(error.message);
}
```

**New Version:**
```javascript
try {
  await fullscreen.request();
} catch (error) {
  // Unified error format
  console.error('Error type:', error.type);
  console.error('Error message:', error.message);
  console.error('Error context:', error.context);
  console.error('Is recoverable:', error.recoverable);
  console.error('Solution:', error.solution);
}
```

### 6. Enhanced Event System

**New version adds more events:**

```javascript
// Fullscreen manager
fullscreen.on('initialized', () => console.log('Initialized'));
fullscreen.on('request', (data) => console.log('Starting fullscreen request'));
fullscreen.on('exit', (data) => console.log('Starting fullscreen exit'));

// Clipboard manager
clipboard.on('copy', (data) => console.log('Copy completed'));
clipboard.on('read', (data) => console.log('Read completed'));

// Font manager
fontManager.on('fontAdded', (data) => console.log('Font added'));
fontManager.on('fontLoaded', (data) => console.log('Font loaded'));
fontManager.on('fontLoadError', (data) => console.log('Font load failed'));
```

## Migration Steps

### Step 1: Update Import Statements

Update all import statements to use the new manager classes or convenience functions.

### Step 2: Add Initialization Code

Add initialization calls for all manager instances.

### Step 3: Update API Calls

Update all method calls according to the new API format.

### Step 4: Update Error Handling

Update error handling code to use the new unified error format.

### Step 5: Add Resource Cleanup

Call the `destroy()` method to clean up resources when components are destroyed.

## Compatibility

### Backward Compatibility

To help with migration, we provide some backward-compatible convenience functions:

```javascript
// These functions provide a similar experience to the old version
import { 
  requestFullscreen,  // Similar to old fullscreen.request()
  copyText,          // Similar to old clipboard.writeText()
  checkFont          // Similar to old font.check()
} from 'js-use-core';
```

### Progressive Migration

You can migrate gradually, with new and old APIs coexisting in the same project:

```javascript
// Continue using convenience functions (similar to old version)
import { requestFullscreen, copyText } from 'js-use-core';

// Use new manager classes for more functionality
import { FontManager } from 'js-use-core';
const fontManager = new FontManager({ debug: true });
```

## FAQ

### Q: Why is initialization required?

A: The new architecture supports more complex configuration and state management. The initialization process ensures all dependencies and configurations are properly set up.

### Q: Will old version code still work?

A: Most convenience functions provide backward compatibility, but we recommend migrating to the new architecture for better functionality and performance.

### Q: How to handle multiple instances?

A: The new architecture supports creating multiple independent manager instances, each with its own configuration and state.

### Q: Is there a performance impact?

A: The new architecture provides better performance through caching, performance monitoring, and optimized algorithms.

## Getting Help

If you encounter issues during migration:

1. Check the detailed API documentation
2. Review example code
3. Submit an Issue on GitHub
4. Refer to test cases

## Summary

The new version provides:

- More unified architectural design
- Better error handling
- Richer functionality
- Better performance
- Stronger extensibility

While some migration work is required, the new architecture will bring better development experience and more stable runtime performance to your project.