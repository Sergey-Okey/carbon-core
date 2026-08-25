import type { Node, Edge } from '@vue-flow/core'

type LayoutDirection = 'TB' | 'LR'

export type HandleSide = 'top' | 'right' | 'bottom' | 'left'

type LayoutOptions = {
  nodeSep?: number
  rankSep?: number
  edgeGap?: number
  componentGap?: number
  marginX?: number
  marginY?: number
  snapGrid?: number
}

export type NetworkLayoutResult = {
  nodes: Node[]
  edges: Edge[]
}

function snap(value: number, grid: number) {
  return Math.round(value / grid) * grid
}

function getNodeSize(node: Node) {
  const measured = node.dimensions
  if (measured?.width && measured?.height) {
    return {
      width: Math.max(measured.width, 180),
      height: Math.max(measured.height, 100),
    }
  }
  if (node.type === 'branch-node') return { width: 240, height: 148 }
  if (node.type === 'milestone-node') return { width: 220, height: 136 }
  return { width: 220, height: 136 }
}

function oppositeSide(side: HandleSide): HandleSide {
  if (side === 'top') return 'bottom'
  if (side === 'right') return 'left'
  if (side === 'bottom') return 'top'
  return 'right'
}

function sourcePortId(nodeId: string, side: HandleSide) {
  return `source-${side}-${nodeId}`
}

function targetPortId(nodeId: string, side: HandleSide) {
  return `target-${side}-${nodeId}`
}

function nodeBranchId(node: Node): string | null {
  const data = node.data as { branchId?: string; type?: string } | undefined
  if (data?.branchId) return data.branchId
  if (node.type === 'branch-node') return node.id
  return null
}

function getComponentBounds(component: string[], byId: Map<string, Node>) {
  return component.reduce(
    (bounds, id) => {
      const node = byId.get(id)
      if (!node) return bounds
      const size = getNodeSize(node)
      return {
        minX: Math.min(bounds.minX, node.position.x),
        minY: Math.min(bounds.minY, node.position.y),
        maxX: Math.max(bounds.maxX, node.position.x + size.width),
        maxY: Math.max(bounds.maxY, node.position.y + size.height),
      }
    },
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  )
}

function moveComponent(component: string[], byId: Map<string, Node>, deltaX: number, deltaY: number) {
  component.forEach((id) => {
    const node = byId.get(id)
    if (!node) return
    node.position.x += deltaX
    node.position.y += deltaY
  })
}

type Network = {
  branchId: string
  nodeIds: string[]
  edges: Edge[]
}

function collectBranchNetworks(nodes: Node[], edges: Edge[]): Network[] {
  const byBranch = new Map<string, string[]>()

  nodes.forEach((node) => {
    const branchId = nodeBranchId(node)
    if (!branchId) return
    const list = byBranch.get(branchId) || []
    list.push(node.id)
    byBranch.set(branchId, list)
  })

  const networks: Network[] = []
  byBranch.forEach((nodeIds, branchId) => {
    const idSet = new Set(nodeIds)
    const networkEdges = edges.filter(
      (edge) =>
        edge.source !== edge.target && idSet.has(edge.source) && idSet.has(edge.target)
    )
    networks.push({ branchId, nodeIds, edges: networkEdges })
  })

  return networks.sort((a, b) => a.branchId.localeCompare(b.branchId))
}

function uniqueSorted(ids: string[]) {
  return [...new Set(ids)].sort()
}

function buildAdjacency(network: Network) {
  const outgoing = new Map<string, string[]>()
  const incoming = new Map<string, string[]>()

  network.edges.forEach((edge) => {
    const outs = outgoing.get(edge.source) || []
    outs.push(edge.target)
    outgoing.set(edge.source, outs)

    const ins = incoming.get(edge.target) || []
    ins.push(edge.source)
    incoming.set(edge.target, ins)
  })

  outgoing.forEach((list, key) => outgoing.set(key, uniqueSorted(list)))
  incoming.forEach((list, key) => incoming.set(key, uniqueSorted(list)))

  return { outgoing, incoming }
}

function compareByBoardOrder(a: string, b: string, byId: Map<string, Node>) {
  const na = byId.get(a)
  const nb = byId.get(b)
  const dy = (na?.position.y ?? 0) - (nb?.position.y ?? 0)
  if (dy) return dy
  const dx = (na?.position.x ?? 0) - (nb?.position.x ?? 0)
  if (dx) return dx
  return a.localeCompare(b)
}

