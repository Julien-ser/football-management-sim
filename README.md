# Football Manager Simulator

A strategic football management simulation game where you take charge of a football club and lead it to domestic and European glory.

## 🎯 Mission

Build, manage, and guide your football club through multiple seasons, balancing squad development, financial management, tactical innovation, and competition success across domestic leagues, cups, and European tournaments.

## 📋 Project Status

**Phase 1: Planning & Setup** (In Progress)

- ✅ Task 1.1: Game Design Document (GDD) - [View docs/GDD.md](docs/GDD.md)
- ⏳ Task 1.2: Development Environment Setup
- ⏳ Task 1.3: Technology Stack Selection
- ⏳ Task 1.4: Data Schema & Prototype Models

See [TASKS.md](TASKS.md) for complete task list and progress.

## 🎮 Core Features

- **Match Simulation:** Event-driven engine with real-time tactics and statistics
- **Tactics System:** Formation editor (4-4-2, 4-3-3, etc.), team/player instructions
- **Transfer Market:** Player search, scouting, bidding, contract negotiation
- **Competitions:** Domestic leagues, cups, and UEFA Champions League/Europa League/Conference League
- **Squad Management:** Rosters, contracts, player development, injuries
- **Club Finances:** Budgeting, revenue streams (matchday, TV, commercial), wage management
- **Youth Academy:** Recruitment, development, promotion pathway

## 🏗️ Architecture

The project follows a layered architecture:

```
Presentation Layer (UI)
    ↓
Application Logic (Match Engine, Tactics, Transfer Market, etc.)
    ↓
Data Layer (SQLite database, models, serialization)
```

**Technology Stack:** Node.js/TypeScript (see [Task 1.3](TASKS.md#task-13-choose-technology-stack--libraries) for formal ADR)

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

Automated testing with Jest:

- Unit tests for data models and utilities
- Integration tests for core game systems
- End-to-end tests for UI critical paths (future)

Run tests with: `npm test`

## 📊 Performance Targets

- Match simulation: ≤15 seconds for full 90+ minutes
- Memory usage: <500MB steady state
- Test coverage: ≥80%

## 🤝 Contributing

This is a solo development project for now. Contributions not accepted unless specified.

## 📄 License

[To be determined]

## 📚 Documentation

- [Game Design Document](docs/GDD.md) - Comprehensive design specification
- [TASKS.md](TASKS.md) - Development roadmap
- Inline code documentation (docstrings)

## 🔮 Roadmap

1. **Planning & Setup** (Tasks 1.1-1.4) → Complete GDD, choose tech stack, create data models
2. **Core Game Systems** (Tasks 2.1-2.4) → Match engine, tactics, transfers, competitions
3. **UI/UX & Polish** (Tasks 3.1-3.4) → Complete interface, match day UI, menus, assets
4. **Testing & Deployment** (Tasks 4.1-4.4) → Automated tests, beta testing, performance tuning, release builds

---

**Status:** Early development phase - No playable build available yet.
