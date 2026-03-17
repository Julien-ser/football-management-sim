const { MatchSimulator } = require('./dist/match/MatchSimulator.js');
const { Team, Player, Formation, Tactics } = require('./dist/models/index.js');

// Create two sample teams
const homeTeam = new Team('Home FC', 'HOME');
const awayTeam = new Team('Away United', 'AWAY');

// Add some players (simplified for benchmark)
for (let i = 0; i < 11; i++) {
  homeTeam.players.push(
    new Player(`Home Player ${i + 1}`, 'GKDFM'[Math.min(i, 3)], 70 + Math.random() * 20)
  );
  awayTeam.players.push(
    new Player(`Away Player ${i + 1}`, 'GKDFM'[Math.min(i, 3)], 70 + Math.random() * 20)
  );
}

const tactics = new Tactics(Formation.FORMATION_4_4_2);

// Warm-up run
console.log('Warm-up run...');
const warmup = new MatchSimulator({
  homeTeam,
  awayTeam,
  homePlayers: homeTeam.players,
  awayPlayers: awayTeam.players,
  homeTactics: tactics,
  awayTactics: tactics,
});
warmup.simulate();
console.log('Warm-up complete\n');

// Benchmark runs
const numRuns = 10;
const times = [];

console.log(`Running ${numRuns} benchmark simulations...`);
for (let i = 0; i < numRuns; i++) {
  const match = new MatchSimulator({
    homeTeam,
    awayTeam,
    homePlayers: homeTeam.players,
    awayPlayers: awayTeam.players,
    homeTactics: tactics,
    awayTactics: tactics,
  });
  const start = process.hrtime.bigint();
  match.simulate();
  const end = process.hrtime.bigint();
  const durationMs = Number(end - start) / 1000000;
  times.push(durationMs);
  console.log(
    `  Run ${i + 1}: ${durationMs.toFixed(2)}ms (${(durationMs / 90).toFixed(2)}ms per minute)`
  );
}

const avg = times.reduce((a, b) => a + b, 0) / times.length;
const min = Math.min(...times);
const max = Math.max(...times);

console.log('');
console.log('=== Match Simulation Results ===');
console.log(`Average: ${avg.toFixed(2)}ms (${(avg / 90).toFixed(2)}ms per minute)`);
console.log(`Minimum: ${min.toFixed(2)}ms (${(min / 90).toFixed(2)}ms per minute)`);
console.log(`Maximum: ${max.toFixed(2)}ms (${(max / 90).toFixed(2)}ms per minute)`);
console.log('');

// Check if target is met (<100ms per minute)
if (avg / 90 < 100) {
  console.log('✅ PASS: Average match simulation meets performance target (<100ms per minute)');
} else {
  console.log('❌ FAIL: Average match simulation exceeds performance target');
  console.log(`Target: <100ms per minute, Actual: ${(avg / 90).toFixed(2)}ms per minute`);
  process.exit(1);
}