/** Shortest-path layers from the branch root. Used to pick one layout parent per node. */
function computeBfsRanks(rootId: string, outgoing: Map<string, string[]>) {
  const ranks = new Map<string, number>()
  ranks.set(rootId, 0)
  const queue = [rootId]

  while (queue.length > 0) {
    const id = queue.shift()!
    const rank = ranks.get(id) || 0
    for (const next of outgoing.get(id) || []) {
      if (ranks.has(next)) continue
      ranks.set(next, rank + 1)
      queue.push(next)
    }
  }

  return ranks
}

/** Longest-path layers so sinks sit on the far side of the flow. */
function computeLongestPathRanks(
  rootId: string,
  nodeIds: string[],
  outgoing: Map<string, string[]>,
  incoming: Map<string, string[]>
) {
  const reachable = new Set(computeBfsRanks(rootId, outgoing).keys())
  const indeg = new Map<string, number>()
  reachable.forEach((id) => indeg.set(id, 0))
  reachable.forEach((id) => {
    for (const src of incoming.get(id) || []) {
      if (reachable.has(src)) indeg.set(id, (indeg.get(id) || 0) + 1)
    }
  })
  indeg.set(rootId, 0)

  const remaining = new Map(indeg)
  const queue = [...reachable].filter((id) => (remaining.get(id) || 0) === 0)
  queue.sort((a, b) => (a === rootId ? -1 : b === rootId ? 1 : a.localeCompare(b)))

  const topo: string[] = []
  while (queue.length > 0) {
    const id = queue.shift()!
    topo.push(id)
    for (const next of outgoing.get(id) || []) {
      if (!reachable.has(next)) continue
      const nextDeg = (remaining.get(next) || 0) - 1
      remaining.set(next, nextDeg)
      if (nextDeg === 0) queue.push(next)
    }
  }

  const ranks = new Map<string, number>()
  ranks.set(rootId, 0)
  for (const id of topo) {
    const current = ranks.get(id) || 0
    for (const next of outgoing.get(id) || []) {
      if (!reachable.has(next)) continue
      ranks.set(next, Math.max(ranks.get(next) || 0, current + 1))
    }
  }

  nodeIds.forEach((id) => {
    if (ranks.has(id)) return
    let best = 0
    for (const src of incoming.get(id) || []) {
      if (ranks.has(src)) best = Math.max(best, (ranks.get(src) || 0) + 1)
    }
    ranks.set(id, best)
  })

  return ranks
}

/**
 * BFS spanning tree: first visit wins, siblings keep the current board order.
 * Extra DAG edges stay drawn but do not steal or double-count subtrees.
 */
function buildSpanningTree(
  rootId: string,
  nodeIds: string[],
  outgoing: Map<string, string[]>,
  byId: Map<string, Node>
) {
  const children = new Map<string, string[]>()
  nodeIds.forEach((id) => children.set(id, []))

  const visited = new Set<string>([rootId])
  const queue = [rootId]

  while (queue.length > 0) {
    const id = queue.shift()!
    const kids = (outgoing.get(id) || [])
      .filter((target) => !visited.has(target))
      .sort((a, b) => compareByBoardOrder(a, b, byId))
    children.set(id, kids)
    kids.forEach((kid) => {
      visited.add(kid)
      queue.push(kid)
    })
  }

  return children
}

type LayoutBox = { id: string; x: number; y: number; w: number; h: number }

function boxesOverlap(a: LayoutBox, b: LayoutBox, gap: number) {
  return (
    a.x < b.x + b.w + gap &&
    a.x + a.w + gap > b.x &&
    a.y < b.y + b.h + gap &&
    a.y + a.h + gap > b.y
  )
}

/** Lightweight safety net — tidy tree should already avoid overlaps. */
function resolveNodeOverlaps(
  nodeIds: string[],
  byId: Map<string, Node>,
  gap: number,
  snapGrid: number,
  crossAxis: 'x' | 'y' = 'y'
) {
  const boxes: LayoutBox[] = nodeIds
    .map((id) => {
      const node = byId.get(id)
      if (!node) return null
      const size = getNodeSize(node)
      return {
        id,
        x: node.position.x,
        y: node.position.y,
        w: size.width,
        h: size.height,
      }
    })
    .filter((box): box is LayoutBox => !!box)

  boxes.sort((a, b) =>
    crossAxis === 'y'
      ? a.y - b.y || a.x - b.x || a.id.localeCompare(b.id)
      : a.x - b.x || a.y - b.y || a.id.localeCompare(b.id)
  )

  for (let pass = 0; pass < 24; pass++) {
    let moved = false
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i]
        const b = boxes[j]
        if (!boxesOverlap(a, b, gap)) continue

        if (crossAxis === 'y') {
          b.y = a.y + a.h + gap
        } else {
          b.x = a.x + a.w + gap
        }
        moved = true
      }
    }
    if (!moved) break
  }

  boxes.forEach((box) => {
    const node = byId.get(box.id)
    if (!node) return
    node.position = {
      x: snap(box.x, snapGrid),
      y: snap(box.y, snapGrid),
    }
  })
}

