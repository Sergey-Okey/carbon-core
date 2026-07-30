import assert from 'node:assert/strict'
import test from 'node:test'
import {
  branchProgressPercent,
  computeActivityTrend,
  computeStreak,
  getLocalDateKey,
  milestoneProgressWeight,
  weightedBranchesScore,
} from '../utils/analyticsMath.ts'

test('getLocalDateKey formats YYYY-MM-DD in local time', () => {
  assert.equal(getLocalDateKey(new Date(2026, 6, 30)), '2026-07-30')
  assert.equal(getLocalDateKey(new Date(2026, 0, 5)), '2026-01-05')
})

test('computeActivityTrend detects up, down, and flat periods', () => {
  assert.equal(computeActivityTrend([1, 2]).dir, 'flat')
  assert.equal(computeActivityTrend([1, 1, 1, 1, 1, 1, 1, 1]).dir, 'flat')
  assert.equal(computeActivityTrend([1, 1, 1, 1, 4, 4, 4, 4]).dir, 'up')
  assert.equal(computeActivityTrend([4, 4, 4, 4, 1, 1, 1, 1]).dir, 'down')
  assert.equal(computeActivityTrend([0, 0, 0, 0, 3, 3, 3, 3]).pct, 100)
})

test('milestoneProgressWeight prefers linked tasks over status', () => {
  assert.equal(
    milestoneProgressWeight({
      linkedDone: 1,
      linkedTotal: 2,
      status: 'completed',
      achieved: true,
    }),
    0.5
  )
  assert.equal(
    milestoneProgressWeight({
      linkedDone: 0,
      linkedTotal: 0,
      status: 'completed',
    }),
    1
  )
  assert.equal(
    milestoneProgressWeight({
      linkedDone: 0,
      linkedTotal: 0,
      status: 'active',
    }),
    0.5
  )
  assert.equal(
    milestoneProgressWeight({
      linkedDone: 0,
      linkedTotal: 0,
      achieved: true,
    }),
    1
  )
  assert.equal(
    milestoneProgressWeight({
      linkedDone: 0,
      linkedTotal: 0,
      status: 'pending',
    }),
    0
  )
})

test('branchProgressPercent averages milestone weights', () => {
  assert.equal(branchProgressPercent([]), 0)
  assert.equal(branchProgressPercent([1, 0.5, 0]), 50)
  assert.equal(branchProgressPercent([1, 1]), 100)
})

test('weightedBranchesScore weights by milestone count', () => {
  assert.equal(weightedBranchesScore([]), 0)
  assert.equal(
    weightedBranchesScore([
      { progress: 100, total: 1 },
      { progress: 0, total: 3 },
    ]),
    25
  )
})

test('computeStreak tracks current and longest runs', () => {
  const history = new Map([
    ['2026-07-27', 2],
    ['2026-07-28', 1],
    ['2026-07-29', 3],
    ['2026-07-30', 1],
  ])
  assert.deepEqual(computeStreak(history, '2026-07-30'), { current: 4, longest: 4 })

  const broken = new Map([
    ['2026-07-27', 2],
    ['2026-07-28', 0],
    ['2026-07-29', 1],
    ['2026-07-30', 1],
  ])
  assert.deepEqual(computeStreak(broken, '2026-07-30'), { current: 2, longest: 2 })

  const idleToday = new Map([
    ['2026-07-28', 1],
    ['2026-07-29', 1],
  ])
  assert.deepEqual(computeStreak(idleToday, '2026-07-30'), { current: 2, longest: 2 })
})
