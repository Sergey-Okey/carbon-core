import dagre from 'dagre'
import type { Node, Edge } from '@vue-flow/core'

export function useAutoLayout() {
  function applyLayout(
    nodes: Node[],
    edges: Edge[],
    direction: 'TB' | 'LR' = 'LR'
  ) {
    if (nodes.length === 0) return []

    const g = new dagre.graphlib.Graph()
    g.setGraph({
      rankdir: direction,
      nodesep: 80,
      ranksep: 150,
      marginx: 50,
      marginy: 50,
    })
    g.setDefaultEdgeLabel(() => ({}))

    nodes.forEach((node) => {
      g.setNode(node.id, { width: 220, height: 120 })
    })

    edges.forEach((edge) => {
      g.setEdge(edge.source, edge.target)
    })

    dagre.layout(g)

    return nodes.map((node) => {
      const pos = g.node(node.id)
      return {
        ...node,
        position: {
          x: pos.x - 110,
          y: pos.y - 60,
        },
      }
    })
  }

  return { applyLayout }
}
