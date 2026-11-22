import { getActivity } from '../core/activity';
import { str } from '../core/i18n';
import type { Session } from '../core/session';
import { isSummitOpen } from '../core/storage';
import { esc } from '../core/util';

function stepsHTML(se: Session): string {
  const s = str();
  const items = se.station.activities
    .map((a, k) => `<li class="${k < se.index ? 'past' : k === se.index ? 'on' : ''}">${getActivity(a.type).label(s)}</li>`)
    .join('');
  return `<ol class="steps" aria-label="${s.ariaSteps}">${items}</ol>`;
}

function doneHTML(se: Session): string {
  const s = str();
  const trLang = se.unit.trLang ?? 'he';
  const st = se.stars;
  const msg = st === 3 ? s.doneMsg3 : st === 2 ? s.doneMsg2 : s.doneMsg1;
  const words = se.station.words?.length
    ? `<p class="instr" style="margin:0">${s.wordsCollected}</p>
       <ul class="collected">${se.station.words
         .map((w) => `<li><span class="en" lang="en">${esc(w.en)}</span>${w.tr ? `<span class="tr small" lang="${trLang}">${esc(w.tr)}</span>` : ''}</li>`)
         .join('')}</ul>`
    : '';
  const idx = se.unit.stations.findIndex((x) => x.id === se.station.id);
  let cta = '';
  if (!se.isSummit) {
    if (idx >= 0 && idx < se.unit.stations.length - 1)
      cta = `<button class="btn wide" data-act="gonext" data-id="${esc(se.unit.stations[idx + 1].id)}">${s.nextStation}</button>`;
    else if (isSummitOpen(se.unit)) cta = `<button class="btn wide" data-act="gosummit">${s.toSummit}</button>`;
  }
  return `<div class="card done">
    <h2>${se.isSummit ? s.summitDoneTitle : s.doneTitle}</h2>
    <div class="bigstars" aria-label="${s.starsAria(st)}">${'★'.repeat(st)}<span class="off">${'★'.repeat(3 - st)}</span></div>
    <p style="margin:0">${msg}</p>
    ${se.total > 0 ? `<p class="small" style="margin:0">${s.firstTry(se.first, se.total)}</p>` : ''}
    ${words}
    <div class="stack" style="width:100%">${cta}<button class="btn sec wide" data-act="endsession">${s.backToMap}</button></div>
  </div>`;
}

export function sessionHTML(se: Session): string {
  if (se.finished) return doneHTML(se);
  const s = str();
  const idx = se.unit.stations.findIndex((x) => x.id === se.station.id);
  const title = se.isSummit ? se.station.name : s.stationTitle(idx + 1, se.station.name);
  return `<div class="stack"><h2 class="station-title">${esc(title)}</h2>${stepsHTML(se)}${se.current.render()}</div>`;
}
