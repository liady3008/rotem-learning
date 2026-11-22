import { isSoundOn } from './storage';

/** Speak an English word. `force` ignores the sound switch (used by explicit "listen" buttons). */
export function say(text: string, force = false): void {
  if (!isSoundOn() && !force) return;
  try {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.85;
    const vs = speechSynthesis.getVoices();
    const v = vs.find((x) => /^en[-_]US/i.test(x.lang)) ?? vs.find((x) => /^en/i.test(x.lang));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch {
    /* speech is optional */
  }
}

export function stopSpeech(): void {
  try {
    speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

let ac: AudioContext | null = null;

function tone(freqs: number[], dur = 0.12, type: OscillatorType = 'sine'): void {
  if (!isSoundOn()) return;
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ac ??= new Ctx();
    const t0 = ac.currentTime;
    freqs.forEach((f, i) => {
      const o = ac!.createOscillator();
      const g = ac!.createGain();
      o.type = type;
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0 + i * dur);
      g.gain.exponentialRampToValueAtTime(0.16, t0 + i * dur + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + (i + 1) * dur + 0.08);
      o.connect(g);
      g.connect(ac!.destination);
      o.start(t0 + i * dur);
      o.stop(t0 + (i + 1) * dur + 0.1);
    });
  } catch {
    /* ignore */
  }
}

export const chimeGood = (): void => tone([660, 880, 1100]);
export const chimeSoft = (): void => tone([330, 262], 0.16, 'triangle');
export const chimeWin = (): void => tone([523, 659, 784, 1047], 0.14);
