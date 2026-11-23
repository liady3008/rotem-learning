import { describe, expect, it } from 'vitest';
import type { Problem } from '../src/activities/math/types';
import { isChoice, isNum, isPlot } from '../src/activities/math/types';
import { fmt } from '../src/activities/math/render';
import { calc, mathMidterm1 } from '../src/units/math-midterm-1';
import { UNITS } from '../src/units';

const problemsOf = (u: (typeof UNITS)[number]): Problem[] =>
  [...u.stations, ...(u.summit ? [u.summit] : [])].flatMap((s) => s.activities.filter((a) => a.type === 'math').flatMap((a) => a.problems as Problem[]));

describe('calc', () => {
  it('evaluates directed-number exercises', () => {
    expect(calc('-2 + 5')).toBe(3);
    expect(calc('-3 + (-4)')).toBe(-7);
    expect(calc('4 - (-3)')).toBe(7);
    expect(calc('-2 - (-7)')).toBe(5);
    expect(calc('-4 + 9 - 7')).toBe(-2);
    expect(() => calc('3 * 4')).toThrow();
  });
});

describe('fmt', () => {
  it('wraps math and uses a real minus sign', () => {
    expect(fmt('חשבי: {-3 + (-4)}')).toBe('חשבי: <span class="m">−3 + (−4)</span>');
    expect(fmt('{a<b}')).toBe('<span class="m">a&lt;b</span>');
  });
});

describe('math unit content', () => {
  const probs = problemsOf(mathMidterm1);

  it('has at least 30 exercises, and the subtitle count matches', () => {
    expect(probs.length).toBeGreaterThanOrEqual(30);
    expect(mathMidterm1.subtitle).toContain(String(probs.length));
  });

  it('every exercise is well formed', () => {
    for (const pr of probs) {
      expect(pr.q.length, pr.q).toBeGreaterThan(0);
      expect(pr.parts.length, pr.q).toBeGreaterThan(0);
      expect(pr.way.length, pr.q).toBeGreaterThan(0);
      if (pr.parts.length > 1) for (const pt of pr.parts) expect(pt.ask, pr.q).toBeTruthy();
      for (const pt of pr.parts) {
        expect(pt.hint.length).toBeGreaterThan(0);
        if (isChoice(pt)) {
          expect(pt.correct).toBeGreaterThanOrEqual(0);
          expect(pt.correct).toBeLessThan(pt.choices.length);
          expect(new Set(pt.choices).size, pr.q).toBe(pt.choices.length);
        } else if (isNum(pt)) {
          expect(Number.isInteger(pt.num), pr.q).toBe(true);
          expect(String(Math.abs(pt.num)).length).toBeLessThanOrEqual(4);
        } else if (isPlot(pt)) {
          expect(pr.viz?.kind, pr.q).toBe('grid');
          const size = pr.viz!.kind === 'grid' ? pr.viz!.size : 0;
          expect(pt.plot.x).toBeLessThanOrEqual(size);
          expect(pt.plot.y).toBeLessThanOrEqual(size);
        } else throw new Error('unknown part');
      }
      // braces are balanced, so no raw markup leaks to the screen
      for (const t of [pr.q, ...pr.way, ...pr.parts.flatMap((x) => [x.hint, x.ask ?? ''])]) {
        expect(t.split('{').length, t).toBe(t.split('}').length);
      }
    }
  });

  it('the numbers in each way end with the answer of a one-step numeric exercise', () => {
    for (const pr of probs) {
      const last = pr.parts[pr.parts.length - 1];
      if (!isNum(last)) continue;
      const shown = pr.way.join(' ').replace(/-/g, '-');
      expect(shown, pr.q).toMatch(new RegExp(`(^|[^\\d])${String(last.num).replace('-', '-')}([^\\d]|$)`));
    }
  });
});
