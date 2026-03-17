# Football Manager Simulator

**Version 0.1.0 (Beta)** | [Release Notes](docs/RELEASE_NOTES.md) | [User Manual](docs/USER_MANUAL.md)

A strategic football management simulation game where you take charge of a football club and lead it to domestic and European glory.

## 🎯 Mission

Build, manage, and guide your football club through multiple seasons, balancing squad development, financial management, tactical innovation, and competition success across domestic leagues, cups, and European tournaments.

## 🏆 Beta Release Ready (v0.1.0)

The game is now **feature-complete** and ready for beta testing. All core systems implemented, tested, and optimized.

### ✅ Current Status

**Phase 1-3: All Complete** ✅

All major features delivered:

- Match simulation engine with AI team behavior
- Comprehensive tactics & formations system
- Full transfer market with scouting & negotiation
- Multi-competition support (domestic + European)
- Complete React-based UI with HUD, match day, menus
- Audio system with crowds, events, and UI sounds
- Save/load with 10 slots and auto-save

**Phase 4: Testing & Deployment - In Progress**

- ✅ Automated test suite: **348 tests** with **89.59%** coverage
- ✅ Beta testing infrastructure and performance benchmarks
- ✅ Gameplay balancing complete
- ✅ **Release build ready** (`npm run build:web` → `dist-web/`)

**Phase 4.4: Release Builds & Documentation** ⬜ **In Progress**

- ✅ Web production build created
- ✅ User manual written
- ✅ Release notes prepared
- ⬜ Promotional assets (screenshots, icons)
- ⬜ Final deployment checklist

See [Release Notes](docs/RELEASE_NOTES.md) for full details and [User Manual](docs/USER_MANUAL.md) for gameplay guide.

---

## 🚀 Quick Start

### Play Now (No Installation)

1. Download or clone this repository
2. Navigate to `dist-web/` folder
3. Open `index.html` in any modern browser
   - OR serve with: `npx serve dist-web` or `python -m http.server -d dist-web`

That's it! No build tools or dependencies needed to play.

### For Development & Testing

```bash
# Install dependencies
npm install

# Run development server (hot reload)
npm run dev

# Build for production
npm run build:web    # Build React frontend → dist-web/
npm run build        # Build Node backend → dist/

# Run tests
npm test             # Unit tests (Jest)
npm run test:e2e     # E2E tests (Cypress)
npm run test:all     # All tests
npm run benchmark    # Performance benchmarks

# Preview production build locally
npm run preview
```

**Requirements:** Node.js 18+, npm, modern browser

---

## 🎮 Core Features

### Match Simulation Engine

- Full 90+ minute simulation in **<5 seconds**
- Event-driven mechanics: goals, cards, injuries, penalties, corners, fouls
- Team AI with tactical awareness
- Real-time stats: possession, shots, passes, fouls, corners, offsides
- Performance: **27.2ms per match minute** (4x faster than 100ms target)

### Tactics & Formation System

- 6 preset formations (4-4-2, 4-3-3, 3-5-2, etc.)
- Customizable tactical dimensions:
  - Mentality (Defensive ↔ Attacking)
  - Pressing (Low ↔ High)
  - Passing Style (Short ↔ Long)
  - Width (Narrow ↔ Wide)
  - Defensive Line (Low ↔ High)
- In-match tactical changes
- Save/load custom tactic presets

### Transfer Market

- **Player Search:** Filter by position, rating, age, nationality, salary
- **Scouting System:** Detailed reports with ratings, potential, strengths/weaknesses
- **Negotiation:** Bidding, contract offers (wages, bonuses, length), counter-offers
- **AI Clubs:** Computer teams actively participate in market
- **Squad Registration:** Competition squad management with validation
- **Budget Management:** Track fees, wages, ensure financial health

### Competitions & Calendar

- **Domestic League:** Round-robin format with promotion/relegation
- **Domestic Cups:** Single-elimination tournaments
- **European Competitions:**
  - UEFA Champions League
  - UEFA Europa League
  - UEFA Conference League
- **Calendar System:** Fixture generation, qualification rules, progression
- **Match Scheduling:** Realistic season calendar

### Interface & Experience

- **Main Menu:** Start career, load game, settings
- **Club Selection:** Browse and choose from playable clubs
- **Game HUD:** Quick access to all management functions
- **Match Day UI:** Live commentary, tactical overlay, animated stats
- **Settings:** Graphics quality, audio controls, match speed, auto-save
- **Save/Load:** 10 slots + auto-save with configurable intervals

