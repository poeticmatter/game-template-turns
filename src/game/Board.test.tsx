import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { PlayerIndex } from 'game-kit/turns'
import { PigBoard } from './Board'
import { pigRules } from './rules'
import { SEAT_COLORS } from './seatColors'

// Board checks without a browser: render to markup and look for what a viewer would see.

const state = pigRules.createInitialState({ settings: { targetScore: 20 }, playerCount: 2, seed: 1 })
const players = [{ name: 'Ana' }, { name: 'Ben' }]

function renderAs(role: PlayerIndex, lookOf: (seat: PlayerIndex) => PlayerIndex): string {
  return renderToStaticMarkup(<PigBoard state={state} role={role} players={players} onMove={() => {}} seating="solo_playtest" lookOf={lookOf} />)
}

describe('the Pig board in a solo playtest', () => {
  it('draws the dealt seat in the colour it is disguised as', () => {
    // Seat 1 is dealt, so GameKit swaps its look with seat 0's.
    const markup = renderAs(1, seat => 1 - seat)
    expect(markup.indexOf(SEAT_COLORS[0].color)).toBeLessThan(markup.indexOf(SEAT_COLORS[1].color))
  })

  it('lists the dealt seat first', () => {
    const markup = renderAs(1, seat => 1 - seat)
    expect(markup.indexOf('Ben')).toBeLessThan(markup.indexOf('Ana'))
  })

  it('names players instead of saying "You"', () => {
    expect(renderAs(0, seat => seat)).not.toContain('You')
  })
})
