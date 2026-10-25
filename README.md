# Turn-Based Game Template

The starting point for games in the [game lab](https://poeticmatter.github.io/game-lab/) where **2–5 players take turns in order**. For two-player games where both choose secretly at the same time, use [game-template](https://github.com/poeticmatter/game-template) instead.

You get, from [GameKit](https://github.com/poeticmatter/GameKit) (`game-kit/turns`):

- **Async play** backed by Supabase: take your turn whenever you like; players join with a link and a name, and can take their seat back on another device
- **Live play** over PeerJS (peer to peer, no server), with spectators and reconnection
- **Solo playtest**: play every seat yourself, across several tables at once, always as the same colour
- **Undo and End turn** in every mode, with a warning before moves that can't be undone
- A lobby with a player count, share links, a "Your turn" tab title, and GitHub Pages deployment

The example game in `src/game/` is Pig, a push-your-luck dice game. Replace it with your own.

## Starting a new game

1. On GitHub, click **Use this template → Create a new repository** (for example `poeticmatter/TownHall`), then clone it.
2. Name the game:
   ```bash
   npm install
   npm run init-game -- TownHall townhall "Town Hall"
   ```
   This sets the Pages path, the title, and the game id. The game id names the Supabase table (`townhall_games`) and seat-claim function (`townhall_claim_seat`), and it prefixes the PeerJS room ids and localStorage keys so lab games never collide.
3. Apply the renamed migration in `supabase/migrations/` to the shared Supabase project.
4. Copy `.env.local` from any other lab game (every game uses the same Supabase project).
5. Replace `src/game/` with your game, rewrite `docs/rules.md` and start `docs/design-log.md` for it, update this README, then run `npm run deploy`.
6. Add the game to the hub's `games.json` in [poeticmatter/game-lab](https://github.com/poeticmatter/game-lab).

## Structure

```
src/
├── game.config.ts   # GAME_CONFIG: game id, title, tagline, Supabase settings
├── game/            # THE GAME: replace this folder
│   ├── index.ts     #   exports `game: GameModule`
│   ├── rules.ts     #   pure, deterministic createInitialState / activePlayer / applyMove
│   ├── rules.test.ts
│   ├── Board.tsx    #   renders state, calls onMove
│   ├── SettingsForm.tsx
│   └── seatColors.ts
├── index.css        # Tailwind, GameKit's theme, and any colour overrides
└── App.tsx          # <TurnBasedGameApp config={GAME_CONFIG} game={game} />
docs/
├── rules.md         # the rules in plain language, as the game plays them now
└── design-log.md    # what changed and why: game design, then game development
```

The lobby, seats, transports and status screens live in GameKit, pinned in `package.json` to a release tag. To change them, change GameKit, tag a release, and bump the version here.

### The game contract

A game provides a `GameModule` (types from `game-kit/turns`):

- `rules.createInitialState({ settings, playerCount, seed })`, `rules.activePlayer(state)` and `rules.applyMove(state, move)`. These must be **pure and deterministic**: in async play the moving player's client computes the next state and everyone else trusts it. Keep randomness in the state, seeded from `seed`, and draw with GameKit's `nextIndex` (Pig's dice do this).
- `activePlayer` names the seat (0-based) whose move the game awaits, or `null` once it's over. A turn can take several moves; only the active player's are applied.
- `applyMove` throws `IllegalMoveError` for a move that breaks the rules. Boards should only offer legal moves; the error guards against stale or tampered ones.
- Optional `rules.irreversibleReason(state, move)`: a message for a move that can't be undone because it draws on the game's randomness (Pig's rolls), or null. GameKit warns before such a move and sends the turn so far at once.
- Optional `rules.outcome(state)`: the winners and scores of a finished game, for the solo playtest's summary.
- `Board` receives `state`, `role` (a seat number or `'spectator'`), `players` (names, in seat order), `onMove`, `seating` and `lookOf`. In a solo playtest, `seating` is `'solo_playtest'` and `role` is the seat the tester was dealt, so name players rather than saying "You". The dealt seat is disguised as seat 0 and the others are shuffled, so draw every seat colour with `lookOf(seat)` and don't list players in seat order (Pig's board does both).
- `minPlayers`, `maxPlayers`, `playerAppearance(seat)` (a name and colour for the lobby and join screens), `defaultSettings` and `SettingsForm` (which also gets the chosen player count).

GameKit's screens take their colours from the tokens in `src/index.css`.

## Commands

```bash
npm run dev      # http://localhost:3000
npm run lint     # tsc --noEmit
npm test         # vitest
npm run build
npm run deploy   # build and publish to GitHub Pages (gh-pages branch)
```
