# FMA Skeckit App

A comprehensive file and case management application for legal professionals, built with Vue 3 and Quasar Framework.

## Features

- **Case Management**: Create, edit, and track legal cases
- **Client Management**: Manage client information and metadata
- **File Operations**: Upload, download, and organize case files
- **Search & Navigation**: Fuzzy search across cases and files
- **Analytics Dashboard**: Business insights with interactive charts
- **Desktop Application**: Native installers for Windows, macOS, and Linux

## Getting Started

### Web Application

#### Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).

## Desktop Application

The application can be packaged as native desktop installers for Windows, macOS, and Linux using Electron.

### System Requirements

- **Node.js**: 18+
- **npm**: 9+
- **Disk Space**: ~50GB for build tools and outputs
- **Platforms**: Windows 10/11, macOS 11+, Ubuntu 20.04+

### Quick Start

```bash
# 1. Install desktop dependencies (one-time setup)
cd desktop
npm install
cd ..

# 2. Build the web application
npm run build

# 3. Build desktop installers
npm run electron:build:mac    # macOS (.dmg)
npm run electron:build:win    # Windows (.exe, .msi)
npm run electron:build:linux  # Linux (.AppImage, .deb, .rpm)
npm run electron:build:all    # All platforms
```

### Build Output

Desktop installers are created in `dist-desktop/`:

- **macOS**: `FMA Skeckit App <version>.dmg` (~90-95MB)
- **Windows**: `FMA Skeckit App Setup <version>.exe` and `.msi`
- **Linux**: `*.AppImage`, `*.deb`, `*.rpm`

### Features

- ✅ **Native installers** for Windows, macOS, and Linux
- ✅ **Auto-update** via GitHub Releases
- ✅ **Deep linking** support (`fmaskeckit://` protocol)
- ✅ **macOS native menu bar** with standard shortcuts
- ✅ **Security**: Context isolation, sandboxed environment
- ✅ **Cross-platform builds** from a single machine

### Documentation

Complete desktop packaging documentation:

- [Desktop README](desktop/README.md) - Comprehensive usage guide
- [**Icon Replacement Guide**](docs/ICON-REPLACEMENT.md) - Replace application icon & splash screen
- [Build Notes](desktop/scripts/BUILD-NOTES.md) - Build instructions and troubleshooting
- [Windows Testing](desktop/scripts/WINDOWS-TESTING.md) - Windows validation checklist
- [macOS Testing](desktop/scripts/MACOS-TESTING.md) - macOS validation checklist
- [Auto-Update Testing](desktop/scripts/AUTO-UPDATE-TESTING.md) - Update flow testing
- [Building on macOS](desktop/scripts/BUILDING-ON-MACOS.md) - macOS-specific guide

### Development Mode

Test the desktop app without building installers:

```bash
npm run electron:dev
```

### Before Production Release

1. **Replace placeholder icon**: See [Icon Replacement Guide](docs/ICON-REPLACEMENT.md) for complete instructions
2. **Add code signing**: Obtain certificates for macOS (Developer ID) and Windows (Authenticode)
3. **Configure GitHub Releases**: Update `desktop/electron-builder.yml` with your repo details
4. **Test thoroughly**: Use the provided testing checklists

For more details, see [desktop/README.md](desktop/README.md).

## Project Structure

```
fma-skeckit-app/
├── src/                    # Vue 3/Quasar web application
├── desktop/                # Electron desktop wrapper
│   ├── main.js            # Main process
│   ├── preload.js         # Security layer
│   ├── electron-builder.yml  # Build configuration
│   └── scripts/           # Build and testing scripts
├── tests/                  # Vitest tests
├── specs/                  # Feature specifications
└── dist/                   # Build outputs
```

## Technology Stack

- **Frontend**: Vue 3, Quasar 2, Vite
- **State Management**: Pinia
- **Testing**: Vitest, Vue Test Utils, Selenium
- **Desktop**: Electron 28+, electron-builder
- **Charts**: ApexCharts

## Contributing

See [CLAUDE.md](CLAUDE.md) for development guidelines and active technologies.

## License

[Your License Here]
