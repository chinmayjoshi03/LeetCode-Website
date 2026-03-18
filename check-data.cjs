const fs = require('fs');
const raw = fs.readFileSync('./src/data/problems.js', 'utf8');
const arr = JSON.parse(raw.replace('export const ALL_PROBLEMS = ', '').replace(/;\s*$/, ''));
console.log('Total:', arr.length);
const ids = new Set(arr.map(p => p.id));
const missing = [];
for (let i = 1; i <= 868; i++) { if (!ids.has(i)) missing.push(i); }
console.log('Missing IDs count:', missing.length);
console.log('Missing IDs:', JSON.stringify(missing));
// Check range of IDs
const maxId = Math.max(...arr.map(p => p.id));
const minId = Math.min(...arr.map(p => p.id));
console.log('Min ID:', minId, 'Max ID:', maxId);
// Show ID gaps in ranges
const topics = {};
arr.forEach(p => { topics[p.topic] = (topics[p.topic] || 0) + 1; });
console.log('Topics:', JSON.stringify(topics, null, 2));
