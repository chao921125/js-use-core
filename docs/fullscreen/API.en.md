# Fullscreen API

[中文](./api.md) | English

## Fullscreen Class

### Constructor

```typescript
new Fullscreen(element?: Element)
```

**Parameters:**
- `element` (Element, optional): Element to manage fullscreen for, defaults to document.documentElement

### Methods

#### `enter(options?)`
Enter fullscreen mode for the element.

```typescript
enter(options?: FullscreenOptions): Promise<void>
```

**Parameters:**
- `options` (FullscreenOptions, optional): Fullscreen options

**Returns:** Promise that resolves when fullscreen is entered

#### `exit()`
Exit fullscreen mode.

```typescript
exit(): Promise<void>
```

**Returns:** Promise that resolves when fullscreen is exited

#### `toggle(options?)`
Toggle fullscreen state.

```typescript
toggle(options?: FullscreenOptions): Promise<void>
```

**Parameters:**
- `options` (FullscreenOptions, optional): Fullscreen options

**Returns:** Promise that resolves when fullscreen state is toggled

#### `isFullscreen()`
Check if the element is currently in fullscreen mode.

```typescript
isFullscreen(): boolean
```

**Returns:** true if element is fullscreen, false otherwise

#### `onChange(callback)`
Add fullscreen change event listener.

```typescript
onChange(callback: (event: Event) => void): void
```

**Parameters:**
- `callback` (Function): Event handler function

#### `offChange(callback)`
Remove fullscreen change event listener.

```typescript
offChange(callback: (event: Event) => void): void
```

**Parameters:**
- `callback` (Function): Event handler function to remove

### Static Methods

#### `Fullscreen.isSupported()`
Check if fullscreen is supported in the current browser.

```typescript
static isSupported(): boolean
```

**Returns:** true if fullscreen is supported, false otherwise

## Types

### FullscreenOptions

```typescript
interface FullscreenOptions {
  navigationUI?: 'auto' | 'hide' | 'show';
}
```

## Examples

```javascript
import { Fullscreen } from 'js-use-core';

// Basic fullscreen operations
const video = document.querySelector('video');
const fullscreen = new Fullscreen(video);

// Enter fullscreen
await fullscreen.enter();

// Exit fullscreen
await fullscreen.exit();

// Toggle fullscreen
await fullscreen.toggle();

// Check support
if (Fullscreen.isSupported()) {
  console.log('Fullscreen is supported');
}

// Listen to changes
fullscreen.onChange((event) => {
  console.log('Fullscreen changed:', fullscreen.isFullscreen());
});
``` 