import './styles/main.css';
import './activities';
import { say, stopSpeech } from './core/audio';
import { APP_LANG, setLang, str } from './core/i18n';
import { toast } from './core/fx';
import { Session } from './core/session';
import { isSoundOn, isStationOpen, isSummitOpen, resetUnit, toggleSound, unitStars } from './core/storage';
import type { Station, Unit, Word } from './core/types';
import { UNITS, unitById } from './units';
import { homeHTML } from './views/home';
import { sessionHTML } from './views/session';
import { sheetHTML, unitHTML, unitWords } from './views/unit';

type Route = { name: 'home' } | { name: 'unit'; id: string };

const app = document.getElementById('app') as HTMLElement;
let route: Route = parseHash();
let session: Session | null = null;
let sheet: Word | null = null;

function parseHash(): Route {
  const m = /^#\/unit\/([\w-]+)$/.exec(location.hash);
  return m && unitById(m[1]) ? { name: 'unit', id: m[1] } : { name: 'home' };
}
const currentUnit = (): Unit | undefined => (route.name === 'unit' ? unitById(route.id) : undefined);

function barHTML(unit: Unit | undefined): string {
  const s = str();
  const total = unit ? unitStars(unit) : UNITS.reduce((n, u) => n + unitStars(u), 0);
  const back = session
    ? `<button class="chip" data-act="endsession">${s.toMap}</button>`
    : unit
      ? `<button class="chip" data-act="tohome">${s.toUnits}</button>`
      : `<span class="brand">${s.brand}</span>`;
  return `<header class="bar">
    ${back}
    <div class="bar-actions">
      <span class="chip stars-chip">${s.stars} <span class="en" style="display:inline">${total}</span></span>
      <button class="chip" data-act="sound" aria-pressed="${isSoundOn()}">${isSoundOn() ? s.soundOn : s.soundOff}</button>
    </div>
  </header>`;
}

function render(top = false): void {
  const unit = currentUnit();
  setLang(unit ? unit.lang : APP_LANG);
  document.documentElement.dataset.theme = unit?.theme ?? 'adventure';
  const body = session ? sessionHTML(session) : unit ? unitHTML(unit) : homeHTML();
  app.innerHTML = barHTML(unit) + body + (sheet && unit ? sheetHTML(unit, sheet) : '');
  if (top) window.scrollTo(0, 0);
  if (session && !session.finished) session.current.mounted?.();
  else if (!session && unit && top) {
    const el = document.querySelector('.node.cur');
    if (el && typeof el.scrollIntoView === 'function') {
      try {
        el.scrollIntoView({ block: 'center' });
      } catch {
        /* ignore */
      }
    }
  }
}

function startSession(unit: Unit, station: Station, isSummit: boolean): void {
  session?.dispose();
  session = new Session(unit, station, isSummit, (top) => render(top));
  session.start();
}

function endSession(): void {
  session?.dispose();
  session = null;
  render(true);
}

function act(name: string, d: DOMStringMap, el: HTMLElement): void {
  const unit = currentUnit();
  switch (name) {
    case 'tohome':
      location.hash = '#/';
      return;
    case 'openunit':
      location.hash = `#/unit/${d.id}`;
      return;
    case 'endsession':
      return endSession();
    case 'sound':
      if (!toggleSound()) stopSpeech();
      return render();
    case 'hear':
      return say(d.w ?? '', true);
    case 'open': {
      if (!unit) return;
      const i = unit.stations.findIndex((x) => x.id === d.id);
      if (i < 0) return;
      if (!isStationOpen(unit, i)) return toast(str().stationLocked);
      return startSession(unit, unit.stations[i], false);
    }
    case 'summit':
      if (!unit?.summit) return;
      if (!isSummitOpen(unit)) return toast(str().summitLocked);
      return startSession(unit, unit.summit, true);
    case 'gonext': {
      const st = unit?.stations.find((x) => x.id === d.id);
      if (unit && st) startSession(unit, st, false);
      return;
    }
    case 'gosummit':
      if (unit?.summit) startSession(unit, unit.summit, true);
      return;
    case 'gem': {
      const w = unit ? unitWords(unit).find((x) => x.en === d.w) : undefined;
      if (w) {
        sheet = w;
        render();
        say(w.en);
      }
      return;
    }
    case 'closesheet':
      sheet = null;
      return render();
    case 'reset': {
      if (!unit) return;
      if (el.dataset.armed) {
        resetUnit(unit.id);
        render(true);
        toast(str().parentResetDone);
      } else {
        el.dataset.armed = '1';
        el.textContent = str().parentResetConfirm;
        setTimeout(() => {
          if (document.body.contains(el)) {
            delete el.dataset.armed;
            el.textContent = str().parentReset;
          }
        }, 4000);
      }
      return;
    }
    default:
      if (session && !session.finished) session.current.act(name, d, el);
  }
}

document.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
  if (!el || (el as HTMLButtonElement).disabled) return;
  if (el.dataset.act === 'closesheet' && (e.target as HTMLElement).closest('[data-keep]') && !(e.target as HTMLElement).closest('button')) return;
  act(el.dataset.act as string, el.dataset, el);
});

document.addEventListener('keydown', (e) => {
  if (session && !session.finished && session.current.onKey?.(e)) return;
  const t = e.target as HTMLElement;
  if ((e.key === 'Enter' || e.key === ' ') && t.matches?.('g[data-act]')) {
    e.preventDefault();
    act(t.dataset.act as string, t.dataset, t);
  }
  if (e.key === 'Escape' && sheet) {
    sheet = null;
    render();
  }
});

window.addEventListener('hashchange', () => {
  route = parseHash();
  session?.dispose();
  session = null;
  sheet = null;
  render(true);
});

try {
  if ('speechSynthesis' in window) speechSynthesis.getVoices();
} catch {
  /* ignore */
}
render(false);
