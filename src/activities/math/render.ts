import { esc } from '../../core/util';
import type { AngleViz, GridViz, LineViz, Viz } from './types';

/** Escape text and turn {math} into a left-to-right math span with real minus signs. */
export function fmt(s: string): string {
  return esc(s).replace(/\{([^{}]+)\}/g, (_, m: string) => `<span class="m">${m.replace(/-/g, '−')}</span>`);
}

/** A number as it should look on screen (real minus sign). */
export const numText = (n: number): string => (n < 0 ? '−' + Math.abs(n) : String(n));

export interface PlotState {
  /** Grid points become tap targets. */
  tappable: boolean;
  marks: { x: number; y: number; ok: boolean }[];
}

const INK = '#17324d';

function gridSVG(v: GridViz, plot?: PlotState): string {
  const W = 320;
  const L = 34;
  const B = 30;
  const T = 22;
  const R = 18;
  const n = v.size;
  const cell = (W - L - R) / n;
  const H = T + n * cell + B;
  const X = (x: number): number => L + x * cell;
  const Y = (y: number): number => T + (n - y) * cell;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="מערכת צירים">`;
  s += `<rect x="${X(0)}" y="${Y(n)}" width="${n * cell}" height="${n * cell}" fill="#ffffff"/>`;
  for (let i = 1; i <= n; i++) {
    s += `<line class="gl" x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(n)}"/><line class="gl" x1="${X(0)}" y1="${Y(i)}" x2="${X(n)}" y2="${Y(i)}"/>`;
  }
  if (v.poly) s += `<polygon points="${v.poly.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')}" fill="rgba(255,197,49,.45)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  // axes with arrows
  s += `<line class="ax" x1="${X(0)}" y1="${Y(0)}" x2="${X(n) + 12}" y2="${Y(0)}"/><line class="ax" x1="${X(0)}" y1="${Y(0)}" x2="${X(0)}" y2="${Y(n) - 10}"/>`;
  s += `<path d="M${X(n) + 14} ${Y(0)} l-8 -5 v10z M${X(0)} ${Y(n) - 12} l-5 8 h10z" fill="${INK}"/>`;
  s += `<text class="axn" x="${X(n) + 8}" y="${Y(0) + 20}">x</text><text class="axn" x="${X(0) + 10}" y="${Y(n) - 4}">y</text>`;
  for (let i = 0; i <= n; i++) {
    s += `<text class="tk" x="${X(i)}" y="${Y(0) + 18}">${i}</text>`;
    if (i > 0) s += `<text class="tk" x="${X(0) - 12}" y="${Y(i) + 4}">${i}</text>`;
  }
  for (const [x1, y1, x2, y2] of v.segs ?? []) s += `<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}" stroke="#e8512f" stroke-width="4" stroke-linecap="round"/>`;
  for (const p of v.points ?? []) {
    if (p.guide) s += `<path d="M${X(p.x)} ${Y(p.y)} V${Y(0)} M${X(p.x)} ${Y(p.y)} H${X(0)}" stroke="#e8512f" stroke-width="2" stroke-dasharray="5 5" fill="none"/>`;
  }
  for (const p of v.points ?? []) {
    const lx = p.x >= n - 0.5 ? X(p.x) - 14 : X(p.x) + 10;
    const ly = p.y >= n - 0.5 ? Y(p.y) + 20 : Y(p.y) - 8;
    s += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="6" fill="#e8512f" stroke="${INK}" stroke-width="2"/><text class="pl" x="${lx}" y="${ly}">${esc(p.label)}</text>`;
  }
  for (const m of plot?.marks ?? []) {
    s += `<circle cx="${X(m.x)}" cy="${Y(m.y)}" r="8" fill="${m.ok ? '#5fa85a' : '#ffe3da'}" stroke="${m.ok ? INK : '#e8512f'}" stroke-width="3"/>`;
    if (!m.ok) s += `<text class="tk wrongtag" x="${X(m.x)}" y="${Y(m.y) - 12}">(${m.x},${m.y})</text>`;
  }
  if (plot?.tappable) {
    for (let x = 0; x <= n; x++)
      for (let y = 0; y <= n; y++)
        s += `<circle class="ptap" cx="${X(x)}" cy="${Y(y)}" r="${(cell / 2).toFixed(1)}" data-act="plot" data-x="${x}" data-y="${y}"><title>(${x},${y})</title></circle>`;
  }
  return s + '</svg>';
}

function lineSVG(v: LineViz): string {
  const W = 340;
  const H = v.jump ? 96 : 72;
  const base = H - 30;
  const span = v.max - v.min;
  const X = (n: number): number => 18 + ((n - v.min) * (W - 36)) / span;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="ציר המספרים">`;
  s += `<line class="ax" x1="6" y1="${base}" x2="${W - 6}" y2="${base}"/><path d="M${W - 2} ${base} l-9 -5 v10z M2 ${base} l9 -5 v10z" fill="${INK}"/>`;
  for (let i = v.min; i <= v.max; i++) {
    const zero = i === 0;
    s += `<line x1="${X(i)}" y1="${base - (zero ? 9 : 6)}" x2="${X(i)}" y2="${base + (zero ? 9 : 6)}" stroke="${INK}" stroke-width="${zero ? 3 : 2}"/>`;
    s += `<text class="tk${zero ? ' zero' : ''}" x="${X(i)}" y="${base + 24}">${numText(i)}</text>`;
  }
  if (v.jump) {
    const a = X(v.jump.from);
    const b = X(v.jump.from + v.jump.by);
    const top = base - 40;
    s += `<path d="M${a} ${base - 8} C ${a} ${top}, ${b} ${top}, ${b} ${base - 10}" fill="none" stroke="#e8512f" stroke-width="3"/><path d="M${b} ${base - 8} l-5 -9 h10z" fill="#e8512f"/>`;
  }
  for (const p of v.points ?? []) {
    s += `<circle cx="${X(p.v)}" cy="${base}" r="7" fill="#e8512f" stroke="${INK}" stroke-width="2"/>`;
    if (p.label) s += `<text class="pl" x="${X(p.v)}" y="${base - 14}" text-anchor="middle">${esc(p.label)}</text>`;
  }
  return s + '</svg>';
}

