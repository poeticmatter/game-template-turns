# Design log

What changed and why, newest first. **Game design** is the game itself: rules, content and balance. **Game development** is everything else: the board and UI, the platform, bots, tooling and fixes that don't change the rules. A change that does both has an entry in each.

*A new game replaces the template's entries below with its own, starting from "Started from the game template".*

## Game design

### 2026-10-15: Pig, the example game
Roll as often as you like, adding each roll to your turn total, then hold to bank it; a 1 loses the turn total and the turn. First to the target score wins. The target is a lobby setting.

## Game development

### 2026-11-16: A plain-language rules document and this log
`docs/rules.md` describes the game as it plays now, and this log records changes in two parts. Both are kept up to date with every change.

### 2026-10-25: Solo playtest replaces hot seat (GameKit 0.6.0)
One tester plays every seat of several tables at once, dealt a random seat each turn and always shown in the same colour. Pig's board names players instead of saying "You" and lists them from the viewer's seat, rolls can't be undone, and a finished game reports its winners and scores for the playtest summary.

### 2026-10-15: A turn-based template on GameKit
Players take turns in order, 2 to 5 of them, in async, live and hot-seat play, with the lobby, seats and transports from GameKit.
