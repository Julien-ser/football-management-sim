# Architecture Decision Record (ADR): Technology Stack Selection

**Date:** 2026-03-16  
**Status:** Accepted  
**Decision Maker:** Project Team  
**Context:** Choosing technology stack for football management sim

## 1. Problem Statement

Select appropriate technologies for building a football management simulation game that requires:

- Complex data modeling (players, teams, competitions, matches)
- Non-real-time match simulation engine
- Text-based UI with potential for graphical interface
- Persistent data storage (save games, player data)
- Cross-platform compatibility
- Efficient development workflow with existing TypeScript setup

## 2. Options Considered

### 2.1 Game Engine / Rendering Approach

| Option               | Pros                                                                             | Cons                                             |
| -------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Console/CLI Only** | Simple, no dependencies, fastest to develop                                      | No graphical UI, limited user experience         |
| **HTML/CSS/Canvas**  | Cross-platform, owns rendering control, good for text/data-heavy UI              | Requires manual DOM management without framework |
| **React + HTML**     | Component-based, excellent for forms/tables, large ecosystem, TypeScript support | Extra dependency, runtime overhead               |
| **Electron**         | Desktop app packaging, Node.js integration                                       | Overkill for initial MVP, heavy resource usage   |

### 2.2 Database / Persistence

| Option              | Pros                                                       | Cons                                                    |
| ------------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| **JSON Files**      | Simple, no dependencies, human-readable                    | No query capabilities, poor scaling, concurrency issues |
| **SQLite**          | Embedded, ACID compliant, SQL queries, single file, proven | Native module dependency, single write limitation       |
| **PostgreSQL**      | Full-featured, concurrent, scalable                        | Requires separate server, overkill for single-player    |
| **LowDB / LevelDB** | JSON-like, simple API                                      | Limited query capabilities, smaller ecosystem           |

### 2.3 State Management (if using UI framework)

| Option            | Pros                                  | Cons                                     |
| ----------------- | ------------------------------------- | ---------------------------------------- |
| **Zustand**       | Minimal, TypeScript-first, simple API | Smaller ecosystem than Redux             |
| **Redux Toolkit** | Mature, devtools, large ecosystem     | Boilerplate, steeper learning curve      |
| **MobX**          | Reactive, less boilerplate            | Less explicit, magic behaviors           |
| **React Context** | Built-in, no dependencies             | Performance issues with frequent updates |

### 2.4 External Football Data APIs

| API                            | Cost                               | Data Coverage                                       | Rate Limits        | License      |
| ------------------------------ | ---------------------------------- | --------------------------------------------------- | ------------------ | ------------ |
| **football-data.org**          | Free tier (30 req/min), paid plans | European leagues, competitions, standings, fixtures | 10 req/min (free)  | CC BY-NC 4.0 |
| **API-FOOTBALL**               | Freemium (100 req/day free), paid  | 300+ leagues worldwide, live scores, players, stats | 100 req/day (free) | Commercial   |
| **football-api.org**           | Paid only                          | Extensive data, odds, injuries                      | Varies             | Commercial   |
| **OpenFootball/football.json** | Free, open data                    | Historical data, leagues, results                   | OpenGitHub repo    | MIT          |
| **Self-hosted**                | Free                               | Only what we implement                              | Unlimited          | N/A          |

## 3. Decision

### 3.1 Rendering / UI Stack

**Decision:** Start with **HTML/CSS/JavaScript (Canvas optional)** + plan for **React migration** in Phase 3

**Rationale:**

- GDD Phase 1-2 focuses on core systems (match engine, tactics, transfers) where UI is secondary
- Console/terminal output is sufficient for prototyping and testing
- Canvas can render simple visualizations for match highlights if needed
- React can be introduced in Phase 3 for polished UI without rewriting core logic
- Aligns with iterative development approach: build backend first, UI later

**Implementation:**

- Core game state in TypeScript classes
- Render to console initially using `console.table`, `console.log`, colors via `chalk` if needed
- Abstract rendering layer behind interfaces to enable future React integration
- Consider adding `ink` (React for CLI) if console UI needs sophistication

**Alternatives considered:** React from start (rejected due to upfront complexity slowing core system development)

### 3.2 Database / Persistence

**Decision:** **SQLite** with `better-sqlite3` driver

**Rationale:**

- Embedded database: no external server required
- Single-file database perfect for save games (portable, easy backup)
- Full SQL support for complex queries (e.g., finding players by attributes)
- ACID transactions ensure data integrity
- Supports concurrent reads (multiple save slots)
- widely used, well-documented, TypeScript types available
- Scales sufficiently for single-player management sim (thousands of players, decades of history)

**Migration path:**

