# Utility Functions API Documentation

## Overview

The utility functions module provides common DOM operations and browser compatibility handling functions, providing foundational support for other feature modules.

## Core API

### Methods

#### `isSupported(feature)`

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

#### `getPrefixedProperty(property)`

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

#### `getPrefixedMethod(element, method)`

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

#### `addEventListener(element, event, handler, options?)`

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

#### `removeEventListener(element, event, handler, options?)`

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

#### `createEventEmitter()`

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

## Browser Compatibility

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

## Performance Considerations

### Memory Management

```javascript
// Good practice: Clean up event listeners
useEffect(() => {
  const handleChange = () => {
    setIsFullscreen(fullscreen.isFullscreen);
  };
  
  utils.addEventListener(document, 'fullscreenchange', handleChange);
  
  return () => {
    utils.removeEventListener(document, 'fullscreenchange', handleChange);
  };
}, []);
```

### Feature Detection Optimization

```javascript
// Cache feature detection results
const featureCache = new Map();

function isFeatureSupported(feature) {
  if (!featureCache.has(feature)) {
    featureCache.set(feature, utils.isSupported(feature));
  }
  return featureCache.get(feature);
}
```

## Migration Guide

### From Native APIs

```javascript
// Old way (native API)
if (document.fullscreenEnabled) {
  document.documentElement.requestFullscreen();
}

// New way (utils)
if (utils.isSupported('fullscreen')) {
  const element = document.documentElement;
  const requestFullscreen = utils.getPrefixedMethod(element, 'requestFullscreen');
  if (requestFullscreen) {
    requestFullscreen.call(element);
  }
}
```

### From Other Libraries

```javascript
// Old way (screenfull)
import screenfull from 'screenfull';
if (screenfull.isEnabled) {
  screenfull.toggle();
}

// New way (utils)
import { utils } from 'js-use-core';
if (utils.isSupported('fullscreen')) {
  // Use utils for cross-browser compatibility
}
```

## Troubleshooting

### Common Issues

1. **Feature detection returning false**
   - Check if the feature name is correct
   - Verify browser support for the feature
   - Some features require HTTPS

2. **Event listeners not working**
   - Ensure the event name is correct
   - Check if the element supports the event
   - Verify the handler function is properly defined

3. **Prefix handling issues**
   - The utility automatically handles prefixes
   - Check if the property/method exists in the browser
   - Some older browsers may not support certain features

### Debug Mode

```javascript
// Enable debug mode for development
if (process.env.NODE_ENV === 'development') {
  console.log('Feature support:', {
    fullscreen: utils.isSupported('fullscreen'),
    clipboard: utils.isSupported('clipboard')
  });
  
  console.log('Prefixed properties:', {
    fullscreenElement: utils.getPrefixedProperty('fullscreenElement'),
    requestFullscreen: utils.getPrefixedProperty('requestFullscreen')
  });
}
``` 