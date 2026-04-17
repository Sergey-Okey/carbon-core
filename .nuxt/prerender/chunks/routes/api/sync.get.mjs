import { defineEventHandler, getQuery, createError } from 'file://C:/Users/smm/Documents/Programing%20Dev/carbon-core/node_modules/h3/dist/index.mjs';
import { p as prisma } from '../../_/prisma.mjs';
import 'file://C:/Users/smm/Documents/Programing%20Dev/carbon-core/node_modules/@prisma/client/default.js';

const sync_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const userId = query.userId;
  if (!userId) {
    throw createError({ statusCode: 400, message: "userId is required" });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const tasks = await prisma.task.findMany({ where: { userId } });
  const branches = await prisma.branch.findMany({
    where: { userId },
    include: { milestones: true }
  });
  const rewards = await prisma.reward.findMany({ where: { userId } });
  const tags = await prisma.tag.findMany({ where: { userId } });
  const ui = await prisma.uI.findUnique({ where: { userId } });
  const settings = await prisma.settings.findUnique({ where: { userId } });
  const parseJson = (data) => {
    if (!data) return data;
    return {
      ...data,
      tagIds: data.tagIds ? JSON.parse(data.tagIds) : [],
      taskIds: data.taskIds ? JSON.parse(data.taskIds) : [],
      effect: data.effect ? JSON.parse(data.effect) : void 0
    };
  };
  return {
    user,
    tasks: tasks.map(parseJson),
    branches: branches.map((b) => ({
      ...b,
      taskIds: b.taskIds ? JSON.parse(b.taskIds) : [],
      milestones: b.milestones.map((m) => ({
        ...m,
        taskIds: m.taskIds ? JSON.parse(m.taskIds) : [],
        position: { x: m.positionX, y: m.positionY }
      }))
    })),
    rewards: rewards.map(parseJson),
    tags,
    ui,
    settings
  };
});

export { sync_get as default };
//# sourceMappingURL=sync.get.mjs.map
