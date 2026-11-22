import type { ActivityType } from '../../core/activity';
import { chimeGood, chimeSoft, say } from '../../core/audio';
import { toast } from '../../core/fx';
import { str } from '../../core/i18n';
import { esc, shuffle } from '../../core/util';
import { otherSide, spoken, wordsOf } from './common';

type Status = null | 'wrong' | 'ok' | 'reveal';

export const typing: ActivityType = {
  label: (s) => s.stepType,
  create(def, ctx) {
    const queue = shuffle(wordsOf(def));
    const trLang = ctx.unit.trLang ?? 'he';
    let i = 0;
    let tries = 0;
    let hints = 0;
    let status: Status = null;
    let val = '';

    const input = (): HTMLInputElement | null => document.getElementById('ans') as HTMLInputElement | null;
    const sync = (): void => {
      const el = input();
      if (el) val = el.value;
    };

    function check(): void {
      sync();
      const w = spoken(queue[i]);
      const answer = val.trim().toLowerCase().replace(/\s+/g, ' ');
      if (!answer) return toast(str().typeEmpty);
      if (answer === w.toLowerCase() || answer === queue[i].en.toLowerCase()) {
        status = 'ok';
        chimeGood();
        say(w);
      } else {
        tries++;
        chimeSoft();
        if (tries >= 3) {
          status = 'reveal';
          say(w);
        } else status = 'wrong';
      }
      ctx.rerender();
      if (status === 'wrong') input()?.focus();
    }

    function next(): void {
      i++;
      if (i >= queue.length) return ctx.complete();
      tries = 0;
      hints = 0;
      status = null;
      val = '';
      ctx.rerender(true);
    }

    return {
      render() {
        const s = str();
        const w = queue[i];
        const total = queue.length;
        const target = spoken(w);
        const letters = [...target].filter((c) => c !== ' ').length;
        let shown = 0;
        const boxes = [...target]
          .map((c) => {
            if (c === ' ') return '<span class="bx gapx"></span>';
            shown++;
            if (status === 'ok') return `<span class="bx ok">${esc(c)}</span>`;
            if (status === 'reveal') return `<span class="bx rev">${esc(c)}</span>`;
            if (shown <= hints) return `<span class="bx hint">${esc(c)}</span>`;
            return '<span class="bx"></span>';
          })
          .join('');
        const finished = status === 'ok' || status === 'reveal';
        let fb = '<div class="feedback" aria-live="polite"></div>';
        if (status === 'ok') fb = `<div class="feedback good" aria-live="polite">${s.cheers[(i + target.length) % s.cheers.length]}</div>`;
        else if (status === 'wrong') fb = `<div class="feedback" aria-live="polite">${s.typeWrong}</div>`;
        else if (status === 'reveal') fb = `<div class="feedback" aria-live="polite">${s.typeReveal}</div>`;
        const promptCls = w.tr ? 'tr hword' : 'en defbox';
        return `<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${i}"><i style="width:${(i / total) * 100}%"></i></div>
          <div class="card">
            <p class="instr" style="text-align:center">${s.typeInstr}</p>
            <div class="qprompt"><div class="${promptCls}" lang="${w.tr ? trLang : 'en'}">${esc(otherSide(w))}</div></div>
            <div class="boxes" lang="en" aria-label="${s.typeLetters(letters)}">${boxes}</div>
            ${
              finished
                ? ''
                : `<input id="ans" class="field ${status === 'wrong' ? 'shake' : ''}" type="text" lang="en" dir="ltr" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="${s.typeAria}" value="${esc(val)}">
                   <p class="small" style="margin:8px 0 0;text-align:center">${s.typeKeyboard}</p>`
            }
            ${fb}
          </div>
          ${
            finished
              ? `<button class="btn wide" data-act="next">${i === total - 1 ? s.finish : s.continue}</button>`
              : `<div class="row"><button class="btn wide" data-act="check">${s.check}</button><button class="btn sec wide" data-act="hint" ${hints >= letters - 1 ? 'disabled' : ''}>${s.hint}</button></div>`
          }`;
      },
      mounted() {
        if (status === null) {
          try {
            input()?.focus({ preventScroll: true });
          } catch {
            /* ignore */
          }
        }
      },
      onKey(e) {
        if (e.key === 'Enter' && (e.target as HTMLElement).id === 'ans') {
          e.preventDefault();
          check();
          return true;
        }
        return false;
      },
      act(name) {
        if (name === 'check') check();
        else if (name === 'hint') {
          sync();
          hints++;
          ctx.rerender();
        } else if (name === 'next') next();
      },
    };
  },
};
