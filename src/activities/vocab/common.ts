import type { ActivityDef, Word } from '../../core/types';
import { pick } from '../../core/util';

/**
 * Words for an activity. Either `words` (fixed list), or `pool` + `pick` (a random sample each run, used by summit challenges).
 */
export function wordsOf(def: ActivityDef): Word[] {
  const words = def.words as Word[] | undefined;
  if (words) return words;
  const pool = def.pool as Word[];
  const n = (def.pick as number | undefined) ?? pool.length;
  return pick(pool, n);
}

export const poolOf = (def: ActivityDef, words: Word[]): Word[] => (def.pool as Word[] | undefined) ?? words;

/** What the learner sees as the "other side" of a word: the translation if the unit has one, otherwise the meaning in English. */
/** The text to read aloud and to type for a word. */
export const spoken = (w: Word): string => w.typed ?? w.en;

export const otherSide = (w: Word): string => w.tr ?? w.def;
