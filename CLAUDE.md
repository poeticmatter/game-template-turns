# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # dev server at http://localhost:3000
npm run lint       # TypeScript type checking (tsc --noEmit)
npm test           # vitest
npm run build      # production build
npm run deploy     # build and publish to GitHub Pages
npm run init-game -- <repo-name> <game-id> "<Title>"   # one-time rename of a fresh template copy
```

## Architecture

A browser game for 2–5 players taking turns in order, with no backend of its own. It is part of the game lab (poeticmatter/game-lab); each game lives in its own repo created from poeticmatter/game-template-turns. (Two-player games where both choose at the same time start from poeticmatter/game-template instead.)

The multiplayer platform (lobby, seats, transports, status screens) is **GameKit**'s `game-kit/turns`, a package pinned in `package.json` to a release tag of poeticmatter/GameKit (local copy: `C:\Code\digital-board-games\GameKit`).

- `src/game/`: the game. Pure rules (`rules.ts`, tested in `rules.test.ts`), React UI (`Board.tsx`, `SettingsForm.tsx`), seat colours, and `index.ts` exporting `game: GameModule`. The example is Pig.
- `src/game.config.ts`: `GAME_CONFIG`: the game id, title, tagline, and Supabase settings read from `.env.local`.
- `src/App.tsx`: renders `<TurnBasedGameApp config={GAME_CONFIG} game={game} />`. GameKit routes on the URL (`?room=CODE[&mode=async]`); solo playtests have no URL.
- `src/index.css`: Tailwind, GameKit's theme (`game-kit/theme.css`), and any colour token overrides.

### Rules contract

- `createInitialState({ settings, playerCount, seed })` and `applyMove(state, move)` must be pure and deterministic. Keep randomness in the game state, seeded from `seed`, and draw with GameKit's `nextIndex` / `nextRandom`, so every client gets the same results.
- `activePlayer(state)` names the seat whose move the game awaits (null once over). A turn may take several moves; GameKit only applies moves from the active player.
- `applyMove` throws GameKit's `IllegalMoveError` for a move that breaks the rules; GameKit catches it and leaves the state alone.
- A player's moves stay on their screen, undoable, until they press End turn. `irreversibleReason(state, move)` marks moves that can't be undone (anything that draws on the randomness, like Pig's rolls); GameKit warns before one and sends the turn so far at once.
- `outcome(state)` gives the solo playtest's summary its winners and scores.

### Seats and transports (in GameKit)

- Seats fill in join order; the creator is seat 0. Browsers remember their seat per room; anyone with the link can take back a seat ("That's me") or watch.
- **Async (Supabase)**: one row per room in `<game-id>_games` (`players`, `player_count`, `state`, `version`), with seats claimed through `<game-id>_claim_seat`. Both are defined in `supabase/migrations/`.
- **Live (PeerJS)**: the creator hosts and runs the rules; the game ends if the host closes the tab.
- **Solo playtest**: one tester plays every seat of several tables, dealt a random seat each turn. The Board gets `seating: 'solo_playtest'` and `role` is the dealt seat, which GameKit disguises as seat 0 while shuffling the other seats' colours, so the tester always plays the same colour. The Board draws every seat colour through `lookOf(seat)`, never `SEAT_COLORS[seat]`, and lists players from the viewer's seat rather than in seat order.

## Rules document and design log

Claude keeps two documents in `docs/` and updates them in the same change as the work they describe, without being asked:

- **`docs/rules.md`**: the game's rules as it plays them now, in plain language, as a new player would read them: what you're trying to do, what's on the table, setup, a turn, how it ends. No code names, file paths or jargon. Every change to the rules or content updates it, so it always matches the game.
- **`docs/design-log.md`**: what changed and why, newest first, in two sections:
  - **Game design**: the game itself: rules, content (boards, tiles, cards, numbers and dials) and balance.
  - **Game development**: everything else: the board and UI, visuals, GameKit bumps, bots, tooling, and fixes that don't change the rules.

  One entry per change, headed by its date and a short title, in the section it belongs to; a change that does both gets an entry in each. Say what changed for players and, when it's known, why. Leave how it was built to the commits.

Both start out describing the example game, Pig. When a new game replaces it, rewrite `rules.md` for that game and replace the template's log entries with the game's own, starting from "Started from the game template". If the designer has their own rules text, keep it as a separate file in `docs/` and let `rules.md` describe what the game plays, including the calls it makes where that text leaves a question open.

## Rules

- All state changes go through `rules.applyMove`. UI components only render state and submit moves.
- Keep `GAME_CONFIG.id` and the table and function names in `supabase/migrations/` in sync.
- To change platform behaviour, change GameKit, tag a release, and bump the `game-kit` version in `package.json`. Don't patch `node_modules/game-kit`.
