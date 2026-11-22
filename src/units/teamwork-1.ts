import type { Unit, Word } from '../core/types';
import { vocabStation, vocabSummit } from './helpers';

/**
 * Teamwork, Unit 1: vocabulary.
 * Source: "Rotem's Vocabulary Starter Pack", Teamwork | Unit 1 | Page 12 (25 words, five at a time).
 * Sentences are the eight gap-fill sentences from section 5 of that page.
 */

const word = (en: string, def: string, tr: string, trAlt?: string, sentence?: Word['sentence']): Word => ({
  en,
  def,
  tr,
  ...(trAlt ? { trAlt } : {}),
  ...(sentence ? { sentence } : {}),
});

const set1: Word[] = [
  word('activity', 'something you do', 'פעילות', undefined, { text: 'Our class ___ is a game.', wrong: ['bridge', 'danger'] }),
  word('bridge', 'a road or path over water', 'גשר'),
  word('choice', 'something you choose', 'בחירה'),
  word('danger', 'something that can hurt you', 'סכנה'),
  word('journey', 'a trip from one place to another', 'מסע', 'נסיעה'),
];
const set2: Word[] = [
  word('mountain', 'a very high hill', 'הר'),
  word('river', 'a long line of natural water', 'נהר'),
  word('village', 'a small place where people live', 'כפר'),
  word('continue', 'to keep doing something', 'להמשיך'),
  word('depend on', 'to need or trust someone', 'להסתמך על', 'להיות תלוי ב', {
    text: 'I ___ my parents when I need help.',
    wrong: ['mountain', 'village'],
  }),
];
const set3: Word[] = [
  word('fix', 'to make something work again', 'לתקן'),
  word('imagine', 'to make a picture in your mind', 'לדמיין'),
  word('prefer', 'to like one thing more', 'להעדיף'),
  word('realize', 'to begin to understand', 'להבין', 'לקלוט', {
    text: 'Now I ___ that I forgot my book.',
    wrong: ['careful', 'fix'],
  }),
  word('careful', 'trying not to get hurt', 'זהיר'),
];
const set4: Word[] = [
  word('dangerous', 'not safe; can hurt you', 'מסוכן'),
  word('possible', 'can happen or be done', 'אפשרי', undefined, {
    text: 'It is ___ to learn new words.',
    wrong: ['wide', 'dangerous'],
  }),
  word('unusual', 'not normal; different', 'יוצא דופן', undefined, {
    text: 'A pink elephant is very ___.',
    wrong: ['possible', 'usual'],
  }),
  word('usual', 'normal; happening often', 'רגיל'),
  word('wide', 'big from side to side', 'רחב'),
];
const set5: Word[] = [
  word('across', 'from one side to the other', 'מצד אחד לצד השני', undefined, {
    text: 'We walk ___ the street.',
    wrong: ['anybody', 'any'],
  }),
  word('any', 'one or some; it does not matter which', 'איזשהו', 'כל'),
  word('anybody', 'any person', 'מישהו', 'כל אחד'),
  word('directly', 'straight there; without stopping', 'ישירות', undefined, {
    text: 'Please go ___ home. Do not stop.',
    wrong: ['anybody', 'any'],
  }),
  word('next to', 'beside', 'ליד', undefined, { text: 'My bag is ___ my chair.', wrong: ['anybody', 'any'] }),
];

const all = [...set1, ...set2, ...set3, ...set4, ...set5];

export const teamwork1: Unit = {
  id: 'teamwork-1',
  kind: 'vocab',
  lang: 'he',
  trLang: 'he',
  theme: 'adventure',
  title: 'יחידה 1: Teamwork',
  subtitle: 'אוצר מילים: 25 מילים',
  lead: 'בחרי תחנה, אספי מילים והגיעי עד הפסגה.',
  order: 'free',
  stations: [
    vocabStation('s1', 'שער ההתחלה', set1),
    vocabStation('s2', 'עמק הנהר', set2),
    vocabStation('s3', 'סדנת הרעיונות', set3),
    vocabStation('s4', 'השביל המיוחד', set4),
    vocabStation('s5', 'הגשר הגדול', set5),
  ],
  summit: vocabSummit('summit', 'אתגר הפסגה', all),
};
