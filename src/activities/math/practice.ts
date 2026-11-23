import type { ActivityType } from '../../core/activity';
import { chimeGood, chimeSoft } from '../../core/audio';
import { str } from '../../core/i18n';
import { fmt, numText, vizHTML, wayHTML } from './render';
import type { Part, Problem } from './types';
import { isChoice, isNum, isPlot } from './types';

/** Longest answer the keypad accepts (digits only). */
const MAX_DIGITS = 4;

/** How an answered step is shown above the next step. */
export function answerText(p: Part): string {
  if (isChoice(p)) return fmt(p.choices[p.correct]);
  if (isNum(p)) {
    if (p.unit === '°') return `<span class="m">${numText(p.num)}°</span>`;
    return `<span class="m">${numText(p.num)}</span>${p.unit ? ` ${fmt(p.unit)}` : ''}`;
  }
  return `<span class="m">(${p.plot.x},${p.plot.y})</span>`;
}

/**
 * Math practice. Config: { problems: Problem[] }.
 * Each problem is solved part by part. A wrong try gives a hint, a second one opens the way,
 * a third one shows the answer. The way is always shown once the problem is solved.
 * Score: a problem counts as first-try when none of its parts had a wrong try.
 */
export const mathPractice: ActivityType = {
  label: (s) => s.stepMath,
  create(def, ctx) {
    const probs = def.problems as Problem[];
    const total = probs.length;
    let i = 0;
    let p = 0;
    let first = 0;
    let clean = true;
    let solved = false;
    let tries = 0;
    let revealed = false;
    let entry = '';
    let shake = false;
    let wrongK: number[] = [];
    let marks: { x: number; y: number; ok: boolean }[] = [];
    let msg: { cls: 'good' | 'bad'; html: string } | null = null;
    let showWay = false;

    const prob = (): Problem => probs[i];
    const part = (): Part => prob().parts[p];

    function resetPart(): void {
      tries = 0;
      revealed = false;
      entry = '';
      wrongK = [];
      marks = [];
    }

    function cheer(): string {
      const c = str().cheers;
      return c[(i * 3 + p) % c.length];
    }

    function advance(good: boolean): void {
      if (p < prob().parts.length - 1) {
        p++;
        resetPart();
        msg = good ? { cls: 'good', html: str().mathPartOk } : null;
        showWay = false;
      } else {
        solved = true;
        if (clean) first++;
        msg = good ? { cls: 'good', html: cheer() } : null;
        showWay = true;
      }
      ctx.rerender();
    }

    function right(): void {
      chimeGood();
      if (isPlot(part())) marks = [...marks.filter((m) => !m.ok), { ...(part() as { plot: { x: number; y: number } }).plot, ok: true }];
      advance(true);
    }

    function wrong(): void {
      const s = str();
      tries++;
      clean = false;
      chimeSoft();
      if (tries === 1) msg = { cls: 'bad', html: `${s.mathWrong1} ${fmt(part().hint)}` };
      else if (tries === 2) {
        msg = { cls: 'bad', html: s.mathWrong2 };
        showWay = true;
      } else {
        revealed = true;
        showWay = true;
        msg = { cls: 'bad', html: `${s.mathReveal} <b>${answerText(part())}</b>` };
        const pt = part();
        if (isPlot(pt)) marks = [...marks, { ...pt.plot, ok: true }];
      }
      ctx.rerender();
    }

    function nextProblem(): void {
      i++;
      if (i >= probs.length) return ctx.complete({ first, total });
      p = 0;
      clean = true;
      solved = false;
      showWay = false;
      msg = null;
      resetPart();
      ctx.rerender(true);
    }

    function press(k: string): void {
      if (solved || revealed || !isNum(part())) return;
      if (k === 'del') entry = entry.slice(0, -1);
      else if (k === 'neg') entry = entry.startsWith('-') ? entry.slice(1) : '-' + entry;
      else if (/^\d$/.test(k) && entry.replace('-', '').length < MAX_DIGITS) entry = (entry === '0' ? '' : entry === '-0' ? '-' : entry) + k;
      shake = false;
      ctx.rerender();
    }

    function check(): void {
      const pt = part();
      if (solved || revealed || !isNum(pt) || !/^-?\d+$/.test(entry)) return;
      if (Number(entry) === pt.num) right();
      else {
        shake = true;
        entry = '';
        wrong();
      }
    }

    function inputHTML(): string {
      const s = str();
      const pt = part();
      if (solved) return '';
      if (isChoice(pt)) {
        const opts = pt.choices
          .map((c, k) => {
            const cls = ['opt', 'mopt'];
            const bad = wrongK.includes(k);
            if (bad) cls.push('bad');
            if (revealed && k === pt.correct) cls.push('good');
            const off = bad || revealed;
            return `<button class="${cls.join(' ')}" data-act="mch" data-k="${k}" ${off ? 'disabled' : ''}>${fmt(c)}</button>`;
          })
          .join('');
        return `<div class="opts">${opts}</div>`;
      }
      if (isNum(pt)) {
        const shown = entry === '' ? '?' : entry.replace('-', '−');
        const deg = pt.unit === '°' ? '°' : '';
        const unit = pt.unit && pt.unit !== '°' ? `<span class="kunit">${fmt(pt.unit)}</span>` : '';
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'neg', '0', 'del']
          .map((k) => {
            const label = k === 'neg' ? '−' : k === 'del' ? '⌫' : k;
            const aria = k === 'neg' ? ` aria-label="${s.keyNeg}"` : k === 'del' ? ` aria-label="${s.keyDel}"` : '';
            return `<button class="key${k.length > 1 ? ' fn' : ''}" data-act="key" data-k="${k}"${aria} ${revealed ? 'disabled' : ''}>${label}</button>`;
          })
          .join('');
        const ok = /^-?\d+$/.test(entry) && !revealed;
        return `<p class="small kpd-instr">${s.mathType}</p>
          <div class="kout${entry === '' ? ' empty' : ''}${shake ? ' shake' : ''}" aria-live="polite"><span class="m">${shown}${deg}</span>${unit}</div>
          <div class="kpad" role="group" aria-label="${s.keypad}">${keys}</div>
          <button class="btn wide kcheck" data-act="mcheck" ${ok ? '' : 'disabled'}>${s.mathCheck}</button>`;
      }
      return revealed ? '' : `<p class="small kpd-instr">${s.mathTap}</p>`;
    }

    return {
      render() {
        const s = str();
        const pr = prob();
        const pt = part();
        const pct = Math.round(((i + (solved ? 1 : 0)) / total) * 100);
        const multi = pr.parts.length > 1;
        const prev = pr.parts
          .slice(0, solved ? pr.parts.length : p)
          .map((q, k) => `<li><span class="ok-mark" aria-hidden="true">✓</span> ${q.ask ? fmt(q.ask) + ' ' : ''}<b>${answerText(q)}</b></li>`)
          .join('');
        const plotState = pr.viz?.kind === 'grid' ? { tappable: isPlot(pt) && !solved && !revealed, marks } : undefined;
        const ask = !solved && pt.ask ? `<p class="mask">${multi ? `<span class="small">${s.mathStep(p + 1, pr.parts.length)}</span><br>` : ''}${fmt(pt.ask)}</p>` : '';
        const hintBtn = !solved && !revealed && tries === 0 && !(msg && msg.cls === 'bad') ? `<button class="linkbtn hintbtn" data-act="mhint">${s.mathHint}</button>` : '';
        const fb = msg ? `<div class="feedback ${msg.cls}" aria-live="polite">${msg.html}</div>` : '';
        const last = i === total - 1;
        const buttons = solved
          ? `<button class="btn wide" data-act="mnext">${last ? s.mathFinish : s.mathNext}</button>`
          : revealed
            ? `<button class="btn wide" data-act="mskip">${s.mathGotIt}</button>`
            : '';
        return `<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div>
          <div class="card mcard-q">
            <p class="small mnum">${s.mathOf(i + 1, total)}</p>
            <div class="mq">${fmt(pr.q)}</div>
            ${vizHTML(pr.viz, plotState)}
            ${prev ? `<ul class="mprev">${prev}</ul>` : ''}
            ${ask}
            ${inputHTML()}
            ${fb}
            ${hintBtn}
            ${showWay ? wayHTML(s.mathWay, pr.way) : ''}
          </div>
          ${buttons}`;
      },
      act(name, d) {
        const pt = part();
        if (name === 'mch' && isChoice(pt) && !solved && !revealed) {
          const k = Number(d.k);
          if (wrongK.includes(k)) return;
          if (k === pt.correct) right();
          else {
            wrongK.push(k);
            wrong();
          }
        } else if (name === 'plot' && isPlot(pt) && !solved && !revealed) {
          const x = Number(d.x);
          const y = Number(d.y);
          if (x === pt.plot.x && y === pt.plot.y) right();
          else {
            marks = [...marks.filter((m) => m.ok), { x, y, ok: false }];
            wrong();
          }
        } else if (name === 'key') press(d.k ?? '');
        else if (name === 'mcheck') check();
        else if (name === 'mhint') {
          msg = { cls: 'bad', html: fmt(pt.hint) };
          ctx.rerender();
        } else if (name === 'mskip' && revealed) advance(false);
        else if (name === 'mnext' && solved) nextProblem();
      },
      onKey(e) {
        if (solved || revealed || !isNum(part())) return false;
        if (/^\d$/.test(e.key)) press(e.key);
        else if (e.key === '-') press('neg');
        else if (e.key === 'Backspace') press('del');
        else if (e.key === 'Enter') check();
        else return false;
        e.preventDefault();
        return true;
      },
    };
  },
};
