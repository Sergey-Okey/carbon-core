import assert from 'node:assert/strict'
import test from 'node:test'
import {
  branchProgressPercent,
  computeActivityTrend,
  computeStreak,
  getLocalDateKey,
  mergeActivityCounts,
  mergeCompletionEvents,
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

test('mergeActivityCounts prefers the richest source for a day', () => {
  const merged = mergeActivityCounts({
    history: [{ date: '2026-08-20', count: 2 }],
    log: [
      { at: Date.UTC(2026, 7, 25, 10), taskId: 'a' },
      { at: Date.UTC(2026, 7, 25, 12), taskId: 'b' },
    ],
    tasks: [
      {
        id: 't1',
        title: 'Done',
        type: 'TASK_DAY',
        done: true,
        completedAt: new Date(2026, 7, 24, 18).getTime(),
      },
      {
        id: 'h1',
        title: 'Habit',
        type: 'HABIT',
        lastCompletedAt: new Date(2026, 7, 20, 9).getTime(),
      },
    ],
  })
  assert.equal(merged.get('2026-08-20'), 2)
  assert.equal(merged.get(getLocalDateKey(new Date(2026, 7, 24))), 1)
  assert.equal(merged.get(getLocalDateKey(new Date(Date.UTC(2026, 7, 25, 10)))), 2)
})

test('mergeCompletionEvents unions log entries with task timestamps', () => {
  const at = new Date(2026, 7, 24, 18).getTime()
  const events = mergeCompletionEvents({
    log: [{ at: at - 1000, taskId: 'log-1', type: 'TASK_WEEK', title: 'From log' }],
    tasks: [
      { id: 't1', title: 'From task', type: 'TASK_DAY', done: true, completedAt: at },
      { id: 'log-1', title: 'dup', type: 'TASK_WEEK', done: true, completedAt: at - 1000 },
    ],
  })
  assert.equal(events.length, 2)
  assert.equal(events.some((item) => item.taskId === 't1'), true)
  assert.equal(events.filter((item) => item.taskId === 'log-1').length, 1)
})
