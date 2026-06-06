declare module 'dagre' {
  const dagre: {
    graphlib: {
      Graph: new () => {
        setGraph(options: Record<string, unknown>): void
        setDefaultEdgeLabel(factory: () => Record<string, unknown>): void
        setNode(id: string, value: { width: number; height: number }): void
        setEdge(source: string, target: string): void
        node(id: string): { x: number; y: number }
      }
    }
    layout(graph: unknown): void
  }

  export default dagre
}
