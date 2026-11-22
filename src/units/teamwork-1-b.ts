import type { Unit, Word } from '../core/types';
import { vocabStation, vocabSummit } from './helpers';

/**
 * Teamwork, Unit 1, part B: vocabulary.
 * Source: "Rotem's Vocabulary" Teamwork | Unit 1 | Page 20 (27 words, part 1 has 14 and part 2 has 13).
 * The 27 words keep the order of the page and are split 5, 5, 5, 4, 4, 4.
 * Sentences are the 14 gap-fill sentences from sections 2 and 3 of that page; the wrong options are
 * the page's own where it gave one, plus a second one chosen so that it clearly does not fit.
 */

const word = (en: string, def: string, tr: string, extra: Partial<Word> = {}): Word => ({ en, def, tr, ...extra });
const gap = (text: string, wrong: [string, string]): Word['sentence'] => ({ text, wrong });

const set1: Word[] = [
  word('history', 'things that happened in the past', 'היסטוריה'),
  word('bowl', 'a dish for soup or food', 'קערה', { sentence: gap('We eat soup from a ___.', ['job', 'nation']) }),
  word('guide', 'a person who shows you places', 'מדריך', { sentence: gap('A person who shows tourists places is a ___.', ['meal', 'bowl']) }),
  word('lemon', 'a sour yellow fruit', 'לימון', { sentence: gap('A yellow sour fruit is a ___.', ['nation', 'job']) }),
  word('meal', 'food you eat at one time', 'ארוחה', { sentence: gap('I eat my lunch. It is my favorite ___.', ['follow', 'receive']) }),
];
const set2: Word[] = [
  word('world', 'the Earth and all its people', 'עולם'),
  word('oil', 'a liquid used for cooking', 'שמן'),
  word('nation', 'people of one country', 'אומה'),
  word('job', 'work you do for money', 'עבודה', { sentence: gap('My teacher gives me a new ___.', ['oil', 'nation']) }),
  word('amaze', 'to make someone very surprised', 'להדהים'),
];
const set3: Word[] = [
  word('salt', 'a white thing we put on food', 'מלח', { sentence: gap('I put a little ___.', ['history', 'nation']) }),
  word('pepper', 'a spice that makes food hot', 'פלפל'),
  word('fall (fell) in love', 'to start loving someone', 'להתאהב', { typed: 'fall in love' }),
  word('feed', 'to give food to someone', 'להאכיל'),
  word('follow', 'to go after someone', 'ללכת בעקבות', { sentence: gap('Please ___ me to the classroom.', ['meal', 'main']) }),
];
const set4: Word[] = [
  word('open', 'to make something not closed', 'לפתוח', { sentence: gap('Please ___ the door.', ['feed', 'amaze']) }),
  word('receive', 'to get something', 'לקבל', { sentence: gap('I ___ a gift on my birthday.', ['main', 'warm']) }),
  word('serve', 'to give food to someone', 'להגיש', { trAlt: 'לשרת' }),
  word('welcome', 'to say hello to a guest', 'לקבל בברכה', { sentence: gap('We ___ our new student to class.', ['meal', 'main']) }),
];
const set5: Word[] = [
  word('amazing', 'very good or surprising', 'מדהים', { sentence: gap('The food is ___.', ['certain', 'according to']) }),
  word('certain', 'sure about something', 'בטוח'),
  word('lovely', 'very nice', 'נחמד', { trAlt: 'נעים' }),
  word('main', 'the most important', 'עיקרי', { sentence: gap('The ___ idea is very important.', ['follow', 'receive']) }),
];
const set6: Word[] = [
  word('typical', 'normal for a person or place', 'טיפוסי'),
  word('warm', 'kind and friendly', 'לבבי', { trAlt: 'חם', sentence: gap('My grandmother is kind and ___.', ['follow', 'meal']) }),
  word('according to', 'as someone or something says', 'לפי'),
  word('shake hands', 'to hold hands to say hello', 'ללחוץ ידיים', { sentence: gap('We ___ when we meet.', ['fall in love', 'feed']) }),
];

const all = [...set1, ...set2, ...set3, ...set4, ...set5, ...set6];

export const teamwork1b: Unit = {
  id: 'teamwork-1-b',
  kind: 'vocab',
  lang: 'he',
  trLang: 'he',
  theme: 'tiktok-restaurant',
  title: "יחידה 1: Teamwork, חלק ב'",
  subtitle: 'אוצר מילים: 27 מילים',
  lead: 'בחרי תחנה, אספי מילים והגיעי לאתגר השף.',
  order: 'free',
  text: {
    summitName: 'אתגר השף',
    summitLocked: 'אתגר השף ייפתח אחרי שתסיימי את כל התחנות.',
    summitDoneTitle: 'השף מרוצה, רותם!',
    toSummit: 'לאתגר השף',
    ariaSummit: (done, locked) => `אתגר השף${done ? ', הושלם' : locked ? ', נעול' : ''}`,
  },
  stations: [
    vocabStation('s1', 'קבלת פנים', set1),
    vocabStation('s2', 'התפריט', set2),
    vocabStation('s3', 'המטבח', set3),
    vocabStation('s4', 'השירות', set4),
    vocabStation('s5', 'המנה העיקרית', set5),
    vocabStation('s6', 'קינוח', set6),
  ],
  summit: vocabSummit('summit', 'אתגר השף', all),
};
