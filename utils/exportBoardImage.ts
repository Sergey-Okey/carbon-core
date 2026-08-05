import { getSmoothStepPath, Position } from '@vue-flow/core'
import type { Edge } from '@vue-flow/core'
import type { Branch } from '~/types/branch.types'
import type { Task } from '~/types/task.types'

const BRANCH_W = 240
const MILESTONE_W = 220
const BRANCH_BASE_H = 138
const MILESTONE_BASE_H = 120
const CARD_PAD = 14
const DETAIL_GAP = 10
const DETAIL_PAD = 12
const LINE = 16
const MAX_DETAIL_H = 260
const PACK_GAP = 28
const CANVAS_PAD = 48
const PIXEL_RATIO = 2

type PortSide = 'top' | 'right' | 'bottom' | 'left'

type ExportTask = { title: string; done: boolean }

type ExportNode = {
  id: string
  kind: 'branch' | 'milestone'
  x: number
  y: number
  w: number
  h: number
  title: string
  color: string
  description: string
  tasks: ExportTask[]
  completedCount: number
  totalCount: number
  isCompleted: boolean
  baseH: number
}

type ThemeColors = {
  bg: string
  surface: string
  border: string
  text: string
  dim: string
  accent: string
  success: string
}

function cssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

function resolveColor(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback
  const trimmed = raw.trim()
  if (trimmed.startsWith('var(')) {
    const match = trimmed.match(/var\(\s*(--[\w-]+)/)
    if (match) return cssVar(match[1], fallback)
  }
  return trimmed
}

function readTheme(): ThemeColors {
  return {
    bg: cssVar('--bg', '#121212'),
    surface: cssVar('--color-surface-1', cssVar('--surface', '#1e1e1e')),
    border: cssVar('--ui-border-color', cssVar('--border', '#2a2a2a')),
    text: cssVar('--text', '#f0f0f0'),
    dim: cssVar('--dim', '#888888'),
    accent: cssVar('--accent', '#d6d6d6'),
    success: cssVar('--success', '#4caf7f'),
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return []
  const lines: string[] = []
  let current = words[0]

  for (let i = 1; i < words.length; i++) {
    const next = `${current} ${words[i]}`
    if (ctx.measureText(next).width <= maxWidth) {
      current = next
      continue
    }
    lines.push(current)
    current = words[i]
    if (lines.length >= maxLines) break
  }

  if (lines.length < maxLines) lines.push(current)
  else if (lines.length) {
    const last = lines[lines.length - 1]
    lines[lines.length - 1] =
      ctx.measureText(`${last}…`).width <= maxWidth ? `${last}…` : `${last.slice(0, Math.max(1, last.length - 1))}…`
  }

  return lines
}

function measureDetailHeight(
  ctx: CanvasRenderingContext2D,
  description: string,
  tasks: ExportTask[],
  contentWidth: number
): number {
  let height = DETAIL_PAD * 2
  ctx.font = '700 11px Inter, system-ui, sans-serif'
  height += LINE
  ctx.font = '400 12px Inter, system-ui, sans-serif'
  const descLines = description
    ? wrapText(ctx, description, contentWidth, 4)
    : ['Нет описания']
  height += descLines.length * LINE + 10

  ctx.font = '700 11px Inter, system-ui, sans-serif'
  height += LINE + 4
  ctx.font = '400 12px Inter, system-ui, sans-serif'
  if (!tasks.length) {
    height += LINE
  } else {
    const visible = Math.min(tasks.length, 8)
    height += visible * LINE
    if (tasks.length > 8) height += LINE
  }

  return Math.min(MAX_DETAIL_H, height)
}

function sideToPosition(side: PortSide): Position {
  switch (side) {
    case 'top':
      return Position.Top
    case 'right':
      return Position.Right
    case 'bottom':
      return Position.Bottom
    case 'left':
    default:
      return Position.Left
  }
}

function portPoint(
  node: { x: number; y: number; w: number; h: number },
  side: PortSide
): { x: number; y: number } {
  switch (side) {
    case 'top':
      return { x: node.x + node.w / 2, y: node.y }
    case 'right':
      return { x: node.x + node.w, y: node.y + node.h / 2 }
    case 'bottom':
      return { x: node.x + node.w / 2, y: node.y + node.h }
    case 'left':
    default:
      return { x: node.x, y: node.y + node.h / 2 }
  }
}

function dominantSide(dx: number, dy: number): PortSide {
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? 'right' : 'left'
  return dy >= 0 ? 'bottom' : 'top'
}

function packNodes(nodes: ExportNode[]): ExportNode[] {
  const boxes = nodes.map((node) => ({ ...node }))
  boxes.sort((a, b) => a.y - b.y || a.x - b.x)

  const overlaps = (a: ExportNode, b: ExportNode) =>
    a.x < b.x + b.w + PACK_GAP &&
    a.x + a.w + PACK_GAP > b.x &&
    a.y < b.y + b.h + PACK_GAP &&
    a.y + a.h + PACK_GAP > b.y

  const placed: ExportNode[] = []
  for (const box of boxes) {
    let moved = true
    let guard = 0
    while (moved && guard < 64) {
      moved = false
      guard += 1
      for (const other of placed) {
        if (!overlaps(box, other)) continue
        const pushDown = other.y + other.h + PACK_GAP - box.y
        const pushRight = other.x + other.w + PACK_GAP - box.x
        if (pushDown <= pushRight) box.y += Math.max(0, pushDown)
        else box.x += Math.max(0, pushRight)
        moved = true
      }
    }
    placed.push(box)
  }
  return placed
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function drawDashedBorder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string
) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.setLineDash([5, 4])
  roundRectPath(ctx, x, y, w, h, r)
  ctx.stroke()
  ctx.restore()
}

function drawProgressDashes(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  total: number,
  completed: number,
  filled: string,
  empty: string
) {
  if (total <= 0) return
  const count = Math.min(total, 16)
  const gap = 4
  const dashW = Math.max(4, (w - gap * (count - 1)) / count)
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = i < completed ? filled : empty
    ctx.fillRect(x + i * (dashW + gap), y, dashW, 3)
  }
}

