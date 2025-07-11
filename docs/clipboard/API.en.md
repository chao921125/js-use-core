# Clipboard Feature API Documentation

## Overview

The clipboard feature provides cross-browser compatible clipboard API encapsulation, supporting text copy and read operations, automatically handling compatibility issues across different browsers.

## Core API

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `isEnabled` | `boolean` | Check if the browser supports clipboard functionality |

### Methods

#### `writeText(text)`

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

#### `readText()`

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

#### `hasPermission()`

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

#### `requestPermission()`

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

### Event Management

#### `on(event, listener)`

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

#### `off(event, listener)`

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

#### `offAll(event?)`

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

#### `destroy()`

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

## Error Handling

### Common Error Types

```typescript
// Browser does not support clipboard functionality
if (!clipboard.isEnabled) {
  console.warn('Browser does not support clipboard functionality');
}

// Clipboard operation failed
try {
  await clipboard.writeText('test');
} catch (error) {
  if (error.message.includes('not supported')) {
    console.error('Browser does not support clipboard functionality');
  } else if (error.message.includes('permission')) {
    console.error('Clipboard permission denied');
  } else {
    console.error('Clipboard operation failed:', error);
  }
}
```

## Browser Compatibility

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

## Security Considerations

- Always request permission before accessing clipboard
- Handle permission denied gracefully
- Provide fallback for unsupported browsers
- Consider user privacy and security implications 