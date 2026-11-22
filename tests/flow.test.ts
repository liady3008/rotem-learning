import { beforeAll, describe, expect, it } from 'vitest';
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

beforeAll(async () => {
  document.body.innerHTML = '<div class="app" id="app"></div>';
  window.scrollTo = () => {};
  await import('../src/main');
});

describe('full learner flow', () => {
  const unit = UNITS[0];

  it('shows the unit on the home screen and opens it', () => {
    expect(text()).toContain(unit.title);
    click(`[data-act=openunit][data-id="${unit.id}"]`);
    expect(location.hash).toBe(`#/unit/${unit.id}`);
  });

  it('plays every station to the end and the summit opens afterwards', async () => {
    await new Promise((r) => setTimeout(r, 0)); // hashchange is async
    expect(document.querySelector('.mapwrap svg')).not.toBeNull();
    // summit starts locked
    click('.node[data-act=summit]');
    expect(document.querySelector('.toast')).not.toBeNull();

    for (const st of unit.stations) {
      click(`.node[data-act=open][data-id="${st.id}"]`);
      for (const a of st.activities) {
        if (a.type === 'flashcards') {
          for (let k = 0; k < (a.words as unknown[]).length; k++) {
            click('[data-act=flip]');
            click('[data-act=next]');
          }
        } else if (a.type === 'match') {
          for (const w of a.words as { en: string }[]) {
            click(`[data-side=l][data-w="${w.en}"]`);
            click(`[data-side=r][data-w="${w.en}"]`);
          }
          click('[data-act=next]');
        } else if (a.type === 'quiz') {
          for (let g = 0; g < 80 && document.querySelector('[data-act=ans]'); g++) {
            // the correct option is the one a test can recognise from the DOM only after answering, so try each until good
            const btns = [...document.querySelectorAll<HTMLElement>('[data-act=ans]')];
            btns[0].click();
            document.querySelector<HTMLElement>('[data-act=next]')?.click();
          }
        } else if (a.type === 'typing') {
          for (let g = 0; g < 20 && document.getElementById('ans'); g++) {
            // reveal after three wrong tries, then continue: exercises the give-up path
            const inp = document.getElementById('ans') as HTMLInputElement;
            for (let t = 0; t < 3; t++) {
              (document.getElementById('ans') as HTMLInputElement | null)!.value = 'zzz';
              click('[data-act=check]');
            }
            void inp;
            click('[data-act=next]');
          }
        }
      }
      expect(text()).toContain(unit.lang === 'he' ? 'התחנה הושלמה' : 'Station complete');
      click('[data-act=endsession]');
    }
    click('.node[data-act=summit]');
    expect(document.querySelector('[data-act=ans]')).not.toBeNull();
  });
});
