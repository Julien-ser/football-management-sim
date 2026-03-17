# Football Manager Simulator - Game Design Document (GDD)

## Executive Summary
Football Manager Simulator is a deep, strategic football management simulation game where players take on the role of a football club manager, tasked with leading their team to domestic and European glory. The game combines tactical match simulation, squad management, transfer negotiations, and long-term club development.

---

## 1. Core Gameplay Loops

### 1.1 Match Simulation Loop
**Input:**
- Pre-match tactics (formation, team instructions, player instructions)
- In-match tactical changes (substitutions, formation switches, mentality adjustments)

**Processing:**
- Event-driven match engine runs in real-time or accelerated modes
- Player AI follows tactical instructions and roles
- Match events trigger based on probability tables influenced by tactics, player attributes, and match context

**Output:**
- Live match statistics (possession, shots, passes, tackles, cards, goals)
- Text-based commentary describing key events
- Player performance ratings
- Match result and post-match analysis

**Performance Target:** Full 90+ minutes simulation in <5 seconds

### 1.2 Transfer & Squad Management Loop
**Input:**
- Player search criteria (position, attributes, age, value)
- Scouting reports on target players
- Contract negotiation parameters (wage, bonus, length)

**Processing:**
- Transfer market simulation with AI clubs buying/selling
- Player valuation algorithm based on attributes, age, potential, contract length
- Contract negotiation mini-game with player/agent demands

**Output:**
- Completed transfers (in/out)
- Updated squad roster
- Budget adjustments
- Modified team chemistry and squad depth

### 1.3 Tactics & Formation Loop
**Input:**
- Formation selection (4-4-2, 4-3-3, 3-5-2, 4-2-3-1, etc.)
- Team mentality (defensive, balanced, attacking)
- Individual player instructions (passing style, marking, forward runs)

**Processing:**
- Tactical parameters translated into match engine modifiers
- Formation slots mapped to player roles and responsibilities
- In-match tactical changes dynamically update AI behavior

**Output:**
- Effective tactical setup applied to match simulation
- Tactical suitability ratings (how well players fit the system)
- Tactical presets can be saved/loaded

### 1.4 Competition & Calendar Loop
**Input:**
- Club's registered competitions (league, cups, European)
- Match schedule generated at season start

**Processing:**
- Fixture list progression with proper scheduling (no conflicts, rest periods)
- Competition-specific rules (qualification, promotion/relegation, cup draws)
- Player availability tracking (injury, suspension, international duty)

**Output:**
- Calendar view with upcoming matches
- Fixture results and league tables
- Competition progression (qualification rounds, knockout stages)

---

## 2. Feature List

### 2.1 Core Features (MVP)

#### Domestic League System
- At least 1 fully implemented league with 20 teams
- Double round-robin format (home/away fixtures)
- Promotion and relegation (bottom 3 down, top 3 up)
- Automatic qualification for European competitions
- Real-time league table with points, GD, GF/GA

#### European Competitions
- UEFA Champions League (32-team group stage + knockout)
- UEFA Europa League (32-team group stage + knockout)
- UEFA Conference League (32-team group stage + knockout)
- Correct qualification pathways based on league position
- Two-legged knockout ties with away goals rule (optional)
- European coefficient system (bonus prize money)

#### Domestic Cup(s)
- Single-elimination knockout format
- Random draws for each round
- Neutral venue for final (optional)
- Lower division teams included for drama

#### Transfer Market
- Transfer windows (summer and winter)
- Player listing with asking price
- Bid negotiation system (counter-offers)
- Loan deals with option to buy
- Youth player acquisition
- Player valuations based on:
  - Current ability (1-100)
  - Potential ability (1-100)
  - Age (peak years 24-28)
  - Contract length (1-5 years)
  - Position (forwards > midfielders > defenders > keepers)

#### Squad Management
- Squad registration (25 players max for competitions)
- Position ratings and preferred positions
- Player morale and happiness
- Contract management (expiring deals, wage demands)
- Injury tracking and recovery
- Player development (potential unlocking through training/playing time)