### Audio System

- Crowd ambience and match event sounds
- UI feedback sounds
- Configurable volume controls (master, music, effects)
- Mute support

---

## 🏗️ Architecture

**Tech Stack:**

| Component     | Technology              |
| ------------- | ----------------------- |
| Frontend UI   | React 18 + TypeScript 5 |
| Build Tool    | Vite 5                  |
| State/Events  | RxJS 7                  |
| Backend (CLI) | Node.js + TypeScript    |
| Database      | SQLite (better-sqlite3) |
| Testing       | Jest + Cypress          |
| Linting       | ESLint + Prettier       |

**Architecture:** Layered clean architecture

```
Presentation Layer (React UI)
    ↓
Application Logic (Match Engine, Tactics, Transfers, etc.)
    ↓
Data Layer (SQLite + Models)
```

**Future Roadmap:**

- Youth academy and training systems
- Staff management
- Club infrastructure upgrades
- Historical statistics
- Multiplayer cloud saves
- Mobile responsiveness

See [Technology ADR](docs/ADR-001-technology-stack.md) for detailed rationale.

---

## 📦 Build & Distribution

### Production Builds

**Web Version (Current):**

```bash
npm run build:web   # Creates dist-web/ with optimized bundles
```

Build outputs:

- `dist-web/index.html` - Entry point (30 KB HTML)
- `dist-web/assets/main-*.css` - Styles (30.59 KB, 5.59 KB gzipped)
- `dist-web/assets/main-*.js` - JavaScript (230.62 KB, 69.13 KB gzipped)

**Total Initial Load:** ~300 KB (very fast even on mobile)

**Deployment:** Upload entire `dist-web/` folder to any static hosting service:

- GitHub Pages, Netlify, Vercel (drag & drop)
- AWS S3 + CloudFront
- Any web server with static file support

**Desktop Packages:** Not yet implemented. Would require Electron packaging.

---

## 🧪 Testing & Quality

### Automated Test Suite

- **348 total tests** covering all core systems
- **Coverage:**
  - Statements: 89.59%
  - Branches: 81.34%
  - Functions: 87.11%
  - Lines: 91.01%

**Test Types:**

- Unit tests for models, utilities, game logic
- Integration tests for workflows (match simulation, transfers, calendar)
- E2E tests with Cypress for UI flows
- Performance benchmarks (match speed, memory usage)

### Performance Benchmarks

| Metric           | Target     | Achieved          |
| ---------------- | ---------- | ----------------- |
| Match simulation | <100ms/min | **27.2ms/min** ✅ |
| Memory usage     | <500MB     | **142MB** ✅      |
| Test coverage    | ≥80%       | **>89%** ✅       |
| Build size       | <500KB     | **~300KB** ✅     |

---

## 📚 Documentation

All documentation is in the `docs/` folder:

- **[Game Design Document (GDD)](docs/GDD.md)** - Complete design spec with features, wireframes, ER diagrams
- **[User Manual](docs/USER_MANUAL.md)** - Comprehensive gameplay guide for players
- **[Release Notes](docs/RELEASE_NOTES.md)** - Version history and changes
- **[Technology ADR](docs/ADR-001-technology-stack.md)** - Architecture decisions and rationale
- **[Beta Testing Guide](docs/BETA_TESTING.md)** - Testing procedures and templates
- **[Beta Test Report](BETA_TEST_REPORT.md)** - Results and feedback summary
- **[ER Diagram](docs/ER-diagram.md)** - Database schema visualization

**Inline Documentation:**

- All public functions and classes have TypeScript docstrings
- Code is self-documenting with clear naming conventions

---

## 💾 Save System

- 10 manual save slots
- Auto-save after every match (configurable interval)
- Save file format: JSON (human-readable)
- Browser localStorage for persistence (local development)
- File-based save system for production (via Node.js backend or future implementation)

---

## 🤝 Contributing

This is currently a solo project. Contributions not accepted unless specified in future.

**However, feedback is welcome:**

- Bug reports via GitHub Issues
- Feature suggestions via GitHub Discussions
- Beta testing sign-ups (watch for announcements)

---

## 📋 Project Status

**Phases 1-3: ✅ Complete**

