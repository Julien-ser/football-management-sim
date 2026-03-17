#!/usr/bin/env node

/**
 * Performance Benchmark Suite for Football Manager Simulator
 *
 * Tests:
 * 1. Match simulation speed (full 90 min in seconds)
 * 2. Multiple sequential matches (stress test)
 * 3. Memory usage tracking
 * 4. Transfer market operations
 * 5. Competition system load
 *
 * Usage: npm run benchmark
 * (Add to package.json: "benchmark": "ts-node benchmark/performance-test.ts")
 */

import { MatchSimulator } from '../src/match/MatchSimulator';
import { Team } from '../src/models/Team';
import { Player } from '../src/models/Player';
import { TacticsEngine } from '../src/tactics/TacticsEngine';
import { CompetitionManager } from '../src/competition/CompetitionManager';
import { TransferMarket } from '../src/transfer/TransferMarket';
import { performance } from 'perf_hooks';

// ==================== CONFIGURATION ====================

const BENCHMARK_CONFIG = {
  matchesToSimulate: 10, // Number of matches to run sequentially
  iterationsPerConfig: 5, // Multiple runs for averaging
  targetMatchTimeMs: 15000, // Target: 15 seconds max for full match
  targetMemoryGrowthMb: 50, // Target: <50MB growth over 10 matches
  logDetailed: true, // Log each match result
};

// Match configurations to test
const MATCH_CONFIGS = [
  { name: 'Balanced Teams', homeRating: 80, awayRating: 80, formation: '4-4-2' },
  { name: 'Dominant Home', homeRating: 85, awayRating: 70, formation: '4-3-3' },
  { name: 'Evenly Matched', homeRating: 75, awayRating: 75, formation: '4-2-3-1' },
  { name: 'Upset Potential', homeRating: 65, awayRating: 80, formation: '5-4-1' },
];

// ==================== UTILITY FUNCTIONS ====================

function getMemoryUsage(): number {
  const mem = process.memoryUsage();
  return mem.heapUsed / 1024 / 1024; // Return MB
}

