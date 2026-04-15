export function useAutoLayout() {
  function applyGridLayout(
    items: { id: string; position: { x: number; y: number } }[],
    cols = 4
  ) {
    const spacing = 300
    return items.map((_, i) => ({
      x: (i % cols) * spacing + 200,
      y: Math.floor(i / cols) * 200 + 200,
    }))
  }
  return { applyGridLayout }
}
