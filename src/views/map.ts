import { str } from '../core/i18n';
import { isDone, isStationOpen, isSummitOpen, starsOf } from '../core/storage';
import type { Unit } from '../core/types';
import { esc, seeded } from '../core/util';

interface Pt {
  x: number;
  y: number;
}
type Cubic = [Pt, Pt, Pt, Pt];

const W = 360;
const STEP = 124;
const TOP = 150;
const BOTTOM = 110;

/** Scenery painter for one visual theme. Add a theme by adding an entry to THEMES and a data-theme block in the CSS. */
interface Scenery {
  (c: { unit: Unit; H: number; pts: Pt[]; route: Cubic[]; rng: () => number }): { svg: string; bridge: string };
}

const cubicAt = ([a, b, c, d]: Cubic, t: number): Pt => {
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
  };
};
const sample = (segs: Cubic[], per = 24): Pt[] => segs.flatMap((s) => Array.from({ length: per + 1 }, (_, k) => cubicAt(s, k / per)));
const dist = (a: Pt, b: Pt): number => Math.hypot(a.x - b.x, a.y - b.y);

function tree(x: number, y: number): string {
  return `<g><rect x="${x - 3}" y="${y}" width="6" height="10" fill="#8a5a33"/><circle cx="${x}" cy="${y - 3}" r="13" fill="#5fa85a" stroke="#17324d" stroke-width="2.5"/></g>`;
}
function house(x: number, y: number): string {
  return `<g><rect x="${x}" y="${y}" width="26" height="20" fill="#fffdf6" stroke="#17324d" stroke-width="2.5"/><polygon points="${x - 4},${y} ${x + 13},${y - 15} ${x + 30},${y}" fill="#e8512f" stroke="#17324d" stroke-width="2.5" stroke-linejoin="round"/><rect x="${x + 10}" y="${y + 9}" width="7" height="11" fill="#17324d"/></g>`;
}

