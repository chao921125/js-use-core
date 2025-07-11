# Utils

[中文](./README.md) | English

A comprehensive utility library for web applications, providing common helper functions and tools for everyday development tasks.

## Features

- **Type Checking**: Comprehensive type checking utilities
- **Data Validation**: Data validation and sanitization functions
- **String Manipulation**: String processing and formatting utilities
- **Array Operations**: Array manipulation and transformation functions
- **Object Utilities**: Object manipulation and deep operations
- **TypeScript Support**: Full TypeScript type definitions
- **Zero Dependencies**: Lightweight with no external dependencies

## Installation

```bash
npm install js-use-core
```

## Quick Start

```javascript
import { isString, isEmpty, debounce } from 'js-use-core';

// Type checking
if (isString(value)) {
  console.log('Value is a string');
}

// Check if value is empty
if (isEmpty(array)) {
  console.log('Array is empty');
}

// Debounce function
const debouncedSearch = debounce(searchFunction, 300);
```

## API

See [API Documentation](./api.en.md) for detailed API reference.

## Examples

```javascript
import { 
  isNumber, 
  deepClone, 
  throttle, 
  formatDate,
  generateId 
} from 'js-use-core';

// Deep clone object
const original = { a: 1, b: { c: 2 } };
const cloned = deepClone(original);

// Throttle function
const throttledScroll = throttle(handleScroll, 100);

// Format date
const formatted = formatDate(new Date(), 'YYYY-MM-DD');

// Generate unique ID
const id = generateId();
```

## Contributing

See [Contributing Guide](./CONTRIBUTING.en.md) for development guidelines. 