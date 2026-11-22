import type { Lang } from './types';

/**
 * Interface text for each language. A unit picks its language (Unit.lang);
 * the home screen uses APP_LANG. Add a key here, then TypeScript forces you to add it to every language.
 */
const he = {
  brand: 'המסע של רותם',
  homeLead: 'בחרי יחידה כדי להמשיך במסע.',
  unitsHeading: 'היחידות שלי',
  unitProgress: (done: number, total: number) => `הושלמו ${done} מתוך ${total} תחנות`,
  start: 'להתחלה',
  resume: 'להמשך',
  toUnits: 'ליחידות',
  toMap: 'למפה',
  stars: 'כוכבים',
  soundOn: 'קול פועל',
  soundOff: 'קול כבוי',
  summitName: 'אתגר הפסגה',
  summitLocked: 'אתגר הפסגה ייפתח אחרי שתסיימי את כל התחנות.',
  stationLocked: 'התחנה הזאת תיפתח אחרי שתסיימי את התחנה הקודמת.',
  ariaMap: 'מפת המסע',
  ariaStation: (n: number, name: string, done: boolean, locked: boolean) =>
    `תחנה ${n}: ${name}${done ? ', הושלמה' : locked ? ', נעולה' : ''}`,
  ariaSummit: (done: boolean, locked: boolean) => `אתגר הפסגה${done ? ', הושלם' : locked ? ', נעול' : ''}`,
  stationTitle: (n: number, name: string) => `תחנה ${n}: ${name}`,
  ariaSteps: 'שלבי התחנה',

  bagHeading: 'תיק המילים',
  bagCount: (n: number, total: number) => `נאספו ${n} מתוך ${total}`,
  bagHint: 'נגעי במילה שנאספה כדי לשמוע אותה ולראות מה היא אומרת.',
  bagEmpty: 'מילה שעוד לא נאספה',
  sheetLabel: 'פרטי המילה',
  close: 'סגירה',
  alsoSay: 'אפשר גם:',

  parentReset: 'להורים: איפוס היחידה',
  parentResetConfirm: 'לחצי שוב כדי לאשר איפוס',
  parentResetDone: 'ההתקדמות של היחידה אופסה.',

  stepFlash: 'הכרות',
  stepMatch: 'זוגות',
  stepQuiz: 'חידון',
  stepType: 'כתיבה',

  hear: 'הקשיבי',
  flashInstr: 'קראי את המילה ואת ההסבר, נסי לנחש מה זה, ואז הפכי את הכרטיס.',
  flashBackInstr: 'כך אומרים את זה בעברית.',
  flashBackInstrDef: 'זה ההסבר של המילה.',
  flashBackLabel: 'בעברית',
  flip: 'הפכי את הכרטיס',
  nextWord: 'המילה הבאה',
  toNextActivity: 'להמשך',

  matchInstr: 'חברי כל מילה באנגלית לפירוש שלה. נגעי במילה אחת ואחר כך בפירוש.',
  matchAllDone: 'כל הזוגות נמצאו! עבודה יפה.',

  qEn2Tr: 'מה הפירוש של המילה בעברית?',
  qDef2En: 'איזו מילה מתאימה להסבר?',
  qTr2En: 'איך אומרים את זה באנגלית?',
  qSent: 'השלימי את המשפט.',
  cheers: ['כל הכבוד!', 'מצוין!', 'יפה מאוד!', 'בדיוק כך!', 'אלופה!', 'נהדר!'],
  wrongMsg: 'לא נורא, כך לומדים. התשובה הנכונה מסומנת בירוק, ונפגוש אותה שוב בהמשך.',
  continue: 'המשיכי',

  typeInstr: 'כתבי את המילה באנגלית.',
  typeKeyboard: 'כדאי להחליף את המקלדת לאנגלית.',
  typeAria: 'התשובה באנגלית',
  typeLetters: (n: number) => `מילה בת ${n} אותיות`,
  check: 'בדיקה',
  hint: 'רמז',
  typeEmpty: 'כתבי את המילה ואז לחצי על בדיקה',
  typeWrong: 'כמעט! בדקי את האותיות ונסי שוב.',
  typeReveal: 'זו המילה. הסתכלי עליה ואמרי אותה בקול.',
  finish: 'לסיום',

  doneTitle: 'התחנה הושלמה!',
  summitDoneTitle: 'הגעת לפסגה, רותם!',
  doneMsg3: 'מושלם! כמעט הכול נכון כבר בניסיון הראשון.',
  doneMsg2: 'יפה מאוד! עוד קצת תרגול וזה יהיה מושלם.',
  doneMsg1: 'סיימת את התחנה! אפשר לחזור ולנסות לאסוף עוד כוכבים.',
  starsAria: (n: number) => `${n} כוכבים מתוך 3`,
  firstTry: (n: number, total: number) => `ענית נכון בניסיון הראשון על ${n} שאלות מתוך ${total}.`,
  wordsCollected: 'המילים האלה נכנסו לתיק שלך:',
  nextStation: 'לתחנה הבאה',
  toSummit: 'לאתגר הפסגה',
  backToMap: 'חזרה למפה',
};

