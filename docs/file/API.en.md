# file API Documentation

Welcome to the file API documentation. This document details all available functions and type definitions in the library.

## Table of Contents

- [File Operations](#file-operations)
  - [urlToBase64](#urltobase64)
  - [blobToBase64](#blobtobase64)
  - [fileToBase64](#filetobase64)
  - [base64ToBlob](#base64toblob)
  - [base64ToFile](#base64tofile)
  - [fileToBlob](#filetoblob)
  - [blobToFile](#blobtofile)
- [Image Operations](#image-operations)
  - [blobToDataURL](#blobtodataurl)
  - [imageToDataURL](#imagetodataurl)
  - [dataURLToImage](#dataurltoimage)
  - [dataURLtoBlob](#dataurltoblob)
  - [dataURLtoImgBlob](#dataurltoimgblob)
  - [dataURLtoFile](#dataurltofile)
  - [imgConvert](#imgconvert)
  - [imgCompress](#imgcompress)
- [Utility Functions](#utility-functions)
  - [Type Checking](#type-checking)
  - [File Type Handling](#file-type-handling)
  - [Other Utilities](#other-utilities)

## File Operations

### urlToBase64(url: string): Promise<string>
Convert URL to Base64 string.

**Parameters:**
- `url`: URL to convert

**Returns:**
- Promise<string>: Returns Base64 encoded string

**Example:**
```javascript
const base64 = await urlToBase64('https://example.com/image.jpg');
console.log(base64); // data:image/jpeg;base64,...
```

### fileToBase64(file: File): Promise<string>
Convert File object to Base64 string.

**Parameters:**
- `file`: File object to convert

**Returns:**
- Promise<string>: Returns Base64 encoded string

**Example:**
```javascript
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const base64 = await fileToBase64(file);
  console.log(base64);
});
```

### base64ToFile(base64: string, filename?: string): File
Convert Base64 string to File object.

**Parameters:**
- `base64`: Base64 encoded string
- `filename`: (optional) File name, if not provided, a random name will be generated

**Returns:**
- File: Returns File object

**Example:**
```javascript
const base64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...';
const file = base64ToFile(base64, 'image.jpg');
console.log(file.name); // image.jpg
console.log(file.type); // image/jpeg
```

### fileToBlob(file: File): Blob
Convert File object to Blob object.

**Parameters:**
- `file`: File object to convert

**Returns:**
- Blob: Returns Blob object

**Example:**
```javascript
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const blob = fileToBlob(file);
  console.log(blob.size);
  console.log(blob.type);
});
```

### blobToFile(blob: Blob, filename: string): File
Convert Blob object to File object.

**Parameters:**
- `blob`: Blob object to convert
- `filename`: File name

**Returns:**
- File: Returns File object

**Example:**
```javascript
const blob = new Blob(['hello world'], { type: 'text/plain' });
const file = blobToFile(blob, 'hello.txt');
console.log(file.name); // hello.txt
console.log(file.type); // text/plain
```

### base64ToBlob(base64: string): Blob
Convert Base64 string to Blob object.

**Parameters:**
- `base64`: Base64 encoded string

**Returns:**
- Blob: Returns Blob object

**Example:**
```javascript
const base64 = 'data:text/plain;base64,aGVsbG8gd29ybGQ=';
const blob = base64ToBlob(base64);
console.log(blob.type); // text/plain
```

### blobToBase64(blob: Blob): Promise<string>
Convert Blob object to Base64 string.

**Parameters:**
- `blob`: Blob object to convert

**Returns:**
- Promise<string>: Returns Base64 encoded string

**Example:**
```javascript
const blob = new Blob(['hello world'], { type: 'text/plain' });
const base64 = await blobToBase64(blob);
console.log(base64); // data:text/plain;base64,aGVsbG8gd29ybGQ=
```

## Image Operations

### blobToDataURL(blob: Blob): Promise<string>
Convert Blob object to DataURL.

**Parameters:**
- `blob`: Blob object to convert

**Returns:**
- Promise<string>: Returns DataURL string

**Example:**
```javascript
const blob = new Blob(['...'], { type: 'image/jpeg' });
const dataURL = await blobToDataURL(blob);
console.log(dataURL); // data:image/jpeg;base64,...
```

### imageToDataURL(image: HTMLImageElement, type?: string, quality?: number): string
Convert HTMLImageElement to DataURL.

**Parameters:**
- `image`: Image element to convert
- `type`: (optional) Output MIME type, defaults to 'image/png'
- `quality`: (optional) Image quality, range 0-1, defaults to 0.8

**Returns:**
- string: Returns DataURL string

**Example:**
```javascript
const img = document.querySelector('img');
const dataURL = imageToDataURL(img, 'image/jpeg', 0.9);
console.log(dataURL); // data:image/jpeg;base64,...
```

### dataURLToImage(dataURL: string): Promise<HTMLImageElement>
Convert DataURL to HTMLImageElement.

**Parameters:**
- `dataURL`: DataURL string

**Returns:**
- Promise<HTMLImageElement>: Returns image element

**Example:**
```javascript
const dataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...';
const img = await dataURLToImage(dataURL);
document.body.appendChild(img);
```

### dataURLtoBlob(dataURL: string): Blob
Convert DataURL to Blob object.

**Parameters:**
- `dataURL`: DataURL string

**Returns:**
- Blob: Returns Blob object

**Example:**
```javascript
const dataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...';
const blob = dataURLtoBlob(dataURL);
console.log(blob.type); // image/jpeg
```

### dataURLtoImgBlob(dataURL: string): Blob
Convert DataURL to image Blob object.

**Parameters:**
- `dataURL`: DataURL string

**Returns:**
- Blob: Returns image Blob object

**Example:**
```javascript
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
// Draw some content
const dataURL = canvas.toDataURL();
const imgBlob = dataURLtoImgBlob(dataURL);
console.log(imgBlob.type); // image/png
```

### dataURLtoFile(dataURL: string, filename: string): File
Convert DataURL to File object.

**Parameters:**
- `dataURL`: DataURL string
- `filename`: File name

**Returns:**
- File: Returns File object

**Example:**
```javascript
const dataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...';
const file = dataURLtoFile(dataURL, 'image.jpg');
console.log(file.name); // image.jpg
console.log(file.type); // image/jpeg
```

### imgConvert(imageFile: File, options: ImageConvertOptions): Promise<File>
Image format conversion.

**Parameters:**
- `imageFile`: Image file object
- `options`: Conversion options
  - `format`: Target format, supports 'jpeg', 'jpg', 'png', 'webp', 'gif'
  - `quality`: (optional) Image quality, range 0-1, defaults to 0.8

**Returns:**
- Promise<File>: Returns converted file object

**Example:**
```javascript
const imageFile = new File(['...'], 'image.jpg', { type: 'image/jpeg' });
const pngFile = await imgConvert(imageFile, { format: 'png' });
console.log(pngFile.name); // image.png
console.log(pngFile.type); // image/png
```

### imgCompress(imageFile: File, options?: ImageCompressOptions): Promise<File>
Image compression.

**Parameters:**
- `imageFile`: Image file object
- `options`: (optional) Compression options
  - `quality`: (optional) Image quality, range 0-1, defaults to 0.8
  - `maxWidth`: (optional) Maximum width
  - `maxHeight`: (optional) Maximum height
  - `format`: (optional) Output format, supports 'jpeg', 'jpg', 'png', 'webp', 'gif'

**Returns:**
- Promise<File>: Returns compressed file object

**Example:**
```javascript
const imageFile = document.querySelector('input[type="file"]').files[0];
const compressedFile = await imgCompress(imageFile, {
  quality: 0.7,
  maxWidth: 800,
  maxHeight: 600
});
console.log(`Original size: ${imageFile.size}, Compressed: ${compressedFile.size}`);
```

## Utility Functions

### isBase64(str: string): boolean
Check if a string is a valid Base64 encoding.

**Parameters:**
- `str`: String to check

**Returns:**
- boolean: Returns true if it's a valid Base64 encoding, false otherwise

**Example:**
```javascript
console.log(isBase64('aGVsbG8gd29ybGQ=')); // true
console.log(isBase64('hello world')); // false
```

### isBlob(obj: any): boolean
Check if an object is a Blob type.

**Parameters:**
- `obj`: Object to check

**Returns:**
- boolean: Returns true if it's a Blob type, false otherwise

**Example:**
```javascript
const blob = new Blob(['hello world'], { type: 'text/plain' });
console.log(isBlob(blob)); // true
console.log(isBlob({})); // false
```

### isFile(obj: any): boolean
Check if an object is a File type.

**Parameters:**
- `obj`: Object to check

**Returns:**
- boolean: Returns true if it's a File type, false otherwise

**Example:**
```javascript
const file = new File(['hello world'], 'hello.txt', { type: 'text/plain' });
console.log(isFile(file)); // true
console.log(isFile({})); // false
```

### getFileExtension(filename: string): string
Get the extension of a filename.

**Parameters:**
- `filename`: File name

**Returns:**
- string: Returns the extension (without the dot)

**Example:**
```javascript
console.log(getFileExtension('image.jpg')); // jpg
console.log(getFileExtension('document.pdf')); // pdf
```

### getMimeTypeFromExtension(extension: string): string | null
Get MIME type from file extension.

**Parameters:**
- `extension`: File extension (without the dot)

**Returns:**
- string | null: Returns the corresponding MIME type, or null if not supported

**Example:**
```javascript
console.log(getMimeTypeFromExtension('jpg')); // image/jpeg
console.log(getMimeTypeFromExtension('pdf')); // application/pdf
```

### getExtensionFromMimeType(mimeType: string): string | null
Get file extension from MIME type.

**Parameters:**
- `mimeType`: MIME type

**Returns:**
- string | null: Returns the corresponding file extension, or null if not supported

**Example:**
```javascript
console.log(getExtensionFromMimeType('image/jpeg')); // jpg
console.log(getExtensionFromMimeType('application/pdf')); // pdf
```

### checkFileType(file: File, allowedTypes: string[]): boolean
Check if a file type is in the list of allowed types.

**Parameters:**
- `file`: File object
- `allowedTypes`: Array of allowed MIME types

**Returns:**
- boolean: Returns true if the file type is in the allowed list, false otherwise

**Example:**
```javascript
const file = new File(['...'], 'image.jpg', { type: 'image/jpeg' });
console.log(checkFileType(file, ['image/jpeg', 'image/png'])); // true
console.log(checkFileType(file, ['image/png', 'image/gif'])); // false
```

### generateRandomFileName(extension?: string): string
Generate a random file name.

**Parameters:**
- `extension`: (optional) File extension

**Returns:**
- string: Returns a randomly generated file name

**Example:**
```javascript
console.log(generateRandomFileName('jpg')); // e.g., a1b2c3d4.jpg
console.log(generateRandomFileName()); // e.g., e5f6g7h8
```

### getMimeTypeFromDataURL(dataURL: string): string | null
Get MIME type from DataURL.

**Parameters:**
- `dataURL`: DataURL string

**Returns:**
- string | null: Returns the MIME type, or null if it can't be parsed

**Example:**
```javascript
console.log(getMimeTypeFromDataURL('data:image/jpeg;base64,/9j/4AAQ...')); // image/jpeg
console.log(getMimeTypeFromDataURL('data:text/plain;base64,aGVsbG8=')); // text/plain
```

### getBase64FromDataURL(dataURL: string): string
Get pure Base64 string from DataURL (without MIME type prefix).

**Parameters:**
- `dataURL`: DataURL string

**Returns:**
- string: Returns the pure Base64 string

**Example:**
```javascript
console.log(getBase64FromDataURL('data:image/jpeg;base64,/9j/4AAQ...')); // /9j/4AAQ...
```

### delay(ms: number): Promise<void>
Create a Promise that resolves after a specified number of milliseconds.

**Parameters:**
- `ms`: Milliseconds to delay

**Returns:**
- Promise<void>: Returns a Promise that resolves after the specified time

**Example:**
```javascript
async function example() {
  console.log('Start');
  await delay(1000); // Delay for 1 second
  console.log('1 second later');
}
```