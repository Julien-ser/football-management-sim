#!/bin/bash

# Memory Usage Benchmark for Football Manager Simulator

set -e

echo "=========================================="
echo "Memory Usage Benchmark"
echo "=========================================="
echo ""

# Build the project
echo "Building project..."
npm run build
echo ""

# Memory benchmark using Node's --inspect and heap snapshots
echo "Running memory usage test (simulating 100 matches)..."
echo "This will allocate resources and check for memory leaks."
echo ""

node --max-old-space-size=4096 -e "
const { MatchSimulator } = require('./dist/match/MatchSimulator.js');
const { Team, Player, Formation, Tactics } = require('./dist/models/index.js');

// Create teams
const homeTeam = new Team('Home FC', 'HOME');
const awayTeam = new Team('Away United', 'AWAY');

// Populate teams
for (let i = 0; i < 11; i++) {
    homeTeam.players.push(new Player('Home Player ' + (i+1), 'GKDFM'[Math.min(i, 3)], 70 + Math.random() * 20));
    awayTeam.players.push(new Player('Away Player ' + (i+1), 'GKDFM'[Math.min(i, 3)], 70 + Math.random() * 20));
}

const tactics = new Tactics(Formation.FORMATION_4_4_2);

console.log('Simulating 100 matches sequentially...');

// Get initial memory
const startMemory = process.memoryUsage();
console.log('Initial memory usage:');
console.log('  RSS: ' + (startMemory.rss / 1024 / 1024).toFixed(2) + ' MB');
console.log('  Heap Total: ' + (startMemory.heapTotal / 1024 / 1024).toFixed(2) + ' MB');
console.log('  Heap Used: ' + (startMemory.heapUsed / 1024 / 1024).toFixed(2) + ' MB');

// Simulate many matches
for (let i = 0; i < 100; i++) {
    const match = new MatchSimulator(homeTeam, awayTeam, tactics, tactics);
    match.simulate();
    
    // Log every 20 matches
    if ((i + 1) % 20 === 0) {
        const mem = process.memoryUsage();
        console.log('After ' + (i+1) + ' matches:');
        console.log('  RSS: ' + (mem.rss / 1024 / 1024).toFixed(2) + ' MB');
        console.log('  Heap Used: ' + (mem.heapUsed / 1024 / 1024).toFixed(2) + ' MB');
    }
}

// Force garbage collection if available
if (global.gc) {
    console.log('\\nRunning garbage collection...');
    global.gc();
}

const endMemory = process.memoryUsage();
console.log('\\nFinal memory usage:');
console.log('  RSS: ' + (endMemory.rss / 1024 / 1024).toFixed(2) + ' MB');
console.log('  Heap Total: ' + (endMemory.heapTotal / 1024 / 1024).toFixed(2) + ' MB');
console.log('  Heap Used: ' + (endMemory.heapUsed / 1024 / 1024).toFixed(2) + ' MB');

const rssGrowth = (endMemory.rss - startMemory.rss) / 1024 / 1024;
const heapGrowth = (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024;

console.log('\\n=== Memory Growth ===');
console.log('RSS Growth: ' + rssGrowth.toFixed(2) + ' MB');
console.log('Heap Used Growth: ' + heapGrowth.toFixed(2) + ' MB');

// Check for memory leaks (some growth is expected due to caches)
const acceptableGrowth = 100; // MB
if (rssGrowth > acceptableGrowth) {
    console.log('⚠️  WARNING: Possible memory leak detected');
    console.log('RSS grew by ' + rssGrowth.toFixed(2) + ' MB (acceptable: <' + acceptableGrowth + 'MB)');
} else {
    console.log('✅ PASS: Memory growth within acceptable range (<' + acceptableGrowth + 'MB)');
}

// Overall status
console.log('\\nMemory benchmark complete!');
console.log('Steady-state memory target: <500MB RSS');
console.log('Current final RSS: ' + (endMemory.rss / 1024 / 1024).toFixed(2) + ' MB');
"

echo ""
echo "=========================================="
echo "Memory benchmark complete!"
echo "=========================================="
