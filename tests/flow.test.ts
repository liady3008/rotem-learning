import { beforeAll, describe, expect, it } from 'vitest';
import type { Problem } from '../src/activities/math/types';
import { isChoice, isNum } from '../src/activities/math/types';
import type { ActivityDef, Word } from '../src/core/types';
import { subjectOf } from '../src/subjects';
import { UNITS } from '../src/units';

const $ = (sel: string): HTMLElement => {
  const el = document.querySelector<HTMLElement>(sel);
  if (!el) throw new Error(`missing ${sel}\n` + document.body.innerHTML.slice(0, 400));
  return el;
};
const click = (sel: string): void => {
  $(sel).dispatchEvent(new MouseEvent('click', { bubbles: true }));
};
const text = (): string => (document.getElementById('app')?.textContent ?? '').replace(/\s+/g, ' ');
const tick = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

/** Solve a math activity. With `stumble`, every step first gets wrong answers (hint, way, reveal paths). */
function playMath(a: ActivityDef, stumble: boolean): void {
  if (a.type === 'mathlearn') {
    for (let k = 0; k < (a.cards as unknown[]).length; k++) click('[data-act=lnext]');
    return;
  }
  for (const pr of a.problems as Problem[]) {
    expect(text()).toContain('תרגיל');
    pr.parts.forEach((pt, pi) => {
      const giveUp = stumble && pi === pr.parts.length - 1 && !isChoice(pt);
      if (isChoice(pt)) {
        if (stumble) click(`[data-act=mch][data-k="${(pt.correct + 1) % pt.choices.length}"]`);
        click(`[data-act=mch][data-k="${pt.correct}"]`);
      } else if (isNum(pt)) {
        const tries = giveUp ? 3 : stumble ? 1 : 0;
        for (let t = 0; t < tries; t++) {
          for (const ch of String(pt.num + 1)) click(`[data-act=key][data-k="${ch === '-' ? 'neg' : ch}"]`);
          click('[data-act=mcheck]');
        }
        if (giveUp) {
          expect(document.querySelector('.way')).not.toBeNull();
          click('[data-act=mskip]');
        } else {
          for (const ch of String(pt.num)) click(`[data-act=key][data-k="${ch === '-' ? 'neg' : ch}"]`);
          click('[data-act=mcheck]');
        }
      } else {
        const { x, y } = pt.plot;
        if (giveUp) {
          for (let t = 0; t < 3; t++) click(`[data-act=plot][data-x="${(x + 1) % 5}"][data-y="${y}"]`);
          click('[data-act=mskip]');
        } else click(`[data-act=plot][data-x="${x}"][data-y="${y}"]`);
      }
    });
    expect(document.querySelector('.way')).not.toBeNull();
    click('[data-act=mnext]');
  }
}

beforeAll(async () => {
  document.body.innerHTML = '<div class="app" id="app"></div>';
  window.scrollTo = () => {};
  await import('../src/main');
});

describe.each(UNITS)('full learner flow: $id', (unit) => {
  it('opens from the home screen with its own theme and wording', async () => {
    location.hash = `#/s/${subjectOf(unit)}`;
    await tick();
    expect(text()).toContain(unit.title);
    click(`[data-act=openunit][data-id="${unit.id}"]`);
    await tick();
    expect(location.hash).toBe(`#/unit/${unit.id}`);
    expect(document.documentElement.dataset.theme).toBe(unit.theme);
    expect(document.querySelector('.mapwrap svg')).not.toBeNull();
  });

  it('plays every station, writes words correctly or gives up, then opens the summit', () => {
    click('.node[data-act=summit]');
    expect(document.querySelector('.toast')).not.toBeNull();
    const words = unit.stations.flatMap((s) => s.words ?? []);
    const byTr = new Map<string, Word>(words.map((w) => [w.tr as string, w]));

    unit.stations.forEach((st, si) => {
      click(`.node[data-act=open][data-id="${st.id}"]`);
      for (const a of st.activities) {
        if (a.type === 'mathlearn' || a.type === 'math') playMath(a, si % 2 === 1);
        else if (a.type === 'flashcards') {
          for (let k = 0; k < (a.words as unknown[]).length; k++) {
            click('[data-act=flip]');
            click('[data-act=next]');
          }
        } else if (a.type === 'match') {
          for (const w of a.words as Word[]) {
            click(`[data-side=l][data-w="${w.en}"]`);
            click(`[data-side=r][data-w="${w.en}"]`);
          }
          click('[data-act=next]');
        } else if (a.type === 'quiz') {
          for (let g = 0; g < 80 && document.querySelector('[data-act=ans]'); g++) {
            document.querySelector<HTMLElement>('[data-act=ans]')!.click();
            document.querySelector<HTMLElement>('[data-act=next]')?.click();
          }
        } else if (a.type === 'typing') {
          for (let g = 0; g < 20 && document.getElementById('ans'); g++) {
            const tr = $('.qprompt .hword').textContent as string;
            const w = byTr.get(tr)!;
            const giveUp = si % 2 === 1;
            for (let t = 0; t < (giveUp ? 3 : 1); t++) {
              (document.getElementById('ans') as HTMLInputElement).value = giveUp ? 'zzz' : w.typed ?? w.en;
              click('[data-act=check]');
            }
            expect(document.querySelector('.bx.ok, .bx.rev')).not.toBeNull();
            click('[data-act=next]');
          }
        }
      }
      expect(text()).toContain('התחנה הושלמה');
      click('[data-act=endsession]');
    });
    click('.node[data-act=summit]');
    expect(document.querySelector('[data-act=ans], [data-act=mch], [data-act=plot], [data-act=key]')).not.toBeNull();
  });

  it('finishes the summit with the unit wording', () => {
    for (const a of unit.summit!.activities) if (a.type === 'math') playMath(a, false);
    for (let g = 0; g < 80 && document.querySelector('[data-act=ans]'); g++) {
      document.querySelector<HTMLElement>('[data-act=ans]')!.click();
      document.querySelector<HTMLElement>('[data-act=next]')?.click();
    }
    const words = unit.stations.flatMap((s) => s.words ?? []);
    const byTr = new Map<string, Word>(words.map((w) => [w.tr as string, w]));
    for (let g = 0; g < 20 && document.getElementById('ans'); g++) {
      const w = byTr.get($('.qprompt .hword').textContent as string)!;
      (document.getElementById('ans') as HTMLInputElement).value = w.typed ?? w.en;
      click('[data-act=check]');
      click('[data-act=next]');
    }
    expect(text()).toContain(unit.text?.summitDoneTitle ?? 'הגעת לפסגה');
  });
});