function drawCard(ctx: CanvasRenderingContext2D, node: ExportNode, theme: ThemeColors) {
  const radius = node.kind === 'branch' ? 16 : 14
  roundRectPath(ctx, node.x, node.y, node.w, node.h, radius)
  ctx.fillStyle = theme.surface
  ctx.fill()

  if (node.kind === 'branch') {
    drawDashedBorder(ctx, node.x, node.y, node.w, node.h, radius, node.color || theme.accent)
  } else {
    ctx.strokeStyle = theme.border
    ctx.lineWidth = 1.25
    roundRectPath(ctx, node.x, node.y, node.w, node.h, radius)
    ctx.stroke()
  }

  const contentX = node.x + CARD_PAD
  const contentW = node.w - CARD_PAD * 2
  let cy = node.y + CARD_PAD


  ctx.fillStyle = node.color || theme.accent
  ctx.fillRect(node.x + node.w - CARD_PAD - 8, cy + 4, 8, 8)


  ctx.fillStyle = theme.text
  ctx.font = '600 15px Inter, system-ui, sans-serif'
  const titleLines = wrapText(ctx, node.title, contentW - 20, 2)
  for (const line of titleLines) {
    ctx.fillText(line, contentX, cy + 14)
    cy += 18
  }

  cy += 6
  drawProgressDashes(
    ctx,
    contentX,
    cy,
    contentW,
    node.totalCount,
    node.completedCount,
    node.color || theme.accent,
    theme.border
  )
  if (node.totalCount > 0) cy += 12

  ctx.fillStyle = theme.dim
  ctx.font = '500 12px Inter, system-ui, sans-serif'
  const counter =
    node.kind === 'branch'
      ? `${node.totalCount} задач`
      : `${node.completedCount} / ${node.totalCount} задач`
  ctx.fillText(counter, contentX, cy + 12)
  cy += 20

  if (node.isCompleted) {
    ctx.fillStyle = theme.success
    ctx.font = '600 11px Inter, system-ui, sans-serif'
    ctx.fillText('Выполнена', contentX, cy + 10)
    cy += 18
  }


  const detailY = node.y + node.baseH + DETAIL_GAP
  const detailH = node.h - node.baseH - DETAIL_GAP
  if (detailH < 40) return

  roundRectPath(ctx, node.x, detailY, node.w, detailH, 12)
  ctx.fillStyle = theme.surface
  ctx.fill()
  ctx.strokeStyle = theme.border
  ctx.lineWidth = 1
  roundRectPath(ctx, node.x, detailY, node.w, detailH, 12)
  ctx.stroke()

  const dx = node.x + DETAIL_PAD
  const dw = node.w - DETAIL_PAD * 2
  let dy = detailY + DETAIL_PAD
  const bottom = detailY + detailH - DETAIL_PAD

  ctx.fillStyle = theme.dim
  ctx.font = '700 11px Inter, system-ui, sans-serif'
  ctx.fillText('Описание', dx, dy + 10)
  dy += 18

  ctx.fillStyle = theme.text
  ctx.font = '400 12px Inter, system-ui, sans-serif'
  const desc = node.description || 'Нет описания'
  for (const line of wrapText(ctx, desc, dw, 4)) {
    if (dy + LINE > bottom) return
    ctx.fillText(line, dx, dy + 10)
    dy += LINE
  }

  dy += 8
  if (dy + LINE > bottom) return
  ctx.fillStyle = theme.dim
  ctx.font = '700 11px Inter, system-ui, sans-serif'
  const taskHeader =
    node.tasks.length > 0
      ? `Задачи  ${node.tasks.filter((t) => t.done).length}/${node.tasks.length}`
      : 'Задачи'
  ctx.fillText(taskHeader, dx, dy + 10)
  dy += 18

  ctx.font = '400 12px Inter, system-ui, sans-serif'
  if (!node.tasks.length) {
    ctx.fillStyle = theme.dim
    ctx.fillText('Нет привязанных задач', dx, dy + 10)
    return
  }

  const visible = node.tasks.slice(0, 8)
  visible.forEach((task, index) => {
    if (dy + LINE > bottom) return
    ctx.fillStyle = task.done ? theme.dim : theme.text
    const label = `${index + 1}. ${task.title}`
    const [line] = wrapText(ctx, label, dw, 1)
    ctx.fillText(line, dx, dy + 10)
    dy += LINE
  })

  if (node.tasks.length > 8 && dy + LINE <= bottom) {
    ctx.fillStyle = theme.dim
    ctx.fillText(`+ ещё ${node.tasks.length - 8}`, dx, dy + 10)
  }
}

