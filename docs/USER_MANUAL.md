# Football Manager Simulator - User Manual

## Version 0.1.0 (Beta Release)

**Release Date:** March 17, 2026

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Game Interface](#game-interface)
4. [Match Day](#match-day)
5. [Tactics & Formations](#tactics--formations)
6. [Transfer Market](#transfer-market)
7. [Squad Management](#squad-management)
8. [Competitions & Calendar](#competitions--calendar)
9. [Club Finances](#club-finances)
10. [Settings & Saving](#settings--saving)
11. [Tips & Strategies](#tips--strategies)
12. [Troubleshooting](#troubleshooting)

---

## Introduction

Welcome to **Football Manager Simulator**, a strategic football management game where you take charge of a football club and guide it to domestic and European success. Manage every aspect of your club - from tactics and transfers to finances and player development.

### Key Features

- **Realistic Match Simulation:** Full 90+ minute matches with event-driven mechanics in under 5 seconds
- **Deep Tactical System:** Custom formations, mentality, pressing, and passing styles
- **Comprehensive Transfer Market:** Scouting, bidding, negotiation, and AI-driven competition
- **Multi-Competition Support:** Domestics leagues, cups, and European tournaments (Champions League, Europa League, Conference League)
- **Dynamic Calendar System:** Fixture management and scheduling
- **Audio Integration:** Crowd sounds, event feedback, and background music
- **Save/Load System:** 10 save slots with configurable auto-save

---

## Getting Started

### System Requirements

**Minimum:**

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for initial load)
- Screen resolution: 1280x720

**Recommended:**

- Screen resolution: 1920x1080 or higher
- Updated browser with JavaScript enabled

### Installation & Setup

1. **Download the Game**
   - Obtain the `dist-web` folder from the release package
   - Or clone the repository: `git clone <repository-url>`

2. **Run Locally (Development)**

   ```bash
   # Install dependencies
   npm install

   # Build the web version
   npm run build:web

   # Preview the build
   npm run preview
   ```

   Then open http://localhost:4173 in your browser

3. **Deploy to Web Server**
   - Upload all files from `dist-web/` to your web hosting service
   - Ensure `index.html` is at the root
   - Configure server to serve static files

### First Launch

When you first start the game:

1. You'll see the **Main Menu** with options to start a new career, load a saved game, or adjust settings
2. Select **"Start New Career"** to begin
3. Choose your club from the **Club Selection** screen (filter by league if needed)
4. Find your team in the list and click "Select"
5. You'll be taken to the **Game HUD** - the main management interface

---

## Game Interface

### Main Menu

The starting point of the game with four primary options:

- **Start New Career** - Begin a new management career
- **Load Game** - Resume from a saved game
- **Settings** - Configure game preferences (graphics, audio, gameplay)
- **Quit** - Exit the game

### Club Selection

Browse available clubs across different leagues:

- **League Filter:** Click league buttons to filter teams
- **Team Cards:** Display team name, league, rating, budget, and stadium
- **Selection:** Click "Select" on a team to begin your career

### Game HUD (Main Interface)

The HUD is your command center during the season:

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 Home  ⚙️ Tactics  👥 Squad  💰 Transfers  ... [more]   │
├─────────────────────────────────────────────────────────────┤
│ ⚽ Football Manager Simulator                              │
│             Club: [Your Team]  Manager: [Your Name]        │
├──────────────┬─────────────────────────┬───────────────────┤
│              │                         │                   │
│  League      │    Club Status          │   Finances        │
│  Table       │    • Morale             │   • Budget        │
│              │    • Board Confidence   │   • Income        │
│              │                         │   • Expenses       │
│              ├─────────────────────────┼───────────────────┤
│              │    Quick Actions        │                   │
│ Calendar     │    • 💾 Save            │                   │
│ • Next Match │    • 📋 Full Squad      │                   │
│ • 3 days     │    • 🎯 Set Tactics    │                   │
│              │    • ⚽ Next Match      │                   │
│              │    • 📊 Preview         │                   │
│              │    • 💬 Team Talk       │                   │
│              ├─────────────────────────┼───────────────────┤
│              │    Squad Overview       │                   │
│              │    • Player list with   │                   │
│              │      stats and ratings  │                   │
│              │                         │                   │
└──────────────┴─────────────────────────┴───────────────────┘
```

**Navigation Bar:** Access different sections of the game:

- Home (current view)
- Tactics - Formation and strategy editor
- Squad - Manage your players
- Transfers - Buy/sell players
- Youth - Academy management (future)
- Training - Training schedules (future)
- Competitions - View all tournaments
- Stats - Detailed statistics

**Quick Actions:** Frequently used functions:

- Save Game - Save your progress
- View Full Squad - Complete squad management
- Set Tactics - Adjust formation and instructions
- Next Match - Skip to upcoming fixture
- Match Preview - See opponent analysis
- Team Talk - Motivate your squad

---

## Match Day

### Preparing for a Match

Before a match, you should:

1. **Set Tactics:** Choose formation, mentality, and player instructions
2. **Select Starting XI:** Pick your best players based on form and fitness
3. **Review Opponent:** Check their formation, key players, and recent form
4. **Check Player Condition:** Ensure no injuries or suspensions

### In-Match Interface

When a match is in progress, the Match Day UI appears:

**Commentary Panel (Left)**

- Real-time text commentary of match events
- Most recent 50 events displayed
- Scrollable history

**Tactical Overlay (Right)**

- **Tactics Tab:** Modify tactics during the match
  - Formation: 4-4-2, 4-3-3, 3-5-2, etc.
  - Mentality: Defensive, Balanced, Attacking
  - Pressing: Low, Medium, High
  - Passing Style: Short, Mixed, Long
  - Width: Narrow, Balanced, Wide
  - Defensive Line: Low, Medium, High
- **Substitutions Tab:**
  - List of players on bench
  - Replace tired or injured players
  - Click player to substitute

**Match Stats Panel (Bottom)**

- Live statistics with animated bars:
  - Possession (%)
  - Shots (on target)
  - Passes (success rate)
  - Fouls
  - Corners
  - Offsides
  - Cards (yellow/red)

### Match Events

You'll see events like:

- ⚽ **Goal!** - Scored by your team or opponent
- 🟨 **Yellow Card** - Player cautioned
- 🟥 **Red Card** - Player sent off
- 🩹 **Injury** - Player hurt (may require substitution)
- 🔄 **Substitution** - Player replaced
- 🎯 **Shot on Target** - Goalkeeper save or goal
- ⚽ **Miss** - Shot wide or over
- 🤝 **Assist** - Led to a goal

### Post-Match Analysis

After the final whistle:

- **Player Ratings:** Each player rated 0-10 based on performance
- **Match Report:** Summary of key events and statistics
- **Standings Update:** League table reflects results
- ** Injuries & Suspensions:** Check for new issues

---

## Tactics & Formations

### Formation Editor

Choose from preset formations:

- **4-4-2** - Classic balanced setup
- **4-3-3** - Attacking with three forwards
- **3-5-2** - Defensive with wing-backs
- **4-2-3-1** - Single striker, creative midfielders
- **4-5-1** - Defensive, counter-attacking
- **5-3-2** - Ultra-defensive with three center-backs

**How to Set Tactics:**

1. Click **⚙️ Tactics** in the navigation bar
2. Select formation from dropdown
3. Adjust player roles (Defender, Midfielder, Forward)
4. Set team instructions:
   - **Mentality:** Defensive ↔ Balanced ↔ Attacking
   - **Pressing:** How aggressively you press opponents
   - **Passing Style:** Short possession vs direct long balls
   - **Width:** Narrow through center vs wide flanks
   - **Defensive Line:** Deep defending vs high line
5. Click **Save Tactics** to confirm

### In-Match Tactical Changes

During a match (via Tactical Overlay):

- Change formation to adapt to opponent
- Switch mentality to protect a lead or chase a goal
- Adjust pressing intensity based on fatigue
- Make substitutions to impact the game

---

## Transfer Market

### Overview

The transfer window allows you to:

- **Buy Players:** Strengthen weak positions
- **Sell Players:** Generate revenue and reduce wage bill
- **Loan Players:** Temporary acquisitions
- **Scout:** Gather intelligence on potential targets

### Finding Players

1. Navigate to **💰 Transfers** section
2. Use filters to narrow search:
   - Position (GK, DEF, MID, FWD)
   - Minimum/Maximum rating
   - Age range
   - Nationality
   - Maximum salary
   - Contract expiry
3. Click **Search** to see matching players
4. Review player cards with stats and attributes

### Scouting System

Before making an offer, send a scout:

1. Select a player from search results
2. Click **"Request Scout Report"**
3. Wait for completion (instant in current version)
4. Review scout's assessment:
   - **Overall Rating:** Current ability (1-100)
   - **Potential:** Future ceiling
   - **Strengths & Weaknesses:** Key attributes highlighted
   - **Recommendation:** Buy / Consider / Avoid
   - **Confidence:** Scout certainty level

### Making a Bid

1. From player listing, click **"Make Offer"**
2. Set your terms:
   - **Transfer Fee:** Initial bid amount
   - **Salary:** Weekly wage offer
   - **Contract Length:** 1-5 years
   - **Bonuses:** Appearance, goal, assist bonuses (optional)
3. Click **Submit Bid**
4. See response: Accepted / Rejected / Counter-offer
5. Negotiate if counter-offer received

### Selling Players

1. Go to **Squad** → select a player
2. Click **"List for Transfer"**
3. Set asking price (or "Accept Best Offer")
4. Player appears in **Transfer Listings** for other clubs to bid on
5. Review incoming bids and accept/reject

### Squad Registration

Before competitions, you must register your squad:

1. Navigate to **Competitions** → select tournament
2. Click **"Squad Registration"**
3. Add players meeting requirements (minimum GK, DEF, MID, FWD)
4. Ensure jersey numbers are unique
5. Assign captain and vice-captain
6. Save registration

---

## Squad Management

### Viewing Your Squad

Access via **👥 Squad** navigation:

**Squad Overview displays:**

- Player name, age, nationality
- Position(s) and jersey number
- Overall rating and current form
- Contract expiry
- Status (Fit, Injured, Suspended, Ineligible)

Click a player for detailed view:

- **Attributes:** Pace, Shooting, Passing, Dribbling, Defending, Physical
- **Performance Stats:** Goals, assists, cards, minutes played
- **Form Graph:** Recent performance trend
- **Contract Details:** Wage, expires, release clause

### Player Roles

Each player has a preferred position and can play:

- **Primary:** Best position (star icon)
- **Secondary:** Competent alternative
- **Can Play:** Limited ability

Playing out of position reduces effectiveness.

---

## Competitions & Calendar

### Calendar System

The calendar shows all scheduled matches and events:

- **Competition Matches:** League fixtures, cup ties, European games
- **Transfer Windows:** Open/close dates
- **Rest Periods:** Recovery time between matches

**Monthly View:**

- Click a date to see match details
- Color-coded by competition
- Shows opponent, venue, time

### Domestic Competitions

**League:**

- Play each team home and away (38 matches in Premier League-style)
- 3 points for win, 1 for draw, 0 for loss
- Champions: Most points (top 4 qualify for Europe)
- Relegation: Bottom 3 (or as configured)

**Domestic Cup:**

- Single-elimination tournament
- Random draw each round
- Lower-tier "giant killing" possible

### European Competitions

**UEFA Champions League (Top Tier)**

- 32 teams in group stage (4 groups of 8? Actually 8 groups of 4)
- Top 2 from each group advance to knockout rounds
- 3rd place drops to Europa League

**UEFA Europa League**

- Teams finishing 3rd in UCL groups + domestic cup winners + league qualifiers
- Knockout format with two-legged ties

**UEFA Conference League**

- 4th-tier European competition (newest format)
- For clubs from lower-ranked associations

### Qualification & Progression

- **European Qualification:** Based on league position (top 4-7 depending on league)
- **Cup Winners:** Automatically qualify for Europe
- **Fair Play:** May grant additional spots (if implemented)
- **Title Race:** Track league leaders and chase the championship

---

## Club Finances

### Budget Management

Your club operates on a season budget:

- **Total Budget:** Sum of income and transfer budget
- **Transfer Budget:** Money available for buying players
- **Wage Budget:** Maximum weekly wage expenditure

### Revenue Streams

- **Matchday:** Ticket sales, concessions, merchandise (per home match)
- **Broadcasting:** TV rights (distributed by league position)
- **Commercial:** Sponsorships, endorsements
- **UEFA Payments:** Prize money for European competitions
- **Player Sales:** Transfer income (one-time boost)

### Expenses

- **Player Wages:** Largest expense (weekly payments)
- **Transfer Fees:** Amortized over contract length
- **Staff Salaries:** Coaches, scouts, support staff
- **Facility Maintenance:** Stadium, training ground
- **Youth Academy:** Development costs

### Financial Health

- **Maintain positive cash flow** - Don't spend more than you earn
- **Watch wage bill** - Should be ≤70% of revenue
- **Sell players** to balance books if over budget
- **European football** = significant revenue boost

---

## Settings & Saving

### Settings Panel

Access via **⚙️ Settings** from Main Menu or in-game:

**Graphics:**

- Quality: Low / Medium / High
  - Low: Basic animations, reduced effects
  - High: Full animations, smooth transitions
- Match Speed: 1x / 2x / 3x (for faster simulation)

**Audio:**

- Master Volume: 0-100%
- Music Volume: Background tracks control
- Sound Effects: Event sounds (goals, cards, whistles)
- Mute All: Disable all audio

**Gameplay:**

- Auto-Save: Enable/Disable automatic saves
- Auto-Save Interval: Every 5/10/15/30 minutes
- Confirm Transfers: Prompt before accepting bids
- Disable Animations: For low-spec systems
- Tooltips: Show help hints on hover

### Save Game System

**Manual Save Slots:**

- 10 slots available
- Save from HUD → **💾 Save Game**
- Name your save file (auto-generated: "Career - [Date]")
- Overwrite warning before saving

**Auto-Save:**

- Enabled by default (configurable in Settings)
- Triggers after each match completion
- Overwrites auto-save slot (keeps last 3 versions)

**Loading a Game:**

1. From Main Menu → **Load Game**
2. Browse save slots with preview info:
   - Team managed
   - Current date/season
   - Hours played
   - League position
3. Click **Load** to resume

**Save File Data:**

- Complete game state (all teams, players, competitions)
- Current date and calendar
- Transfer history
- Tactics and settings

---

## Tips & Strategies

### Getting Started

1. **Learn Your Squad:** Check player ratings and attributes before setting tactics
2. **Balance the Budget:** Don't overspend in first transfer window
3. ** scout First:** Always get a scout report before buying players
4. **Rotate Squad:** Manage fatigue - don't play injured/suspended players
5. **Save Often:** Manual saves before big decisions/matches

### Tactical Guidance

- **Defensive (0-33 mentality):** Good for protecting leads, weaker teams
- **Balanced (34-66):** Solid all-around, ideal for most situations
- **Attacking (67-100):** Chase goals, but be vulnerable to counters

**Pressing:**

- High: Causes opponent errors but tires players faster
- Low: Conserves energy but gives opponents time

**Width:**

- Narrow: Good for central control, less spread defense
- Wide: Exploit flanks, stretch opponent defense

### Transfer Market Mastery

- **Buy Young:** Players under 23 with high potential grow in value
- **Sell High:** List aging players (28+) before decline
- **Free Agents:** No transfer fee, but demand higher wages
- **Loans:** Useful for short-term needs, youth development
- **Release Clauses:** Player can force transfer if met (use cautiously)

### Long-Term Success

- **Youth Academy:** Invest in prospects for future
- **Infrastructure:** Upgrade stadium, training ground (if implemented)
- **Manager Reputation:** Improves with success → attract better players
- **Board Confidence:** Keep them happy with results and financial stability
- **Achieve European Football:** Massive revenue and prestige boost

### Common Pitfalls

- ❌ Don't ignore warnings about squad registration (ineligible players can't play)
- ❌ Don't overspend wages (>70% of revenue is dangerous)
- ❌ Don't neglect defensive signings if conceding too many
- ❌ Don't ignore injuries - rotate squad
- ❌ Don't sell your best players without replacements

---

## Troubleshooting

### Game Won't Start

**Symptom:** Blank screen or error on load

- ✅ Ensure browser is up-to-date (Chrome 90+, Firefox 88+, Safari 14+)
- ✅ Disable browser extensions (ad blockers can interfere)
- ✅ Clear browser cache and reload
- ✅ Check console (F12) for errors

### Build Issues

**npm run build:web fails:**

- ✅ Delete `node_modules/` and `package-lock.json`
- ✅ Run `npm install` again
- ✅ Check Node.js version (requires Node 18+)
- ✅ Ensure all files are present in `src/`

**Vite preview shows 404:**

- ✅ Make sure you're running from `dist-web/` directory
- ✅ All assets should be in `dist-web/assets/`
- ✅ `index.html` must reference assets correctly

### Performance Problems

**UI is slow or laggy:**

- ✅ Lower graphics quality in Settings
- ✅ Disable animations
- ✅ Close other browser tabs
- ✅ Use Chrome/Edge for best performance
- ✅ Reduce number of open panels

**Match simulation slow:**

- ✅ This shouldn't happen (benchmarked at 27.2ms per minute)
- ✅ Check system resources (CPU/memory)
- ✅ Close resource-intensive applications

### Save/Load Issues

**Save file not appearing:**

- ✅ Browser storage enabled (localStorage)
- ✅ Not in incognito/private mode
- ✅ Sufficient disk space

**Load fails or corrupted:**

- ✅ Use recent manual save, not auto-save
- ✅ Don't edit save files manually
- ✅ Check file isn't locked by another process

### Audio Not Working

- ✅ Check browser isn't muted
- ✅ Verify master volume > 0 in Settings
- ✅ Ensure audio tracks exist in `public/audio/`
- ✅ Some browsers require user interaction before playing audio

### Display Issues

**Missing icons/images:**

- ✅ Verify `public/` folder intact with all assets
- ✅ Check browser console for 404 errors
- ✅ Use absolute paths, not relative

**Layout broken:**

- ✅ Screen resolution too low (minimum 1280x720)
- ✅ Zoom level set to 100%
- ✅ Clear browser cache

---

## Technical Support

**Game Version:** 0.1.0 (Beta)  
**Build Date:** March 17, 2026  
**Source Code:** https://github.com/yourusername/football-management-sim

**Reporting Bugs:**

- Use the GitHub Issues page
- Include: browser, version, steps to reproduce, screenshots
- Check existing issues before filing new ones

**Known Issues:**

- Some features marked "future" not yet implemented (youth academy, training)
- European competition seeding may not follow UEFA regulations exactly
- Match commentary limited to 50 events (scroll to see older)
- No multiplayer support (single-player only)

---

## Credits

**Development:** Solo Developer  
**Engine:** Custom TypeScript/React with RxJS  
**Database:** SQLite (better-sqlite3)  
**Build Tool:** Vite  
**Testing:** Jest + Cypress

**Special Thanks:**

- Football data communities
- Open-source contributors
- Beta testers for feedback

---

_Enjoy your managerial career! May you bring glory to your club!_ ⚽🏆
