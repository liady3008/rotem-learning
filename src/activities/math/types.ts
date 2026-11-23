/**
 * Math practice content.
 * Text fields use a small markup: anything inside {braces} is math. It is shown left-to-right inside the
 * Hebrew sentence, in the math font, and a '-' inside it becomes a real minus sign.
 */

export interface GridPoint {
  x: number;
  y: number;
  label: string;
  /** Dashed lines from the point down to the x axis and across to the y axis. */
  guide?: boolean;
}

/** First-quadrant coordinate grid from 0 to `size` on both axes. */
export interface GridViz {
  kind: 'grid';
  size: number;
  points?: GridPoint[];
  /** Segments as [x1, y1, x2, y2]. */
  segs?: [number, number, number, number][];
  /** A filled polygon (rectangle, triangle...), corners in order. */
  poly?: [number, number][];
}

/** Number line with every whole number from min to max. */
export interface LineViz {
  kind: 'line';
  min: number;
  max: number;
  points?: { v: number; label: string }[];
  /** Arrow for a move: start at `from`, move `by` steps (positive = right). */
  jump?: { from: number; by: number };
}

/** An angle drawing. Degrees are measured counter-clockwise from the ray pointing right. */
export interface AngleViz {
  kind: 'angle';
  vertex: string;
  rays: { deg: number; label: string }[];
  arcs?: { from: number; to: number; text?: string }[];
  /** Small square that marks a right angle between these two directions. */
  right?: [number, number];
}

export type Viz = GridViz | LineViz | AngleViz;

interface PartBase {
  /** The question for this step. Optional when the problem has one step and `q` already asks it. */
  ask?: string;
  hint: string;
}
export interface ChoicePart extends PartBase {
  choices: string[];
  correct: number;
}
export interface NumPart extends PartBase {
  num: number;
  /** Shown after the number: '°' sticks to it, any other text follows it (for example 'יחידות'). */
  unit?: string;
}
export interface PlotPart extends PartBase {
  /** The learner taps this point on the problem's grid. */
  plot: { x: number; y: number };
}
export type Part = ChoicePart | NumPart | PlotPart;

export interface Problem {
  q: string;
  viz?: Viz;
  /** One part = a plain exercise. Several parts = a guided exercise, solved step by step. */
  parts: Part[];
  /** The way to the answer, shown after solving (and after a second wrong try). */
  way: string[];
}

export interface LearnCard {
  title: string;
  lines: string[];
  viz?: Viz;
}

export const isChoice = (p: Part): p is ChoicePart => 'choices' in p;
export const isNum = (p: Part): p is NumPart => 'num' in p;
export const isPlot = (p: Part): p is PlotPart => 'plot' in p;