const adventure: Scenery = ({ H, pts, route, rng }) => {
  const n = pts.length;
  const top = pts[n - 1];
  let s = `<rect width="${W}" height="${H}" fill="#a9d98a"/>`;
  for (let k = 0; k < Math.ceil(H / 230); k++) {
    s += `<ellipse cx="${60 + rng() * 240}" cy="${160 + k * 230 + rng() * 60}" rx="${50 + rng() * 30}" ry="${28 + rng() * 10}" fill="#b8e29c"/>`;
  }
  // mountains behind the final node, one smaller range on the other side
  const mx = top.x;
  s += `<polygon points="${mx - 75},${top.y + 66} ${mx},${top.y - 56} ${mx + 75},${top.y + 66}" fill="#8d9cc2" stroke="#17324d" stroke-width="3" stroke-linejoin="round"/>`;
  s += `<polygon points="${mx},${top.y - 56} ${mx - 22},${top.y - 20} ${mx - 8},${top.y - 28} ${mx},${top.y - 14} ${mx + 13},${top.y - 28} ${mx + 24},${top.y - 20}" fill="#fff" stroke="#17324d" stroke-width="2.5" stroke-linejoin="round"/>`;
  const ox = mx < 180 ? 285 : 70;
  s += `<polygon points="${ox - 52},${top.y + 96} ${ox},${top.y + 14} ${ox + 52},${top.y + 96}" fill="#a1aed0" stroke="#17324d" stroke-width="3" stroke-linejoin="round"/>`;
  s += `<g fill="#fff" opacity=".9"><ellipse cx="70" cy="40" rx="28" ry="11"/><ellipse cx="92" cy="34" rx="18" ry="10"/><ellipse cx="300" cy="62" rx="26" ry="10"/><ellipse cx="318" cy="56" rx="15" ry="9"/></g>`;

  // river across the middle with a bridge where it meets the route
  const avoid: Pt[] = [...sample(route), ...pts];
  const keep: Pt[] = [];
  let bridge = '';
  if (n >= 2) {
    const k = Math.floor((n - 1) / 2);
    const yr = (pts[k].y + pts[k + 1].y) / 2;
    const r1: Cubic = [{ x: -20, y: yr }, { x: 80, y: yr + 50 }, { x: 140, y: yr - 50 }, { x: 200, y: yr }];
    const r2: Cubic = [{ x: 200, y: yr }, { x: 260, y: yr + 50 }, { x: 330, y: yr + 30 }, { x: 390, y: yr - 10 }];
    const d = `M${r1[0].x} ${r1[0].y} C ${r1[1].x} ${r1[1].y} ${r1[2].x} ${r1[2].y} ${r1[3].x} ${r1[3].y} C ${r2[1].x} ${r2[1].y} ${r2[2].x} ${r2[2].y} ${r2[3].x} ${r2[3].y}`;
    s += `<path d="${d}" fill="none" stroke="#17324d" stroke-width="42" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#47c2d8" stroke-width="35" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#9be3ef" stroke-width="8" stroke-linecap="round" stroke-dasharray="14 22"/>`;
    const rv = sample([r1, r2], 30);
    keep.push(...rv);
    // bridge: the route point closest to the river
    const rs = sample(route, 40);
    let best = 1e9;
    let bi = 0;
    rs.forEach((p, i) => {
      const dd = Math.min(...rv.map((q) => dist(p, q)));
      if (dd < best) {
        best = dd;
        bi = i;
      }
    });
    const p = rs[bi];
    const q = rs[Math.min(bi + 1, rs.length - 1)];
    const ang = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
    bridge = `<g transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${ang.toFixed(1)})"><rect x="-26" y="-11" width="52" height="22" rx="4" fill="#c98d4f" stroke="#17324d" stroke-width="2.5"/><path d="M-13 -11v22M0 -11v22M13 -11v22" stroke="#17324d" stroke-width="2"/></g>`;
  }
  // trees and houses on free ground
  const free = (x: number, y: number, r: number): boolean => [...avoid, ...keep].every((p) => dist(p, { x, y }) > r);
  const place = (count: number, r: number, draw: (x: number, y: number) => string, yMin: number): void => {
    let placed = 0;
    for (let tries = 0; tries < 400 && placed < count; tries++) {
      const x = 24 + rng() * (W - 48);
      const y = yMin + rng() * (H - yMin - 20);
      if (!free(x, y, r)) continue;
      s += draw(x, y);
      avoid.push({ x, y });
      placed++;
    }
  };
  place(n * 3 + 4, 52, tree, top.y + 100);
  place(3, 70, (x, y) => house(x - 13, y), H - 230);
  return { svg: s, bridge };
};

const THEMES: Record<string, Scenery> = { adventure };