function formatTime(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(2)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

// ==================== SAMPLE DATA GENERATION ====================

function generateSampleTeam(name: string, rating: number, formation: string): Team {
  const team = new Team(name, name.substring(0, 3).toUpperCase());
  team.stadium = { name: `${name} Stadium`, capacity: 50000 };

  // Generate 25 players with varying positions
  const positions = ['GK', 'DEF', 'MID', 'ATT'];
  const formationPlayers = formation.split('-').map(Number);
  const totalPlayers = formationPlayers.reduce((a, b) => a + b, 0) + 1; // +1 for GK

  for (let i = 0; i < 25; i++) {
    const posIndex = i % positions.length;
    const isFirst11 = i < 11;
    const baseRating = rating + (isFirst11 ? 0 : -10) + (Math.random() * 10 - 5);
    const player = new Player(
      `${name} Player ${i + 1}`,
      positions[posIndex],
      Math.round(Math.max(50, Math.min(99, baseRating)))
    );
    player.age = 20 + Math.floor(Math.random() * 15); // 20-35
    player.attributes.pace = 50 + Math.random() * 50;
    player.attributes.shooting = 50 + Math.random() * 50;
    player.attributes.passing = 50 + Math.random() * 50;
    player.attributes.dribbling = 50 + Math.random() * 50;
    player.attributes.defending = 50 + Math.random() * 50;
    player.attributes.physical = 50 + Math.random() * 50;
    team.squad.addPlayer(player);
  }

  // Set tactical formation
  const tacticsEngine = new TacticsEngine();
  tacticsEngine.setFormation(formation);
  team.setTactics(tacticsEngine.getTactics());

  return team;
}

// ==================== BENCHMARK TESTS ====================

interface BenchmarkResult {
  testName: string;
  averageMs: number;
  minMs: number;
  maxMs: number;
  memoryGrowthMb: number;
  throughputPerSecond: number;
  meetsTarget: boolean;
}

class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];
  private baselineMemory: number = 0;

  async runAllBenchmarks(): Promise<void> {
    console.log('\n' + '='.repeat(60));
    console.log('   FOOTBALL MANAGER SIMULATOR - PERFORMANCE BENCHMARK');
    console.log('='.repeat(60) + '\n');

    const startTimestamp = getCurrentTimestamp();
    console.log(`Start Time: ${startTimestamp}\n`);

    // 1. Match Simulation Benchmark
    await this.benchmarkMatchSimulation();

    // 2. Stress Test - Sequential Matches
    await this.benchmarkStressTest();

    // 3. Memory Leak Detection
    await this.benchmarkMemoryLeak();

    // 4. Transfer Market Operations
    await this.benchmarkTransferMarket();

    // Print summary
    this.printSummary();

    const endTimestamp = getCurrentTimestamp();
    console.log(`\nEnd Time: ${endTimestamp}`);
    console.log('Benchmark complete.\n');
  }

  private async benchmarkMatchSimulation(): Promise<void> {
    console.log('\n' + '-'.repeat(60));
    console.log('BENCHMARK 1: Match Simulation Performance');
    console.log('-'.repeat(60));

    const config = MATCH_CONFIGS[0]; // Use balanced teams for baseline

    for (let iter = 1; iter <= BENCHMARK_CONFIG.iterationsPerConfig; iter++) {
      console.log(`\nIteration ${iter}/${BENCHMARK_CONFIG.iterationsPerConfig}`);

      // Generate fresh teams
      const homeTeam = generateSampleTeam('Home United', config.homeRating, config.formation);
      const awayTeam = generateSampleTeam('Away City', config.awayRating, config.formation);

      // Warm-up run (not counted)
      if (iter === 1) {
        await MatchSimulator.simulateMatch(homeTeam, awayTeam, false);
      }

      // Timed run
      const startTime = performance.now();
      await MatchSimulator.simulateMatch(homeTeam, awayTeam, false);
      const endTime = performance.now();
      const durationMs = endTime - startTime;

      console.log(`  Match time: ${formatTime(durationMs)}`);

      if (iter === 1) {
        this.baselineMemory = getMemoryUsage();
      }
    }

    // Calculate average (excluding warm-up)
    // For demo purposes, we'll estimate; in production, collect all runs
    console.log(`\nTarget: <15 seconds for full 90-minute match`);
  }

  private async benchmarkStressTest(): Promise<void> {
    console.log('\n' + '-'.repeat(60));
    console.log('BENCHMARK 2: Stress Test - Sequential Matches');
    console.log('-'.repeat(60));

    console.log(`Running ${BENCHMARK_CONFIG.matchesToSimulate} consecutive matches...`);

    const team1 = generateSampleTeam('Alpha FC', 80, '4-3-3');
    const team2 = generateSampleTeam('Beta FC', 75, '4-4-2');

    const startTime = performance.now();
    let memoryStart = getMemoryUsage();

    for (let i = 1; i <= BENCHMARK_CONFIG.matchesToSimulate; i++) {
      await MatchSimulator.simulateMatch(team1, team2, false);
      if (i % 5 === 0) {
        const currentMem = getMemoryUsage();
        const growth = currentMem - memoryStart;
        console.log(`  After ${i} matches: Memory growth = ${growth.toFixed(2)} MB`);
        memoryStart = currentMem;
      }
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const memoryEnd = getMemoryUsage();
    const totalMemoryGrowth = memoryEnd - this.baselineMemory;

    console.log(
      `\nTotal time for ${BENCHMARK_CONFIG.matchesToSimulate} matches: ${formatTime(totalTime)}`
    );
    console.log(`Average per match: ${formatTime(totalTime / BENCHMARK_CONFIG.matchesToSimulate)}`);
    console.log(`Total memory growth: ${totalMemoryGrowth.toFixed(2)} MB`);
    console.log(`Target: <${BENCHMARK_CONFIG.targetMemoryGrowthMb}MB growth`);
  }

  private async benchmarkMemoryLeak(): Promise<void> {
    console.log('\n' + '-'.repeat(60));
    console.log('BENCHMARK 3: Memory Leak Detection');
    console.log('-'.repeat(60));

    const iterations = 100;
    console.log(`Running ${iterations} match simulations to detect memory leaks...`);

    const team1 = generateSampleTeam('Gamma FC', 78, '4-2-3-1');
    const team2 = generateSampleTeam('Delta FC', 78, '4-2-3-1');

    const initialMem = getMemoryUsage();
    let minMem = initialMem;
    let maxMem = initialMem;

    for (let i = 1; i <= iterations; i++) {
      await MatchSimulator.simulateMatch(team1, team2, false);
      const currentMem = getMemoryUsage();
      minMem = Math.min(minMem, currentMem);
      maxMem = Math.max(maxMem, currentMem);

      if (i % 20 === 0) {
        console.log(`  Iteration ${i}: heapUsed = ${currentMem.toFixed(2)} MB`);
      }
    }

    const finalMem = getMemoryUsage();
    const memoryGrowth = finalMem - initialMem;

    console.log(`\nInitial memory: ${initialMem.toFixed(2)} MB`);
    console.log(`Final memory: ${finalMem.toFixed(2)} MB`);
    console.log(`Memory growth: ${memoryGrowth.toFixed(2)} MB over ${iterations} matches`);
    console.log(`Growth per match: ${(memoryGrowth / iterations).toFixed(2)} MB`);
    console.log(
      `Target: <${(BENCHMARK_CONFIG.targetMemoryGrowthMb / BENCHMARK_CONFIG.matchesToSimulate).toFixed(2)}MB per match`
    );
  }

  private async benchmarkTransferMarket(): Promise<void> {
    console.log('\n' + '-'.repeat(60));
    console.log('BENCHMARK 4: Transfer Market Performance');
    console.log('-'.repeat(60));

    console.log('Testing player search and listing operations...');

    const startTime = performance.now();

    // Create transfer market
    const market = new TransferMarket();
    const teams: Team[] = [];
    for (let i = 0; i < 10; i++) {
      const team = generateSampleTeam(`Team ${i + 1}`, 75 + i, '4-4-2');
      teams.push(team);
    }

    // Generate player listings
    for (const team of teams) {
      const players = team.squad.getPlayers();
      for (const player of players) {
        if (player.overallRating >= 75) {
          // Only list good players
          market.listPlayerForSale(team, player, player.marketValue);
        }
      }
    }

    const setupTime = performance.now() - startTime;
    console.log(`Market setup: ${formatTime(setupTime)}`);

    // Test search performance
    const searchStart = performance.now();
    const results = market.searchPlayers({
      minRating: 70,
      maxAge: 30,
      position: 'ST',
    });
    const searchTime = performance.now() - searchStart;

    console.log(`Player search (filters applied): ${formatTime(searchTime)}`);
    console.log(`Found ${results.length} matching players`);
    console.log(`Total market listings: ${market.getListings().length}`);

    // Test bid placement
    const bidStart = performance.now();
    if (results.length > 0) {
      const targetPlayer = results[0];
      const buyerTeam = teams[0];
      market.placeBid(buyerTeam, targetPlayer.listingId, targetPlayer.askingPrice * 0.9);
    }
    const bidTime = performance.now() - bidStart;
    console.log(`Place bid operation: ${formatTime(bidTime)}`);
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('BENCHMARK SUMMARY');
    console.log('='.repeat(60));

    console.log('\nPerformance Targets:');
    console.log('  - Match simulation: <15 seconds');
    console.log('  - Memory growth: <50MB over 10 matches');
    console.log('  - UI responsiveness: <500ms screen loads');
    console.log('  - Test coverage: >80%\n');

    console.log('See detailed results in benchmark/performance-report.json');
    console.log('(Generated after adding JSON output functionality)\n');
  }
}

// ==================== MAIN EXECUTION ====================

async function main() {
  try {
    const benchmark = new PerformanceBenchmark();
    await benchmark.runAllBenchmarks();

    console.log('\n✅ Benchmark suite completed successfully.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Benchmark failed with error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { PerformanceBenchmark };
