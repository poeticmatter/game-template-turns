import {
  Button,
  Card,
  ColorSwatch,
  type BoardProps,
  type PlayerAppearance,
  type PlayerIndex,
  type PlayerProfile,
  type Seating,
  type UserRole,
} from 'game-kit/turns'
import { BUST_FACE } from './rules'
import { SEAT_COLORS } from './seatColors'
import type { LastRoll, PigMove, PigState } from './types'

const DIE_GLYPHS = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

interface Viewer {
  role: UserRole
  seating: Seating
  players: PlayerProfile[]
  lookOf: (seat: PlayerIndex) => PlayerIndex
}

/** A solo playtester plays every seat, so only an online viewer is "You". */
function isViewer(seat: number, { role, seating }: Viewer): boolean {
  return seating === 'remote' && role === seat
}

/**
 * The colour a seat is drawn in. In a solo playtest GameKit disguises the seats: the one
 * being played always looks like seat 0 and the others are shuffled, so the tester plays
 * the same colour every turn. Draw every seat colour through this, never SEAT_COLORS[seat].
 */
function appearanceOf(seat: number, { lookOf }: Viewer): PlayerAppearance {
  return SEAT_COLORS[lookOf(seat)]
}

function nameOf(seat: number, viewer: Viewer): string {
  if (isViewer(seat, viewer)) return 'You'
  return viewer.players[seat]?.name ?? appearanceOf(seat, viewer).name
}

/** Seats in turn order from the viewer's own; seat order would give a solo playtester's real seat away. */
function seatsFromViewer(seatCount: number, { role }: Viewer): number[] {
  const start = role === 'spectator' ? 0 : role
  return Array.from({ length: seatCount }, (_, offset) => (start + offset) % seatCount)
}

function describeRoll(lastRoll: LastRoll | null, viewer: Viewer): string {
  if (!lastRoll) return 'No rolls yet.'
  const who = nameOf(lastRoll.player, viewer)
  if (lastRoll.value === BUST_FACE) return `${who} rolled a 1 and lost the turn’s points.`
  return `${who} rolled a ${lastRoll.value}.`
}

function Scoreboard({ state, viewer }: { state: PigState; viewer: Viewer }) {
  return (
    <Card>
      <ul className="flex flex-col divide-y divide-slot">
        {seatsFromViewer(state.scores.length, viewer).map(seat => {
          const isActive = state.winner === null && seat === state.playerIndex
          return (
            <li key={seat} className={`flex items-center gap-3 py-2 ${isActive ? 'font-bold' : ''}`}>
              <span className="w-3">{isActive ? '▶' : ''}</span>
              <ColorSwatch color={appearanceOf(seat, viewer).color} />
              <span className="flex-1">{nameOf(seat, viewer)}</span>
              {isActive && state.turnTotal > 0 && <span className="text-sm text-ink-soft">+{state.turnTotal} at stake</span>}
              <span className="w-10 text-right text-2xl tabular-nums">{state.scores[seat]}</span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

function TurnControls({ state, onMove }: { state: PigState; onMove: (move: PigMove) => void }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-ink-soft">
        Turn total: <strong className="text-ink">{state.turnTotal}</strong>
      </p>
      <div className="flex gap-3">
        <Button onClick={() => onMove({ kind: 'roll' })} className="px-8">
          Roll
        </Button>
        <Button tone="secondary" onClick={() => onMove({ kind: 'hold' })} disabled={state.turnTotal === 0} className="px-8">
          Hold
        </Button>
      </div>
    </div>
  )
}

export function PigBoard({ state, role, players, onMove, seating, lookOf }: BoardProps<PigState, PigMove>) {
  const viewer: Viewer = { role, seating, players, lookOf }
  const isOver = state.winner !== null
  const isViewersTurn = !isOver && role === state.playerIndex

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 p-6">
      <p className="text-center text-sm text-ink-soft">First to {state.targetScore}</p>
      <Scoreboard state={state} viewer={viewer} />

      <Card className="flex flex-col items-center gap-2 text-center">
        <span className="text-7xl leading-none" aria-hidden>
          {state.lastRoll ? DIE_GLYPHS[state.lastRoll.value - 1] : '·'}
        </span>
        <p>{describeRoll(state.lastRoll, viewer)}</p>
      </Card>

      {state.winner !== null && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-2xl font-bold">{isViewer(state.winner, viewer) ? 'You win!' : `${nameOf(state.winner, viewer)} wins!`}</p>
          <a href="./" className="text-sm text-ink-soft underline hover:text-ink">
            Back to the lobby
          </a>
        </div>
      )}
      {isViewersTurn && <TurnControls state={state} onMove={onMove} />}
      {!isOver && !isViewersTurn && (
        <p className="text-center text-ink-soft">
          {seating === 'solo_playtest' ? `${nameOf(state.playerIndex, viewer)} to play` : `Waiting for ${nameOf(state.playerIndex, viewer)}…`}
        </p>
      )}
      {role === 'spectator' && seating === 'remote' && <p className="text-center text-sm text-ink-faint">You’re watching.</p>}
    </div>
  )
}