#### Club Finances
- Revenue streams:
  - Matchday (ticket sales, concessions, hospitality)
  - Broadcasting (TV rights based on league position and European progress)
  - Commercial (sponsorship, merchandise)
  - Prize money (competition rewards)
- Expenses:
  - Player wages (weekly)
  - Transfer fees (amortized over contract length)
  - Facility maintenance (stadium, training ground)
  - Staff salaries (coaches, scouts, medical)
  - Transfer commissions
- Budget balance and board expectations

#### Youth Academy
- Youth intake (age 16-18) each season
- Youth player attributes and potential
- Youth team match simulation (optional, simplified)
- Player development curves
- Promotion to senior squad

#### Training System
- Multiple training focuses (attacking, defending, fitness, tactics)
- Individual player training (position-specific, skill development)
- Match preparation (tactical familiarization, set pieces)
- Training intensity controls (balanced, heavy, light)

#### Staff Management
- Hiring/firing assistant coaches, scouts, physios
- Staff attributes affecting performance
- Staff morale and wage demands

### 2.2 Polish Features (Nice-to-Have)

#### Match Engine Enhancements
- Set piece routines (corners, free kicks, penalties)
- In-match momentum shifts
- Weather effects (rain reduces passing accuracy)
- Pitch conditions
- Crowd influence on home advantage

#### Manager Profile
- Manager reputation system (affects job offers, player acquisition)
- Manager attributes (tactical knowledge, man-management, negotiating)
- Manager career progression (starting from lower leagues)
- Board confidence meter
- Media interactions and press conferences

#### Fan & Media Relations
- Fan sentiment based on results and style
- Press leaks and rumors
- Social media reactions (optional)
- Fan protests if results are poor

#### Advanced Tactics
- Custom team instructions (line height, width, pressing triggers)
- Player roles with specific duties (regista, anchor man, false nine)
- Team/player tendencies (tendency to cross, dribble, etc.)
- In-match tactical presets for quick changes

#### Historical Stats & Records
- Club history and records
- Player career histories
- Seasonal statistics leaders
- Achievements and trophies
- All-time top scorers, appearance makers

#### International Football
- National team management (optional)
- International call-ups affecting club availability
- International tournaments (World Cup, Euros, Copa America)
- Player national team preferences

---

## 3. UI/UX Design & Wireframes

### 3.1 Main Game HUD (Home/Club Screen)

```
┌─────────────────────────────────────────────────────────────┐
│  [Menu] [Tactics] [Squad] [Transfer] [Youth] [Training]  │
├───────────────┬─────────────────────────────────────────────┤
│               │                                             │
│  LEAGUE       │           CLUB DASHBOARD                    │
│  TABLE         │                                             │
│  ┌──────────┐ │  📊 Finances: £2.3M Budget (↑12%)         │
│  │ Pos Club │ │  😊 Morale: High (87/100)                 │
│  │ 1  Arsenal│ │  📈 Board Confidence: Very High (92/100) │
│  │ 2  Man U  │ │  ⚽ Next Match: 3d - vs Liverpool (H)    │
│  │ 3  Liverpool│ │                                             │
│  │ ...       │ │  QUICK ACTIONS:                           │
│  │ 10  MY TEAM│ │  [View Squad] [Set Tactics] [Next Match]│
│  └──────────┘ │                                             │
│               │  SQUAD OVERVIEW (Top 11)                   │
│  ⚽ Next 5:    │  ⚽ GK: Alisson (87)                      │
│  [1] A - 3d   │  🛡️ DEF: Van Dijk (90), Alexander-Arno   │
│  [2] H - 7d   │  ⚙️ MID: Casemiro (87), De Bruyne (89)   │
│  [3] A - 10d  │  ⚡ ATT: Salah (90), Haaland (92)         │
│  [4] H - 17d  │                                             │
│  [5] A - 24d  │  RECENT RESULTS:                          │
│               │  ✓ W 3-1 vs Chelsea (H)                   │
│  📅 Calendar  │  ✓ W 2-0 vs Newcastle (A)                │
│  [Mar] [Apr]  │  ✗ L 0-1 vs Man City (A)                 │
│               │                                             │
└───────────────┴─────────────────────────────────────────────┘
```

