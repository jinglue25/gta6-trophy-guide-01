import { trophies, byId, gradeOrder } from './data.js';
import { earnedSet, toggleEarned, setCounter, counterValue, subscribe, seedProgress, exportProgress, importProgress } from './store.js';
import { visibleTrophies } from './filters.js';
import { checklist, detail, roadmapView, missablesView } from './views.js';
const params = new URLSearchParams(location.search);
const state = { view: ['checklist','roadmap','missables'].includes(params.get('view')) ? params.get('view') : 'checklist', open: byId.has(Number(params.get('open'))) ? Number(params.get('open')) : null, spoilers: params.has('spoilers') ? params.get('spoilers') === 'on' : localStorageSetting(), search: '', kind: 'all', grade: 'all', earned: earnedSet() };
function localStorageSetting() { try { return localStorage.getItem('leonida-hide-spoilers') === 'true'; } catch { return false; } }
const seeded = params.has('seed') && /^\d+$/.test(params.get('seed'));
if (seeded) seedProgress(Number(params.get('seed')));
const $ = selector => document.querySelector(selector);
function render() {
  state.earned = earnedSet();
  const items = visibleTrophies(trophies,state), count = state.earned.size, percent = Math.round(count / 55 * 100);
  $('#earned-count').textContent = count;
  $('#percent').textContent = `${percent}%`;
  $('#progress-fill').style.width = `${count / 55 * 100}%`;
  $('#progress-bar').setAttribute('aria-valuenow',count);
  $('#grade-summary').innerHTML = gradeOrder.map(grade => `<span><i class="dot ${grade}"></i><b>${trophies.filter(t => t.grade === grade && state.earned.has(t.id)).length}</b> ${grade}</span>`).join('');
  $('#list').innerHTML = (state.view === 'roadmap' ? roadmapView : state.view === 'missables' ? missablesView : checklist)(items,state);
  $('#detail').innerHTML = detail(byId.get(state.open),state);
  document.querySelectorAll('[data-view]').forEach(button => { button.classList.toggle('active',button.dataset.view === state.view); button.setAttribute('aria-selected',button.dataset.view === state.view); });
  document.querySelectorAll('[data-kind]').forEach(button => { button.classList.toggle('active',button.dataset.kind === state.kind); button.setAttribute('aria-pressed',button.dataset.kind === state.kind); });
  $('#spoilers').checked = state.spoilers;
  $('#save-label').textContent = seeded ? 'PREVIEW · PROGRESS IS NOT SAVED' : 'YOUR PROGRESS · SAVED ON THIS DEVICE';
}
function status(message) { $('#status').textContent = message; }
$('#search').addEventListener('input',event => { state.search=event.target.value; render(); });
$('#grade').addEventListener('change',event => { state.grade=event.target.value; render(); });
$('#spoilers').addEventListener('change',event => {
  state.spoilers=event.target.checked;
  if (!seeded) try { localStorage.setItem('leonida-hide-spoilers',String(state.spoilers)); } catch { status('Spoiler preference could not be saved.'); }
  render();
});
document.addEventListener('click',event => {
  const button=event.target.closest('button'); if (!button) return;
  if (button.dataset.kind) { state.kind=button.dataset.kind; render(); }
  if (button.dataset.view) { state.view=button.dataset.view; render(); }
  if (button.dataset.open) { state.open=Number(button.dataset.open); render(); if (matchMedia('(max-width: 900px)').matches) $('#detail').scrollIntoView({behavior:'smooth',block:'start'}); }
  if (button.dataset.step) { const id=Number(button.dataset.id); setCounter(id,counterValue(id)+Number(button.dataset.step)); }
});
document.addEventListener('change',event => {
  if (event.target.dataset.earn) toggleEarned(Number(event.target.dataset.earn));
  if (event.target.dataset.counter) setCounter(Number(event.target.dataset.counter),Number(event.target.value));
});
$('#export').addEventListener('click',exportProgress);
$('#import').addEventListener('click',() => $('#import-file').click());
$('#import-file').addEventListener('change',async event => {
  try { await importProgress(event.target.files[0]); status(seeded ? 'Imported into this temporary preview.' : 'Progress imported and saved.'); }
  catch (error) { status(`Import failed: ${error.message}`); }
  event.target.value='';
});
document.addEventListener('save-error',() => status('Storage is unavailable. Export your progress before closing.'));
subscribe(render); render();
if (state.open) requestAnimationFrame(() => document.getElementById(`trophy-${state.open}`)?.scrollIntoView({block:'center'}));
