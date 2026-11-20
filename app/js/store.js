import { byId, roadmapOrder } from './data.js';
const KEY = 'leonida-ledger-progress-v1';
let earned = new Set(), counters = {}, overlay = null;
const callbacks = new Set();
function validate(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.earned) || !value.counters || typeof value.counters !== 'object' || Array.isArray(value.counters)) throw new Error('Choose a Leonida Ledger version 1 progress file.');
  if (value.earned.some(id => !Number.isInteger(id) || !byId.has(id))) throw new Error('The file contains an unknown trophy id.');
  for (const [id, count] of Object.entries(value.counters)) {
    const t = byId.get(Number(id));
    if (!t?.target || !Number.isInteger(count) || count < 0 || count > t.target) throw new Error('The file contains an invalid trophy counter.');
  }
  return value;
}
try {
  const saved = localStorage.getItem(KEY);
  if (saved) { const value = validate(JSON.parse(saved)); earned = new Set(value.earned); counters = { ...value.counters }; }
} catch { /* An unavailable or invalid save starts with an empty ledger. */ }
export function earnedSet() {
  const set = new Set(overlay ?? earned);
  if (Array.from(byId.keys()).filter(id => id !== 1).every(id => set.has(id))) set.add(1);
  else set.delete(1);
  return set;
}
export const isEarned = id => earnedSet().has(id);
export const counterValue = id => counters[id] ?? 0;
export const subscribe = callback => { callbacks.add(callback); return () => callbacks.delete(callback); };
function notify() { callbacks.forEach(callback => callback()); }
function persist() {
  if (overlay === null) {
    try { localStorage.setItem(KEY, JSON.stringify({ version: 1, earned: [...earnedSet()].sort((a,b) => a-b), counters })); }
    catch { document.dispatchEvent(new CustomEvent('save-error')); }
  }
  notify();
}
export function seedProgress(n) { overlay = new Set(roadmapOrder.slice(0, Math.max(0, Math.min(55, n)))); notify(); }
export function toggleEarned(id) {
  if (!byId.has(id) || id === 1) return;
  const set = overlay ?? earned;
  if (set.has(id)) set.delete(id); else set.add(id);
  persist();
}
export function setCounter(id, value) {
  const target = byId.get(id)?.target;
  if (!target || !Number.isFinite(value)) return;
  counters[id] = Math.max(0, Math.min(target, Math.trunc(value)));
  persist();
}
export function exportProgress() {
  const blob = new Blob([JSON.stringify({ version: 1, earned: [...earnedSet()].sort((a,b) => a-b), counters }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = 'leonida-ledger-progress.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function importProgress(file) {
  if (!file || file.size > 1048576) throw new Error('Choose a progress JSON file smaller than 1 MB.');
  const value = validate(JSON.parse(await file.text()));
  if (overlay !== null) overlay = new Set(value.earned); else earned = new Set(value.earned);
  counters = { ...value.counters }; persist();
}
