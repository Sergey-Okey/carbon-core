import assert from 'node:assert/strict'
import test from 'node:test'
import {
  calculateLevel,
  calculateTasksForNextLevel,
} from '../utils/levelCalculator.ts'

test('calculateLevel maps completed tasks into 20-task bands', () => {
  assert.equal(calculateLevel(0), 1)
  assert.equal(calculateLevel(19), 1)
  assert.equal(calculateLevel(20), 2)
  assert.equal(calculateLevel(39), 2)
  assert.equal(calculateLevel(40), 3)
})

test('calculateTasksForNextLevel scales by league', () => {
  assert.equal(calculateTasksForNextLevel(1, 'Бронза'), 20)
  assert.equal(calculateTasksForNextLevel(2, 'Серебро'), 50)
  assert.equal(calculateTasksForNextLevel(2, 'Золото'), 60)
  assert.equal(calculateTasksForNextLevel(3, 'Платина'), 120)
})
