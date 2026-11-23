import { db } from './db';

export async function notify(userIds, type, text, taskId = '') {
  const unique = [...new Set(userIds)].filter(Boolean);
  if (!unique.length) return;
  await db.notification.createMany({ data: unique.map(userId => ({ userId, type, text, taskId })) });
}

export async function taskWatchers(task, excludeUserId = null) {
  const ids = task.assignees.map(a => a.userId);
  if (task.createdBy) ids.push(task.createdBy);
  return [...new Set(ids)].filter(id => id !== excludeUserId);
}

export async function reviewers() {
  const roles = await db.role.findMany();
  const reviewRoleIds = roles.filter(r => { try { return JSON.parse(r.permissions).includes('review_tasks'); } catch { return false; } }).map(r => r.id);
  const users = await db.user.findMany({ where: { roleId: { in: reviewRoleIds } } });
  return users.map(u => u.id);
}

// Day-before-deadline reminders; cheap sweep run on page loads.
export async function sweepReminders() {
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() + 1);
  const end = new Date(start); end.setDate(end.getDate() + 1);
  const tasks = await db.task.findMany({
    where: { deadline: { gte: start, lt: end }, state: { not: 'مكتملة' } },
    include: { assignees: true },
  });
  for (const task of tasks) {
    for (const a of task.assignees) {
      const existing = await db.notification.findFirst({ where: { userId: a.userId, taskId: task.id, type: 'reminder' } });
      if (!existing) {
        await db.notification.create({ data: { userId: a.userId, taskId: task.id, type: 'reminder', text: `تذكير: مهمة "${task.title}" موعد تسليمها غدًا` } });
      }
    }
  }
}
