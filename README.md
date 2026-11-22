# Rotem's Learning Journey

An adventure-map study app for a child. Each **unit** is one chapter of the class syllabus (vocabulary today, grammar and more later). Built with Vite and TypeScript, no framework. Progress is stored in the browser (`localStorage`).

```
npm install
npm run dev        # local development
npm test           # content checks + a full learner flow
npm run build      # typecheck + production build into dist/
```

## How it is organised

| Folder | What lives there |
|---|---|
| `src/units/` | **Content.** One file per unit. Add a unit here; no engine code changes. |
| `src/activities/` | **Exercise types** (flashcards, match, quiz, typing). Each is registered by name. |
| `src/core/` | Engine: session runner, progress storage, sound, interface strings (`i18n.ts`), types. |
| `src/views/` | Screens: home (unit list), unit map, station session, word sheet. |
| `src/styles/` | One stylesheet. Colours and fonts are tokens at the top, so a new look is a theme. |

The model: **Unit → Stations → Activities**. A station is a list of activities that run in order; the engine adds up their scores into 1 to 3 stars. A unit may also have a `summit` station that opens after all stations are done.

## Add a vocabulary unit

1. Copy `src/units/teamwork-1.ts` to `src/units/<name>.ts`, change the id, title and words.
2. Import it in `src/units/index.ts` and add it to `UNITS`.
3. `npm test` checks ids, activity names, and that every sentence has a gap and at least two wrong options.

Per unit you choose:
- `lang`: `'he'` or `'en'`. This sets the interface text **and** page direction, so an advanced unit can be fully English, left to right.
- `order`: `'free'` (all stations open) or `'sequential'`.
- `theme`: visual theme key (see below).
- A word without `tr` (translation) is fine: the engine skips translation questions for it and uses the English meaning instead.

## Add a new kind of unit (for example grammar)

1. Write an activity in `src/activities/<kind>/`, implementing `ActivityType` from `src/core/activity.ts`: `render()` returns HTML, `act()` handles clicks, and `ctx.complete({first, total})` ends it.
2. Register it by name in `src/activities/index.ts`.
3. Use that name in a station's `activities` list in a unit file. The map, stars, progress and summit work unchanged.

New interface text goes in `src/core/i18n.ts`. TypeScript requires every key in both languages.

## Add a visual theme

Set `theme: 'name'` on a unit. Three places define a theme:

1. `src/styles/main.css`: override the colour tokens (text, surfaces, border, shadow, primary action) in `:root[data-theme="name"]`. `tiktok-restaurant` is a full dark example.
2. `src/views/map.ts`: add an entry to `THEMES` with the scenery painter, route and node colours, and the character drawn on the map.
3. `index.html`: add any new Google Font.

A unit can also replace interface wording with `text: { ... }` (for example the name of its final challenge).

## Progress data

Stored under the key `rotem-learning:v1` in `localStorage`, per unit and station. It lives only in that browser on that device. Moving it between devices would need accounts and a database, which this version deliberately does not have.

## Words with special typing

`typed` on a word is what the learner types and what is read aloud when it differs from `en`, for example `en: 'fall (fell) in love'`, `typed: 'fall in love'`. Both forms are accepted.
