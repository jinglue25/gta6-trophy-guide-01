import { byId, roadmap } from './data.js';
import { isMasked } from './filters.js';
import { counterValue } from './store.js';
export const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const swatch = t => `<span class="grade ${t.grade}">${t.grade}</span>`;
export function row(t, state) {
  const masked = isMasked(t, state.spoilers, state.earned), done = state.earned.has(t.id);
  return `<article class="trophy-row ${done ? 'earned' : ''} ${state.open === t.id ? 'selected' : ''}" id="trophy-${t.id}">
    <input type="checkbox" data-earn="${t.id}" aria-label="${t.id === 1 ? 'Platinum completes automatically' : `Mark ${escape(masked ? 'hidden trophy' : t.name)} earned`}" ${done ? 'checked' : ''} ${t.id === 1 ? 'disabled' : ''}>
    <button class="row-content" data-open="${t.id}" aria-pressed="${state.open === t.id}"><span class="row-top">${swatch(t)}<span class="kind">${t.kind}</span>${t.missable ? '<span class="danger">MISSABLE</span>' : ''}${t.target ? `<span class="row-count">${counterValue(t.id).toLocaleString()} / ${t.target.toLocaleString()}</span>` : ''}</span><strong>${escape(masked ? 'Hidden trophy' : t.name)}</strong><span class="description">${masked ? 'Story details hidden until earned.' : escape(t.description)}</span></button><span class="row-number">${String(t.id).padStart(2,'0')}</span>
  </article>`;
}
export function checklist(items, state) {
  return `<div class="section-heading"><h2>The trophy ledger</h2><span>${items.length} trophies shown</span></div>${items.length ? items.map(t => row(t, state)).join('') : '<div class="empty"><h3>No trophies here</h3><p>No description mentions online play. For other filters, try clearing your search or changing the grade.</p></div>'}`;
}
export function detail(t, state) {
  if (!t) return '<div class="detail-empty"><span class="eyebrow">FIELD NOTES</span><h2>Your next legend<br>starts here.</h2><p>Select a trophy to read its official requirement, original guide and source notes.</p><div class="css-medal" aria-hidden="true">VI</div></div>';
  const masked = isMasked(t, state.spoilers, state.earned);
  return `<div class="detail-top"><span class="eyebrow">FIELD NOTES / ${String(t.id).padStart(2,'0')}</span>${swatch(t)}</div><h2>${escape(masked ? 'Hidden trophy' : t.name)}</h2><span class="kind">${t.kind} · stage ${t.stage}</span>${t.missable ? '<p class="danger">MISSABLE RISK · CHOICES</p>' : ''}
    ${masked ? '<p class="official">Story details are hidden. Turn off “Hide story spoilers” to read this guide.</p>' : `<h3>Official requirement</h3><p class="official">${escape(t.description)}</p><h3>Your approach</h3><p>${escape(t.guide)}</p>${t.missableNote ? `<div class="caution"><h3>${t.missable ? 'Before you choose' : 'Checkpoint note'}</h3><p>${escape(t.missableNote)}</p></div>` : ''}`}
    ${t.target ? `<div class="counter"><label for="counter-${t.id}">Your recorded progress <span>${t.target.toLocaleString()} target</span></label><div><button data-step="-1" data-id="${t.id}" aria-label="Decrease counter">−</button><input id="counter-${t.id}" data-counter="${t.id}" type="number" min="0" max="${t.target}" value="${counterValue(t.id)}"><button data-step="1" data-id="${t.id}" aria-label="Increase counter">+</button></div><small>Manual notes. Mark earned separately after confirmation.</small></div>` : ''}
    <div class="sources"><h3>Sources & confidence</h3><p>${escape(t.sources)}</p><a href="https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/" target="_blank" rel="noreferrer">Exophase</a><span> / </span><a href="https://psnprofiles.com/trophies/43531-grand-theft-auto-vi" target="_blank" rel="noreferrer">PSNProfiles</a></div>`;
}
export function roadmapView(items, state) {
  const allowed = new Set(items.map(t => t.id));
  return `<div class="section-heading"><h2>The road to legend</h2><span>8 stages</span></div><p class="view-intro">A suggested route, grounded in the trophy descriptions. Check the choice warning before the finale.</p>${roadmap.stages.map(s => `<section class="stage"><div class="stage-heading"><span class="stage-number">${String(s.n).padStart(2,'0')}</span><h3>${escape(s.title)}</h3><span>${s.trophyIds.filter(id => state.earned.has(id)).length}/${s.trophyIds.length} earned</span></div><p>${escape(s.blurb)}</p>${s.trophyIds.filter(id => allowed.has(id)).map(id => row(byId.get(id),state)).join('')}</section>`).join('')}<p class="view-intro">${escape(roadmap.note)}</p>`;
}
export function missablesView(items,state) {
  return `<div class="section-heading"><h2>Before you commit</h2><span>1 choice risk</span></div><div class="warning"><span class="danger">READ BEFORE THE FINALE</span><h3>Choices deserve a checkpoint.</h3><p>Only Actions Speak Louder explicitly refers to choices. This is a precaution from its description, not a verified lockout. Replay and recovery are unverified.</p></div>${items.filter(t => t.missable).map(t => `<section class="note-card">${row(t,state)}<p>${escape(t.missableNote)}</p></section>`).join('')}<h2 class="checkpoint-heading">Story checkpoints</h2><p class="view-intro">These are progress checks, not confirmed missables.</p>${items.filter(t => t.kind === 'story').map(t => `<section class="note-card">${row(t,state)}<p>${escape(t.missableNote)}</p></section>`).join('')}`;
}
