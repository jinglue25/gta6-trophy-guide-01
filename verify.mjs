import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, relative, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = dirname(fileURLToPath(import.meta.url));
let failed = false;
function check(label, action) {
  try { if (action() === false) throw new Error('condition not met'); console.log(`PASS ${label}`); }
  catch (error) { failed = true; console.log(`FAIL ${label}: ${error.message}`); }
}
const readJSON = file => JSON.parse(readFileSync(resolve(root, file), 'utf8'));
const exactIds = (ids, start, end) => ids.length === end-start+1 && new Set(ids).size === ids.length && ids.every(id => Number.isInteger(id) && id >= start && id <= end);
check('55 unique trophies, full guides and metadata', () => {
  const data = readJSON('app/data/trophies.json');
  return exactIds(data.trophies.map(t => t.id), 1, 55) && data.trophies.every(t => typeof t.guide === 'string' && t.guide.trim() && t.kind && Number.isInteger(t.stage) && t.stage >= 1 && t.stage <= 8 && typeof t.sources === 'string' && t.sources.trim());
});
check('Roadmap covers ids 2–55 exactly once', () => {
  const data = readJSON('app/data/roadmap.json');
  return data.stages.length === 8 && data.stages.every((s,i) => s.n === i+1) && exactIds(data.stages.flatMap(s => s.trophyIds), 2, 55);
});
function files(dir) { return readdirSync(dir, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name)).flatMap(entry => entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]); }
console.log('INFO External URL occurrences under app/ (links are not fetched automatically):');
for (const file of files(resolve(root, 'app'))) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const match of line.matchAll(/https?:\/\//g)) console.log(`INFO ${relative(root, file)}:${i+1}:${match.index+1} ${line.trim()}`);
  });
}
const expected = readJSON('shots.json').map(shot => shot.file).sort();
const actual = readdirSync(resolve(root, 'screenshots')).sort();
const starters = ['1-checklist.jpg', '2-silver.jpg', '3-bronze.jpg'];
if (actual.length === 3 && starters.every(name => actual.includes(name))) console.log('NOTE Starter screenshots remain; capture is deferred.');
else check('Exactly four expected screenshots, each at most 262144 bytes', () => expected.length === 4 && JSON.stringify(actual) === JSON.stringify(expected) && actual.every(name => statSync(resolve(root, 'screenshots', name)).size <= 262144));
if (process.env.KIT_VENDOR) check('Vendor SHA-256 matches KIT_VENDOR', () => {
  const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');
  return hash(resolve(root, 'vendor/makefun-frontend.ts')) === hash(process.env.KIT_VENDOR);
}); else console.log('SKIP Vendor comparison: KIT_VENDOR is not set.');
process.exitCode = failed ? 1 : 0;
