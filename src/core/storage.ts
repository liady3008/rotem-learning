import type { Unit } from './types';

interface UnitProgress {
  /** station id -> 1 */
  done: Record<string, 1>;
  /** station id -> best stars (1..3) */
  stars: Record<string, number>;
}

interface Progress {
  v: 1;
  sound: boolean;
  units: Record<string, UnitProgress>;
}

const KEY = 'rotem-learning:v1';

function fresh(): Progress {
  return { v: 1, sound: true, units: {} };
}

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Progress>;
      return { ...fresh(), ...p, units: { ...(p.units ?? {}) } };
    }
  } catch {
    /* storage may be unavailable; run without saving */
  }
  return fresh();
}

let P = load();

function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(P));
  } catch {
    /* ignore */
  }
}

function up(unitId: string): UnitProgress {
  return (P.units[unitId] ??= { done: {}, stars: {} });
}

export const isSoundOn = (): boolean => P.sound;
export function toggleSound(): boolean {
  P.sound = !P.sound;
  save();
  return P.sound;
}

export const isDone = (unitId: string, stationId: string): boolean => !!P.units[unitId]?.done[stationId];
export const starsOf = (unitId: string, stationId: string): number => P.units[unitId]?.stars[stationId] ?? 0;

export function markDone(unitId: string, stationId: string, stars: number): void {
  const u = up(unitId);
  u.done[stationId] = 1;
  u.stars[stationId] = Math.max(u.stars[stationId] ?? 0, stars);
  save();
}

export function resetUnit(unitId: string): void {
  delete P.units[unitId];
  save();
}

export function unitStars(unit: Unit): number {
  const all = [...unit.stations, ...(unit.summit ? [unit.summit] : [])];
  return all.reduce((sum, s) => sum + starsOf(unit.id, s.id), 0);
}

export function stationsDone(unit: Unit): number {
  return unit.stations.filter((s) => isDone(unit.id, s.id)).length;
}

export const allStationsDone = (unit: Unit): boolean => stationsDone(unit) === unit.stations.length;

export function isStationOpen(unit: Unit, index: number): boolean {
  if ((unit.order ?? 'free') === 'free') return true;
  return index === 0 || isDone(unit.id, unit.stations[index - 1].id);
}

export const isSummitOpen = (unit: Unit): boolean => !!unit.summit && allStationsDone(unit);
