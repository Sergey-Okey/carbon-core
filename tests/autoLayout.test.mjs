import assert from 'node:assert/strict'
import test from 'node:test'
import { useAutoLayout } from '../composables/useAutoLayout.ts'

const { applyNetworkLayout } = useAutoLayout()

function branchNode(id, y = 0) {
  return {
    id,
    type: 'branch-node',
    position: { x: 0, y },
    data: { branchId: id },
  }
}

function milestoneNode(id, branchId, y = 0) {
  return {
    id,
    type: 'milestone-node',
    position: { x: 0, y },
    data: { branchId },
  }
}

function edge(source, target) {
  return { id: `${source}->${target}`, source, target }
}

function boxes(nodes, gap = 0) {
  return nodes.map((node) => {
    const width = node.type === 'branch-node' ? 240 : 220
    const height = node.type === 'branch-node' ? 148 : 136
    return {
      id: node.id,
      x: node.position.x,
      y: node.position.y,
      w: width,
      h: height,
    }
  }).filter((box) => {
    void gap
    return true
  })
}

function hasOverlap(nodes, gap = 24) {
  const list = boxes(nodes)
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i]
      const b = list[j]
      const overlap =
        a.x < b.x + b.w + gap &&
        a.x + a.w + gap > b.x &&
        a.y < b.y + b.h + gap &&
        a.y + a.h + gap > b.y
      if (overlap) return `${a.id} overlaps ${b.id}`
    }
  }
  return null
}

function boundsOf(nodes) {
  return nodes.reduce(
    (bounds, node) => {
      const width = node.type === 'branch-node' ? 240 : 220
      const height = node.type === 'branch-node' ? 148 : 136
      return {
        minX: Math.min(bounds.minX, node.position.x),
        minY: Math.min(bounds.minY, node.position.y),
        maxX: Math.max(bounds.maxX, node.position.x + width),
        maxY: Math.max(bounds.maxY, node.position.y + height),
      }
    },
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  )
}

test('diamond DAG does not double-count the shared sink', () => {
  const nodes = [
    branchNode('B', 200),
    milestoneNode('left', 'B', 80),
    milestoneNode('right', 'B', 320),
    milestoneNode('sink', 'B', 200),
  ]
  const edges = [
    edge('B', 'left'),
    edge('B', 'right'),
    edge('left', 'sink'),
    edge('right', 'sink'),
  ]

  const { nodes: layouted } = applyNetworkLayout(nodes, edges, 'LR', {
    nodeSep: 48,
    edgeGap: 96,
    marginX: 40,
    marginY: 40,
    snapGrid: 20,
  })

  const byId = Object.fromEntries(layouted.map((node) => [node.id, node]))
  assert.ok(byId.sink.position.x > byId.left.position.x)
  assert.ok(byId.sink.position.x > byId.right.position.x)
  assert.equal(hasOverlap(layouted), null)

  const height = boundsOf(layouted).maxY - boundsOf(layouted).minY
  assert.ok(height < 520, `diamond layout too tall: ${height}`)
})

test('dense cross-linked branch stays in columns without overlaps', () => {
  const streamY = { product: 40, body: 200, mind: 360, money: 520 }
  const nodes = [
    branchNode('COF', 280),
    milestoneNode('vision', 'COF', 280),
    milestoneNode('product', 'COF', streamY.product),
    milestoneNode('body', 'COF', streamY.body),
    milestoneNode('mind', 'COF', streamY.mind),
    milestoneNode('money', 'COF', streamY.money),
    milestoneNode('plan', 'COF', streamY.product),
    milestoneNode('sleep', 'COF', streamY.body),
    milestoneNode('focus', 'COF', streamY.mind),
    milestoneNode('budget', 'COF', streamY.money),
    milestoneNode('fe', 'COF', streamY.product),
    milestoneNode('deep', 'COF', streamY.mind),
    milestoneNode('release', 'COF', 280),
  ]
  const edges = [
    edge('COF', 'vision'),
    edge('vision', 'product'),
    edge('vision', 'body'),
    edge('vision', 'mind'),
    edge('vision', 'money'),
    edge('product', 'plan'),
    edge('body', 'sleep'),
    edge('mind', 'focus'),
    edge('money', 'budget'),
    edge('plan', 'fe'),
    edge('sleep', 'deep'),
    edge('focus', 'deep'),
    edge('deep', 'fe'),
    edge('fe', 'release'),
    edge('budget', 'release'),
    edge('deep', 'release'),
  ]

  const { nodes: layouted } = applyNetworkLayout(nodes, edges, 'LR', {
    nodeSep: 56,
    edgeGap: 100,
    marginX: 40,
    marginY: 40,
    snapGrid: 20,
  })

  assert.equal(layouted.length, nodes.length)
  assert.equal(hasOverlap(layouted, 20), null)

  const byId = Object.fromEntries(layouted.map((node) => [node.id, node]))
  assert.ok(byId.product.position.y < byId.body.position.y)
  assert.ok(byId.body.position.y < byId.mind.position.y)
  assert.ok(byId.mind.position.y < byId.money.position.y)
  assert.ok(byId.fe.position.x > byId.plan.position.x)
  assert.ok(byId.release.position.x >= byId.fe.position.x)
  assert.ok(byId.release.position.x >= byId.deep.position.x)

  const height = boundsOf(layouted).maxY - boundsOf(layouted).minY
  assert.ok(height < 1400, `dense layout too tall: ${height}`)
})

test('simple tree still stacks children under the parent', () => {
  const nodes = [
    branchNode('root', 0),
    milestoneNode('a', 'root', 0),
    milestoneNode('b', 'root', 200),
    milestoneNode('c', 'root', 400),
  ]
  const edges = [edge('root', 'a'), edge('root', 'b'), edge('root', 'c')]
  const { nodes: layouted } = applyNetworkLayout(nodes, edges, 'LR', {
    nodeSep: 48,
    edgeGap: 96,
    marginX: 20,
    marginY: 20,
    snapGrid: 20,
  })

  const xs = new Set(layouted.filter((node) => node.type === 'milestone-node').map((node) => node.position.x))
  assert.equal(xs.size, 1)
  assert.equal(hasOverlap(layouted), null)
})
