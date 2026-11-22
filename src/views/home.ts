import { str } from '../core/i18n';
import { stationsDone, unitStars } from '../core/storage';
import { esc } from '../core/util';
import { UNITS } from '../units';

export function homeHTML(): string {
  const s = str();
  const cards = UNITS.map((u) => {
    const done = stationsDone(u);
    const started = done > 0 || unitStars(u) > 0;
    return `<button class="card unitcard" data-act="openunit" data-id="${esc(u.id)}">
      <span class="unit-title">${esc(u.title)}</span>
      ${u.subtitle ? `<span class="small">${esc(u.subtitle)}</span>` : ''}
      <span class="small">${s.unitProgress(done, u.stations.length)}</span>
      <span class="btn unit-go">${started ? s.resume : s.start}</span>
    </button>`;
  }).join('');
  return `<section class="hero">
      <h1>${s.brand}</h1>
      <p class="lead">${s.homeLead}</p>
    </section>
    <h2 class="section-title">${s.unitsHeading}</h2>
    <div class="stack">${cards}</div>`;
}
