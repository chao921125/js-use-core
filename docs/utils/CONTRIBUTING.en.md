# Contributing Guide

Thank you for your interest in the js-use-core utility functions! We welcome all forms of contributions.

## Ways to Contribute

### 🐛 Report Bugs

If you find a bug, please report it through the following methods:

1. Create a new issue using [GitHub Issues](https://github.com/your-username/js-use-core/issues)
2. Add `[utils]` prefix in the title
3. Provide detailed reproduction steps and error information

**Bug Report Template:**

```markdown
## Bug Description
Brief description of the bug

## Reproduction Steps
1. Open browser
2. Use utility function
3. Observe error

## Expected Behavior
Describe the behavior you expect to see

## Actual Behavior
Describe what actually happened

## Environment Information
- Browser: Chrome 90.0.4430.212
- Operating System: macOS 11.4
- js-use-core version: 1.0.0

## Error Message
```
Error: Utility function failed
```

## Additional Information
Any other relevant information
```

### 💡 Feature Requests

If you have new feature ideas, please:

1. Create a new issue using [GitHub Issues](https://github.com/your-username/js-use-core/issues)
2. Add `[utils]` prefix in the title
3. Describe the feature requirements and use cases in detail

### 🔧 Code Contributions

#### Development Environment Setup

1. Fork the project
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/js-use-core.git
   cd js-use-core
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a feature branch:
   ```bash
   git checkout -b feature/utils-improvement
   ```

#### Development Process

1. **Write Code** - Make modifications in `src/utils/`
2. **Write Tests** - Add test cases in `test/utils.test.ts`
3. **Run Tests** - Ensure all tests pass:
   ```bash
   npm test
   ```
4. **Type Check** - Ensure TypeScript types are correct:
   ```bash
   npm run type-check
   ```
5. **Code Formatting** - Run ESLint:
   ```bash
   npm run lint
   ```

#### Commit Standards

Use [Conventional Commits](https://www.conventionalcommits.org/) standards:

```bash
# New feature
git commit -m "feat(utils): add new utility function"

# Bug fix
git commit -m "fix(utils): fix feature detection on Safari"

# Documentation update
git commit -m "docs(utils): update API documentation"

# Performance optimization
git commit -m "perf(utils): optimize event listener management"
```

#### Submit Pull Request

1. Push your branch:
   ```bash
   git push origin feature/utils-improvement
   ```

2. Create a Pull Request on GitHub
3. Fill out the PR template, describing your changes
4. Wait for code review

## Code Standards

### TypeScript Standards

- Write all code in TypeScript
- Provide complete type definitions
- Use interfaces to define API contracts
- Avoid using `any` type

### Code Style

- Use 2-space indentation
- Use single quotes
- No semicolons at line endings
- Use ES6+ syntax

### Testing Standards

- Each new feature should have corresponding tests
- Test coverage should be no less than 80%
- Use Jest as the testing framework
- Test cases should be clear and understandable

### Documentation Standards

- All public APIs should have JSDoc comments
- Update examples in README.md
- Add type definition documentation

## Utility Functions Specific Guidelines

### Browser Compatibility

- Ensure new functions work in all supported browsers
- Test feature detection across different browsers
- Verify the correctness of fallback solutions

### Performance Considerations

- Optimize for performance in frequently used functions
- Cache feature detection results when appropriate
- Minimize memory usage in event handling

### Error Handling

- Provide meaningful error messages
- Implement graceful fallback solutions
- Handle edge cases appropriately

## Release Process

### Version Management

Use [Semantic Versioning](https://semver.org/):

- **MAJOR** - Incompatible API changes
- **MINOR** - Backward-compatible new features
- **PATCH** - Backward-compatible bug fixes

### Release Steps

1. Update version number:
   ```bash
   npm version patch|minor|major
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Run tests:
   ```bash
   npm test
   ```

4. Publish to npm:
   ```bash
   npm publish
   ```

5. Create a GitHub release with release notes

## Code Review Process

### Review Checklist

- [ ] Code follows project standards
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)
- [ ] Performance impact is considered
- [ ] Browser compatibility is verified

### Review Guidelines

- Be constructive and respectful
- Focus on the code, not the person
- Provide specific suggestions for improvement
- Consider edge cases and error scenarios

## Community Guidelines

### Communication

- Be respectful and inclusive
- Use clear and concise language
- Provide context when asking questions
- Help others when possible

### Recognition

- Contributors will be listed in the project README
- Significant contributions will be acknowledged in release notes
- Contributors may be invited to join the maintainer team

## Getting Help

If you need help with contributing:

1. Check existing issues and discussions
2. Read the documentation thoroughly
3. Ask questions in GitHub Discussions
4. Contact maintainers directly if needed

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License. 