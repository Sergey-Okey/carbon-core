import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userId = query.userId as string

  if (!userId) {
    throw createError({ statusCode: 400, message: 'userId is required' })
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  const tasks = await prisma.task.findMany({ where: { userId } })
  const branches = await prisma.branch.findMany({
    where: { userId },
    include: { milestones: true },
  })
  const rewards = await prisma.reward.findMany({ where: { userId } })
  const tags = await prisma.tag.findMany({ where: { userId } })
  const ui = await prisma.uI.findUnique({ where: { userId } })
  const settings = await prisma.settings.findUnique({ where: { userId } })

  const parseJson = (data: any) => {
    if (!data) return data
    return {
      ...data,
      tagIds: data.tagIds ? JSON.parse(data.tagIds) : [],
      taskIds: data.taskIds ? JSON.parse(data.taskIds) : [],
      effect: data.effect ? JSON.parse(data.effect) : undefined,
    }
  }

  return {
    user,
    tasks: tasks.map(parseJson),
    branches: branches.map((b: any) => ({
      ...b,
      taskIds: b.taskIds ? JSON.parse(b.taskIds) : [],
      milestones: b.milestones.map((m: any) => ({
        ...m,
        taskIds: m.taskIds ? JSON.parse(m.taskIds) : [],
        position: { x: m.positionX, y: m.positionY },
      })),
    })),
    rewards: rewards.map(parseJson),
    tags,
    ui,
    settings,
  }
})
