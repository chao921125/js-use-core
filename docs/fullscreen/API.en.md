# Fullscreen Feature API Documentation

## Overview

The fullscreen feature provides cross-browser compatible fullscreen API encapsulation, supporting fullscreen operations for pages and elements, automatically handling prefix differences across different browsers.

## Core API

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `isEnabled` | `boolean` | Check if the browser supports fullscreen functionality |
| `isFullscreen` | `boolean` | Check if currently in fullscreen state |
| `element` | `Element \| undefined` | Get the currently fullscreen element |

### Methods

#### `request(element?, options?)`

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

#### `exit()`

Exit fullscreen mode.

**Returns:** `Promise<void>`

**Example:**
```javascript
await fullscreen.exit();
```

#### `toggle(element?, options?)`

Toggle fullscreen state.

**Parameters:**
- `element` (optional): `Element` - Element to make fullscreen
- `options` (optional): `FullscreenOptions` - Fullscreen options

**Returns:** `Promise<void>`

**Example:**
```javascript
await fullscreen.toggle();
```

### Event Management

#### `on(event, listener)`

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

#### `off(event, listener)`

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

#### `offAll(event?)`

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

#### `destroy()`

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

interface FullscreenAPI {
  readonly isEnabled: boolean;
  readonly isFullscreen: boolean;
  readonly element: Element | undefined;
  
  request(element?: Element, options?: FullscreenOptions): Promise<void>;
  exit(): Promise<void>;
  toggle(element?: Element, options?: FullscreenOptions): Promise<void>;
  
  on(event: FullscreenEventType, listener: FullscreenEventListener): void;
  off(event: FullscreenEventType, listener: FullscreenEventListener): void;
  offAll(event?: FullscreenEventType): void;
  destroy(): void;
}
```

## Error Handling

### Common Error Types

```typescript
// Browser does not support fullscreen functionality
if (!fullscreen.isEnabled) {
  console.warn('Browser does not support fullscreen functionality');
}

// Fullscreen operation failed
try {
  await fullscreen.request();
} catch (error) {
  if (error.message.includes('not supported')) {
    console.error('Browser does not support fullscreen functionality');
  } else if (error.message.includes('not enabled')) {
    console.error('Fullscreen functionality is not enabled');
  } else {
    console.error('Fullscreen operation failed:', error);
  }
}
```

### Error Handling Best Practices

```javascript
async function safeFullscreenToggle() {
  try {
    // Check support
    if (!fullscreen.isEnabled) {
      throw new Error('Browser does not support fullscreen functionality');
    }
    
    // Execute fullscreen operation
    await fullscreen.toggle();
    
    // Success handling
    console.log('Fullscreen state toggle successful');
    
  } catch (error) {
    // Error handling
    console.error('Fullscreen operation failed:', error.message);
    
    // User-friendly error message
    const userMessage = getErrorMessage(error);
    showNotification(userMessage, 'error');
  }
}

function getErrorMessage(error) {
  const errorMap = {
    'not supported': 'Your browser does not support fullscreen functionality',
    'not enabled': 'Fullscreen functionality is not enabled',
    'permission denied': 'Fullscreen permission denied',
    'default': 'Fullscreen operation failed, please try again'
  };
  
  for (const [key, message] of Object.entries(errorMap)) {
    if (error.message.includes(key)) {
      return message;
    }
  }
  
  return errorMap.default;
}
```

## Browser Compatibility

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| Chrome | 15+ | ✅ | Full support |
| Firefox | 10+ | ✅ | Full support |
| Safari | 5.1+ | ✅ | Desktop only |
| Edge | 12+ | ✅ | Full support |
| IE | 11+ | ✅ | Limited support |

**Important Notes:**
- Safari on iPhone does not support fullscreen functionality
- Some mobile browsers have limited fullscreen support
- IE 11 has some limitations with element fullscreen

## Performance Considerations

### Memory Management

```javascript
// Good practice: Clean up event listeners
useEffect(() => {
  const handleChange = () => {
    setIsFullscreen(fullscreen.isFullscreen);
  };
  
  fullscreen.on('change', handleChange);
  
  return () => {
    fullscreen.off('change', handleChange);
  };
}, []);

// Better practice: Use destroy when component unmounts
useEffect(() => {
  return () => {
    fullscreen.destroy();
  };
}, []);
```

### Event Listener Optimization

```javascript
// Avoid creating new functions in render
const handleFullscreenChange = useCallback(() => {
  setIsFullscreen(fullscreen.isFullscreen);
}, []);

useEffect(() => {
  fullscreen.on('change', handleFullscreenChange);
  return () => fullscreen.off('change', handleFullscreenChange);
}, [handleFullscreenChange]);
```

## Migration Guide

### From Native Fullscreen API

```javascript
// Old way (native API)
if (document.fullscreenEnabled) {
  document.documentElement.requestFullscreen();
}

// New way (js-use-core)
if (fullscreen.isEnabled) {
  await fullscreen.request();
}
```

### From Other Libraries

```javascript
// Old way (screenfull)
import screenfull from 'screenfull';
if (screenfull.isEnabled) {
  screenfull.toggle();
}

// New way (js-use-core)
import { fullscreen } from 'js-use-core';
if (fullscreen.isEnabled) {
  await fullscreen.toggle();
}
```

## Troubleshooting

### Common Issues

1. **Fullscreen not working on mobile**
   - Check if the browser supports fullscreen
   - Some mobile browsers require user gesture

2. **Event listeners not firing**
   - Ensure the listener is properly registered
   - Check for typos in event names

3. **Permission denied errors**
   - Fullscreen must be triggered by user interaction
   - Some browsers require HTTPS

### Debug Mode

```javascript
// Enable debug mode for development
if (process.env.NODE_ENV === 'development') {
  fullscreen.on('change', (event) => {
    console.log('Fullscreen debug:', {
      isFullscreen: fullscreen.isFullscreen,
      element: fullscreen.element,
      event
    });
  });
}
``` 