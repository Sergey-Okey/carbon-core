import { defineEventHandler, readBody, createError } from 'file://C:/Users/smm/Documents/Programing%20Dev/carbon-core/node_modules/h3/dist/index.mjs';
import { p as prisma } from '../../_/prisma.mjs';
import 'file://C:/Users/smm/Documents/Programing%20Dev/carbon-core/node_modules/@prisma/client/default.js';

const sync_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { userId, user, tasks, branches, rewards, tags, ui, settings } = body;
  if (!userId) {
    throw createError({ statusCode: 400, message: "userId is required" });
  }
  await prisma.$transaction(async (tx) => {
    await tx.user.upsert({
      where: { id: userId },
      update: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        totalXP: user.totalXP,
        gold: user.gold,
        leaguePoints: user.leaguePoints
      },
      create: { id: userId, ...user }
    });
    await tx.task.deleteMany({ where: { userId } });
    if (tasks.length) {
      await tx.task.createMany({
        data: tasks.map((t) => ({
          ...t,
          userId,
          tagIds: JSON.stringify(t.tagIds)
        }))
      });
    }
    await tx.milestone.deleteMany({ where: { branch: { userId } } });
    await tx.branch.deleteMany({ where: { userId } });
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
            create: b.milestones.map((m) => ({
              id: m.id,
              name: m.name,
              description: m.description,
              icon: m.icon,
              requiredXP: m.requiredXP,
              currentXP: m.currentXP,
              status: m.status,
              taskIds: JSON.stringify(m.taskIds),
              positionX: m.position.x,
              positionY: m.position.y
            }))
          }
        }
      });
    }
    await tx.reward.deleteMany({ where: { userId } });
    if (rewards.length) {
      await tx.reward.createMany({
        data: rewards.map((r) => ({
          ...r,
          userId,
          effect: JSON.stringify(r.effect)
        }))
      });
    }
    await tx.tag.deleteMany({ where: { userId } });
    if (tags.length) {
      await tx.tag.createMany({
        data: tags.map((t) => ({ ...t, userId }))
      });
    }
    await tx.uI.upsert({
      where: { userId },
      update: { ...ui },
      create: { ...ui, userId }
    });
    await tx.settings.upsert({
      where: { userId },
      update: { ...settings },
      create: { ...settings, userId }
    });
  });
  return { success: true };
});

export { sync_post as default };
//# sourceMappingURL=sync.post.mjs.map