**Key Panels:**
- League table (scrollable)
- Club status indicators (finances, morale, board confidence)
- Upcoming fixtures (next 5 with countdown)
- Current best XI with overall ratings
- Recent match results

### 3.2 Squad Management Screen

```
┌─────────────────────────────────────────────────────────────┐
│  [Back]  Squad Management  [Filter: All ▾]  [Sort: Rating]│
├─────────────────────────────────────────────────────────────┤
│  GK  │ DEF  │ MID  │ ATT  │ Name           │ Age │ Rating │
│  🧤  │      │      │      │ Alisson        │ 31  │ 87     │
│      │ 🛡️  │      │      │ Van Dijk       │ 32  │ 90     │
│      │ 🛡️  │      │      │ Alexander-Arn  │ 25  │ 88     │
│      │ 🛡️  │      │      │ Dias           │ 27  │ 88     │
│      │      │ ⚙️   │      │ Casemiro       │ 31  │ 87     │
│      │      │ ⚙️   │      │ De Bruyne      │ 32  │ 89     │
│      │      │ ⚙️   │      │ Bernardo Silva │ 29  │ 86     │
│      │      │      │ ⚡   │ Salah          │ 31  │ 90     │
│      │      │      │ ⚡   │ Haaland        │ 24  │ 92     │
│  [View Details] [Set Starting XI] [Offer New Contract]    │
│  [Transfer List] [Loan Out] [Sell]                        │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Filter by position
- Sort by rating/value/age/contract expiry
- Select players for actions
- Bulk operations (release, transfer list)
- Contract expiry warnings
- Player cards with key attributes

### 3.3 Tactics Editor

```
┌─────────────────────────────────────────────────────────────┐
│  Formation: [4-3-3 ▾]  Mentality: [Balanced ▾]           │
├──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┤
│ D/L  │      │      │      │      │      │      │ D/R  │
│      │      │      │      │      │      │      │      │
│  CB  │  CB  │  DM  │  CM  │  CM  │  WG  │  WG  │  ST  │
│      │      │      │      │      │      │      │      │
├──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┤
│  Player Roles:                                          │
│  GK: Sweeper Keeper                                     │
│  CB: Ball Playing Defender                             │
│  DM: Defensive Midfielder                              │
│  CM: Box-to-Box Midfielder                             │
│  WG: Inside Forward                                    │
│  ST: Advanced Forward                                  │
├─────────────────────────────────────────────────────────────┤
│  Team Instructions:                                      │
│  ☐ Higher Defensive Line    ☐ Higher Pressing          │
│  ☐ Play Out of Defence      ☐ Gegenpressing            │
│  ☑ More Direct Passes       ☐ Counter-Press            │
│  ☑ Focus Play Through Middle ☐ Be More Disciplined     │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 Transfer Market Screen

```
┌─────────────────────────────────────────────────────────────┐
│  Transfer Market  [Search...] [Filters ▾]  [My Bids (3)] │
├─────────────────────────────────────────────────────────────┤
│  POS │ Name            │ Age │ Rating │ Value   │ Status  │
│  ST  │ Victor Osimhen  │ 25  │ 86     │ £85M    │ Listed  │
│  CM  │ Martín Zubimendi│ 25  │ 84     │ £52M    │ Listed  │
│      │                │     │        │         │         │
│  [View Profile] [Make Offer] [Add to Shortlist]         │
├─────────────────────────────────────────────────────────────┤
│  SHORTLIST (5 players):                                  │
│  1. Enzo Fernández (CM, 23, 87) - £75M - Chelsea       │
│  2. Declan Rice (DM, 24, 86) - £105M - West Ham        │
│  3. ...                                                  │
└─────────────────────────────────────────────────────────────┘
```

### 3.5 Match Day UI

