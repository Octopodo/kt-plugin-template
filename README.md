# Create KT Plugin

[![npm version](https://badge.fury.io/js/create-kt-plugin.svg)](https://badge.fury.io/js/create-kt-plugin)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A CLI tool for creating KT (KT Framework) plugins for Adobe ExtendScript applications. This template generator creates a structured project with TypeScript support, testing capabilities, and build configurations optimized for Adobe Creative Suite applications.

## 🚀 Quick Start

Create a new KT plugin project instantly:

```bash
npx create-kt-plugin
```

Or install globally:

```bash
npm install -g create-kt-plugin
create-kt-plugin
```

## 📋 What You'll Get

The CLI will prompt you for:

- **Plugin Name**: The name of your plugin (alphanumeric and hyphens only)
- **Target Program**: Choose from:
  - After Effects
  - ExtendScript (generic)
  - Photoshop
  - Premiere Pro
  - Illustrator
- **App Version**: Automatically detects available versions for your chosen program
- **Author**: Your name
- **Description**: Brief description of your plugin
- **Install Dependencies**: Whether to automatically install npm dependencies

## 🏗️ Project Structure

The generated project includes:

```
your-plugin-name/
├── src/
│   ├── index.ts           # Main entry point
│   ├── YourPlugin.ts      # Main plugin class
│   └── tests/
│       └── index.test.ts  # Unit tests
├── dist/                  # Compiled output
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tsconfig.tests.json    # TypeScript config for tests
├── vite.config.ts         # Vite build configuration
└── vite.es.config.ts      # ExtendScript-specific build config
```

## 🔧 Available Scripts

The generated project comes with these npm scripts:

- `npm run build` - Build the plugin for production
- `npm run watch` - Build and watch for changes during development
- `npm run build-tests` - Build test files
- `npm run prepublishOnly` - Pre-publish build process
- `npm run postpublish` - Post-publish cleanup

## 🧪 Testing

The template includes a testing framework with:

- **kt-testing-suite-ts**: TypeScript testing suite for KT plugins
- Pre-configured test structure
- Example tests for your plugin class

Run tests with:
```bash
npm run build-tests
```

## 🛠️ Technology Stack

- **TypeScript**: Full TypeScript support with proper Adobe types
- **Vite**: Modern build tool with fast development
- **KT Core**: KT framework for plugin architecture
- **types-for-adobe**: Adobe application type definitions
- **Babel**: JavaScript compilation and transformation
- **Rollup**: Module bundling

## 📦 Dependencies

### Core Dependencies
- `kt-core`: KT framework core functionality

### Development Dependencies
- TypeScript compiler and tooling
- Vite build system with plugins
- Adobe types from `types-for-adobe`
- Testing suite (`kt-testing-suite-core`)
- Build tools (Babel, Rollup plugins)

## 🎯 Target Applications

This template supports creating plugins for:

- **After Effects**: Motion graphics and visual effects
- **Photoshop**: Image editing and manipulation
- **Premiere Pro**: Video editing
- **Illustrator**: Vector graphics
- **Generic ExtendScript**: Cross-application scripts

## 🔍 Features

- **Interactive CLI**: User-friendly prompts for project setup
- **TypeScript Support**: Full type safety and IntelliSense
- **Hot Reload**: Development with watch mode
- **Testing Framework**: Built-in testing capabilities
- **Adobe Types**: Automatic inclusion of appropriate Adobe application types
- **Modern Build Tools**: Vite + Rollup for optimized builds
- **KT Framework Integration**: Built on the KT plugin architecture

## 📖 Example Usage

After creating your plugin, the basic structure looks like:

```typescript
// src/YourPlugin.ts
export class YourPlugin {
  private name = 'YourPlugin';
  private version = '1.0.0';
  
  constructor() {
    $.writeln('YourPlugin constructor');
  }
}

// src/index.ts
import { KT } from 'kt-core';
import { YourPlugin } from './YourPlugin';

KT.Module('YourPlugin', YourPlugin);
export { YourPlugin };
```

## 🚦 Requirements

- **Node.js**: Version 14.0.0 or higher
- **npm**: For package management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Miguel de Mendoza

---

**Happy coding with KT plugins!** 🎉