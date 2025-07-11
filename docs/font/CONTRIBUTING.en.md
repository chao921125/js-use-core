# Contributing Guide

> Back to [Main README](../README.en.md)

Thank you for considering contributing to font-load-check! Here are some guidelines to help you get started.

## Development Environment Setup

1. Fork this repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/font-load-check.git`
3. Install dependencies: `npm install` or `pnpm install`
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Process

### Development Mode

Run the following command to start development mode, which will watch for file changes and rebuild automatically:

```bash
npm run dev
```

### Building the Library

To build the library, run:

```bash
npm run build
```

This will create production-ready files in the `dist` directory.

### Running Tests

Run tests:

```bash
npm test
```

Run tests with coverage report:

```bash
npm run test:coverage
```

## Submission Guidelines

### Commit Messages

Please use clear commit messages that describe your changes. The recommended format is:

```
feat: add feature X
fix: fix issue Y
docs: update documentation Z
test: add test cases
refactor: refactor code
```

### Pull Request Process

1. Ensure your code passes all tests
2. Update relevant documentation
3. Commit your changes: `git commit -am 'feat: add some feature'`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Submit a pull request to the main repository

## Code Style

- Follow existing code style and patterns
- Use TypeScript types
- Add tests for new features
- Ensure code passes all existing tests

## Reporting Issues

If you find an issue but don't have time to fix it, please create an issue on GitHub including:

- A brief description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment information (browser, operating system, etc.)

## Feature Requests

If you have an idea for a new feature, please create an issue describing the feature and how it would work.

## License

By contributing your code, you agree to license your contribution under the project's MIT license. 