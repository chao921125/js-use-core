# File API

[中文](./api.md) | English

## File Class

### Constructor

```typescript
new File(filename: string)
```

**Parameters:**
- `filename` (string): Name of the file to manage

### Methods

#### `read(encoding?)`
Read file content.

```typescript
read(encoding?: string): Promise<string>
```

**Parameters:**
- `encoding` (string, optional): File encoding, defaults to 'utf-8'

**Returns:** Promise that resolves to file content

#### `write(content, options?)`
Write content to file.

```typescript
write(content: string, options?: WriteOptions): Promise<void>
```

**Parameters:**
- `content` (string): Content to write to file
- `options` (WriteOptions, optional): Write options

**Returns:** Promise that resolves when content is written

#### `download(url, filename, options?)`
Download file from URL.

```typescript
download(url: string, filename: string, options?: DownloadOptions): Promise<void>
```

**Parameters:**
- `url` (string): URL to download from
- `filename` (string): Name to save file as
- `options` (DownloadOptions, optional): Download options

**Returns:** Promise that resolves when download is complete

#### `upload(file, options?)`
Upload file to server.

```typescript
upload(file: File, options?: UploadOptions): Promise<UploadResult>
```

**Parameters:**
- `file` (File): File to upload
- `options` (UploadOptions, optional): Upload options

**Returns:** Promise that resolves to upload result

#### `isValid(allowedTypes?)`
Check if file type is valid.

```typescript
isValid(allowedTypes?: string[]): boolean
```

**Parameters:**
- `allowedTypes` (string[], optional): Array of allowed file extensions

**Returns:** true if file type is valid, false otherwise

#### `getSize()`
Get file size in bytes.

```typescript
getSize(): Promise<number>
```

**Returns:** Promise that resolves to file size

### Static Methods

#### `File.isSupported()`
Check if file operations are supported in the current environment.

```typescript
static isSupported(): boolean
```

**Returns:** true if file operations are supported, false otherwise

## Types

### WriteOptions

```typescript
interface WriteOptions {
  encoding?: string;
  createIfNotExists?: boolean;
  append?: boolean;
}
```

### DownloadOptions

```typescript
interface DownloadOptions {
  onProgress?: (progress: number) => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
```

### UploadOptions

```typescript
interface UploadOptions {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  onProgress?: (progress: number) => void;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}
```

### UploadResult

```typescript
interface UploadResult {
  success: boolean;
  data?: any;
  error?: string;
}
```

## Examples

```javascript
import { File } from 'js-use-core';

// Basic file operations
const file = new File('example.txt');

// Read file
const content = await file.read();

// Write file
await file.write('Hello, World!');

// Download file
await file.download('https://example.com/file.pdf', 'downloaded-file.pdf');

// File validation
if (file.isValid(['txt', 'pdf', 'doc'])) {
  console.log('File type is valid');
}

// Upload with progress
const uploadResult = await file.upload(fileInput.files[0], {
  url: '/api/upload',
  onProgress: (progress) => console.log(`Upload: ${progress}%`)
});

// Check support
if (File.isSupported()) {
  console.log('File operations are supported');
}
```