function drawSmoothEdge(
  ctx: CanvasRenderingContext2D,
  source: ExportNode,
  target: ExportNode,
  color: string
) {
  const dx = target.x + target.w / 2 - (source.x + source.w / 2)
  const dy = target.y + target.h / 2 - (source.y + source.h / 2)
  const sourceSide = dominantSide(dx, dy)
  const targetSide =
    Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? 'left' : 'right') : dy >= 0 ? 'top' : 'bottom'

  const from = portPoint(source, sourceSide)
  const to = portPoint(target, targetSide)
  const [path] = getSmoothStepPath({
    sourceX: from.x,
    sourceY: from.y,
    sourcePosition: sideToPosition(sourceSide),
    targetX: to.x,
    targetY: to.y,
    targetPosition: sideToPosition(targetSide),
    borderRadius: 16,
    offset: 10,
  })

  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 1.35
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.stroke(new Path2D(path))
  ctx.restore()
}

function tasksForIds(tasks: Task[], ids: string[]): ExportTask[] {
  const byId = new Map(tasks.map((task) => [task.id, task]))
  return ids
    .map((id) => byId.get(id))
    .filter((task): task is Task => !!task)
    .map((task) => ({ title: task.title, done: !!task.done }))
}

function buildExportNodes(
  ctx: CanvasRenderingContext2D,
  branches: Branch[],
  tasks: Task[],
  theme: ThemeColors,
  getBranchTaskIds?: (branchId: string) => string[]
): ExportNode[] {
  const nodes: ExportNode[] = []

  for (const branch of branches) {
    const uniqueIds = getBranchTaskIds
      ? getBranchTaskIds(branch.id)
      : [...new Set([...(branch.directTaskIds || []), ...branch.milestones.flatMap((m) => m.taskIds), ...branch.taskIds])]
    const branchTasks = tasksForIds(tasks, uniqueIds)
    const color = resolveColor(branch.markerColor || branch.backgroundColor, theme.accent)
    const contentW = BRANCH_W - DETAIL_PAD * 2
    const detailH = measureDetailHeight(
      ctx,
      branch.description?.trim() || '',
      branchTasks,
      contentW
    )
    const isCompleted =
      branch.milestones.length > 0 && branch.milestones.every((m) => m.status === 'completed')

    nodes.push({
      id: branch.id,
      kind: 'branch',
      x: branch.position?.x ?? 100,
      y: branch.position?.y ?? 100,
      w: BRANCH_W,
      h: BRANCH_BASE_H + DETAIL_GAP + detailH,
      baseH: BRANCH_BASE_H,
      title: branch.displayName || 'Ветка',
      color,
      description: branch.description?.trim() || '',
      tasks: branchTasks,
      completedCount: branchTasks.filter((t) => t.done).length,
      totalCount: branchTasks.length,
      isCompleted,
    })

    for (const milestone of branch.milestones) {
      const milestoneTasks = tasksForIds(tasks, milestone.taskIds)
      const milestoneColor = resolveColor(
        milestone.markerColor || milestone.backgroundColor || branch.markerColor || branch.backgroundColor,
        theme.accent
      )
      const mContentW = MILESTONE_W - DETAIL_PAD * 2
      const mDetailH = measureDetailHeight(
        ctx,
        milestone.description?.trim() || '',
        milestoneTasks,
        mContentW
      )

      nodes.push({
        id: milestone.id,
        kind: 'milestone',
        x: milestone.position?.x ?? 0,
        y: milestone.position?.y ?? 0,
        w: MILESTONE_W,
        h: MILESTONE_BASE_H + DETAIL_GAP + mDetailH,
        baseH: MILESTONE_BASE_H,
        title: milestone.name || 'Этап',
        color: milestoneColor,
        description: milestone.description?.trim() || '',
        tasks: milestoneTasks,
        completedCount: milestoneTasks.filter((t) => t.done).length,
        totalCount: milestone.taskIds.length,
        isCompleted: milestone.status === 'completed',
      })
    }
  }

  return packNodes(nodes)
}

