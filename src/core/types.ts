export type Lang = 'he' | 'en';

/** A vocabulary word. `tr` is the translation into the learner's native language (optional in advanced units). */
export interface Word {
  en: string;
  def: string;
  tr?: string;
  trAlt?: string;
  /** Fill-in-the-gap sentence. `text` contains ___ ; `wrong` are options that clearly do not fit. */
  sentence?: { text: string; wrong: string[] };
}

/** One step inside a station. `type` selects an activity from the registry; the rest is that activity's own config. */
export interface ActivityDef {
  type: string;
  [key: string]: unknown;
}

export interface Station {
  id: string;
  name: string;
  activities: ActivityDef[];
  /** Words taught here. Used for the word bag and the end-of-station summary. */
  words?: Word[];
}

export interface Unit {
  id: string;
  /** Free label for the kind of unit (vocab, grammar, ...). Not used by the engine; for humans and future filters. */
  kind: string;
  /** Language of the unit's interface text. Also sets page direction. */
  lang: Lang;
  /** Language of `Word.tr`. Defaults to 'he'. */
  trLang?: Lang;
  /** Visual theme key, applied as data-theme on <html>. */
  theme: string;
  title: string;
  subtitle?: string;
  /** Short line shown above the map. */
  lead?: string;
  /** 'free' = every station open. 'sequential' = a station opens after the previous one is done. */
  order?: 'free' | 'sequential';
  stations: Station[];
  /** Final challenge, opens after all stations are done. */
  summit?: Station;
}

export interface Score {
  first: number;
  total: number;
}