```
┌─────────────────────────────────────────────────────────────┐
│  [Tactics] [Substitutes] [Match Stats] [Lineups]        │
├─────────────────────────────────────────────────────────────┤
│                      MATCH COMMENTARY                     │
│  23' ⚽ GOAL! Mohamed Salah scores! 1-0                 │
│     - Excellent through ball from De Bruyne             │
│     - Salah finishes into bottom corner                │
│  19' 🟨 Yellow card for Henderson                       │
│  15' 📊 Possession: 58% - 42%                           │
│         Shots: 7 - 3                                     │
│         Shots on target: 4 - 1                           │
│         Pass accuracy: 89% - 76%                         │
├─────────────────────────────────────────────────────────────┤
│  Formation: 4-3-3  Mentality: Balanced                   │
│  Minute: 23  Score: 1 - 0                               │
│  [Pause] [Speed: 1x ▾] [End Match]                      │
└─────────────────────────────────────────────────────────────┘
```

### 3.6 Competition Screens
- League table view (full table with filters)
- Cup bracket view (tree structure showing all rounds)
- European competition draw screens
- Season calendar view (monthly grid with match markers)

### 3.7 Club Finances Screen
- Revenue and expense breakdown (pie charts)
- Monthly cash flow graph
- Wage budget utilization meter
- Transfer profit/loss tracker
- 5-year financial projection

---

## 4. Technical Architecture

### 4.1 Technology Selection (To Be Determined)