function node(cx: number, cy: number, state: 'done' | 'cur' | 'lock', label: string, aria: string, act: string, extra: string, digit: string, stars: number, hasStars: boolean): string {
  const fill = state === 'done' ? '#5fa85a' : state === 'cur' ? '#ffc531' : '#cfd8e0';
  let s = `<g class="node ${state === 'cur' ? 'cur' : ''}" role="button" tabindex="0" ${extra} data-act="${act}" aria-label="${esc(aria)}">`;
  if (state === 'cur') s += `<circle class="pulse" cx="${cx}" cy="${cy}" r="30" fill="#ffc531"/>`;
  s += `<circle class="nring" cx="${cx}" cy="${cy}" r="25" fill="${fill}" stroke="#17324d" stroke-width="3.5"/>`;
  if (state === 'done') s += `<path d="M${cx - 10} ${cy} l7 8 l13 -16" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  else if (state === 'lock')
    s += `<rect x="${cx - 9}" y="${cy - 3}" width="18" height="14" rx="3" fill="#8a9bab" stroke="#17324d" stroke-width="2"/><path d="M${cx - 5} ${cy - 3} v-5 a5 5 0 0 1 10 0 v5" fill="none" stroke="#17324d" stroke-width="2.5"/>`;
  else s += digit;
  s += `<text class="nlabel" x="${cx}" y="${cy + 46}">${esc(label)}</text>`;
  if (hasStars) s += `<text class="nstars" x="${cx}" y="${cy + 64}">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</text>`;
  return s + '</g>';
}

export function mapSVG(unit: Unit): string {
  const s = str();
  const total = unit.stations.length + (unit.summit ? 1 : 0);
  const H = TOP + BOTTOM + (total - 1) * STEP;
  const pts: Pt[] = Array.from({ length: total }, (_, i) => ({ x: i % 2 === 0 ? 95 : 265, y: H - BOTTOM - i * STEP }));
  const route: Cubic[] = pts.slice(1).map((p, i) => {
    const a = pts[i];
    const mid = (a.y + p.y) / 2;
    return [a, { x: a.x, y: mid }, { x: p.x, y: mid }, p];
  });
  const rng = seeded(unit.id);
  const { svg: scenery, bridge } = (THEMES[unit.theme] ?? adventure)({ unit, H, pts, route, rng });

  const d = `M${pts[0].x} ${pts[0].y} ` + route.map((c) => `C ${c[1].x} ${c[1].y} ${c[2].x} ${c[2].y} ${c[3].x} ${c[3].y}`).join(' ');
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="${s.ariaMap}">${scenery}`;
  svg += `<path d="${d}" fill="none" stroke="#17324d" stroke-width="20" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff3c4" stroke-width="14" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#17324d" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 9" opacity=".55"/>`;
  svg += bridge;

  const firstOpen = unit.stations.findIndex((st) => !isDone(unit.id, st.id));
  unit.stations.forEach((st, i) => {
    const open = isStationOpen(unit, i);
    const done = isDone(unit.id, st.id);
    const state = done ? 'done' : open ? 'cur' : 'lock';
    const digit = `<text class="ndigit" x="${pts[i].x}" y="${pts[i].y + 1}">${i + 1}</text>`;
    svg += node(pts[i].x, pts[i].y, state, st.name, s.ariaStation(i + 1, st.name, done, !open), 'open', `data-id="${esc(st.id)}"`, digit, starsOf(unit.id, st.id), done);
  });
  let hiker: Pt | null = firstOpen >= 0 ? pts[firstOpen] : null;
  if (unit.summit) {
    const i = total - 1;
    const sm = unit.summit;
    const open = isSummitOpen(unit);
    const done = isDone(unit.id, sm.id);
    const cx = pts[i].x;
    const cy = pts[i].y;
    const flag = `<path d="M${cx - 6} ${cy + 12} V${cy - 12} L${cx + 13} ${cy - 6} L${cx - 6} ${cy}" fill="${done ? '#e8512f' : '#fff'}" stroke="#17324d" stroke-width="2.5" stroke-linejoin="round"/>`;
    svg += node(cx, cy, done ? 'done' : open ? 'cur' : 'lock', sm.name, s.ariaSummit(done, !open), 'summit', '', flag, starsOf(unit.id, sm.id), done);
    if (firstOpen < 0 && !done) hiker = pts[i];
  }
  if (hiker) {
    const hx = hiker.x - (hiker.x > 180 ? -38 : 38);
    const hy = hiker.y - 30;
    svg += `<g class="hiker" pointer-events="none"><g transform="translate(${hx} ${hy})"><ellipse cx="0" cy="36" rx="13" ry="3.5" fill="rgba(23,50,77,.25)"/><rect x="-15" y="16" width="7" height="15" rx="3.5" fill="#ffc531" stroke="#17324d" stroke-width="2.2"/><rect x="-9" y="15" width="18" height="21" rx="7" fill="#e8512f" stroke="#17324d" stroke-width="2.5"/><circle cx="0" cy="8" r="9" fill="#f6d3ad" stroke="#17324d" stroke-width="2.5"/><path d="M-9 7 C-10 -4 10 -4 9 7 C5 2 -5 2 -9 7Z" fill="#6b3b1f" stroke="#17324d" stroke-width="2"/></g></g>`;
  }
  return svg + '</svg>';
}