export type ExportBoardImageInput = {
  branches: Branch[]
  edges: Edge[]
  tasks: Task[]
  getBranchTaskIds?: (branchId: string) => string[]
  filename?: string
}

export async function exportBoardImage(input: ExportBoardImageInput): Promise<void> {
  const { branches, edges, tasks, getBranchTaskIds } = input
  if (!branches.length) throw new Error('empty')

  const theme = readTheme()
  const measureCanvas = document.createElement('canvas')
  const measureCtx = measureCanvas.getContext('2d')
  if (!measureCtx) throw new Error('canvas')

  const nodes = buildExportNodes(measureCtx, branches, tasks, theme, getBranchTaskIds)
  if (!nodes.length) throw new Error('empty')

  const byId = new Map(nodes.map((node) => [node.id, node]))
  const minX = Math.min(...nodes.map((n) => n.x))
  const minY = Math.min(...nodes.map((n) => n.y))
  const maxX = Math.max(...nodes.map((n) => n.x + n.w))
  const maxY = Math.max(...nodes.map((n) => n.y + n.h))
  const width = Math.ceil(maxX - minX + CANVAS_PAD * 2)
  const height = Math.ceil(maxY - minY + CANVAS_PAD * 2)

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * PIXEL_RATIO))
  canvas.height = Math.max(1, Math.round(height * PIXEL_RATIO))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')

  ctx.scale(PIXEL_RATIO, PIXEL_RATIO)
  ctx.fillStyle = theme.bg
  ctx.fillRect(0, 0, width, height)
  ctx.translate(CANVAS_PAD - minX, CANVAS_PAD - minY)

  for (const edge of edges) {
    const source = byId.get(edge.source)
    const target = byId.get(edge.target)
    if (!source || !target) continue
    const branch =
      branches.find((b) => b.id === source.id) ||
      branches.find((b) => b.milestones.some((m) => m.id === source.id))
    const color = resolveColor(
      branch?.markerColor || branch?.backgroundColor,
      theme.dim
    )
    drawSmoothEdge(ctx, source, target, color)
  }

  for (const node of nodes) {
    drawCard(ctx, node, theme)
  }

  const dataUrl = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.download =
    input.filename || `carbon-board-${new Date().toISOString().slice(0, 10)}.png`
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  link.remove()
}
