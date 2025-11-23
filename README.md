# KnotIQ - Crochet Companion App

A modern, project-focused crochet companion app built with React Native and Expo. Think Ravelry + Row Counter + Pattern Notebook + Yarn Stash Manager, but simpler and more beginner-friendly.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-lightgrey.svg)

## ✨ Features

### 🎯 Project-Centric Design
- **Smart Counters** - Persistent row/stitch counters that don't reset when your screen locks
- **Project Tracking** - Track multiple projects with pattern sources, notes, photos, and progress
- **Project Journal** - Timeline of progress photos and milestones
- **Status Management** - Pause, resume, or mark projects as finished

### 📚 Pattern Library
- **Pattern Maker** - Create and edit your own pattern drafts with live preview
- **Pattern Import** - Import patterns from URLs, PDFs, or text
- **Pattern Catalog** - Curated collection of crochet patterns
- **Pattern Organization** - Filter by difficulty, search by tags

### 🧶 Yarn Stash Management
- **Stash Tracking** - Track yarn details (brand, color, weight, meterage)
- **Color Picker** - Visual color selection for yarns
- **Project Linking** - Link yarns to projects and track reserved quantities
- **Stash Summary** - View total skeins and meters at a glance

### 🎨 Customization
- **Custom Accent Colors** - Personalize your app's accent color
- **Theme Support** - Light, dark, and system theme modes
- **Clean UI** - Modern, minimal, iOS-native design

### 📱 Cross-Platform
- **iOS** - Native iOS experience
- **Android** - Full Android support
- **Web** - Progressive web app

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS) or Android Emulator (for Android)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/srj753/StitchFlow.git
   cd StitchFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your platform**
   - iOS: `npm run ios` or press `i` in the Expo CLI
   - Android: `npm run android` or press `a` in the Expo CLI
   - Web: `npm run web` or press `w` in the Expo CLI

## 📁 Project Structure

```
crochet-reboot/
├── app/                    # Expo Router screens
│   ├── home/              # Home/Dashboard
│   ├── projects/          # Project list & detail
│   ├── patterns/          # Pattern library & maker
│   ├── community/         # Community (placeholder)
│   └── settings/          # Settings & preferences
├── components/             # Reusable UI components
│   ├── counters/          # Counter components
│   ├── projects/          # Project-related components
│   ├── yarn/              # Yarn stash components
│   └── ui/                # Generic UI components
├── store/                  # Zustand state management
├── types/                  # TypeScript type definitions
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── data/                   # Mock data & catalogs
└── docs/                   # Documentation
```

## 🛠️ Tech Stack

- **Framework:** React Native with Expo
- **Navigation:** Expo Router (file-based routing)
- **State Management:** Zustand
- **Persistence:** AsyncStorage
- **Language:** TypeScript
- **Styling:** React Native StyleSheet

## 📖 Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md) - Detailed architecture documentation
- [Testing Guide](./docs/TESTING_GUIDE.md) - Comprehensive testing checklist
- [Recent Fixes](./docs/COMPREHENSIVE_FIXES.md) - Latest fixes and improvements

## 🎯 Roadmap

### Phase 1 (Complete ✅)
- Project list & detail screens
- Smart counters (row/stitch)
- Pattern library & import
- Yarn stash management
- Project journal & photos
- Custom accent colors

### Phase 2 (In Progress 🚧)
- Multi-part linked counters
- Counter presets & templates
- Pattern row checklist
- Basic pattern text parsing

### Phase 3 (Planned 📋)
- Voice commands for counters
- Pattern parsing & AI extraction
- Diagram & drawing tools
- Voice notes & video notes
- Inspiration & moodboard
- Gauge/yarn estimator
- Community features

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev/)
- UI inspired by modern iOS design principles
- Pattern catalog curated from various sources

## 📧 Contact

For questions, suggestions, or bug reports, please open an issue on GitHub.

---

Made with ❤️ for the crochet community

