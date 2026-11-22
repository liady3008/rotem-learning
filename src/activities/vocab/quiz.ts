import type { ActivityType } from '../../core/activity';
import { chimeGood, chimeSoft, say } from '../../core/audio';
import { SPEAKER } from '../../core/fx';
import { str } from '../../core/i18n';
import type { Word } from '../../core/types';
import { esc, pick, shuffle } from '../../core/util';
import { poolOf, wordsOf } from './common';

type QType = 'en2tr' | 'def2en' | 'tr2en' | 'sent';

interface Opt {
  label: string;
  correct: boolean;
  en: boolean;
}
interface Item {
  type: QType;
  w: Word;
  pool: Word[];
  opts: Opt[];
  retry: boolean;
}

function makeItem(type: QType, w: Word, pool: Word[], retry = false): Item {
  let opts: Opt[];
  if (type === 'sent') {
    opts = [{ label: w.en, correct: true, en: true }, ...w.sentence!.wrong.map((d) => ({ label: d, correct: false, en: true }))];
  } else if (type === 'en2tr') {
    const ds = pick(pool.filter((x) => x.tr && x.tr !== w.tr), 2, [w]);
    opts = [{ label: w.tr!, correct: true, en: false }, ...ds.map((d) => ({ label: d.tr!, correct: false, en: false }))];
  } else {
    const ds = pick(pool, 2, [w]);
    opts = [{ label: w.en, correct: true, en: true }, ...ds.map((d) => ({ label: d.en, correct: false, en: true }))];
  }
  return { type, w, pool, opts: shuffle(opts), retry };
}

/** Which question types a word can support. */
function available(w: Word): QType[] {
  const t: QType[] = [];
  if (w.tr) t.push('en2tr');
  t.push('def2en');
  if (w.tr) t.push('tr2en');
  return t;
}

/** About two questions per word, a sentence question where the word has one. */
function build(words: Word[], pool: Word[], perWord: number): Item[] {
  let items: Item[] = [];
  words.forEach((w, i) => {
    const av = available(w);
    for (let k = 0; k < perWord; k++) {
      const useSentence = !!w.sentence && (perWord > 1 ? k === perWord - 1 : Math.random() < 0.5);
      items.push(makeItem(useSentence ? 'sent' : av[(i + k) % av.length], w, pool));
    }
  });
  for (let tries = 0; tries < 30; tries++) {
    items = shuffle(items);
    if (items.every((it, k) => k === 0 || it.w !== items[k - 1].w)) break;
  }
  return items;
}

export const quiz: ActivityType = {
  label: (s) => s.stepQuiz,
  create(def, ctx) {
    const words = wordsOf(def);
    const pool = poolOf(def, words);
    const trLang = ctx.unit.trLang ?? 'he';
    const queue = build(words, pool, (def.perWord as number | undefined) ?? 2);
    const total = queue.length;
    let i = 0;
    let first = 0;
    let doneCount = 0;
    let picked: number | null = null;
    let token = 0;

    function next(): void {
      token++;
      picked = null;
      i++;
      if (i >= queue.length) return ctx.complete({ first, total });
      ctx.rerender(true);
      if (queue[i].type === 'en2tr') say(queue[i].w.en);
    }

    function answer(k: number): void {
      if (picked !== null) return;
      const it = queue[i];
      picked = k;
      doneCount++;
      if (it.opts[k].correct) {
        if (!it.retry) first++;
        chimeGood();
        say(it.w.en);
        const t = ++token;
        setTimeout(() => {
          if (ctx.active() && token === t) next();
        }, 1500);
      } else {
        chimeSoft();
        queue.push(makeItem(it.type, it.w, it.pool, true));
      }
      ctx.rerender();
    }

    return {
      onEnter() {
        if (queue[0]?.type === 'en2tr') say(queue[0].w.en);
      },
      render() {
        const s = str();
        const it = queue[i];
        const remaining = queue.length - i;
        const pct = Math.round((doneCount / (doneCount + remaining)) * 100);
        let instr: string;
        let prompt: string;
        if (it.type === 'en2tr') {
          instr = s.qEn2Tr;
          prompt = `<div class="en word" lang="en">${esc(it.w.en)}</div><button class="hear" data-act="hear" data-w="${esc(it.w.en)}">${SPEAKER}<span>${s.hear}</span></button>`;
        } else if (it.type === 'def2en') {
          instr = s.qDef2En;
          prompt = `<div class="defbox" lang="en">${esc(it.w.def)}</div>`;
        } else if (it.type === 'tr2en') {
          instr = s.qTr2En;
          prompt = `<div class="tr hword" lang="${trLang}">${esc(it.w.tr!)}</div>`;
        } else {
          instr = s.qSent;
          prompt = `<div class="sent" lang="en">${esc(it.w.sentence!.text).replace('___', '<span class="gap"></span>')}</div>`;
        }
        const opts = it.opts
          .map((o, k) => {
            const cls = ['opt', o.en ? 'en' : 'tr'];
            if (picked !== null) {
              if (o.correct) cls.push('good');
              else if (picked === k) cls.push('bad');
              else cls.push('dim');
            }
            return `<button class="${cls.join(' ')}" data-act="ans" data-k="${k}" lang="${o.en ? 'en' : trLang}" ${picked !== null ? 'disabled' : ''}>${esc(o.label)}</button>`;
          })
          .join('');
        let fb = '<div class="feedback" aria-live="polite"></div>';
        if (picked !== null) {
          fb = it.opts[picked].correct
            ? `<div class="feedback good" aria-live="polite">${s.cheers[(doneCount + it.w.en.length) % s.cheers.length]}</div>`
            : `<div class="feedback bad" aria-live="polite">${s.wrongMsg}</div>`;
        }
        return `<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div>
          <div class="card">
            <p class="instr" style="text-align:center">${instr}</p>
            <div class="qprompt">${prompt}</div>
            <div class="opts">${opts}</div>
            ${fb}
          </div>
          ${picked !== null ? `<button class="btn wide" data-act="next">${s.continue}</button>` : ''}`;
      },
      act(name, d) {
        if (name === 'hear') say(d.w ?? '', true);
        else if (name === 'ans') answer(Number(d.k));
        else if (name === 'next') next();
      },
    };
  },
};
