# Beta Testing Guide

## Overview

This document outlines the beta testing process for Football Manager Simulator. The beta test will involve 5-10 external testers playing through complete game sessions and providing structured feedback.

## Beta Testing Structure

### Phase 1: Pre-Beta Preparation

1. **Build Distribution**
   - Create web deployment build: `npm run build:web`
   - Deploy to a staging environment (GitHub Pages, Netlify, or Vercel)
   - Ensure build is stable and contains all latest features

2. **Tester Recruitment**
   - Recruit 5-10 external testers from:
     - Football manager game enthusiasts
     - React/TypeScript developer community
     - Gaming forums and Discord servers
   - Each tester should have:
     - Modern web browser (Chrome, Firefox, Safari, Edge)
     - Stable internet connection
     - Basic understanding of football management games

3. **Beta Package Distribution**
   - Provide testers with:
     - URL to deployed web application
     - Beta testing questionnaire link (Google Forms, Typeform, or similar)
     - Known issues list (if any)
     - Contact method for critical bugs

### Phase 2: Test Execution (7-14 Days)

**Expected Test Duration:** 2-4 hours per tester (multiple sessions)

**Test Scenarios:**

1. New game start → complete first season
2. Transfer market activities (scouting, bidding, negotiations)
3. Match simulation with tactical changes
4. Save/load functionality
5. Settings and preferences adjustment
6. Multi-competition participation

### Phase 3: Feedback Collection

#### Structured Questionnaire

The questionnaire should cover:

**A. Basic Information**

- Tester ID (anonymous)
- Experience with football manager games (None, Casual, Regular, Hardcore)
- Platform used (Desktop OS + browser)
- Session duration

**B. Gameplay Experience (1-5 scale)**

- Overall enjoyment
- Learning curve (How easy to understand mechanics?)
- Interface usability
- Match simulation realism
- Transfer market depth
- Tactics system effectiveness
- Performance (speed and responsiveness)

**C. Bug Reports (Critical)**

- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser console errors (if any)
- Terminal/DevTools logs (for Node version)

**D. Feature Requests**

- Most liked feature
- Most missing feature
- Suggested improvements

**E. Performance Metrics**

- Match simulation times (user perception)
- UI responsiveness
- Any slowdowns or freezes

**F. Qualitative Feedback**

- What did you enjoy most?
- What was confusing or frustrating?
- Would you continue playing? Why/why not?

### Phase 4: Bug Triage & Fixes

#### Bug Severity Classification

- **Critical:** Game crashes, save corruption, progression blockers
- **Major:** Missing features, broken game mechanics, poor performance
- **Minor:** UI glitches, typos, cosmetic issues
- **Enhancement:** Suggestions for improvement

#### Bug Tracker Organization

Use GitHub Issues with labels:

- `bug/critical`, `bug/major`, `bug/minor`
- `area/match-engine`, `area/transfer`, `area/ui`, `area/tactics`
- `status/triage`, `status/in-progress`, `status/fixed`

#### Fix Prioritization

1. Fix all critical bugs immediately
2. Address major bugs affecting core gameplay
3. Triage minor bugs for future sprints
4. Document enhancement requests for roadmap

### Phase 5: Performance Testing

#### Benchmark Scenarios

Run automated performance tests:

```bash
# Match simulation benchmark (warm vs cold start)
npm run benchmark:match

# Memory usage benchmark
npm run benchmark:memory

# UI render performance
npm run benchmark:ui
```

#### Performance Targets

- **Match Simulation:** ≤100ms per match minute (worst-case)
- **UI Render:** <16ms per frame (60 FPS) for all animations
- **Memory:** <500MB steady state after extended play
- **Load Time:** <5 seconds for game start (including database init)

#### Target Hardware

Test on:

- Low-end: 4GB RAM, dual-core CPU, integrated graphics
- Mid-range: 8GB RAM, quad-core CPU, dedicated GPU
- High-end: 16GB+ RAM, 8+ core CPU, modern GPU

### Phase 6: Reporting & Documentation

#### Beta Test Report Template

```markdown
# Beta Test Report

## Executive Summary

- Test period: [dates]
- Number of testers: [N]
- Total play time: [hours]
- Issues found: [N critical, N major, N minor]

## Key Findings

### Critical Issues

[List and impact]

### Major Issues

[List and impact]

### Performance Summary

- Average match simulation: [X ms/min]
- Memory usage: [Y MB avg, Z MB peak]
- Frame rate: stable/unstable

## Tester Feedback

- Overall satisfaction score: [X/5]
- Commonly praised features: [list]
- Commonly reported problems: [list]

## Action Items

- [ ] Fix critical bugs: [list]
- [ ] Address major issues: [list]
- [ ] Performance optimizations: [list]
- [ ] Documentation updates: [list]

## Next Steps

- Release candidate preparation
- Final polish before full release
```

## Deliverables

- [x] Beta testing guide (this document)
- [x] Bug report template in `.github/ISSUE_TEMPLATE/`
- [x] Performance benchmark scripts in `scripts/benchmark/`
- [x] Beta test questionnaire (external form link)
- [ ] Bug tracker populated with issues (simulated or from real testers)
- [ ] Beta test report with findings and action items
- [ ] All critical/major bugs fixed or documented as known issues

## Success Criteria

✅ At least 5 external testers participate  
✅ Comprehensive feedback collected via questionnaire  
✅ All critical bugs identified and fixed  
✅ Performance targets met on target hardware  
✅ Beta test report completed and archived  
✅ Game is stable and ready for candidate release

## Resources

- Bug template: `.github/ISSUE_TEMPLATE/bug_report.md`
- Performance scripts: `scripts/benchmark/`
- Test sessions log: `BETA_TEST_SESSIONS.md`
- Issue tracker: GitHub Issues (label filters applied)
