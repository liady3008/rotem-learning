import { SPEAKER } from '../core/fx';
import { str } from '../core/i18n';
import { isDone } from '../core/storage';
import type { Unit, Word } from '../core/types';
import { esc } from '../core/util';
import { mapSVG } from './map';

export const unitWords = (unit: Unit): Word[] => unit.stations.flatMap((s) => s.words ?? []);
export const collectedWords = (unit: Unit): Word[] => unit.stations.filter((s) => isDone(unit.id, s.id)).flatMap((s) => s.words ?? []);

export function unitHTML(unit: Unit): string {
  const s = str();
  const all = unitWords(unit);
  const got = new Set(collectedWords(unit).map((w) => w.en));
  const bag = all.length
    ? `<section class="pack card">
        <div class="pack-head"><h2>${s.bagHeading}</h2><span class="small">${s.bagCount(got.size, all.length)}</span></div>
        <div class="grid">${all
          .map((w) =>
            got.has(w.en)
              ? `<button class="gem" data-act="gem" data-w="${esc(w.en)}" lang="en">${esc(w.en)}</button>`
              : `<div class="gem locked" aria-label="${s.bagEmpty}">?</div>`,
          )
          .join('')}</div>
        <p class="small" style="margin:12px 0 0">${s.bagHint}</p>
      </section>`
    : '';
  return `<section class="hero">
      <h1>${esc(unit.title)}</h1>
      ${unit.lead ? `<p class="lead">${esc(unit.lead)}</p>` : ''}
    </section>
    <div class="mapwrap">${mapSVG(unit)}</div>
    ${bag}
    <div class="parent"><button class="linkbtn" data-act="reset">${s.parentReset}</button></div>`;
}

export function sheetHTML(unit: Unit, w: Word): string {
  const s = str();
  const trLang = unit.trLang ?? 'he';
  return `<div class="overlay" data-act="closesheet"><div class="card sheet" role="dialog" aria-label="${s.sheetLabel}" data-keep="1">
    <div class="en word" lang="en">${esc(w.en)}</div>
    <div class="en" style="font-size:20px" lang="en">${esc(w.def)}</div>
    ${w.tr ? `<div class="tr big" lang="${trLang}">${esc(w.tr)}</div>` : ''}
    ${w.trAlt ? `<div class="tr small" lang="${trLang}">${s.alsoSay} ${esc(w.trAlt)}</div>` : ''}
    <button class="hear" data-act="hear" data-w="${esc(w.en)}">${SPEAKER}<span>${s.hear}</span></button>
    <button class="btn sec wide" data-act="closesheet">${s.close}</button>
  </div></div>`;
}
