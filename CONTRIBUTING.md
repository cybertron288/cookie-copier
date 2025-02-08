# Contributing to Cookie Copier

Thank you for your interest in contributing to Cookie Copier! We welcome contributions from the community and are pleased to have them. This document will help you get started.

## 🤝 Ways to Contribute

### Bug Reports
- Use the [GitHub Issues](https://github.com/cybertron288/cookie-copier/issues) page
- Search existing issues before creating a new one
- Provide detailed reproduction steps
- Include browser version, OS, and extension version
- Add screenshots or screen recordings if helpful

### Feature Requests
- Check existing issues and discussions first
- Use the feature request template
- Describe the problem you're trying to solve
- Explain why this feature would be useful
- Consider providing mockups or examples

### Code Contributions
- Fix bugs
- Implement new features
- Improve documentation
- Add or improve tests
- Optimize performance

## 🚀 Getting Started

### Prerequisites
- Node.js 16.0.0 or higher
- pnpm 8.0.0 or higher
- Git
- Chrome browser for testing

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/cookie-copier.git
   cd cookie-copier
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

4. **Start Development**
   ```bash
   pnpm run dev
   ```

5. **Load Extension in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## 🏗️ Development Guidelines

### Code Style
- We use ESLint and Prettier for consistent code formatting
- Run `pnpm run lint` to check for issues
- Run `pnpm run format` to auto-format code
- All code must pass linting checks

### TypeScript
- Use TypeScript for all new code
- Provide proper type definitions
- Avoid `any` types when possible
- Use meaningful variable and function names

### Testing
- Write tests for new functionality
- Maintain or improve test coverage
- Run `pnpm test` before submitting
- Use `pnpm run test:coverage` to check coverage

### Git Commit Messages
Follow the [Conventional Commits](https://conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(search): add real-time cookie filtering
fix(export): handle empty cookie lists correctly
docs(readme): update installation instructions
test(utils): add tests for cookie manager
```

### Branch Naming
- `feature/descriptive-name` for new features
- `fix/issue-description` for bug fixes
- `docs/what-docs` for documentation
- `refactor/component-name` for refactoring

## 📋 Pull Request Process

### Before Submitting
1. **Test Thoroughly**
   - Test your changes manually
   - Run automated tests: `pnpm test`
   - Check code quality: `pnpm run lint`
   - Verify build: `pnpm run build`

2. **Update Documentation**
   - Update README if needed
   - Add or update code comments
   - Update TypeScript types

3. **Check Compatibility**
   - Test on Chrome (latest stable)
   - Ensure Manifest V3 compatibility
   - Verify accessibility features work

### Submitting
1. **Create Pull Request**
   - Use the PR template
   - Write clear title and description
   - Reference related issues
   - Add screenshots/GIFs if UI changes

2. **Review Process**
   - Address reviewer feedback
   - Keep discussions professional
   - Update your branch as needed
   - Be patient and responsive

## 🧪 Testing Guidelines

### Unit Tests
- Located in `tests/` directory
- Use Jest as testing framework
- Mock Chrome APIs appropriately
- Test both success and error cases

### Integration Tests
- Test component interactions
- Verify complete user workflows
- Use realistic test data

### Manual Testing
- Test in actual Chrome extension environment
- Verify all user interactions
- Check different screen sizes
- Test keyboard navigation

## 🎨 UI/UX Guidelines

### Design Principles
- Follow modern web standards
- Ensure accessibility (WCAG 2.1 AA)
- Support keyboard navigation
- Maintain consistency with Chrome UI

### CSS/Styling
- Use CSS custom properties (variables)
- Follow mobile-first responsive design
- Support high contrast mode
- Maintain theme consistency

### Accessibility
- Provide proper ARIA labels
- Ensure keyboard navigation
- Support screen readers
- Use semantic HTML

## 📝 Documentation Standards

### Code Documentation
- Use JSDoc comments for functions
- Explain complex algorithms
- Document public APIs
- Include usage examples

### User Documentation
- Keep language clear and simple
- Include screenshots where helpful
- Provide step-by-step instructions
- Update for new features

## 🐛 Bug Report Guidelines

### Information to Include
1. **Environment**
   - Chrome version
   - Operating system
   - Extension version

2. **Steps to Reproduce**
   - Detailed step-by-step instructions
   - Expected vs actual behavior
   - Screenshots or recordings

3. **Additional Context**
   - Console errors (if any)
   - Browser developer tools output
   - Related issues or discussions

### Bug Report Template
```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Chrome Version: [e.g., 120.0.6099.71]
- OS: [e.g., macOS 14.1]
- Extension Version: [e.g., 2.0.0]

## Additional Context
Any other context about the problem
```

## 🚫 What NOT to Contribute

- Malicious or harmful code
- Copyright-infringing content
- Code that violates Chrome Web Store policies
- Features that compromise user privacy
- Unnecessary dependencies
- Breaking changes without discussion

## ❓ Questions?

- Open a [Discussion](https://github.com/cybertron288/cookie-copier/discussions)
- Check existing documentation
- Read through closed issues
- Contact maintainers via email

## 📄 License

By contributing to Cookie Copier, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

All contributors will be recognized in our README and release notes. Thank you for making Cookie Copier better!

---

Happy coding! 🍪