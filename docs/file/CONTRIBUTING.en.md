# Contributing Guidelines

Thank you for considering contributing to the file project! This document provides some guidelines and best practices to help make your contribution process smoother.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Feature Requests](#feature-requests)
  - [Submitting Code](#submitting-code)
- [Development Process](#development-process)
  - [Environment Setup](#environment-setup)
  - [Code Style](#code-style)
  - [Testing](#testing)
- [Submitting Pull Requests](#submitting-pull-requests)
- [Release Process](#release-process)

## Code of Conduct

This project adopts an open, respectful, and inclusive attitude. We expect all participants to:

- Use friendly and inclusive language
- Respect different viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what's best for the community

## How to Contribute

### Reporting Bugs

If you find a bug, please report it through GitHub Issues and include the following information:

1. A brief description of the issue
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Environment information (browser, operating system, Node.js version, etc.)
6. If possible, provide a minimal reproduction example

### Feature Requests

If you'd like to add a new feature or improve an existing one, please submit a feature request through GitHub Issues, including:

1. Detailed description of the feature
2. Use cases and motivation
3. Possible implementation approach (if any)

### Submitting Code

1. Fork the project repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Process

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/file.git
   cd file
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

### Code Style

We use ESLint and TypeScript to maintain code quality and consistency. Before submitting code, please ensure:

1. Run lint checks:
   ```bash
   npm run lint
   ```

2. Fix automatically fixable issues:
   ```bash
   npm run lint:fix
   ```

### Testing

To ensure code quality, please add appropriate tests for your changes:

1. Run tests:
   ```bash
   npm test
   ```

2. Check test coverage:
   ```bash
   npm run test:coverage
   ```

## Submitting Pull Requests

1. Ensure your code passes all tests
2. Update documentation to reflect your changes (if applicable)
3. When submitting a Pull Request, please provide a clear description:
   - What problem you solved
   - How you implemented it
   - Any areas that need special attention from reviewers

## Release Process

Project maintainers are responsible for releasing new versions. If you are a maintainer, follow these steps to release:

1. Update the version number (following [Semantic Versioning](https://semver.org/)):
   ```bash
   npm version patch|minor|major
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Publish to npm:
   ```bash
   npm publish
   ```

4. Create a GitHub Release with version release notes

---

Thank you again for your contribution! If you have any questions, feel free to ask in the Issues section. 