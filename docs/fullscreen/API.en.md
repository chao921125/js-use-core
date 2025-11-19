# Fullscreen API

[中文](./api.md) | English

## FullscreenManager Class

### Constructor

```typescript
new FullscreenManager(options?: FullscreenOptions)
```

**Parameters:**
- `options` (FullscreenOptions, optional): Fullscreen manager options

### FullscreenOptions

```typescript
interface FullscreenOptions extends BaseOptions {
  /** Navigation UI display mode */
  navigationUI?: 'auto' | 'hide' | 'show';
  /** Enable performance monitoring */
  enablePerformanceMonitoring?: boolean;
  /** Fullscreen request timeout (milliseconds) */
  requestTimeout?: number;
  /** Enable keyboard input (WebKit) */
  allowKeyboardInput?: boolean;
}
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `isSupported` | `boolean` | Check if fullscreen API is supported |
| `isEnabled` | `boolean` | Check if fullscreen is enabled |
| `isFullscreen` | `boolean` | Check if currently in fullscreen mode |
| `element` | `Element \| null` | Get the current fullscreen element |
| `state` | `FullscreenState` | Get complete fullscreen state information |
| `performanceData` | `FullscreenPerformanceMetrics` | Get performance monitoring data |

### Methods

#### `initialize(): Promise<void>`
Initialize the fullscreen manager. With v1.3.0+, managers are automatically initialized.

```typescript
await fullscreen.initialize();
```

**Returns:** Promise that resolves when initialization is complete

#### `request(element?, options?): Promise<void>`
Request fullscreen mode.

```typescript
request(element?: Element, options?: FullscreenOptions): Promise<void>
```

**Parameters:**
- `element` (Element, optional): Element to fullscreen, defaults to `document.documentElement`
- `options` (FullscreenOptions, optional): Fullscreen options

**Returns:** Promise that resolves when fullscreen is entered

**Examples:**
```javascript
// Page fullscreen
await fullscreen.request();

// Element fullscreen
const videoElement = document.getElementById('video');
await fullscreen.request(videoElement);

// Fullscreen with options
await fullscreen.request(videoElement, { navigationUI: 'hide' });
```

#### `exit(): Promise<void>`
Exit fullscreen mode.

```typescript
exit(): Promise<void>
```

**Returns:** Promise that resolves when fullscreen is exited

**Example:**
```javascript
await fullscreen.exit();
```

#### `toggle(element?, options?): Promise<void>`
Toggle fullscreen state.

```typescript
toggle(element?: Element, options?: FullscreenOptions): Promise<void>
```

**Parameters:**
- `element` (Element, optional): Element to fullscreen (only used when entering fullscreen)
- `options` (FullscreenOptions, optional): Fullscreen options (only used when entering fullscreen)

**Returns:** Promise that resolves when fullscreen state is toggled

**Examples:**
```javascript
// Toggle page fullscreen
await fullscreen.toggle();

// Toggle element fullscreen
await fullscreen.toggle(document.getElementById('video'));
```

#### `destroy(): void`
Destroy the manager instance and clean up resources.

```typescript
destroy(): void
```

#### `on(event, listener): this`
Add event listener.

**Event Types:**
- `'change'` - Fullscreen state change
- `'error'` - Fullscreen operation error
- `'request'` - Fullscreen request started
- `'exit'` - Fullscreen exit started
- `'initialized'` - Manager initialization complete

```javascript
fullscreen.on('change', (data) => {
  console.log('Fullscreen state:', data.isFullscreen);
  console.log('Fullscreen element:', data.element);
});
```

#### `off(event, listener): this`
Remove event listener.

```javascript
const changeListener = (data) => console.log('State changed');
fullscreen.on('change', changeListener);
fullscreen.off('change', changeListener);
```

### Static Methods

#### `isFullscreenSupported(): boolean`
Check if fullscreen is supported in the current browser.

```typescript
static isFullscreenSupported(): boolean
```

**Returns:** true if fullscreen is supported, false otherwise

#### `isFullscreenEnabled(): boolean`
Check if fullscreen is enabled in the current browser.

```typescript
static isFullscreenEnabled(): boolean
```

**Returns:** true if fullscreen is enabled, false otherwise

## Types

### FullscreenState

```typescript
interface FullscreenState {
  isFullscreen: boolean;
  element: Element | null;
  startTime?: number;
  duration?: number;
}
```

### FullscreenPerformanceMetrics

```typescript
interface FullscreenPerformanceMetrics {
  enterTime: number;
  exitTime: number;
  duration: number;
  errorCount: number;
  successCount: number;
}
```

## Examples

### Basic Usage with Auto-initialization (v1.3.0+)

```javascript
import { FullscreenManager } from 'js-use-core';

// Create fullscreen manager (automatically initialized)
const fullscreen = new FullscreenManager({
  enablePerformanceMonitoring: true
});

// Use directly without explicit initialization
await fullscreen.request();

// Check support
if (fullscreen.isSupported && fullscreen.isEnabled) {
  console.log('Fullscreen is supported and enabled');
}

// Listen to changes
fullscreen.on('change', (data) => {
  console.log('Fullscreen changed:', data.isFullscreen);
});
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