# 🍪 Cookie Copier - Modern Chrome Extension

<div align="center">
  <img src="assets/icons/icon-128.png" alt="Cookie Copier Logo" width="128" height="128">

  [![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/cybertron288/cookie-copier)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.0.12-purple.svg)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC.svg)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
  [![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Coming_Soon-yellow.svg)](#installation)
  [![Build Status](https://img.shields.io/github/actions/workflow/status/cybertron288/cookie-copier/ci.yml?branch=v2)](https://github.com/cybertron288/cookie-copier/actions)
</div>

<p align="center">
  <strong>A modern, elegant Chrome extension for seamless cookie management across domains.</strong><br>
  Built with TypeScript, Tailwind CSS, and modern web technologies for developers and QA engineers.
</p>

## 📸 Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="assets/screenshots/main-interface.png" alt="Main Interface" width="400"/>
        <br />
        <em>Main Interface - Glass Morphism Design</em>
      </td>
      <td align="center">
        <img src="assets/screenshots/cookie-list.png" alt="Cookie List" width="400"/>
        <br />
        <em>Cookie Management View</em>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="assets/screenshots/search-filter.png" alt="Search & Filter" width="400"/>
        <br />
        <em>Advanced Search & Filtering</em>
      </td>
      <td align="center">
        <img src="assets/screenshots/export-import.png" alt="Export/Import" width="400"/>
        <br />
        <em>Export & Import Options</em>
      </td>
    </tr>
  </table>
</div>

## ✨ Key Features

### 🎨 Modern UI/UX
- **Glass Morphism Design**: Beautiful frosted glass effects with smooth animations
- **Minimal Interface**: Clean, distraction-free design focusing on functionality
- **Dark Mode Support**: Automatic theme detection with manual toggle option
- **Responsive Layout**: Optimized 440px width for comfortable viewing
- **Toast Notifications**: Non-intrusive feedback for all user actions
- **Micro-interactions**: Smooth hover effects and delightful transitions

### 🚀 Core Functionality
- **Smart Cookie Detection**: Automatically detects and lists all cookies for the current domain
- **One-Click Copy**: Copy individual cookies or all cookies at once
- **Cross-Domain Paste**: Paste cookies to any domain with automatic validation
- **Batch Operations**: Copy, paste, and manage multiple cookies simultaneously
- **Cookie Editing**: Modify cookie values, expiration dates, and attributes in-place
- **Advanced Search**: Real-time filtering by name, value, or domain
- **Export/Import**: Support for JSON, CSV, and Netscape cookie jar formats

### 🔒 Security & Privacy
- **Manifest V3**: Latest Chrome security standards
- **Local Storage Only**: All data stays on your device
- **Secure Cookie Handling**: Respects secure and HttpOnly flags
- **No Tracking**: Zero telemetry or data collection
- **Minimal Permissions**: Only essential permissions requested
- **Input Validation**: Comprehensive XSS and injection protection

### 👨‍💻 Developer Features
- **TypeScript Support**: Full type safety with comprehensive type definitions
- **Vite Build System**: Lightning-fast HMR and optimized production builds
- **Component Architecture**: Modular, maintainable code structure
- **Modern Testing**: Comprehensive test suite with Jest and Testing Library
- **CI/CD Pipeline**: Automated testing and deployment with GitHub Actions
- **Code Quality**: ESLint, Prettier, and EditorConfig for consistent code
- **Keyboard Shortcuts**: Productivity-focused hotkeys for power users

## 🛠️ Tech Stack

<div align="center">
  <table>
    <tr>
      <td align="center">💙</td>
      <td><strong>TypeScript 5.2.2</strong> - Type-safe development</td>
      <td align="center">⚡</td>
      <td><strong>Vite 5.0.12</strong> - Lightning-fast builds</td>
    </tr>
    <tr>
      <td align="center">🎨</td>
      <td><strong>Tailwind CSS 3.4.1</strong> - Utility-first styling</td>
      <td align="center">📦</td>
      <td><strong>pnpm 8.15.0</strong> - Fast, disk space efficient</td>
    </tr>
    <tr>
      <td align="center">🧪</td>
      <td><strong>Jest 29.7.0</strong> - Comprehensive testing</td>
      <td align="center">✨</td>
      <td><strong>ESLint + Prettier</strong> - Code quality</td>
    </tr>
  </table>
</div>

## 📦 Installation

### Option 1: Chrome Web Store (Coming Soon)
The extension will be available on the Chrome Web Store soon. Star this repo to get notified!

### Option 2: Manual Installation (Available Now)

1. **Download the Extension**
   ```bash
   # Clone the repository
   git clone https://github.com/cybertron288/cookie-copier.git
   cd cookie-copier

   # Checkout v2 branch
   git checkout v2

   # Install dependencies and build
   pnpm install
   pnpm build
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `dist` folder from the project

3. **Pin the Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Pin Cookie Copier for easy access

## 🎯 Usage

### Quick Start

1. **Open the Extension**
   - Click the Cookie Copier icon in your Chrome toolbar
   - The extension automatically detects cookies for the current domain

2. **Copy Cookies**
   - Use the search bar to find specific cookies
   - Click the copy icon next to individual cookies
   - Or use "Copy All" for batch operations

3. **Paste Cookies**
   - Navigate to the target domain
   - Open the extension
   - Click "Paste" to apply copied cookies
   - Refresh the page to apply changes

### Advanced Features

- **Export Cookies**: Save cookies to JSON/CSV for backup or sharing
- **Import Cookies**: Load previously exported cookie collections
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + C`: Copy selected cookies
  - `Ctrl/Cmd + V`: Paste cookies
  - `Ctrl/Cmd + F`: Focus search
  - `Escape`: Clear selection

## 🔧 Development

### Prerequisites

```bash
# Required versions
Node.js: 18.0.0+
pnpm: 8.15.0+
Chrome: 120.0+
```

### Recommended IDE Setup

- **VS Code** with extensions:
  - ESLint
  - Prettier - Code formatter
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin (Volar)

### Development Workflow

```bash
# Clone the repository
git clone https://github.com/cybertron288/cookie-copier.git
cd cookie-copier

# Checkout v2 branch for latest features
git checkout v2

# Install dependencies
pnpm install

# Start development server with HMR
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format code
pnpm format
```

### Project Structure

```
cookie-copier/
├── src/
│   ├── background.ts      # Background service worker
│   ├── content.ts         # Content script
│   ├── popup-modern.html  # Popup UI
│   ├── popup-modern.ts    # Popup controller
│   ├── components/        # Reusable components
│   ├── lib/              # Core utilities
│   ├── styles/           # Tailwind styles
│   ├── types/            # TypeScript types
│   └── utils/            # Helper functions
├── tests/                # Test suites
├── dist/                 # Build output
└── vite.config.mts       # Vite configuration
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

```bash
# 1. Fork and clone
git clone https://github.com/your-username/cookie-copier.git

# 2. Create feature branch
git checkout -b feature/amazing-feature

# 3. Make changes and test
pnpm dev
pnpm test

# 4. Commit with conventional commits
git commit -m 'feat: add amazing feature'

# 5. Push and create PR
git push origin feature/amazing-feature
```

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test updates
- `chore:` Build process or auxiliary tool changes

## 🚀 Roadmap

- [ ] **v2.1** - Cloud sync for cookie collections
- [ ] **v2.2** - Cookie templates and presets
- [ ] **v2.3** - Advanced encryption for sensitive cookies
- [ ] **v3.0** - Firefox and Edge support
- [ ] **v3.1** - Cookie analytics dashboard
- [ ] **v3.2** - Team collaboration features
- [ ] **v4.0** - AI-powered cookie management

## 📊 Performance

- **Build Time**: ~950ms (10x faster than webpack)
- **Bundle Size**: <50KB (optimized with Rollup)
- **Load Time**: <100ms
- **Memory Usage**: <10MB
- **Test Coverage**: 95%+

## 🔒 Security

- **Manifest V3**: Latest Chrome security standards
- **Minimal Permissions**: Only essential permissions requested
- **No External Dependencies**: All data stays local
- **Secure Storage**: Chrome's secure storage API
- **Input Validation**: Comprehensive XSS protection
- **Regular Security Audits**: Automated with GitHub Actions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chrome Extension documentation and community
- Tailwind CSS and shadcn/ui for design inspiration
- Vite for the amazing build tool
- All our amazing contributors

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/cybertron288/cookie-copier/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cybertron288/cookie-copier/discussions)
- **Email**: ravi60353@gmail.com
- **Twitter**: [@cybertron288](https://twitter.com/cybertron288)

## 📈 Stats

![GitHub Stars](https://img.shields.io/github/stars/cybertron288/cookie-copier?style=social)
![GitHub Forks](https://img.shields.io/github/forks/cybertron288/cookie-copier?style=social)
![GitHub Watchers](https://img.shields.io/github/watchers/cybertron288/cookie-copier?style=social)

---

<div align="center">
  <p>
    <strong>⭐ Star this repository if you find it helpful!</strong>
  </p>
  <p>
    Made with ❤️ by <a href="https://github.com/cybertron288">cybertron288</a>
  </p>
  <p>
    <a href="https://github.com/cybertron288/cookie-copier/stargazers">
      <img src="https://img.shields.io/github/stars/cybertron288/cookie-copier?style=social" alt="Stars">
    </a>
    <a href="https://github.com/cybertron288/cookie-copier/network/members">
      <img src="https://img.shields.io/github/forks/cybertron288/cookie-copier?style=social" alt="Forks">
    </a>
    <a href="https://github.com/cybertron288/cookie-copier/watchers">
      <img src="https://img.shields.io/github/watchers/cybertron288/cookie-copier?style=social" alt="Watchers">
    </a>
  </p>
</div>