- Phase 1: Simple schema with tables for saves, configuration
- Phase 2: Full relational schema for players, teams, competitions
- PostgreSQL can be added later if multiplayer/cloud features needed

**Schema outline (to be implemented in Task 1.4):**

- `saves`: id, name, timestamp, game_state (JSON)
- `players`: id, name, age, attributes (JSON), contract, club_id
- `teams`: id, name, league_id, reputation, budget
- `competitions`: id, name, type, season_data (JSON)
- `matches`: id, home_team_id, away_team_id, competition_id, date, result (JSON)
- `user_club`: club_id managed by player

**Alternatives considered:** JSON files (rejected due to scalability and query limitations)

### 3.3 State Management

**Decision:** **RxJS** or custom event emitter pattern for core game state

**Rationale:**

- Match simulation needs reactive events (goal scored, card shown, half-time)
- RxJS provides observable streams for decoupled components
- Can be used without UI framework
- If React adopted later, RxJS state can be connected via hooks or converters
- Avoids premature choice of Redux/Zustand which are React-centric

**Implementation:**

- `GameState` class with observable properties
- `EventManager` for broadcasting match events, transfer news, etc.
- Subscribers: UI renderers, AI decision makers, save system

### 3.4 Football Data APIs

**Decision:** **Self-hosted data + optional integration with football-data.org for live updates**

**Rationale:**

- Game needs realistic initial data (100+ players, 20+ teams)
- Cannot rely solely on external APIs (rate limits, cost, offline play)
- Build initial dataset manually or from open sources (Wikipedia, open football datasets)
- Use football-data.org as optional feature for real-world updates/immersion
- Provides full control over data schema and game balance

**Implementation:**

- Create initial data in JSON files with mock but realistic players/teams
- Design data model compatible with football-data.org schema (player: name, age, position, attributes; team: name, players, league)
- Optional: Write adapter to fetch real data for "real-world mode"

**Research sources:**

- [OpenFootball datasets](https://github.com/openfootball): Historical results, leagues, CC-BY-NC 3.0
- Wikipedia football club/player pages: Scrape for initial roster data
- football-data.org API: Use for inspiration on data structure

### 3.5 Build System & Tooling (Existing)

**Existing choices from Task 1.2:**

- **Language:** TypeScript 5.x
- **Compiler:** `tsc` (TypeScript Compiler)
- **Testing:** Jest + ts-jest
- **Linting:** ESLint + @typescript-eslint
- **Formatting:** Prettier
- **CI/CD:** GitHub Actions (Node.js 18.x, 20.x matrix)

**Status:** These are appropriate and will be retained.

### 3.6 Additional Libraries (Proposed for Future)

- **date-fns** or **dayjs**: Date manipulation for fixtures, contract dates
- **commander** or **yargs**: CLI commands for debugging, data generation
- **chalk**: Terminal colors for console UI
- ** ora**: Spinners for loading operations
- **inquirer**: Interactive CLI prompts for menus (before React UI)
- **uuid**: Unique IDs for entities
- **seedrandom**: Deterministic RNG for reproducible matches (testing)

All proposals will be added as needed in upcoming tasks, not all at once.

## 4. Consequences

### Positive

- Clear separation: core logic independent of rendering
- Can prototype match engine quickly without UI overhead
- SQLite provides robust persistence with minimal code
- TypeScript ecosystem supports all chosen libraries with types
- Incremental UI improvement path: CLI → enhanced CLI → web UI
- Data privacy: internal dataset avoids API dependency

### Negative

- Future React migration requires refactoring rendering layer
- Console UI may feel "temporary" and delay full UI polish
- SQLite's write concurrency limit (but irrelevant for single-player)
- Manual data creation effort for initial dataset

### Risks

- **Scope creep:** Spending too much time on data creation vs. core simulation
- **Renderer abstraction leak:** Core logic accidentally dependent on console output
- **Schema rigidity:** SQL schema changes require migrations, need versioning strategy

**Mitigation:**

- Define `IRenderer` interface early and enforce separation
- Use database migration tool (e.g., `umzug` for SQLite) or simple version column
- Limit initial data to 10 teams × 25 players = 250 players (sufficient for MVP)
- Leverage open datasets to bootstrap data generation

## 5. Related Decisions

- Task 1.4: Database schema implementation will follow this ADR
- Task 2.1: Match engine must emit RxJS events
- Task 3.1: UI implementation will replace console renderer with React
- GitHub Actions workflow already configured for this stack

## 6. References

- GDD.md (Game Design Document)
- football-data.org API docs: https://www.football-data.org/documentation
- SQLite documentation: https://www.sqlite.org/docs.html
- RxJS documentation: https://rxjs.dev/
- Better-SQLite3: https://github.com/WiseLibs/better-sqlite3
