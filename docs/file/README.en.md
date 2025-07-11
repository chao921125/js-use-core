# File

[中文](./README.md) | English

A comprehensive file management utility for web applications, providing file operations, validation, and processing capabilities.

## Features

- **File Operations**: Read, write, and manipulate files
- **File Validation**: Validate file types, sizes, and formats
- **File Processing**: Process and transform file content
- **Download Support**: Download files with progress tracking
- **Upload Support**: Upload files with validation
- **TypeScript Support**: Full TypeScript type definitions
- **Zero Dependencies**: Lightweight with no external dependencies

## Installation

```bash
npm install js-use-core
```

## Quick Start

```javascript
import { File } from 'js-use-core';

// Read file content
const file = new File('example.txt');
const content = await file.read();

// Write file content
await file.write('Hello, World!');

// Download file
await file.download('https://example.com/file.pdf', 'downloaded-file.pdf');
```

## API

See [API Documentation](./api.en.md) for detailed API reference.

## Examples

```javascript
import { File } from 'js-use-core';

// File validation
const file = new File('document.pdf');
if (file.isValid(['pdf', 'doc', 'docx'])) {
  console.log('File type is valid');
}

// Read file with encoding
const content = await file.read('utf-8');

// Write file with options
await file.write('New content', {
  encoding: 'utf-8',
  createIfNotExists: true
});

// Download with progress
await file.download('https://example.com/large-file.zip', 'download.zip', {
  onProgress: (progress) => console.log(`Download: ${progress}%`)
});
```

## Contributing

See [Contributing Guide](./CONTRIBUTING.en.md) for development guidelines. 
