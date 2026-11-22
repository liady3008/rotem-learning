import { describe, expect, it } from 'vitest';
import '../src/activities';
import { hasActivity } from '../src/core/activity';
import type { Station, Unit } from '../src/core/types';
import { UNITS } from '../src/units';

const allStations = (u: Unit): Station[] => [...u.stations, ...(u.summit ? [u.summit] : [])];

describe('unit content', () => {
  it('has unique unit ids', () => {
    const ids = UNITS.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const unit of UNITS) {
    describe(unit.id, () => {
      it('has unique station ids and at least one station', () => {
        const ids = allStations(unit).map((s) => s.id);
        expect(ids.length).toBeGreaterThan(0);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it('uses only registered activity types', () => {
        for (const s of allStations(unit)) for (const a of s.activities) expect(hasActivity(a.type), `${s.id}: ${a.type}`).toBe(true);
      });

      it('has well-formed words and sentences', () => {
        const words = unit.stations.flatMap((s) => s.words ?? []);
        const seen = new Set<string>();
        for (const w of words) {
          expect(seen.has(w.en), `duplicate word ${w.en}`).toBe(false);
          seen.add(w.en);
          expect(w.def.length).toBeGreaterThan(0);
          if (w.sentence) {
            expect(w.sentence.text).toContain('___');
            expect(w.sentence.wrong.length).toBeGreaterThanOrEqual(2);
            expect(w.sentence.wrong).not.toContain(w.en);
          }
        }
      });
    });
  }
});