const en: typeof he = {
  brand: "Rotem's Journey",
  homeLead: 'Pick a unit to keep going on your journey.',
  unitsHeading: 'My units',
  unitProgress: (done, total) => `${done} of ${total} stations done`,
  start: 'Start',
  resume: 'Continue',
  toUnits: 'Units',
  toMap: 'Map',
  stars: 'Stars',
  soundOn: 'Sound on',
  soundOff: 'Sound off',
  summitName: 'Summit challenge',
  summitLocked: 'The summit challenge opens when you finish every station.',
  stationLocked: 'This station opens when you finish the one before it.',
  ariaMap: 'Journey map',
  ariaStation: (n, name, done, locked) => `Station ${n}: ${name}${done ? ', done' : locked ? ', locked' : ''}`,
  ariaSummit: (done, locked) => `Summit challenge${done ? ', done' : locked ? ', locked' : ''}`,
  stationTitle: (n, name) => `Station ${n}: ${name}`,
  ariaSteps: 'Station steps',

  bagHeading: 'Word bag',
  bagCount: (n, total) => `${n} of ${total} collected`,
  bagHint: 'Tap a collected word to hear it and see what it means.',
  bagEmpty: 'A word not collected yet',
  sheetLabel: 'Word details',
  close: 'Close',
  alsoSay: 'Also:',

  parentReset: 'For parents: reset this unit',
  parentResetConfirm: 'Tap again to confirm the reset',
  parentResetDone: 'This unit was reset.',

  stepFlash: 'Meet',
  stepMatch: 'Match',
  stepQuiz: 'Quiz',
  stepType: 'Write',

  hear: 'Listen',
  flashInstr: 'Read the word and its meaning, try to guess it, then flip the card.',
  flashBackInstr: 'This is how you say it in Hebrew.',
  flashBackInstrDef: 'This is what the word means.',
  flashBackLabel: 'In Hebrew',
  flip: 'Flip the card',
  nextWord: 'Next word',
  toNextActivity: 'Continue',

  matchInstr: 'Match each English word to its meaning. Tap a word, then tap its meaning.',
  matchAllDone: 'All pairs found! Nice work.',

  qEn2Tr: 'What does the word mean in Hebrew?',
  qDef2En: 'Which word fits the meaning?',
  qTr2En: 'How do you say this in English?',
  qSent: 'Complete the sentence.',
  cheers: ['Well done!', 'Great!', 'Very good!', 'Exactly!', 'Champion!', 'Excellent!'],
  wrongMsg: "That's okay, this is how we learn. The right answer is green, and you will see it again later.",
  continue: 'Continue',

  typeInstr: 'Write the word in English.',
  typeKeyboard: 'Make sure your keyboard is set to English.',
  typeAria: 'Your answer in English',
  typeLetters: (n) => `A word with ${n} letters`,
  check: 'Check',
  hint: 'Hint',
  typeEmpty: 'Write the word, then press Check',
  typeWrong: 'Almost! Check the letters and try again.',
  typeReveal: 'This is the word. Look at it and say it out loud.',
  finish: 'Finish',

  doneTitle: 'Station complete!',
  summitDoneTitle: 'You reached the summit, Rotem!',
  doneMsg3: 'Perfect! Almost everything was right on the first try.',
  doneMsg2: 'Very good! A little more practice and it will be perfect.',
  doneMsg1: 'You finished the station! Come back to collect more stars.',
  starsAria: (n) => `${n} stars out of 3`,
  firstTry: (n, total) => `You got ${n} of ${total} questions right on the first try.`,
  wordsCollected: 'These words are now in your bag:',
  nextStation: 'Next station',
  toSummit: 'To the summit challenge',
  backToMap: 'Back to the map',
};

export type Strings = typeof he;
export const STRINGS: Record<Lang, Strings> = { he, en };

/** Language of the home screen (the list of units). */
export const APP_LANG: Lang = 'he';

let current: Lang = APP_LANG;
let overrides: Partial<Strings> = {};

/** Per-unit wording that replaces the language defaults. Pass {} for none. */
export function setOverrides(o: Partial<Strings> | undefined): void {
  overrides = o ?? {};
}

export function setLang(l: Lang): void {
  current = l;
  document.documentElement.lang = l;
  document.documentElement.dir = l === 'he' ? 'rtl' : 'ltr';
}

export const str = (): Strings => ({ ...STRINGS[current], ...overrides });
export const currentLang = (): Lang => current;
