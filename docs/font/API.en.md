# API Documentation

> Back to [Main README](../README.en.md)

## Core Classes

### FontChecker

The main font checker class that provides font loading detection and management functionality.

#### Constructor

```typescript
constructor(options?: FontCheckerOptions)
```

**Parameters:**
- `options` (optional): Configuration options
  - `timeout`: Font loading timeout in milliseconds, default is 3000

**Example:**
```typescript
import FontChecker from 'font-load-check';

// With default configuration
const checker = new FontChecker();

// With custom configuration
const checker = new FontChecker({ timeout: 5000 });
```

#### Methods

##### check(fontNames?: string | string[]): Promise<FontLoadResult>

Checks if fonts are loaded.

**Parameters:**
- `fontNames` (optional): Font name or array of font names, if not provided, checks all loaded fonts

**Returns:**
- `Promise<FontLoadResult>`: Font loading result

**Example:**
```typescript
// Check a single font
const result = await checker.check('Arial');

// Check multiple fonts
const result = await checker.check(['Arial', 'Helvetica', 'Times New Roman']);

// Check all fonts
const result = await checker.check();
```

##### addFont(fontName: string, url: string, options?: FontFaceDescriptors): boolean

Dynamically adds a font.

**Parameters:**
- `fontName`: Font name
- `url`: URL to the font file
- `options` (optional): FontFace descriptor options

**Returns:**
- `boolean`: Whether the addition was successful

**Example:**
```typescript
const success = checker.addFont('MyFont', '/path/to/font.woff2');
```

##### addFontFace(font: FontFace): boolean

Dynamically adds a font using a FontFace object.

**Parameters:**
- `font`: FontFace object

**Returns:**
- `boolean`: Whether the addition was successful

**Example:**
```typescript
const fontFace = new FontFace('MyFont', 'url(/path/to/font.woff2)');
const success = checker.addFontFace(fontFace);
```

##### deleteFont(font: FontFace | string): boolean

Deletes a previously added font.

**Parameters:**
- `font`: FontFace object or font name

**Returns:**
- `boolean`: Whether the deletion was successful

**Example:**
```typescript
// Delete by FontFace object
const success = checker.deleteFont(fontFace);

// Delete by font name
const success = checker.deleteFont('MyFont');
```

##### clearFonts(): boolean

Clears all dynamically added fonts.

**Returns:**
- `boolean`: Whether the clearing was successful

**Example:**
```typescript
const success = checker.clearFonts();
```

## Utility Functions

### createFontChecker(options?: FontCheckerOptions): FontChecker

Creates a font checker instance.

**Parameters:**
- `options` (optional): Configuration options

**Returns:**
- `FontChecker`: Font checker instance

**Example:**
```typescript
import { createFontChecker } from 'font-load-check';

const checker = createFontChecker({ timeout: 5000 });
```

### checkFont(fontName: string, options?: FontCheckerOptions): Promise<FontCheckResult>

Checks if a single font is loaded.

**Parameters:**
- `fontName`: Font name
- `options` (optional): Configuration options

**Returns:**
- `Promise<FontCheckResult>`: Font check result

**Example:**
```typescript
import { checkFont } from 'font-load-check';

const result = await checkFont('Arial');
console.log(result.loaded); // true/false
```

### checkFonts(fontNames: string[], options?: FontCheckerOptions): Promise<FontLoadResult>

Checks if multiple fonts are loaded.

**Parameters:**
- `fontNames`: Array of font names
- `options` (optional): Configuration options

**Returns:**
- `Promise<FontLoadResult>`: Font loading result

**Example:**
```typescript
import { checkFonts } from 'font-load-check';

const result = await checkFonts(['Arial', 'Helvetica']);
if (result.success) {
  console.log('All fonts are loaded');
} else {
  console.log('Some fonts failed to load:', result.failedFonts);
}
```

### addFont(fontName: string, url: string, options?: FontFaceDescriptors, checkerOptions?: FontCheckerOptions): boolean

Dynamically adds a font.