function angleSVG(v: AngleViz): string {
  const W = 340;
  const degs = v.rays.map((r) => r.deg);
  const wide = degs.some((d) => d > 120);
  const H = 210;
  const cx = wide ? W / 2 : 120;
  const cy = 172;
  const len = wide ? 140 : 130;
  const P = (deg: number, r: number): [number, number] => [cx + r * Math.cos((deg * Math.PI) / 180), cy - r * Math.sin((deg * Math.PI) / 180)];
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="זווית">`;
  (v.arcs ?? []).forEach((a, k) => {
    const r = 42 + k * 16 + (a.to - a.from < 30 ? 12 : 0);
    const [x1, y1] = P(a.from, r);
    const [x2, y2] = P(a.to, r);
    const large = a.to - a.from > 180 ? 1 : 0;
    s += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${large} 0 ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="#e8512f" stroke-width="2.5"/>`;
    if (a.text) {
      const [tx, ty] = P((a.from + a.to) / 2, r + 20);
      s += `<text class="deg" x="${tx.toFixed(1)}" y="${(ty + 5).toFixed(1)}">${esc(a.text)}</text>`;
    }
  });
  if (v.right) {
    const q = 18;
    const [ax, ay] = P(v.right[0], q);
    const [bx, by] = P(v.right[1], q);
    s += `<path d="M${ax.toFixed(1)} ${ay.toFixed(1)} L${(ax + bx - cx).toFixed(1)} ${(ay + by - cy).toFixed(1)} L${bx.toFixed(1)} ${by.toFixed(1)}" fill="none" stroke="#e8512f" stroke-width="2.5"/>`;
  }
  for (const r of v.rays) {
    const [x, y] = P(r.deg, len);
    s += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="${INK}"/>`;
    const [lx, ly] = P(r.deg, len + 16);
    s += `<text class="pl" x="${lx.toFixed(1)}" y="${(ly + 6).toFixed(1)}" text-anchor="middle">${esc(r.label)}</text>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="5" fill="${INK}"/><text class="pl" x="${cx}" y="${cy + 28}" text-anchor="middle">${esc(v.vertex)}</text>`;
  return s + '</svg>';
}

export function vizHTML(v: Viz | undefined, plot?: PlotState): string {
  if (!v) return '';
  const svg = v.kind === 'grid' ? gridSVG(v, plot) : v.kind === 'line' ? lineSVG(v) : angleSVG(v);
  return `<div class="viz viz-${v.kind}">${svg}</div>`;
}

/** The method box. */
export const wayHTML = (title: string, lines: string[]): string =>
  `<div class="way"><h3>${title}</h3><ol>${lines.map((l) => `<li>${fmt(l)}</li>`).join('')}</ol></div>`;
