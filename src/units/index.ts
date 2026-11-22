import type { Unit } from '../core/types';
import { teamwork1 } from './teamwork-1';

/**
 * All units, in the order they appear on the home screen.
 * To add a unit: create src/units/<name>.ts that exports a Unit, import it here, and add it to the list.
 */
export const UNITS: Unit[] = [teamwork1];

export const unitById = (id: string): Unit | undefined => UNITS.find((u) => u.id === id);
