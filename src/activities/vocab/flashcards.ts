import type { ActivityType } from '../../core/activity';
import { say } from '../../core/audio';
import { SPEAKER } from '../../core/fx';
import { str } from '../../core/i18n';
import { esc } from '../../core/util';
import { wordsOf } from './common';

export const flashcards: ActivityType = {
  label: (s) => s.stepFlash,
  create(def, ctx) {
    const words = wordsOf(def);
    const trLang = ctx.unit.trLang ?? 'he';
    let card = 0;
    let flipped = false;

    return {
      onEnter() {
        say(words[0].en);
      },
      render() {
        const s = str();
        const w = words[card];
        const hasTr = !!w.tr;
        const last = card === words.length - 1;
        const dots = words.map((_, k) => `<i class="${k < card ? 'past' : k === card ? 'on' : ''}"></i>`).join('');
        const hear = `<button class="hear" data-act="hear" data-w="${esc(w.en)}">${SPEAKER}<span>${s.hear}</span></button>`;
        const face = flipped
          ? `<div class="card flashcard back">
              <div class="small">${hasTr ? s.flashBackLabel : ''}</div>
              ${
                hasTr
                  ? `<div class="tr big" lang="${trLang}">${esc(w.tr!)}</div>${w.trAlt ? `<div class="tr alt" lang="${trLang}">${s.alsoSay} ${esc(w.trAlt)}</div>` : ''}`
                  : `<div class="en defbig" lang="en">${esc(w.def)}</div>`
              }
              <div class="en" style="font-size:24px" lang="en">${esc(w.en)}</div>
              ${hear}
            </div>`
          : `<div class="card flashcard">
              <div class="en word" lang="en">${esc(w.en)}</div>
              ${hasTr ? `<div class="en def" lang="en">${esc(w.def)}</div>` : ''}
              ${hear}
            </div>`;
        const instr = flipped ? (hasTr ? s.flashBackInstr : s.flashBackInstrDef) : s.flashInstr;
        return `<p class="instr">${instr}</p>
          ${face}
          <div class="dots" aria-hidden="true">${dots}</div>
          ${
            flipped
              ? `<button class="btn wide" data-act="next">${last ? s.toNextActivity : s.nextWord}</button>`
              : `<button class="btn wide" data-act="flip">${s.flip}</button>`
          }`;
      },
      act(name, d) {
        if (name === 'hear') return say(d.w ?? '', true);
        if (name === 'flip') {
          flipped = true;
          ctx.rerender();
        } else if (name === 'next') {
          if (card >= words.length - 1) return ctx.complete();
          card++;
          flipped = false;
          ctx.rerender(true);
          say(words[card].en);
        }
      },
    };
  },
};
