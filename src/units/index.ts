import type { Unit } from '../core/types';
import { teamwork1 } from './teamwork-1';
import { teamwork1b } from './teamwork-1-b';
import { mathMidterm1 } from './math-midterm-1';

/**
 * All units, in the order they appear on the home screen.
 * To add a unit: create src/units/<name>.ts that exports a Unit, import it here, and add it to the list.
 */
export const UNITS: Unit[] = [teamwork1, teamwork1b, mathMidterm1];

export const unitById = (id: string): Unit | undefined => UNITS.find((u) => u.id === id);