function flowFromDirection(direction: LayoutDirection): HandleSide {
  return direction === 'TB' ? 'bottom' : 'right'
}

/**
 * HubSpot-style tidy tree on a spanning tree of the DAG:
 * forced primary axis, subtree-height spacing, parent centered on children.
 * Shared descendants are counted once; columns follow BFS rank.
 */
function layoutSingleNetwork(
  network: Network,
  byId: Map<string, Node>,
  options: Required<Pick<LayoutOptions, 'edgeGap' | 'nodeSep' | 'snapGrid'>>,
  direction: LayoutDirection
): HandleSide {
  const { edgeGap, nodeSep, snapGrid } = options
  const flow = flowFromDirection(direction)
  const horizontal = flow === 'left' || flow === 'right'
  const crossAxis: 'x' | 'y' = horizontal ? 'y' : 'x'

  const branchNode =
    byId.get(network.branchId) ||
    network.nodeIds.map((id) => byId.get(id)!).find((node) => node?.type === 'branch-node')

  if (!branchNode) return flow

  const { outgoing, incoming } = buildAdjacency(network)
  const ranks = computeLongestPathRanks(branchNode.id, network.nodeIds, outgoing, incoming)
  const tree = buildSpanningTree(branchNode.id, network.nodeIds, outgoing, byId)
  const placed = new Set<string>()
  const spanCache = new Map<string, number>()

  const kidsOf = (parentId: string) => tree.get(parentId) || []

  const nodeCrossSize = (node: Node) => {
    const size = getNodeSize(node)
    return horizontal ? size.height : size.width
  }

  const nodeFlowSize = (node: Node) => {
    const size = getNodeSize(node)
    return horizontal ? size.width : size.height
  }

  const columnPitch =
    network.nodeIds.reduce((max, id) => {
      const node = byId.get(id)
      return node ? Math.max(max, nodeFlowSize(node)) : max
    }, 0) + edgeGap

  const subtreeSpan = (id: string): number => {
    const cached = spanCache.get(id)
    if (cached !== undefined) return cached

    const node = byId.get(id)
    if (!node) return 0

    const kids = kidsOf(id)
    const self = nodeCrossSize(node)
    let span = self
    if (kids.length > 0) {
      const childSpans = kids.map((kid) => subtreeSpan(kid))
      const stacked =
        childSpans.reduce((sum, value) => sum + value, 0) + nodeSep * (kids.length - 1)
      span = Math.max(self, stacked)
    }

    spanCache.set(id, span)
    return span
  }

  const placeTree = (id: string, crossCenter: number) => {
    const node = byId.get(id)
    if (!node || placed.has(id)) return

    const size = getNodeSize(node)
    const rank = ranks.get(id) ?? 0
    const mainOrigin = rank * columnPitch
    if (horizontal) {
      node.position = {
        x: snap(mainOrigin, snapGrid),
        y: snap(crossCenter - size.height / 2, snapGrid),
      }
    } else {
      node.position = {
        x: snap(crossCenter - size.width / 2, snapGrid),
        y: snap(mainOrigin, snapGrid),
      }
    }
    placed.add(id)

    const kids = kidsOf(id).filter((kid) => !placed.has(kid))
    if (kids.length === 0) return

    const childSpans = kids.map((kid) => subtreeSpan(kid))
    const total =
      childSpans.reduce((sum, value) => sum + value, 0) + nodeSep * (kids.length - 1)
    let cursor = crossCenter - total / 2

    kids.forEach((kid, index) => {
      const span = childSpans[index]
      placeTree(kid, cursor + span / 2)
      cursor += span + nodeSep
    })
  }

  spanCache.clear()
  const rootSpan = subtreeSpan(branchNode.id)
  placeTree(branchNode.id, rootSpan / 2)

  const orphans = network.nodeIds.filter((id) => !placed.has(id))
  if (orphans.length > 0) {
    const bounds = getComponentBounds([...placed], byId)
    const maxRank = Math.max(0, ...[...ranks.values()])
    orphans.forEach((id) => {
      if (!ranks.has(id)) ranks.set(id, maxRank + 1)
    })

    orphans.forEach((id) => {
      spanCache.delete(id)
    })

    const orphanSpans = orphans.map((id) => subtreeSpan(id))
    const total =
      orphanSpans.reduce((sum, value) => sum + value, 0) +
      nodeSep * Math.max(orphans.length - 1, 0)
    let cursor =
      (Number.isFinite(bounds.minY) ? (bounds.minY + bounds.maxY) / 2 : 0) - total / 2

    orphans.forEach((id, index) => {
      const span = orphanSpans[index]
      placeTree(id, cursor + span / 2)
      cursor += span + nodeSep
    })
  }

  resolveNodeOverlaps(network.nodeIds, byId, nodeSep, snapGrid, crossAxis)

  const bounds = getComponentBounds(network.nodeIds, byId)
  if (Number.isFinite(bounds.minX)) {
    moveComponent(network.nodeIds, byId, -bounds.minX, -bounds.minY)
  }

  return flow
}

