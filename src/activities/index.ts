import { registerActivity } from '../core/activity';
import { flashcards } from './vocab/flashcards';
import { match } from './vocab/match';
import { quiz } from './vocab/quiz';
import { typing } from './vocab/typing';

/**
 * Every activity type the app knows. A station lists these by name in its `activities`.
 * Future unit kinds (grammar, reading...) add a file under src/activities/<kind>/ and one line here.
 */
registerActivity('flashcards', flashcards);
registerActivity('match', match);
registerActivity('quiz', quiz);
registerActivity('typing', typing);
