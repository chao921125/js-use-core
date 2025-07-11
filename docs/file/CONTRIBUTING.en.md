# Contributing to File Module

[中文](./CONTRIBUTING.md) | English

Thank you for your interest in contributing to the File module! This document provides guidelines for contributing to this project.

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/js-core-util.git
   cd js-core-util
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Development

### Project Structure

```
src/file/
├── index.ts          # Main file module
├── types.ts          # Type definitions
└── utils.ts          # Utility functions
```

### Running Tests

```bash
# Run all tests
npm test

# Run file module tests only
npm test -- --grep "file"

# Run tests in watch mode
npm run test:watch
```

### Building

```bash
# Build the project
npm run build

# Build in watch mode
npm run build:watch
```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Follow the existing type definitions
- Add proper JSDoc comments for public APIs

### Code Formatting

- Use 2 spaces for indentation
- Use semicolons at the end of statements
- Use single quotes for strings
- Follow the existing code style

### Naming Conventions

- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces
- Use UPPER_SNAKE_CASE for constants

## Testing

### Writing Tests

- Write tests for all new functionality
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

### Test Structure

```typescript
describe('File', () => {
  describe('read()', () => {
    it('should read file content successfully', async () => {
      // Test implementation
    });

    it('should handle read errors', async () => {
      // Test implementation
    });
  });
});
```

## Documentation

### API Documentation

- Update API documentation for any new public APIs
- Include TypeScript type definitions
- Provide usage examples

### README Updates

- Update README.md for new features
- Include installation and usage instructions
- Add examples for common use cases

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Add tests for new functionality
4. Update documentation
5. Run tests and ensure they pass
6. Submit a pull request

### Pull Request Guidelines

- Provide a clear description of changes
- Include any breaking changes
- Reference related issues
- Ensure all tests pass
- Update documentation as needed

## Issues

### Reporting Bugs

- Use the bug report template
- Include steps to reproduce
- Provide browser and version information
- Include error messages and stack traces

### Feature Requests

- Use the feature request template
- Describe the use case
- Provide examples if possible
- Consider implementation complexity

## Code of Conduct

- Be respectful and inclusive
- Focus on the code and technical discussions
- Help others learn and grow
- Follow the project's coding standards

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License. 