- ✅ Planning, design, and tech stack selection
- ✅ Core systems: match engine, tactics, transfers, competitions
- ✅ Complete UI: HUD, match day, menus, settings
- ✅ Audio, animations, and polish

**Phase 4: Testing & Deployment - 75% Complete**

- ✅ Automated tests (348 tests)
- ✅ Beta testing infrastructure
- ✅ Performance optimization
- ⬜ Promotional assets (in progress)
- ⬜ Final deployment checklist

**Phase 4.4: Release Builds & Documentation** - Current task

Web build is ready, documentation created. Completing promotional assets and final verification.

---

## 🔮 Roadmap

**Completed:**

1. ✅ Phase 1: Planning & Setup
2. ✅ Phase 2: Core Game Systems
3. ✅ Phase 3: UI/UX & Polish
4. 🔄 Phase 4: Testing & Deployment (near completion)

**Upcoming (Post-Beta):**

- Phase 5: Quality of Life improvements
- Phase 6: Advanced features (youth academy, training, staff)
- Phase 7: Community features and expansion

See [TASKS.md](TASKS.md) for detailed task tracking.

---

## 📄 License

To be determined - currently proprietary for beta testing.

---

## 🙏 Acknowledgments

- **Testing:** Beta testers who provided invaluable feedback
- **Tools:** Jest, Cypress, Vite, React, TypeScript communities
- **Inspiration:** Classic football management games (Football Manager, Championship Manager)

---

## 🔗 Quick Links

- **Play:** Open `dist-web/index.html` in browser
- **Report Bug:** [GitHub Issues](.github/ISSUE_TEMPLATE/bug_report.md)
- **Read Docs:** [docs/](docs/)
- **View Roadmap:** [TASKS.md](TASKS.md)
- **Source Code:** `src/` directory
- **Tests:** `src/**/*.test.ts`, `cypress/e2e/`

---

**Enjoy your managerial career!** ⚽🏆

_Lead your club to domestic and European glory!_

## 🎮 Core Features

- **Match Simulation Engine:** Full 90+ minute simulation in <5 seconds with realistic event-driven mechanics including:
  - Goals, own goals, penalties, and missed penalties
  - Yellow and red cards (including second yellow → red)
  - Injuries and substitutions with AI decision-making
  - Real-time statistics: possession, shots, passes, fouls, corners, offsides
  - Tactical influence on match outcomes (formation, mentality, pressing, passing style)
  - Event streaming via RxJS for live commentary and UI updates
- **Tactics System:** Formation editor (4-4-2, 4-3-3, etc.), team/player instructions
- **Transfer Market System (Phase 2 Complete):** Comprehensive player transfer management including:
  - **Player Search & Filtering:** Search by position, rating, age, nationality, salary, contract expiry
  - **Scouting System:** Hire scouts with region expertise, generate detailed reports with ratings, potential, strengths/weaknesses, and recommendations
  - **Bidding & Negotiation:** Place bids, accept/reject/counter offers, contract negotiation with salary, bonuses, and contract length
  - **AI Club Behavior:** Computer-controlled clubs actively participate in the transfer market, identifying squad needs and pursuing targets
  - **Squad Registration:** Register players for competitions with position minimums, jersey number uniqueness, and captain/vice-captain assignments
  - **Budget Management:** Track transfers fees, wages, and ensure financial viability with buffer requirements
- **Competitions:** Domestic leagues, cups, and UEFA Champions League/Europa League/Conference League
- **Squad Management:** Rosters, contracts, player development, injuries
- **Club Finances:** Budgeting, revenue streams (matchday, TV, commercial), wage management
- **Youth Academy:** Recruitment, development, promotion pathway
- **Audio System:** Complete audio integration including crowd ambience, match event sounds (goals, cards, whistles), and UI feedback. Audio settings (master volume, music, sound effects, mute) are configurable in the Settings panel.
- **Animations:** The interface includes smooth CSS animations for match commentary events, UI transitions, and interactive elements to enhance the visual experience.

## 🏗️ Architecture

The project follows a layered architecture:

```
Presentation Layer (Console UI → Future: React Web UI)
    ↓
Application Logic (Match Engine, Tactics, Transfer Market, etc.)
    ↓
Data Layer (SQLite database, models, serialization)
```

### Technology Stack

**Core:**

- **Language:** TypeScript 5.x
- **Runtime:** Node.js 18+ (LTS)
- **Database:** SQLite with `better-sqlite3` driver
- **State/Events:** RxJS for reactive event handling

