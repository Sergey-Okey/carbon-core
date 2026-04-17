import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId, user, tasks, branches, rewards, tags, ui, settings } = body

  if (!userId) {
    throw createError({ statusCode: 400, message: 'userId is required' })
  }

  // Транзакция для атомарного обновления
  await prisma.$transaction(async (tx) => {
    // User
    await tx.user.upsert({
      where: { id: userId },
      update: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        totalXP: user.totalXP,
        gold: user.gold,
        leaguePoints: user.leaguePoints,
      },
      create: { id: userId, ...user },
    })

    // Tasks
    await tx.task.deleteMany({ where: { userId } })
    if (tasks.length) {
      await tx.task.createMany({
        data: tasks.map((t: any) => ({
          ...t,
          userId,
          tagIds: JSON.stringify(t.tagIds),
        })),
      })
    }

    // Branches & Milestones
    await tx.milestone.deleteMany({ where: { branch: { userId } } })
    await tx.branch.deleteMany({ where: { userId } })
    for (const b of branches) {
      await tx.branch.create({
        data: {
          id: b.id,
          displayName: b.displayName,
          icon: b.icon,
          description: b.description,
          taskIds: JSON.stringify(b.taskIds),
          order: b.order,
          userId,
          milestones: {
            create: b.milestones.map((m: any) => ({
              id: m.id,
              name: m.name,
              description: m.description,
              icon: m.icon,
              requiredXP: m.requiredXP,
              currentXP: m.currentXP,
              status: m.status,
              taskIds: JSON.stringify(m.taskIds),
              positionX: m.position.x,
              positionY: m.position.y,
            })),
          },
        },
      })
    }

    // Rewards
    await tx.reward.deleteMany({ where: { userId } })
    if (rewards.length) {
      await tx.reward.createMany({
        data: rewards.map((r: any) => ({
          ...r,
          userId,
          effect: JSON.stringify(r.effect),
        })),
      })
    }

    // Tags
    await tx.tag.deleteMany({ where: { userId } })
    if (tags.length) {
      await tx.tag.createMany({
        data: tags.map((t: any) => ({ ...t, userId })),
      })
    }

    // UI
    await tx.uI.upsert({
      where: { userId },
      update: { ...ui },
      create: { ...ui, userId },
    })

    // Settings
    await tx.settings.upsert({
      where: { userId },
      update: { ...settings },
      create: { ...settings, userId },
    })
  })

  return { success: true }
})
