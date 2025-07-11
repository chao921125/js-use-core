# Utils API

[中文](./api.md) | English

## Type Checking Functions

### `isString(value)`
Check if value is a string.

```typescript
isString(value: any): value is string
```

### `isNumber(value)`
Check if value is a number.

```typescript
isNumber(value: any): value is number
```

### `isBoolean(value)`
Check if value is a boolean.

```typescript
isBoolean(value: any): value is boolean
```

### `isArray(value)`
Check if value is an array.

```typescript
isArray(value: any): value is any[]
```

### `isObject(value)`
Check if value is an object.

```typescript
isObject(value: any): value is object
```

### `isFunction(value)`
Check if value is a function.

```typescript
isFunction(value: any): value is Function
```

## Data Validation Functions

### `isEmpty(value)`
Check if value is empty (null, undefined, empty string, empty array, empty object).

```typescript
isEmpty(value: any): boolean
```

### `isValid(value, validator)`
Validate value using a custom validator function.

```typescript
isValid(value: any, validator: (value: any) => boolean): boolean
```

## String Functions

### `formatDate(date, format)`
Format date according to specified format.

```typescript
formatDate(date: Date, format: string): string
```

### `generateId()`
Generate a unique identifier.

```typescript
generateId(): string
```

### `camelCase(str)`
Convert string to camelCase.

```typescript
camelCase(str: string): string
```

### `kebabCase(str)`
Convert string to kebab-case.

```typescript
kebabCase(str: string): string
```

## Array Functions

### `unique(array)`
Remove duplicates from array.

```typescript
unique<T>(array: T[]): T[]
```

### `chunk(array, size)`
Split array into chunks of specified size.

```typescript
chunk<T>(array: T[], size: number): T[][]
```

### `flatten(array)`
Flatten nested array.

```typescript
flatten<T>(array: any[]): T[]
```

## Object Functions

### `deepClone(obj)`
Create a deep clone of an object.

```typescript
deepClone<T>(obj: T): T
```

### `merge(target, ...sources)`
Deep merge objects.

```typescript
merge(target: object, ...sources: object[]): object
```

### `pick(obj, keys)`
Pick specified keys from object.

```typescript
pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>
```

### `omit(obj, keys)`
Omit specified keys from object.

```typescript
omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>
```

## Function Utilities

### `debounce(func, delay)`
Create a debounced function.

```typescript
debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void
```

### `throttle(func, delay)`
Create a throttled function.

```typescript
throttle<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void
```

### `once(func)`
Create a function that can only be called once.

```typescript
once<T extends (...args: any[]) => any>(func: T): (...args: Parameters<T>) => ReturnType<T>
```

## Examples

```javascript
import { 
  isString, 
  isEmpty, 
  deepClone, 
  debounce, 
  formatDate,
  generateId 
} from 'js-use-core';

// Type checking
if (isString(value)) {
  console.log('Value is a string');
}

// Data validation
if (isEmpty(array)) {
  console.log('Array is empty');
}

// Object manipulation
const original = { a: 1, b: { c: 2 } };
const cloned = deepClone(original);

// Function utilities
const debouncedSearch = debounce(searchFunction, 300);

// String utilities
const formatted = formatDate(new Date(), 'YYYY-MM-DD');
const id = generateId();
``` 