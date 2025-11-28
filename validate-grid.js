// Validation script for DEFAULT_POSITIONS
const positions = [
    { id: 'totalBalance', column: 0, row: 0, size: 1, height: 2 },
    { id: 'winRate', column: 1, row: 0, size: 1, height: 2 },
    { id: 'capitalGrowth', column: 2, row: 0, size: 2, height: 2 },
    { id: 'topMovers', column: 4, row: 0, size: 2, height: 2 },
    { id: 'currentROI', column: 0, row: 1, size: 1, height: 2 },
    { id: 'avgPnLPerDay', column: 1, row: 1, size: 1, height: 2 },
    { id: 'goals', column: 2, row: 1, size: 2, height: 2 },
    { id: 'behaviorAnalytics', column: 4, row: 1, size: 2, height: 2 },
    { id: 'combinedPnLROI', column: 0, row: 2, size: 4, height: 2 },
    { id: 'costEfficiency', column: 4, row: 2, size: 2, height: 2 },
    { id: 'aiInsights', column: 0, row: 3, size: 4, height: 2 },
    { id: 'tradingQuality', column: 4, row: 3, size: 2, height: 2 },
    { id: 'emotionMistakeCorrelation', column: 0, row: 4, size: 6, height: 2 },
    { id: 'performanceHighlights', column: 0, row: 5, size: 2, height: 2 },
    { id: 'avgPnLPerTrade', column: 2, row: 5, size: 1, height: 2 },
    { id: 'totalTrades', column: 3, row: 5, size: 1, height: 2 },
];

// Check for overlaps
const grid = {};
let hasOverlap = false;
const overlaps = [];

positions.forEach(pos => {
    for (let r = pos.row; r < pos.row + Math.ceil(pos.height / 2); r++) {
        for (let c = pos.column; c < pos.column + pos.size; c++) {
            const key = `${r}-${c}`;
            if (grid[key]) {
                const msg = `OVERLAP: ${pos.id} overlaps with ${grid[key]} at row ${r}, col ${c}`;
                overlaps.push(msg);
                hasOverlap = true;
            }
            grid[key] = pos.id;
        }
    }
});

if (hasOverlap) {
    console.log('❌ OVERLAPS DETECTED:');
    overlaps.forEach(o => console.log('  -', o));
} else {
    console.log('✅ No overlaps detected in DEFAULT_POSITIONS');
}

// Visualize grid
console.log('\nGrid visualization (6 subcolumns):');
const maxRow = Math.max(...positions.map(p => p.row + Math.ceil(p.height / 2)));
for (let r = 0; r < maxRow; r++) {
    let row = `Row ${r}: `;
    for (let c = 0; c < 6; c++) {
        const key = `${r}-${c}`;
        row += grid[key] ? grid[key].substring(0, 8).padEnd(10) : '          ';
    }
    console.log(row);
}

// Check bounds
console.log('\nBounds check:');
positions.forEach(pos => {
    const endCol = pos.column + pos.size;
    if (endCol > 6) {
        console.log(`❌ ${pos.id} exceeds grid bounds: column ${pos.column} + size ${pos.size} = ${endCol} > 6`);
    }
});
