# Clipboard API

[中文](./api.md) | English

## Clipboard Class

### Constructor

```typescript
new Clipboard()
```

### Methods

#### `copy(text, options?)`
Copy text to clipboard.

```typescript
copy(text: string, options?: CopyOptions): Promise<void>
```

**Parameters:**
- `text` (string): Text to copy to clipboard
- `options` (CopyOptions, optional): Copy options

**Returns:** Promise that resolves when text is copied

#### `read()`
Read text from clipboard.

```typescript
read(): Promise<string>
```

**Returns:** Promise that resolves to clipboard text content

#### `copyImage(blob)`
Copy image to clipboard.

```typescript
copyImage(blob: Blob): Promise<void>
```

**Parameters:**
- `blob` (Blob): Image blob to copy

**Returns:** Promise that resolves when image is copied

#### `readImage()`
Read image from clipboard.

```typescript
readImage(): Promise<Blob | null>
```

**Returns:** Promise that resolves to image blob or null

#### `onChange(callback)`
Add clipboard change event listener.

```typescript
onChange(callback: (event: ClipboardEvent) => void): void
```

**Parameters:**
- `callback` (Function): Event handler function

#### `offChange(callback)`
Remove clipboard change event listener.

```typescript
offChange(callback: (event: ClipboardEvent) => void): void
```

**Parameters:**
- `callback` (Function): Event handler function to remove

### Static Methods

#### `Clipboard.isSupported()`
Check if clipboard is supported in the current browser.

```typescript
static isSupported(): boolean
```

**Returns:** true if clipboard is supported, false otherwise

#### `Clipboard.hasPermission()`
Check if clipboard permission is granted.

```typescript
static hasPermission(): Promise<boolean>
```

**Returns:** Promise that resolves to boolean

#### `Clipboard.requestPermission()`
Request clipboard permission.

```typescript
static requestPermission(): Promise<boolean>
```

**Returns:** Promise that resolves to boolean

## Types

### CopyOptions

```typescript
interface CopyOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
```

## Examples

```javascript
import { Clipboard } from 'js-use-core';

// Basic clipboard operations
const clipboard = new Clipboard();

// Copy text
await clipboard.copy('Hello, World!');

// Read text
const text = await clipboard.read();
console.log('Clipboard content:', text);

// Copy with callbacks
await clipboard.copy('Text to copy', {
  onSuccess: () => console.log('Copied successfully'),
  onError: (error) => console.error('Copy failed:', error)
});

// Check support and permission
if (Clipboard.isSupported()) {
  const hasPermission = await Clipboard.hasPermission();
  if (!hasPermission) {
    await Clipboard.requestPermission();
  }
}

// Listen to clipboard changes
clipboard.onChange((event) => {
  console.log('Clipboard changed:', event);
});
``` 