import type { ActivityCtx, ActivityInstance } from './activity';
import { getActivity } from './activity';
import type { Score, Station, Unit } from './types';
import { chimeWin, stopSpeech } from './audio';
import { confetti } from './fx';
import { markDone } from './storage';

/** Runs the activities of one station in order, adds up the scores, and awards stars at the end. */
export class Session {
  index = 0;
  current!: ActivityInstance;
  finished = false;
  stars = 0;
  first = 0;
  total = 0;
  private cid = 0;
  private disposed = false;

  constructor(
    readonly unit: Unit,
    readonly station: Station,
    readonly isSummit: boolean,
    private readonly onChange: (top: boolean) => void,
  ) {}

  start(): void {
    this.enter(0);
  }

  dispose(): void {
    this.disposed = true;
    this.cid++;
    stopSpeech();
  }

  private enter(i: number): void {
    this.index = i;
    const id = ++this.cid;
    const def = this.station.activities[i];
    const ctx: ActivityCtx = {
      unit: this.unit,
      station: this.station,
      rerender: (top = false) => {
        if (!this.disposed && this.cid === id) this.onChange(top);
      },
      complete: (score?: Score) => {
        if (this.disposed || this.cid !== id) return;
        if (score) {
          this.first += score.first;
          this.total += score.total;
        }
        if (i + 1 < this.station.activities.length) this.enter(i + 1);
        else this.finish();
      },
      active: () => !this.disposed && this.cid === id,
    };
    this.current = getActivity(def.type).create(def, ctx);
    this.onChange(true);
    this.current.onEnter?.();
  }

  private finish(): void {
    const pct = this.total > 0 ? this.first / this.total : 1;
    this.stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1;
    this.finished = true;
    this.cid++;
    markDone(this.unit.id, this.station.id, this.stars);
    chimeWin();
    confetti();
    this.onChange(true);
  }
}
