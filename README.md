# Pomodoro Timer

A modern, Progressive Web App (PWA) Pomodoro timer built with Angular 18 and Angular Material. Stay focused, manage your time effectively, and boost your productivity with this simple yet powerful timer application.

🌐 **Live Demo:** [https://focusgo.app](https://focusgo.app)

## Features

- ⏱️ **Classic Pomodoro Technique**: 25-minute focus sessions followed by 5-minute breaks
- 🎨 **Visual Progress Indicator**: Circular progress spinner shows time remaining
- 🔔 **Audio Notifications**: Sound alert when switching between focus and break modes
- 🔄 **Auto-Start Option**: Automatically begin the next session (configurable)
- 📱 **Progressive Web App**: Install on any device for offline access
- 🎯 **Minimal & Distraction-Free**: Clean Material Design interface
- 💾 **Persistent Settings**: Your preferences are saved locally
- 🌓 **Mode Indication**: Clear visual distinction between focus and break times

## Technology Stack

- **Framework**: Angular 18 (standalone components)
- **UI Library**: Angular Material
- **State Management**: RxJS
- **PWA**: Angular Service Worker
- **TypeScript**: Strict mode enabled
- **Build Tool**: Angular CLI

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/herbertmoroni/pomodoro.git
cd pomodoro

# Install dependencies
npm install
```

### Development Server

```bash
# Start the development server
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload when you change source files.

### Build for Production

```bash
# Build the project
npm run build
```

Build artifacts will be stored in the `dist/` directory with production optimizations including:
- AOT compilation
- Tree shaking
- Minification
- Service worker for offline support

### Running Tests

```bash
# Run unit tests
npm test

# Run tests with code coverage
npm test -- --code-coverage
```

### Code Quality

```bash
# Lint TypeScript and HTML files
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check
```

## Usage

### Controls

- **Play/Pause**: Start or pause the current timer
- **Reset**: Return to the start of the current session (focus or break)
- **Skip**: Move to the next session immediately
- **Auto Start Toggle**: Enable/disable automatic session transitions

### Timer Behavior

1. **Focus Mode** (25 minutes)
   - Blue theme color
   - Progress fills clockwise
   - Helps you concentrate on tasks

2. **Break Mode** (5 minutes)
   - Red/pink theme color
   - Progress empties counterclockwise
   - Time to rest and recharge

3. **Session Transitions**
   - Audio alert plays when switching modes
   - If Auto Start is enabled, next session begins automatically
   - Browser title shows countdown when timer is active

## Project Structure

```
pomodoro/
├── src/
│   ├── app/
│   │   ├── app.component.ts      # Main timer component
│   │   ├── app.component.html    # Timer template
│   │   ├── app.component.css     # Component styles
│   │   ├── app.component.spec.ts # Unit tests
│   │   ├── app.config.ts         # App configuration
│   │   └── app.routes.ts         # Routing (minimal)
│   ├── index.html                # Main HTML file
│   ├── main.ts                   # Application entry point
│   └── styles.css                # Global styles
├── public/
│   ├── icons/                    # PWA icons
│   ├── manifest.webmanifest      # PWA manifest
│   ├── robots.txt                # SEO configuration
│   ├── sitemap.xml               # Site map
│   └── mixkit-*.wav              # Alarm sound
├── angular.json                  # Angular CLI configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies
└── README.md                     # This file
```

## Configuration

### Timer Durations

Timer durations are defined in `src/app/app.component.ts`:

```typescript
focusTime = 25 * 60; // 25 minutes in seconds
breakTime = 5 * 60;  // 5 minutes in seconds
```

### PWA Settings

Service worker configuration in `ngsw-config.json` controls:
- Caching strategies
- Asset groups
- Update behavior

### Build Configuration

Bundle size limits and build optimizations are configured in `angular.json`.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## SEO & Analytics

- Google Tag Manager integration
- Microsoft Clarity for user behavior analytics
- Sitemap and robots.txt for search engine optimization
- Open Graph and meta tags for social sharing

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Angular style guide
- Write unit tests for new features
- Run linting before committing (`npm run lint:fix`)
- Format code with Prettier (`npm run format`)
- Maintain TypeScript strict mode compliance

## License

This project is open source and available for personal and commercial use.

## Author

**Herbert Moroni Gois**

## Acknowledgments

- Pomodoro Technique® by Francesco Cirillo
- Sound effects from Mixkit
- Icons and UI components from Angular Material

## Roadmap

Future enhancements may include:
- Customizable timer durations
- Session history and statistics
- Multiple timer presets
- Sound customization
- Keyboard shortcuts
- Dark mode toggle

---

**Boost your productivity today!** Visit [focusgo.app](https://focusgo.app)