function packNetworks(
  networks: Network[],
  byId: Map<string, Node>,
  marginX: number,
  marginY: number,
  componentGap: number,
  snapGrid: number
) {
  const ordered = [...networks].sort((a, b) => a.branchId.localeCompare(b.branchId))
  let cursorY = marginY

  ordered.forEach((network) => {
    const bounds = getComponentBounds(network.nodeIds, byId)
    if (!Number.isFinite(bounds.minX)) return
    const height = bounds.maxY - bounds.minY
    moveComponent(
      network.nodeIds,
      byId,
      snap(marginX - bounds.minX, snapGrid),
      snap(cursorY - bounds.minY, snapGrid)
    )
    cursorY += height + componentGap
  })
}

function forcedFlowPorts(flow: HandleSide): { sourceSide: HandleSide; targetSide: HandleSide } {
  return { sourceSide: flow, targetSide: oppositeSide(flow) }
}

export function useAutoLayout() {
  function applyNetworkLayout(
    nodes: Node[],
    edges: Edge[],
    direction: LayoutDirection = 'LR',
    options: LayoutOptions = {}
  ): NetworkLayoutResult {
    if (nodes.length === 0) return { nodes: [], edges }

    const snapGrid = options.snapGrid || 20
    const nodeSep = options.nodeSep || 48
    const edgeGap = options.edgeGap || options.rankSep || 96
    const componentGap = options.componentGap || 72
    const marginX = options.marginX || 80
    const marginY = options.marginY || 80
    const flow = flowFromDirection(direction)

    const layoutedNodes = nodes.map((node) => ({
      ...node,
      position: { ...node.position },
    }))
    const byId = new Map(layoutedNodes.map((node) => [node.id, node]))
    const validEdges = edges.filter(
      (edge) => edge.source !== edge.target && byId.has(edge.source) && byId.has(edge.target)
    )

    const networks = collectBranchNetworks(layoutedNodes, validEdges)

    networks.forEach((network) => {
      layoutSingleNetwork(network, byId, { edgeGap, nodeSep, snapGrid }, direction)
    })

    packNetworks(networks, byId, marginX, marginY, componentGap, snapGrid)

    resolveNodeOverlaps(
      layoutedNodes.map((node) => node.id),
      byId,
      nodeSep,
      snapGrid,
      direction === 'TB' ? 'x' : 'y'
    )

    const { sourceSide, targetSide } = forcedFlowPorts(flow)
    const syncedEdges = validEdges.map((edge) => ({
      ...edge,
      sourceHandle: sourcePortId(edge.source, sourceSide),
      targetHandle: targetPortId(edge.target, targetSide),
      type: edge.type || 'smoothstep',
    }))

    return { nodes: layoutedNodes, edges: syncedEdges }
  }

  function applyLayout(
    nodes: Node[],
    edges: Edge[],
    direction: LayoutDirection = 'LR',
    options: LayoutOptions = {}
  ) {
    return applyNetworkLayout(nodes, edges, direction, options).nodes
  }

  function syncEdgeHandles(
    edges: Edge[],
    byId: Map<string, Node>,
    flow: HandleSide = 'right'
  ): Edge[] {
    const { sourceSide, targetSide } = forcedFlowPorts(flow)
    return edges.map((edge) => {
      if (!byId.has(edge.source) || !byId.has(edge.target)) return edge
      return {
        ...edge,
        sourceHandle: sourcePortId(edge.source, sourceSide),
        targetHandle: targetPortId(edge.target, targetSide),
      }
    })
  }

  return { applyLayout, applyNetworkLayout, syncEdgeHandles }
}
