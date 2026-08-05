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

function handleSide(handle?: string | null): HandleSide | null {
  if (!handle) return null
  if (handle.includes('-top-')) return 'top'
  if (handle.includes('-right-')) return 'right'
  if (handle.includes('-bottom-')) return 'bottom'
  if (handle.includes('-left-')) return 'left'
  return null
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


function detectPrimarySide(network: Network, rootId: string): HandleSide {
  const counts: Record<HandleSide, number> = { top: 0, right: 0, bottom: 0, left: 0 }

  const bumpExit = (edge: Edge) => {
    const exit =
      handleSide(edge.sourceHandle) ||
      (handleSide(edge.targetHandle)
        ? oppositeSide(handleSide(edge.targetHandle)!)
        : null)
    if (exit) counts[exit] += 1
  }

  network.edges.forEach((edge) => {
    if (edge.source === rootId) bumpExit(edge)
  })

  if (Object.values(counts).every((n) => n === 0)) {
    network.edges.forEach((edge) => bumpExit(edge))
  }

  const ranked: HandleSide[] = ['right', 'bottom', 'left', 'top']
  let best: HandleSide = 'right'
  let bestCount = -1
  ranked.forEach((side) => {
    if (counts[side] > bestCount) {
      best = side
      bestCount = counts[side]
    }
  })
  return bestCount > 0 ? best : 'right'
}


function edgeExitSide(edge: Edge, fallback: HandleSide): HandleSide {
  return (
    handleSide(edge.sourceHandle) ||
    (handleSide(edge.targetHandle)
      ? oppositeSide(handleSide(edge.targetHandle)!)
      : null) ||
    fallback
  )
}


function portsFromPositions(
  source: Node,
  target: Node
): { sourceSide: HandleSide; targetSide: HandleSide } {
  const ss = getNodeSize(source)
  const ts = getNodeSize(target)
  const dx = target.position.x + ts.width / 2 - (source.position.x + ss.width / 2)
  const dy = target.position.y + ts.height / 2 - (source.position.y + ss.height / 2)
  const sourceSide: HandleSide =
    Math.abs(dx) >= Math.abs(dy)
      ? dx >= 0
        ? 'right'
        : 'left'
      : dy >= 0
        ? 'bottom'
        : 'top'
  return { sourceSide, targetSide: oppositeSide(sourceSide) }
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

  outgoing.forEach((list, key) => outgoing.set(key, [...new Set(list)].sort()))
  incoming.forEach((list, key) => incoming.set(key, [...new Set(list)].sort()))

  return { outgoing, incoming }
}


function clusterLanes(values: number[], snapGrid: number, tolerance: number) {
  const sorted = [...values].sort((a, b) => a - b)
  const groups: number[][] = []
  sorted.forEach((value) => {
    const last = groups[groups.length - 1]
    if (!last || Math.abs(last[last.length - 1] - value) > tolerance) {
      groups.push([value])
    } else {
      last.push(value)
    }
  })

  const remap = new Map<number, number>()
  groups.forEach((group) => {
    const mean = group.reduce((sum, value) => sum + value, 0) / group.length
    const lane = snap(mean, snapGrid)
    group.forEach((value) => remap.set(value, lane))
  })
  return remap
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


function resolveNodeOverlaps(
  nodeIds: string[],
  byId: Map<string, Node>,
  gap: number,
  snapGrid: number
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

  boxes.sort((a, b) => a.y - b.y || a.x - b.x || a.id.localeCompare(b.id))

  for (let pass = 0; pass < 48; pass++) {
    let moved = false
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i]
        const b = boxes[j]
        if (!boxesOverlap(a, b, gap)) continue

        const acx = a.x + a.w / 2
        const acy = a.y + a.h / 2
        const bcx = b.x + b.w / 2
        const bcy = b.y + b.h / 2
        const sameColumn = Math.abs(acx - bcx) <= Math.max(a.w, b.w) * 0.35
        const sameRow = Math.abs(acy - bcy) <= Math.max(a.h, b.h) * 0.35

        const pushRight = a.x + a.w + gap - b.x
        const pushDown = a.y + a.h + gap - b.y

        if (sameColumn && !sameRow) {
          b.y = a.y + a.h + gap
        } else if (sameRow && !sameColumn) {
          b.x = a.x + a.w + gap
        } else if (pushRight <= pushDown) {
          b.x += Math.max(0, pushRight)
        } else {
          b.y += Math.max(0, pushDown)
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


  for (let pass = 0; pass < 8; pass++) {
    let moved = false
    for (let i = 0; i < boxes.length; i++) {
      const nodeA = byId.get(boxes[i].id)!
      const sizeA = getNodeSize(nodeA)
      boxes[i].x = nodeA.position.x
      boxes[i].y = nodeA.position.y
      boxes[i].w = sizeA.width
      boxes[i].h = sizeA.height
    }
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        if (!boxesOverlap(boxes[i], boxes[j], gap)) continue
        const a = boxes[i]
        const b = boxes[j]
        const pushRight = a.x + a.w + gap - b.x
        const pushDown = a.y + a.h + gap - b.y
        if (pushRight <= pushDown) b.x += Math.max(0, pushRight)
        else b.y += Math.max(0, pushDown)
        const node = byId.get(b.id)
        if (node) {
          node.position = { x: snap(b.x, snapGrid), y: snap(b.y, snapGrid) }
        }
        moved = true
      }
    }
    if (!moved) break
  }
}


function layoutSingleNetwork(
  network: Network,
  byId: Map<string, Node>,
  options: Required<Pick<LayoutOptions, 'edgeGap' | 'nodeSep' | 'snapGrid'>>
): HandleSide {
  const { edgeGap, nodeSep, snapGrid } = options
  const branchNode =
    byId.get(network.branchId) ||
    network.nodeIds.map((id) => byId.get(id)!).find((node) => node?.type === 'branch-node')

  if (!branchNode) return 'right'

  const flow = detectPrimarySide(network, branchNode.id)
  const { outgoing } = buildAdjacency(network)


  const maxWidth = Math.max(
    ...network.nodeIds.map((id) => getNodeSize(byId.get(id)!).width)
  )
  const maxHeight = Math.max(
    ...network.nodeIds.map((id) => getNodeSize(byId.get(id)!).height)
  )
  const layerMainPitchX = maxWidth + edgeGap
  const layerMainPitchY = maxHeight + edgeGap
  const crossPitchX = maxWidth + nodeSep
  const crossPitchY = maxHeight + nodeSep

  const edgeByPair = new Map<string, Edge>()
  network.edges.forEach((edge) => {
    edgeByPair.set(`${edge.source}->${edge.target}`, edge)
  })

  branchNode.position = { x: 0, y: 0 }
  const placed = new Set<string>([branchNode.id])

  const placeChildren = (parentId: string) => {
    const parent = byId.get(parentId)
    if (!parent) return
    const parentSize = getNodeSize(parent)
    const pcx = parent.position.x + parentSize.width / 2
    const pcy = parent.position.y + parentSize.height / 2

    const childIds = (outgoing.get(parentId) || []).filter((id) => !placed.has(id))
    const bySide: Record<HandleSide, string[]> = {
      top: [],
      right: [],
      bottom: [],
      left: [],
    }

    childIds.forEach((childId) => {
      const edge = edgeByPair.get(`${parentId}->${childId}`)
      const exit = edge ? edgeExitSide(edge, flow) : flow
      bySide[exit].push(childId)
    })

    ;(['right', 'bottom', 'left', 'top'] as HandleSide[]).forEach((side) => {
      const group = bySide[side]
      if (group.length === 0) return

      const horizontal = side === 'left' || side === 'right'
      const crossPitch = horizontal ? crossPitchY : crossPitchX
      const mainPitch = horizontal ? layerMainPitchX : layerMainPitchY
      const crossSpan = Math.max(group.length - 1, 0) * crossPitch

      group.forEach((childId, index) => {
        const child = byId.get(childId)
        if (!child) return
        const childSize = getNodeSize(child)
        const cross = -crossSpan / 2 + index * crossPitch


        const mainDistance = horizontal
          ? parentSize.width / 2 + edgeGap + childSize.width / 2
          : parentSize.height / 2 + edgeGap + childSize.height / 2
        const travel = Math.max(mainPitch, mainDistance)

        let cx = pcx
        let cy = pcy
        if (side === 'right') {
          cx = pcx + travel
          cy = pcy + cross
        } else if (side === 'left') {
          cx = pcx - travel
          cy = pcy + cross
        } else if (side === 'bottom') {
          cx = pcx + cross
          cy = pcy + travel
        } else {
          cx = pcx + cross
          cy = pcy - travel
        }

        child.position = {
          x: snap(cx - childSize.width / 2, snapGrid),
          y: snap(cy - childSize.height / 2, snapGrid),
        }
        placed.add(childId)
      })

      group.forEach((childId) => placeChildren(childId))
    })
  }

  placeChildren(branchNode.id)


  const orphans = network.nodeIds.filter((id) => !placed.has(id))
  if (orphans.length > 0) {
    const rootSize = getNodeSize(branchNode)
    const rcx = branchNode.position.x + rootSize.width / 2
    const rcy = branchNode.position.y + rootSize.height / 2
    const horizontal = flow === 'left' || flow === 'right'
    const crossPitch = horizontal ? crossPitchY : crossPitchX
    const mainPitch = horizontal ? layerMainPitchX : layerMainPitchY
    const crossSpan = Math.max(orphans.length - 1, 0) * crossPitch
    orphans.forEach((id, index) => {
      const node = byId.get(id)
      if (!node) return
      const size = getNodeSize(node)
      const cross = -crossSpan / 2 + index * crossPitch
      const travel = horizontal
        ? rootSize.width / 2 + edgeGap + size.width / 2
        : rootSize.height / 2 + edgeGap + size.height / 2
      const distance = Math.max(mainPitch, travel)
      let cx = rcx
      let cy = rcy
      if (flow === 'right') {
        cx = rcx + distance
        cy = rcy + cross
      } else if (flow === 'left') {
        cx = rcx - distance
        cy = rcy + cross
      } else if (flow === 'bottom') {
        cx = rcx + cross
        cy = rcy + distance
      } else {
        cx = rcx + cross
        cy = rcy - distance
      }
      node.position = {
        x: snap(cx - size.width / 2, snapGrid),
        y: snap(cy - size.height / 2, snapGrid),
      }
      placed.add(id)
      placeChildren(id)
    })
  }


  const centers = network.nodeIds.map((id) => {
    const node = byId.get(id)!
    const size = getNodeSize(node)
    return {
      id,
      cx: node.position.x + size.width / 2,
      cy: node.position.y + size.height / 2,
    }
  })
  const laneTolerance = Math.min(snapGrid * 0.5, 8)
  const xLanes = clusterLanes(
    centers.map((item) => item.cx),
    snapGrid,
    laneTolerance
  )
  const yLanes = clusterLanes(
    centers.map((item) => item.cy),
    snapGrid,
    laneTolerance
  )
  centers.forEach((item) => {
    const node = byId.get(item.id)
    if (!node) return
    const size = getNodeSize(node)
    const cx = xLanes.get(item.cx) ?? snap(item.cx, snapGrid)
    const cy = yLanes.get(item.cy) ?? snap(item.cy, snapGrid)
    node.position = {
      x: snap(cx - size.width / 2, snapGrid),
      y: snap(cy - size.height / 2, snapGrid),
    }
  })

  resolveNodeOverlaps(network.nodeIds, byId, nodeSep, snapGrid)

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

export function useAutoLayout() {
  
  function applyNetworkLayout(
    nodes: Node[],
    edges: Edge[],
    _direction: LayoutDirection = 'LR',
    options: LayoutOptions = {}
  ): NetworkLayoutResult {
    if (nodes.length === 0) return { nodes: [], edges }

    const snapGrid = options.snapGrid || 20
    const nodeSep = options.nodeSep || 28
    const edgeGap = options.edgeGap || options.rankSep || 64
    const componentGap = options.componentGap || 56
    const marginX = options.marginX || 80
    const marginY = options.marginY || 80

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
      layoutSingleNetwork(network, byId, { edgeGap, nodeSep, snapGrid })
    })

    packNetworks(networks, byId, marginX, marginY, componentGap, snapGrid)


    resolveNodeOverlaps(
      layoutedNodes.map((node) => node.id),
      byId,
      nodeSep,
      snapGrid
    )

    const syncedEdges = validEdges.map((edge) => {
      const { sourceSide, targetSide } = portsFromPositions(
        byId.get(edge.source)!,
        byId.get(edge.target)!
      )
      return {
        ...edge,
        sourceHandle: sourcePortId(edge.source, sourceSide),
        targetHandle: targetPortId(edge.target, targetSide),
        type: edge.type || 'smoothstep',
      }
    })

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

  function syncEdgeHandles(edges: Edge[], byId: Map<string, Node>, _flow: HandleSide = 'right'): Edge[] {
    return edges.map((edge) => {
      const source = byId.get(edge.source)
      const target = byId.get(edge.target)
      if (!source || !target) return edge
      const { sourceSide, targetSide } = portsFromPositions(source, target)
      return {
        ...edge,
        sourceHandle: sourcePortId(edge.source, sourceSide),
        targetHandle: targetPortId(edge.target, targetSide),
      }
    })
  }

  return { applyLayout, applyNetworkLayout, syncEdgeHandles }
}
