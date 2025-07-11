# file API 文档

欢迎使用 file 的 API 文档。这里详细介绍了库中可用的所有函数和类型定义。

## 目录

- [文件操作](#文件操作)
  - [urlToBase64](#urltobase64)
  - [blobToBase64](#blobtobase64)
  - [fileToBase64](#filetobase64)
  - [base64ToBlob](#base64toblob)
  - [base64ToFile](#base64tofile)
  - [fileToBlob](#filetoblob)
  - [blobToFile](#blobtofile)
- [图片操作](#图片操作)
  - [blobToDataURL](#blobtodataurl)
  - [imageToDataURL](#imagetodataurl)
  - [dataURLToImage](#dataurltoimage)
  - [dataURLtoBlob](#dataurltoblob)
  - [dataURLtoImgBlob](#dataurltoimgblob)
  - [dataURLtoFile](#dataurltofile)
  - [imgConvert](#imgconvert)
  - [imgCompress](#imgcompress)
  - [convertImageFormat](#convertimageformat)
- [工具函数](#工具函数)
  - [类型检查](#类型检查)
  - [文件类型处理](#文件类型处理)
  - [其他工具函数](#其他工具函数)

## 文件操作

### urlToBase64

将URL转换为Base64字符串。

```typescript
async function urlToBase64(url: string): Promise<string>
```

**参数：**
- `url`: 文件URL

**返回值：**
- `Promise<string>`: Base64字符串

**示例：**
```javascript
const base64 = await urlToBase64('https://example.com/image.jpg');
console.log(base64); // data:image/jpeg;base64,...
```

### blobToBase64

将Blob对象转换为Base64字符串。

```typescript
function blobToBase64(blob: Blob): Promise<string>
```

**参数：**
- `blob`: Blob对象

**返回值：**
- `Promise<string>`: Base64字符串

**示例：**
```javascript
const blob = new Blob(['hello world'], { type: 'text/plain' });
const base64 = await blobToBase64(blob);
console.log(base64); // data:text/plain;base64,...
```

### fileToBase64

将File对象转换为Base64字符串。

```typescript
function fileToBase64(file: File): Promise<string>
```

**参数：**
- `file`: File对象

**返回值：**
- `Promise<string>`: Base64字符串

**示例：**
```javascript
// 在浏览器环境中
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const base64 = await fileToBase64(file);
  console.log(base64);
});
```

### base64ToBlob

将Base64字符串转换为Blob对象。

```typescript
function base64ToBlob(base64: string): Blob
```

**参数：**
- `base64`: Base64字符串

**返回值：**
- `Blob`: Blob对象

**示例：**
```javascript
const base64 = 'data:text/plain;base64,SGVsbG8gV29ybGQ=';
const blob = base64ToBlob(base64);
console.log(blob.type); // text/plain
console.log(blob.size); // 11
```

### base64ToFile

将Base64字符串转换为File对象。

```typescript
function base64ToFile(base64: string, filename?: string): File
```

**参数：**
- `base64`: Base64字符串
- `filename` (可选): 文件名，如果不提供则生成随机文件名

**返回值：**
- `File`: File对象

**示例：**
```javascript
const base64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...';
const file = base64ToFile(base64, 'image.jpg');
console.log(file.name); // image.jpg
console.log(file.type); // image/jpeg
```

### fileToBlob

将File对象转换为Blob对象。

```typescript
function fileToBlob(file: File): Blob
```

**参数：**
- `file`: File对象

**返回值：**
- `Blob`: Blob对象

**示例：**
```javascript
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const blob = fileToBlob(file);
  console.log(blob.type); // 与file.type相同
});
```

### blobToFile

将Blob对象转换为File对象。

```typescript
function blobToFile(blob: Blob, filename?: string): File
```

**参数：**
- `blob`: Blob对象
- `filename` (可选): 文件名，如果不提供则生成随机文件名

**返回值：**
- `File`: File对象

**示例：**
```javascript
const blob = new Blob(['hello world'], { type: 'text/plain' });
const file = blobToFile(blob, 'hello.txt');
console.log(file.name); // hello.txt
console.log(file.type); // text/plain
```

## 图片操作

### blobToDataURL

将Blob对象转换为DataURL。

```typescript
function blobToDataURL(blob: Blob): Promise<string>
```

**参数：**
- `blob`: Blob对象

**返回值：**
- `Promise<string>`: DataURL字符串

**示例：**
```javascript
const blob = new Blob(['...'], { type: 'image/jpeg' });
const dataURL = await blobToDataURL(blob);
console.log(dataURL); // data:image/jpeg;base64,...
```

### imageToDataURL

将HTMLImageElement对象转换为DataURL。

```typescript
function imageToDataURL(
  image: HTMLImageElement,
  format: ImageFormat = 'jpeg',
  quality: number = 0.9
): string
```

**参数：**
- `image`: HTMLImageElement对象
- `format` (可选): 输出格式，默认为'jpeg'
- `quality` (可选): 输出质量，范围0-1，默认为0.9

**返回值：**
- `string`: DataURL字符串

**示例：**
```javascript
const img = new Image();
img.src = 'image.jpg';
img.onload = () => {
  const dataURL = imageToDataURL(img, 'png', 0.8);
  console.log(dataURL);
};
```

### dataURLToImage

将DataURL转换为HTMLImageElement对象。

```typescript
function dataURLToImage(dataURL: string): Promise<HTMLImageElement>
```

**参数：**
- `dataURL`: DataURL字符串

**返回值：**
- `Promise<HTMLImageElement>`: 图片元素

**示例：**
```javascript
const dataURL = 'data:image/jpeg;base64,...';
const img = await dataURLToImage(dataURL);
document.body.appendChild(img);
```

### dataURLtoBlob

将DataURL转换为Blob对象。

```typescript
function dataURLtoBlob(dataURL: string): Blob
```

**参数：**
- `dataURL`: DataURL字符串

**返回值：**
- `Blob`: Blob对象

**示例：**
```javascript
const dataURL = 'data:image/png;base64,...';
const blob = dataURLtoBlob(dataURL);
console.log(blob.type); // image/png
```

### dataURLtoImgBlob

将DataURL转换为图片Blob对象，如果不是图片格式则抛出错误。

```typescript
function dataURLtoImgBlob(dataURL: string): Blob
```

**参数：**
- `dataURL`: DataURL字符串

**返回值：**
- `Blob`: Blob对象，MIME类型为图片类型

**示例：**
```javascript
const dataURL = 'data:image/png;base64,...';
const blob = dataURLtoImgBlob(dataURL);
console.log(blob.type); // image/png
```

### dataURLtoFile

将DataURL转换为File对象。

```typescript
function dataURLtoFile(dataURL: string, filename?: string): File
```

**参数：**
- `dataURL`: DataURL字符串
- `filename` (可选): 文件名，如果不提供则生成随机文件名

**返回值：**
- `File`: File对象

**示例：**
```javascript
const dataURL = 'data:image/jpeg;base64,...';
const file = dataURLtoFile(dataURL, 'image.jpg');
console.log(file.name); // image.jpg
console.log(file.type); // image/jpeg
```

### imgConvert

图片格式转换。

```typescript
function imgConvert(
  imageFile: File,
  options: ImageConvertOptions
): Promise<File>
```

**参数：**
- `imageFile`: 图片文件
- `options`: 转换选项
  - `format`: 输出格式
  - `quality` (可选): 输出质量，范围0-1，默认0.9

**返回值：**
- `Promise<File>`: 转换后的文件

**示例：**
```javascript
const imageFile = new File(['...'], 'image.jpg', { type: 'image/jpeg' });
const pngFile = await imgConvert(imageFile, { format: 'png' });
console.log(pngFile.name); // image.png
console.log(pngFile.type); // image/png
```

### imgCompress

图片压缩。

```typescript
function imgCompress(
  imageFile: File,
  options: ImageCompressOptions = {}
): Promise<File>
```

**参数：**
- `imageFile`: 图片文件
- `options` (可选): 压缩选项
  - `quality` (可选): 压缩质量，范围0-1，默认0.8
  - `maxWidth` (可选): 最大宽度，如果指定则按比例缩放
  - `maxHeight` (可选): 最大高度，如果指定则按比例缩放
  - `format` (可选): 输出格式，默认与原图相同

**返回值：**
- `Promise<File>`: 压缩后的文件

**示例：**
```javascript
const imageFile = new File(['...'], 'image.jpg', { type: 'image/jpeg' });
const compressedFile = await imgCompress(imageFile, {
  quality: 0.7,
  maxWidth: 800,
  maxHeight: 600
});
console.log(`原大小: ${imageFile.size}, 压缩后: ${compressedFile.size}`);
```

## 工具函数

### 类型检查

#### isBase64

检查是否为Base64字符串。

```typescript
function isBase64(str: string): boolean
```

#### isBlob

检查是否为Blob对象。

```typescript
function isBlob(obj: any): obj is Blob
```

#### isFile

检查是否为File对象。

```typescript
function isFile(obj: any): obj is File
```

### 文件类型处理

#### getFileExtension

获取文件扩展名。

```typescript
function getFileExtension(filename: string): string
```

#### getMimeTypeFromExtension

根据文件扩展名获取MIME类型。

```typescript
function getMimeTypeFromExtension(extension: string): string
```

#### getExtensionFromMimeType

根据MIME类型获取文件扩展名。

```typescript
function getExtensionFromMimeType(mimeType: string): string
```

#### checkFileType

检查文件类型。

```typescript
function checkFileType(file: File | string): FileTypeResult
```

返回值类型：

```typescript
interface FileTypeResult {
  isImage: boolean;
  isAudio: boolean;
  isVideo: boolean;
  mimeType: string;
  extension: string;
}
```

### 其他工具函数

#### generateRandomFileName

生成随机文件名。

```typescript
function generateRandomFileName(extension: string = ''): string
```

#### getMimeTypeFromDataURL

从DataURL中提取MIME类型。

```typescript
function getMimeTypeFromDataURL(dataURL: string): string
```

#### getBase64FromDataURL

从DataURL中提取Base64数据部分。

```typescript
function getBase64FromDataURL(dataURL: string): string
```