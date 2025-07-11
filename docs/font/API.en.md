# Font API

[中文](./api.md) | English

## Font Class

### Constructor

```typescript
new Font(fontFamily: string, source?: string, options?: FontOptions)
```

**Parameters:**
- `fontFamily` (string): Font family name
- `source` (string, optional): Font source URL or CSS
- `options` (FontOptions, optional): Font loading options

### Methods

#### `load()`
Load the font and return a promise that resolves when loading is complete.

```typescript
load(): Promise<FontLoadResult>
```

**Returns:** Promise that resolves to FontLoadResult

#### `isLoaded()`
Check if the font is currently loaded.

```typescript
isLoaded(): boolean
```

**Returns:** true if font is loaded, false otherwise

#### `isAvailable()`
Check if the font is available in the system.

```typescript
isAvailable(): Promise<boolean>
```

**Returns:** Promise that resolves to boolean

### Static Methods

#### `Font.isFontAvailable(fontFamily)`
Check if a font family is available in the system.

```typescript
static isFontAvailable(fontFamily: string): Promise<boolean>
```

**Parameters:**
- `fontFamily` (string): Font family name to check

**Returns:** Promise that resolves to boolean

## Types

### FontOptions

```typescript
interface FontOptions {
  timeout?: number;
  fallback?: string;
  weight?: string | number;
  style?: string;
}
```

### FontLoadResult

```typescript
interface FontLoadResult {
  success: boolean;
  fontFamily: string;
  loaded: boolean;
  error?: string;
}
```

## Examples

```javascript
import { Font } from 'js-use-core';

// Basic font loading
const font = new Font('Roboto', 'https://fonts.googleapis.com/css2?family=Roboto&display=swap');
const result = await font.load();
console.log('Font loaded:', result.success);

// Font with options
const customFont = new Font('CustomFont', 'https://example.com/fonts/custom.css', {
  timeout: 5000,
  fallback: 'sans-serif',
  weight: 'bold'
});

// Check font availability
const isAvailable = await Font.isFontAvailable('Arial');
console.log('Arial available:', isAvailable);
``` 