**Parameters:**
- `fontName`: Font name
- `url`: URL to the font file
- `options` (optional): FontFace descriptor options
- `checkerOptions` (optional): Font checker configuration options

**Returns:**
- `boolean`: Whether the addition was successful

**Example:**
```typescript
import { addFont } from 'font-load-check';

const success = addFont('MyFont', '/path/to/font.woff2');
```

### addFontFace(font: FontFace, options?: FontCheckerOptions): boolean

Dynamically adds a font using a FontFace object.

**Parameters:**
- `font`: FontFace object
- `options` (optional): Configuration options

**Returns:**
- `boolean`: Whether the addition was successful

**Example:**
```typescript
import { addFontFace } from 'font-load-check';

const fontFace = new FontFace('MyFont', 'url(/path/to/font.woff2)');
const success = addFontFace(fontFace);
```

### deleteFont(font: FontFace | string, options?: FontCheckerOptions): boolean

Deletes a font.

**Parameters:**
- `font`: FontFace object or font name
- `options` (optional): Configuration options

**Returns:**
- `boolean`: Whether the deletion was successful

**Example:**
```typescript
import { deleteFont } from 'font-load-check';

// Delete by FontFace object
const success = deleteFont(fontFace);

// Delete by font name
const success = deleteFont('MyFont');
```

### clearFonts(options?: FontCheckerOptions): boolean

Clears all dynamically added fonts.

**Parameters:**
- `options` (optional): Configuration options

**Returns:**
- `boolean`: Whether the clearing was successful

**Example:**
```typescript
import { clearFonts } from 'font-load-check';

const success = clearFonts();
```

### isFontLoaded(fontName: string): boolean

Checks if a font is loaded (synchronous method).

**Parameters:**
- `fontName`: Font name

**Returns:**
- `boolean`: Whether the font is loaded

**Example:**
```typescript
import { isFontLoaded } from 'font-load-check';

const loaded = isFontLoaded('Arial');
console.log(loaded); // true/false
```

### waitForFonts(fontNames: string[], timeout?: number): Promise<FontLoadResult>

Waits for fonts to load.

**Parameters:**
- `fontNames`: Array of font names
- `timeout` (optional): Timeout in milliseconds

**Returns:**
- `Promise<FontLoadResult>`: Font loading result

**Example:**
```typescript
import { waitForFonts } from 'font-load-check';

const result = await waitForFonts(['Arial', 'Helvetica'], 5000);
```

### loadFont(fontName: string, url: string, options?: FontFaceDescriptors, onSuccess?: () => void, onError?: (error: any, isCORSError: boolean) => void): boolean

Loads a font and monitors its loading status.

**Parameters:**
- `fontName`: Font name
- `url`: URL to the font file
- `options` (optional): FontFace descriptor options
- `onSuccess` (optional): Callback function when loading succeeds
- `onError` (optional): Callback function when loading fails

**Returns:**
- `boolean`: Whether the font was successfully added (note: this doesn't mean the font has loaded successfully)

**Example:**
```typescript
import { loadFont } from 'font-load-check';

loadFont(
  'MyFont',
  '/path/to/font.woff2',
  { display: 'swap' },
  () => console.log('Font loaded successfully'),
  (error, isCORSError) => {
    if (isCORSError) {
      console.error('Loading failed: CORS error');
    } else {
      console.error('Loading failed:', error);
    }
  }
);
```

## Type Definitions

### FontCheckerOptions

```typescript
interface FontCheckerOptions {
  timeout?: number; // Font loading timeout in milliseconds, default is 3000
}
```

### FontCheckResult

```typescript
interface FontCheckResult {
  name: string;      // Font name
  loaded: boolean;   // Whether the font is loaded
  status: string;    // Loading status: 'loaded' | 'unloaded' | 'error' | 'fallback'
}
```

### FontLoadResult

```typescript
interface FontLoadResult {
  success: boolean;                    // Whether all fonts loaded successfully
  allFonts: FontCheckResult[];         // Results for all fonts
  failedFonts?: FontCheckResult[];     // Failed fonts (only exists when success is false)
}
``` 