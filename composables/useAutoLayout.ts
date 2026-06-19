import dagre from 'dagre'
import type { Node, Edge } from '@vue-flow/core'

type LayoutDirection = 'TB' | 'LR'

type LayoutOptions = {
  nodeSep?: number
  rankSep?: number
  edgeGap?: number
  componentGap?: number
  marginX?: number
  marginY?: number
  snapGrid?: number
}

function snap(value: number, grid: number) {
  return Math.round(value / grid) * grid
}

function getNodeSize(node: Node) {
  if (node.type === 'branch-node') return { width: 240, height: 132 }
  if (node.type === 'milestone-node') return { width: 220, height: 122 }
  return { width: 220, height: 120 }
}

type HandleSide = 'top' | 'right' | 'bottom' | 'left'

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

function edgeVector(edge: Edge): HandleSide {
  const sourceSide = handleSide(edge.sourceHandle)
  if (sourceSide) return sourceSide

  const targetSide = handleSide(edge.targetHandle)
  return targetSide ? oppositeSide(targetSide) : 'right'
}

function vectorKey(edge: Edge) {
  return `${edge.source}:${edgeVector(edge)}`
}

function collectComponents(nodes: Node[], edges: Edge[]) {
  const adjacency = new Map<string, Set<string>>()

  nodes.forEach((node) => adjacency.set(node.id, new Set()))
  edges.forEach((edge) => {
    adjacency.get(edge.source)?.add(edge.target)
    adjacency.get(edge.target)?.add(edge.source)
  })

  const visited = new Set<string>()
  const components: string[][] = []

  nodes.forEach((node) => {
    if (visited.has(node.id)) return

    const component: string[] = []
    const queue = [node.id]
    visited.add(node.id)

    while (queue.length > 0) {
      const id = queue.shift()!
      component.push(id)

      adjacency.get(id)?.forEach((nextId) => {
        if (visited.has(nextId)) return
        visited.add(nextId)
        queue.push(nextId)
      })
    }

    components.push(component)
  })

  return components
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

export function useAutoLayout() {
  function applyLayout(
    nodes: Node[],
    edges: Edge[],
    direction: LayoutDirection = 'LR',
    options: LayoutOptions = {}
  ) {
    if (nodes.length === 0) return []

    const g = new dagre.graphlib.Graph()
    const snapGrid = options.snapGrid || 20
    const nodeSep = options.nodeSep || 100
    const rankSep = options.rankSep || 200
    const edgeGap = options.edgeGap || rankSep
    const componentGap = options.componentGap || Math.max(edgeGap, nodeSep * 2.6, 220)
    const marginX = options.marginX || 80
    const marginY = options.marginY || 80

    g.setGraph({
      rankdir: direction,
      nodesep: nodeSep,
      ranksep: edgeGap,
      marginx: marginX,
      marginy: marginY,
      acyclicer: 'greedy',
      ranker: 'network-simplex',
    })
    g.setDefaultEdgeLabel(() => ({}))

    nodes.forEach((node) => {
      g.setNode(node.id, getNodeSize(node))
    })

    edges.forEach((edge) => {
      if (edge.source !== edge.target) g.setEdge(edge.source, edge.target)
    })

    dagre.layout(g)

    const layoutedNodes = nodes.map((node) => {
      const pos = g.node(node.id)
      const size = getNodeSize(node)
      return {
        ...node,
        position: {
          x: snap(pos.x - size.width / 2, snapGrid),
          y: snap(pos.y - size.height / 2, snapGrid),
        },
      }
    })

    const byId = new Map(layoutedNodes.map((node) => [node.id, node]))
    const validEdges = edges.filter(
      (edge) => edge.source !== edge.target && byId.has(edge.source) && byId.has(edge.target)
    )
    const vectorGroups = new Map<string, Edge[]>()

    validEdges.forEach((edge) => {
      const key = vectorKey(edge)
      const group = vectorGroups.get(key) || []
      group.push(edge)
      vectorGroups.set(key, group)
    })

    const orderedEdges = [...validEdges].sort((a, b) => {
      const sourceCompare = a.source.localeCompare(b.source)
      if (sourceCompare !== 0) return sourceCompare
      return a.target.localeCompare(b.target)
    })

    for (let pass = 0; pass < 3; pass++) {
      orderedEdges.forEach((edge) => {
        const sourceNode = byId.get(edge.source)
        const targetNode = byId.get(edge.target)
        if (!sourceNode || !targetNode) return

        const vector = edgeVector(edge)
        const group = vectorGroups.get(vectorKey(edge)) || [edge]
        const siblingIndex = Math.max(0, group.findIndex((item) => item.id === edge.id))
        const centeredIndex = siblingIndex - (group.length - 1) / 2
        const sourceSize = getNodeSize(sourceNode)
        const targetSize = getNodeSize(targetNode)
        const horizontalDistance = sourceSize.width + edgeGap
        const verticalDistance = sourceSize.height + edgeGap
        const horizontalFan = (Math.max(sourceSize.height, targetSize.height) + nodeSep * 0.55) * centeredIndex
        const verticalFan = (Math.max(sourceSize.width, targetSize.width) + nodeSep * 0.55) * centeredIndex

        if (vector === 'right') {
          targetNode.position.x = snap(sourceNode.position.x + horizontalDistance, snapGrid)
          targetNode.position.y = snap(sourceNode.position.y + horizontalFan, snapGrid)
        } else if (vector === 'left') {
          targetNode.position.x = snap(sourceNode.position.x - targetSize.width - edgeGap, snapGrid)
          targetNode.position.y = snap(sourceNode.position.y + horizontalFan, snapGrid)
        } else if (vector === 'bottom') {
          targetNode.position.x = snap(sourceNode.position.x + verticalFan, snapGrid)
          targetNode.position.y = snap(sourceNode.position.y + verticalDistance, snapGrid)
        } else {
          targetNode.position.x = snap(sourceNode.position.x + verticalFan, snapGrid)
          targetNode.position.y = snap(sourceNode.position.y - targetSize.height - edgeGap, snapGrid)
        }
      })
    }

    const rankBuckets = new Map<number, Node[]>()
    layoutedNodes.forEach((node) => {
      const rank = snap(node.position.x, Math.max(edgeGap, snapGrid))
      const bucket = rankBuckets.get(rank) || []
      bucket.push(node)
      rankBuckets.set(rank, bucket)
    })

    rankBuckets.forEach((rankNodes) => {
      rankNodes.sort((a, b) => a.position.y - b.position.y)
      for (let i = 1; i < rankNodes.length; i++) {
        const prev = rankNodes[i - 1]
        const curr = rankNodes[i]
        const prevSize = getNodeSize(prev)
        const currSize = getNodeSize(curr)
        const minY = prev.position.y + prevSize.height / 2 + currSize.height / 2 + nodeSep
        if (curr.position.y < minY) {
          curr.position.y = snap(minY, snapGrid)
        }
      }
    })

    const orderedComponents = collectComponents(layoutedNodes, validEdges).sort((a, b) => {
      const aBounds = getComponentBounds(a, byId)
      const bBounds = getComponentBounds(b, byId)
      const primary = direction === 'LR' ? aBounds.minY - bBounds.minY : aBounds.minX - bBounds.minX
      if (primary !== 0) return primary
      return direction === 'LR' ? aBounds.minX - bBounds.minX : aBounds.minY - bBounds.minY
    })

    let cursor = direction === 'LR' ? marginY : marginX
    orderedComponents.forEach((component) => {
      const bounds = getComponentBounds(component, byId)
      const start = direction === 'LR' ? bounds.minY : bounds.minX
      const delta = Math.max(0, cursor - start)

      if (delta > 0) {
        if (direction === 'LR') moveComponent(component, byId, 0, snap(delta, snapGrid))
        else moveComponent(component, byId, snap(delta, snapGrid), 0)
      }

      const nextBounds = delta > 0 ? getComponentBounds(component, byId) : bounds
      cursor = (direction === 'LR' ? nextBounds.maxY : nextBounds.maxX) + componentGap
    })

    return layoutedNodes
  }

  return { applyLayout }
}
