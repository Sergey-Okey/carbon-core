import dagre from 'dagre'
import type { Node, Edge } from '@vue-flow/core'

type LayoutDirection = 'TB' | 'LR'

type LayoutOptions = {
  nodeSep?: number
  rankSep?: number
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

function isVerticalLaneEdge(edge: Edge) {
  return (
    edge.sourceHandle?.startsWith('source-bottom') ||
    edge.targetHandle?.startsWith('target-top')
  )
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
    const marginX = options.marginX || 80
    const marginY = options.marginY || 80

    g.setGraph({
      rankdir: direction,
      nodesep: nodeSep,
      ranksep: rankSep,
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

    // Получаем позиции от dagre, НЕ переопределяем X
    let layoutedNodes = nodes.map((node) => {
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

    // Построение карты для быстрого доступа
    const byId = new Map(layoutedNodes.map((node) => [node.id, node]))

    // Обработка вертикальных связей (source-bottom -> target-top)
    // Смещаем целевые узлы чуть вниз, чтобы не перекрывать горизонтальные линии
    const verticalEdges = edges.filter(isVerticalLaneEdge)
    const verticalGroups = new Map<string, Edge[]>()
    verticalEdges.forEach((edge) => {
      const group = verticalGroups.get(edge.source) || []
      group.push(edge)
      verticalGroups.set(edge.source, group)
    })

    verticalGroups.forEach((edgesList) => {
      edgesList.sort((a, b) => a.target.localeCompare(b.target))
      edgesList.forEach((edge, idx) => {
        const sourceNode = byId.get(edge.source)
        const targetNode = byId.get(edge.target)
        if (!sourceNode || !targetNode) return
        const targetSize = getNodeSize(targetNode)
        // Не меняем X, только слегка корректируем Y, чтобы развести вертикальные цепочки
        const yOffset = 70 * (idx + 1)
        targetNode.position.y = snap(targetNode.position.y + yOffset, snapGrid)
      })
    })

    // Корректировка коллизий по Y в пределах одной X-группы (ранга)
    const rankBuckets = new Map<number, Node[]>()
    layoutedNodes.forEach((node) => {
      const rank = snap(node.position.x, rankSep)
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

    return layoutedNodes
  }

  return { applyLayout }
}