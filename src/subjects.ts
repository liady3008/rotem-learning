import type { Unit } from './core/types';

export interface Subject {
  id: string;
  /** Label shown on the home-screen tab. */
  label: string;
}

/**
 * Subject tabs on the home screen, in display order.
 * To add a subject: add it here, then give its units `subject: '<id>'` (see Unit.subject).
 */
export const SUBJECTS: Subject[] = [
  { id: 'english', label: 'אנגלית' },
  { id: 'math', label: 'מתמטיקה' },
];

export const DEFAULT_SUBJECT = SUBJECTS[0].id;

export const subjectById = (id: string): Subject | undefined => SUBJECTS.find((s) => s.id === id);

/** A unit without an explicit subject belongs to the default one (English). */
export const subjectOf = (u: Unit): string => u.subject ?? DEFAULT_SUBJECT;
