import type { ActivityType } from '../../core/activity';
import { str } from '../../core/i18n';
import { fmt, vizHTML } from './render';
import type { LearnCard } from './types';

/** "The way": a few short cards that show the method before practice. No score. Config: { cards: LearnCard[] }. */
export const mathLearn: ActivityType = {
  label: (s) => s.stepLearn,
  create(def, ctx) {
    const cards = def.cards as LearnCard[];
    let k = 0;
    return {
      render() {
        const s = str();
        const c = cards[k];
        const dots = cards.map((_, j) => `<i class="${j < k ? 'past' : j === k ? 'on' : ''}"></i>`).join('');
        const last = k === cards.length - 1;
        return `<div class="card learncard">
            <h3 class="learn-title">${fmt(c.title)}</h3>
            ${vizHTML(c.viz)}
            <ul class="learn">${c.lines.map((l) => `<li>${fmt(l)}</li>`).join('')}</ul>
          </div>
          ${cards.length > 1 ? `<div class="dots">${dots}</div>` : ''}
          <button class="btn wide" data-act="lnext">${last ? s.learnStart : s.learnNext}</button>`;
      },
      act(name) {
        if (name !== 'lnext') return;
        if (k < cards.length - 1) {
          k++;
          ctx.rerender(true);
        } else ctx.complete();
      },
    };
  },
};
