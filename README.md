# Football Manager Simulator

A strategic football management simulation game where you take charge of a football club and lead it to domestic and European glory.

## 🎯 Mission

Build, manage, and guide your football club through multiple seasons, balancing squad development, financial management, tactical innovation, and competition success across domestic leagues, cups, and European tournaments.

## 📋 Project Status

**Phase 1: Planning & Setup** (In Progress)

- ✅ Task 1.1: Game Design Document (GDD) - [View docs/GDD.md](docs/GDD.md)
- ✅ Task 1.2: Development Environment Setup
- ✅ Task 1.3: Technology Stack Selection - [View docs/ADR-001-technology-stack.md](docs/ADR-001-technology-stack.md)
  - ✅ Task 1.4: Data Schema & Prototype Models

See [TASKS.md](TASKS.md) for complete task list and progress.

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