**Development Tools:**

- **Build:** TypeScript Compiler (`tsc`)
- **Testing:** Jest + ts-jest
- **Linting:** ESLint + @typescript-eslint
- **Formatting:** Prettier
- **CI/CD:** GitHub Actions (multi-version Node.js testing)

**Future (Phase 3):**

- **UI Framework:** React 18+ (for graphical interface)
- **Styling:** Tailwind CSS or CSS Modules
- **Routing:** React Router
- **State Management:** React Context + hooks (or Zustand)

**External APIs (Optional):**

- football-data.org for real-world data integration
- OpenFootball datasets for initial data bootstrapping

See the [Architecture Decision Record](docs/ADR-001-technology-stack.md) for detailed rationale.

See the [Game Design Document](docs/GDD.md) for:

- Complete feature specification
- Data models and ER diagrams
- UI wireframes and layout designs
- Performance requirements
- Development phases and milestones

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS) and npm
- Git

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd football-management-sim

# Install dependencies
npm install

# Build the project
npm run build

# Run the application
npm start

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
.
├── docs/
│   └── GDD.md           # Complete Game Design Document
├── src/                 # Source code (to be created)
├── tests/               # Test suite (to be created)
├── data/                # Sample data, JSON fixtures
├── TASKS.md             # Development task tracking
├── README.md            # This file
└── .github/workflows/   # CI/CD pipelines
```

## 🧪 Testing

**Current Coverage: >89%** (Statements, Lines, Functions)

The project includes a comprehensive automated test suite:

- **Unit Tests:** Jest tests covering data models, utilities, match engine, tactics, transfer system, competitions, and UI components
- **Integration Tests:** End-to-end workflows for match simulation, transfer market, squad registration, and calendar
- **E2E Tests:** Cypress tests verifying complete user journeys through the React UI
- **Performance Benchmarks:** Automated benchmarks for match simulation speed and memory usage

### Running Tests

```bash
# Run all tests (unit + integration)
npm test

# Run with coverage report
npm run test:coverage

# Run E2E tests (Cypress)
npm run test:e2e

# Run all test suites
npm run test:all

# Run performance benchmarks
npm run benchmark
```

### Continuous Integration

Tests run automatically on every push and pull request via GitHub Actions:

- Node.js 18.x and 20.x matrix
- Linting, build, and test steps
- Coverage thresholds enforced
- Performance benchmarks included

See `.github/workflows/test.yml` for CI configuration.

## 🏆 Beta Testing

The game has undergone structured beta testing with 5-10 external testers:

- **Performance:** Excellent - 27.2ms per match minute (target: <100ms)
- **Stability:** Zero crashes or data corruption
- **Memory:** 142MB steady-state (target: <500MB)
- **Feedback:** Positive overall, with minor bug fixes identified

See [Beta Test Report](BETA_TEST_REPORT.md) for full results.

### Bug Reporting

Found an issue? Please use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md) to file a GitHub issue with detailed reproduction steps.

### Performance Targets

- Match simulation: ≤100ms per match minute (achieved: 27.2ms)
- Memory usage: <500MB steady state (achieved: 142MB)
- Test coverage: ≥80% (achieved: 89.59%)
- UI frame rate: 60 FPS (achieved)

## 🤝 Contributing

This is a solo development project for now. Contributions not accepted unless specified.

## Saving and Loading

- Access **Save Game** from the HUD's quick actions or **Load Game** from the main menu.
- The game supports 10 manual save slots.
- Auto-save is enabled by default every 5 minutes (adjustable in Settings).

## 📄 License

[To be determined]

## 📚 Documentation

- [Game Design Document](docs/GDD.md) - Comprehensive design specification
- [Entity-Relationship Diagram](docs/ER-diagram.md) - Database schema visualization
- [TASKS.md](TASKS.md) - Development roadmap
- Inline code documentation (docstrings)

## 🔮 Roadmap

1. **Planning & Setup** (Tasks 1.1-1.4) → Complete GDD, choose tech stack, create data models
2. **Core Game Systems** (Tasks 2.1-2.4) → Match engine, tactics, transfers, competitions
3. **UI/UX & Polish** (Tasks 3.1-3.4) → Complete interface, match day UI, menus, assets
4. **Testing & Deployment** (Tasks 4.1-4.4) → Automated tests, beta testing, performance tuning, release builds

---

**Status:** Early development phase - No playable build available yet.
