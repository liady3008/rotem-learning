import type { ActivityType } from '../../core/activity';
import { chimeGood, chimeSoft, say } from '../../core/audio';
import { str } from '../../core/i18n';
import { esc, shuffle } from '../../core/util';
import { otherSide, wordsOf } from './common';

export const match: ActivityType = {
  label: (s) => s.stepMatch,
  create(def, ctx) {
    const words = wordsOf(def);
    const trLang = ctx.unit.trLang ?? 'he';
    const left = shuffle(words.map((w) => w.en));
    const right = shuffle(words.map((w) => w.en));
    const byEn = new Map(words.map((w) => [w.en, w]));
    const done = new Set<string>();
    let sel: { side: 'l' | 'r'; w: string } | null = null;
    let flash: { l: string; r: string } | null = null;

    function tap(side: 'l' | 'r', w: string): void {
      if (done.has(w) || flash) return;
      if (!sel || sel.side === side) {
        sel = { side, w };
        if (side === 'l') say(w);
        ctx.rerender();
        return;
      }
      const a = sel.side === 'l' ? sel.w : w;
      const b = sel.side === 'l' ? w : sel.w;
      sel = null;
      if (a === b) {
        done.add(a);
        chimeGood();
        say(a);
      } else {
        chimeSoft();
        const f = { l: a, r: b };
        flash = f;
        setTimeout(() => {
          if (ctx.active() && flash === f) {
            flash = null;
            ctx.rerender();
          }
        }, 520);
      }
      ctx.rerender();
    }

    return {
      render() {
        const s = str();
        const n = words.length;
        const complete = done.size === n;
        const col = (items: string[], side: 'l' | 'r') =>
          items
            .map((w) => {
              const cls = ['mcard', side === 'l' ? 'en' : 'tr'];
              if (done.has(w)) cls.push('ok');
              else if (sel && sel.side === side && sel.w === w) cls.push('sel');
              if (flash && flash[side] === w) cls.push('shake');
              const label = side === 'l' ? w : otherSide(byEn.get(w)!);
              const lang = side === 'l' ? 'en' : byEn.get(w)!.tr ? trLang : 'en';
              return `<button class="${cls.join(' ')}" data-act="m" data-side="${side}" data-w="${esc(w)}" lang="${lang}" ${done.has(w) ? 'disabled' : ''}>${esc(label)}</button>`;
            })
            .join('');
        return `<p class="instr">${s.matchInstr}</p>
          <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${done.size}"><i style="width:${(done.size / n) * 100}%"></i></div>
          <div class="match"><div class="col">${col(right, 'r')}</div><div class="col">${col(left, 'l')}</div></div>
          <div class="feedback ${complete ? 'good' : ''}" aria-live="polite">${complete ? s.matchAllDone : ''}</div>
          ${complete ? `<button class="btn wide" data-act="next">${s.toNextActivity}</button>` : ''}`;
      },
      act(name, d) {
        if (name === 'm') tap(d.side as 'l' | 'r', d.w ?? '');
        else if (name === 'next') ctx.complete();
      },
    };
  },
};
