import type { ActivityDef, Score, Station, Unit } from './types';
import type { Strings } from './i18n';

/** What a running activity exposes to the screen. */
export interface ActivityInstance {
  render(): string;
  /** Handle a click on an element with data-act. */
  act(name: string, data: DOMStringMap, el: HTMLElement): void;
  /** Runs once when the activity starts. */
  onEnter?(): void;
  /** Runs after every render (focus an input, etc.). */
  mounted?(): void;
  /** Keyboard events while the activity is on screen. Return true if handled. */
  onKey?(e: KeyboardEvent): boolean;
}

export interface ActivityCtx {
  unit: Unit;
  station: Station;
  rerender(top?: boolean): void;
  /** Tell the session this activity is finished. A score (first-try correct / total) feeds the star rating. */
  complete(score?: Score): void;
  /** False once the learner left this activity; guards timers. */
  active(): boolean;
}

export interface ActivityType {
  /** Short name shown in the step bar. */
  label(s: Strings): string;
  create(def: ActivityDef, ctx: ActivityCtx): ActivityInstance;
}

const registry = new Map<string, ActivityType>();

/** Register an activity type. New unit kinds (grammar, reading...) add their own types here. */
export function registerActivity(type: string, impl: ActivityType): void {
  registry.set(type, impl);
}

export function getActivity(type: string): ActivityType {
  const a = registry.get(type);
  if (!a) throw new Error(`Unknown activity type: ${type}`);
  return a;
}

export const hasActivity = (type: string): boolean => registry.has(type);
