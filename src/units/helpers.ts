import type { Station, Word } from '../core/types';

/** The standard vocabulary station: meet the words, match, quiz, write. */
export function vocabStation(id: string, name: string, words: Word[]): Station {
  return {
    id,
    name,
    words,
    activities: [
      { type: 'flashcards', words },
      { type: 'match', words },
      { type: 'quiz', words, pool: words },
      { type: 'typing', words },
    ],
  };
}

/** Final challenge over all the unit's words: a fresh random sample of questions, then a few words to write. */
export function vocabSummit(id: string, name: string, all: Word[]): Station {
  return {
    id,
    name,
    activities: [
      { type: 'quiz', pool: all, pick: 10, perWord: 1 },
      { type: 'typing', pool: all, pick: 5 },
    ],
  };
}