**Recommended Stack:**
- **Language:** Python (for rapid development, extensive libraries) or TypeScript/JavaScript (for web deployment)
- **Game Engine/Framework:**
  - Python: Pygame (2D), Ursina (3D), or custom with Panda3D
  - Web: Phaser.js (2D), Three.js (3D), or React + Canvas
  - Desktop: Godot (GDScript), Unity (C#)
- **Database:** SQLite (embedded, no server needed)
- **UI Framework:**
  - Python: Tkinter (simple), Kivy (cross-platform), PyQt (professional)
  - Web: React/Vue.js with component library
  - Desktop: Native UI of chosen engine
- **Build System:** CMake (C++), setuptools (Python), or native project files

**Research Decision:** Need to evaluate:
- Target platform(s): PC (Windows/Mac/Linux) vs Web
- Performance requirements (simulation speed vs UI polish)
- Team familiarity with technology
- Asset pipeline needs (art, audio, animations)

### 4.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                     │
│  (UI Screens, Menus, Match Day Interface, Visualizations) │
├─────────────────────────────────────────────────────────────┤
│                  Application Logic Layer                  │
│  ├── Match Engine           (simulation core)            │
│  ├── Tactics System         (formations, instructions)   │
│  ├── Transfer Market        (buy/sell, negotiations)     │
│  ├── Competition System     (fixtures, tables, rules)    │
│  ├── Squad Management       (rosters, contracts, morale) │
│  ├── Finance Manager        (budget, revenue, expenses)  │
│  ├── Youth Academy          (recruitment, development)   │
│  └── Training System        (schedule, improvements)     │
├─────────────────────────────────────────────────────────────┤
│                     Data Layer                            │
│  ├── Database (SQLite)        (persistent storage)       │
│  ├── Data Models               (Player, Team, Match, etc) │
│  └── Serialization (JSON/YAML) (save games, configs)     │
├─────────────────────────────────────────────────────────────┤
│                     External Data                         │
│  (Optional: APIs for real-world data/statistics)          │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Core Data Models (ER Diagram)

```
[Player] 1 ── n [Player Seasonal Stats]
   │
   ├─ n [Contract] 1 ── n [Transfer]
   │
   ├─ n [Squad Registration] n ── 1 [Competition]
   │
   ├─ m [Player Injury] m ── 1 [Injury Type]
   │
   └─ n [Player Rating] n ── 1 [Match]

[Team] 1 ── n [Squad] 1 ── n [Player] (through Squad)
   │
   ├─ n [Match] (home_team_id, away_team_id)
   │
   ├─ n [Competition Participation] n ── 1 [Competition]
   │
   ├─ 1 [Stadium]
   │
   └─ n [Staff] (manager, coaches, etc.)

[Competition] 1 ── n [Season]
   │
   ├─ n [Competition Rule]
   │
   └─ n [Match] (through Fixture)

[Season] 1 ── n [Match]
   │
   ├─ n [League Table Entry] (team_id, position, points, etc.)
   │
   └─ n [Competition Stage] (group stage, knockout rounds)

[Match] 1 ── n [Match Event] (goals, cards, substitutions)
   │
   ├─ n [Match Statistic] (possession, shots, passes)
   │
   ├─ n [Match Player Performance] (player_id, rating, stats)
   │
   └─ 1 [Tactics] (home_tactics, away_tactics as JSON)
```

### 4.4 Data Model Attributes (Initial Implementation)

**Player:**
- id (UUID/Integer)
- first_name, last_name
- date_of_birth, nationality
- preferred_foot (left/right/both)
- height, weight
- positions (array: ST, LW, CAM, CM, CDM, LB, CB, GK)
- current_ability (1-100)
- potential_ability (1-100)
- wage (weekly)
- contract_expiry (date)
- release_clause (optional)
- market_value
- morale (1-100)
- form (1-100)
- stamina (1-100)

**Team:**
- id
- name, short_name
- stadium_id
- stadium_capacity
- chairman, owner
- transfer_budget (seasonal)
- wage_budget (weekly)
- reputation (1-100)
- passing_style, pressing_intensity (tactical DNA)

**Match:**
- id
- season_id
- competition_id
- home_team_id, away_team_id
- date, time, venue
- status (scheduled, live, finished, postponed)
- home_score, away_score
- home_tactics, away_tactics (JSON: formation, mentality, instructions)
- match_events (JSON array: minute, type, player_id, description)
- match_stats (JSON: possession, shots, passes, tackles, etc.)

**Competition:**
- id
- name (English Premier League, UEFA Champions League)
- type (domestic_league, domestic_cup, european)
- country (null for pan-European)
- season_id (foreign key)
- format (round_robin, knockout, group_stage_knockout)
- teams_count (20, 32, etc.)
- current_stage (group_stage, quarter_final, etc.)

### 4.5 Performance Requirements

**Match Simulation:**
- Minimum: 3 game minutes/second (270 seconds for 90 min)
- Target: 6-12 game minutes/second (7.5-15 seconds for full match)
- Worst-case acceptable: 1.8 game minutes/second (50 seconds for 90 min)

**Memory:**
- Base memory footprint: <500MB
- Memory growth: <50MB per hour of gameplay (no leaks)
- Save file size: <50MB for 10-season career

**Storage:**
- Database size: <100MB for full 10-season career with multiple leagues

### 4.6 Save Game Format

**File Structure:**
```
save_game_001.json
├── metadata (version, timestamp, manager name, club)
├── season (current season number, day/round)
├── competitions (all competition states, tables, fixtures)
├── clubs [
│   ├── id, name, finances, squad, staff, board confidence
│   ├── tactics (saved presets)
│   └── history (recent results, trophies)
└── players [
    ├── all player data (including dynamic attributes: form, morale)
    ├── contracts, injuries, stats
    └── development (potential changes)
```

### 4.7 AI Behavior

**Opponent Manager AI:**
- Tactical selection based on opponent strength and own squad
- In-match adjustments (substitutions, mentality changes) triggered by:
  - Score difference (chasing game → attacking)
  - Time remaining (late game → defensive if leading)
  - Player fatigue/injuries
- Transfer market participation (buy needs, sell surplus)
- Youth development focus

**Club AI:**
- Financial management (stick to budget, occasional overspending)
- Board expectations (top-half finish, European qualification)
- Manager hiring/firing based on performance
- Stadium and facility upgrades

### 4.8 Extensibility & Modding

**Data-Driven Design:**
- All formations, tactics, and instructions defined in config files (YAML/JSON)
- Players and teams loaded from external CSV/JSON for easy creation
- Competition rules modular (add new cups/leagues without code changes)
- Attribute calculations use formulas editable without recompilation

**Modding Support (Future):**
- Custom kit/logo loading
- New leagues/countries via data packs
- Custom translations via language files
- Scenario/mission creation

---

## 5. Development Phases & Milestones

### Phase 1: Prototype (Week 1-2)
- Basic project setup with chosen technology
- Core data models (Player, Team, Match) with serialization
- Simple match simulator running headless (text output)
- 5 sample teams with 25 players each

**Success Criteria:** Match simulation produces valid result in <10 seconds

### Phase 2: Core Systems (Week 3-4)
- Full match engine with event generation
- Tactics system (formation mapping, instructions)
- Basic competition structure (league table, fixtures)
- Simple UI to view match results and league table

**Success Criteria:** Play through single match, see result, view updated table

### Phase 3: Transfer & Squad (Week 5-6)
- Transfer market with player search and valuation
- Squad management (sign/release players, view roster)
- Contract system with expiry and wages
- Budget tracking (revenue/expenses)

**Success Criteria:** Complete transfer window, balance budget, field valid squad

### Phase 4: Polish & Features (Week 7-8)
- Complete UI for all screens
- Youth academy and training
- Staff management
- Multiple competitions (cup + European)
- Save/load system
- Audio integration (placeholder sounds)

**Success Criteria:** Playable season with all major features

### Phase 5: Beta & Polish (Week 9-10)
- Bug fixes and balance tuning
- Performance optimization (meet simulation targets)
- Tutorial system
- Settings and options
- Documentation

**Success Criteria:** 80%+ test coverage, smooth gameplay, ready for external testing

---

## 6. Risk Assessment & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Match simulation too slow | High | Medium | Optimize event-driven design, profiling from Phase 1, consider WebAssembly/Cython if needed |
| AI too simple/broken | High | Medium | Implement rule-based AI first, gradually add complexity, extensive playtesting |
| Scope creep | High | High | Stick to MVP (Phase 4), defer peripheral features (international, manager profile) |
| Technology choice wrong | Medium | Low | Research thoroughly before Phase 1, prototype small proof-of-concept |
| Data creation overwhelming | Medium | High | Use procedural generation for sample data, focus on quality over quantity, consider external datasets later |
| UI complexity | Medium | Medium | Use proven UI framework, keep layouts simple, prioritize functionality over polish initially |
| Save compatibility across versions | Medium | Medium | Use versioned save format, migration scripts for data structure changes |

---

## 7. Success Metrics

**Technical Metrics:**
- Match simulation speed: ≤15 seconds for 90 minutes
- Test coverage: ≥80% of critical systems
- Build time: <5 minutes
- Memory usage: <500MB steady state

**Gameplay Metrics:**
- Completable season without critical bugs
- All core features functional (transfer, tactics, competitions)
- Save/load works reliably (no corruption)
- AI provides reasonable challenge (win rate 40-70% for competent player)

**User Experience Metrics:**
- New player understands basic controls within 10 minutes (tutorial or trial-and-error)
- Common actions (tactic change, substitution) accessible within 3 clicks
- No game-breaking bugs in beta testing (critical/major issues resolved)

---

## 8. Out of Scope (Post-V1.0)

- 3D graphics and animations (stick to 2D or text-based match visualization)
- Online multiplayer (single-player only)
- Real-world licensing (fictional teams/players or publicly available data)
- Advanced scouting with video analysis
- Complex staff relationships and chemistry
- Club ownership and multiple clubs
- National team management
- Dynamic storylines and narrative events
- Weather and day/night cycles (simple clock only)

---

## 9. References & Inspiration

- **Games:** Football Manager (Sports Interactive), FIFA Manager, Top Eleven
- **Data Sources:** football-data.org, API-FOOTBALL, Transfermarkt (for research)
- **Design Docs:** GDC talks on sports games, match simulation algorithms
- **Technical:** Clean Architecture by Robert C. Martin, Entity Component System patterns

---

## 10. Approval & Sign-off

This GDD is a living document. Changes to core features require team agreement and updated version number.

**Version:** 1.0  
**Date:** 2026-03-16  
**Status:** Draft - Awaiting Technical Stack Decision (Task 1.3)
