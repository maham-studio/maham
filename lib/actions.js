'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from './db';
import { getCurrentUser, can, setSessionCookie, clearSessionCookie } from './auth';
import { notify, taskWatchers, reviewers } from './notify';
import { STATES } from './constants';

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}
async function requirePerm(perm) {
  const user = await requireUser();
  if (!can(user, perm)) throw new Error('ليس لديك صلاحية');
  return user;
}
async function log(taskId, userId, action, detail = '') {
  await db.activity.create({ data: { taskId, userId, action, detail } });
}

// ---------- Auth ----------
export async function login(prev, formData) {
  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '');
  const user = await db.user.findFirst({ where: { OR: [{ username }, { email: username }] } });
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return { error: 'بيانات الدخول غير صحيحة' };
  }
  setSessionCookie(user.id);
  redirect('/tasks');
}
export async function logout() {
  clearSessionCookie();
  redirect('/login');
}

// ---------- Users ----------
export async function createUser(prev, formData) {
  await requirePerm('manage_users');
  const name = String(formData.get('name') || '').trim();
  const username = String(formData.get('username') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const roleId = String(formData.get('roleId') || '');
  if (!name || !username || !email || !password || !roleId) return { error: 'كل الحقول مطلوبة' };
  const exists = await db.user.findFirst({ where: { OR: [{ username }, { email }] } });
  if (exists) return { error: 'اسم المستخدم أو البريد مستخدم بالفعل' };
  await db.user.create({ data: { name, username, email, roleId, passwordHash: bcrypt.hashSync(password, 10) } });
  revalidatePath('/admin/users');
  return { ok: 'تم إنشاء الحساب' };
}

// ---------- Roles ----------
export async function createRole(prev, formData) {
  await requirePerm('manage_roles');
  const name = String(formData.get('name') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const permissions = formData.getAll('permissions').map(String);
  if (!name) return { error: 'اسم الدور مطلوب' };
  const exists = await db.role.findUnique({ where: { name } });
  if (exists) return { error: 'هذا الدور موجود بالفعل' };
  await db.role.create({ data: { name, description, permissions: JSON.stringify(permissions) } });
  revalidatePath('/admin/roles');
  return { ok: 'تم إنشاء الدور' };
}
export async function updateRole(prev, formData) {
  await requirePerm('manage_roles');
  const id = String(formData.get('id') || '');
  const description = String(formData.get('description') || '').trim();
  const permissions = formData.getAll('permissions').map(String);
  await db.role.update({ where: { id }, data: { description, permissions: JSON.stringify(permissions) } });
  revalidatePath('/admin/roles');
  return { ok: 'تم حفظ الصلاحيات' };
}

// ---------- Projects ----------
export async function createProject(prev, formData) {
  await requirePerm('manage_projects');
  const name = String(formData.get('name') || '').trim();
  const client = String(formData.get('client') || '').trim();
  const description = String(formData.get('description') || '').trim();
  if (!name || !client) return { error: 'اسم المشروع والعميل مطلوبان' };
  await db.project.create({ data: { name, client, description } });
  revalidatePath('/admin/projects');
  return { ok: 'تم إنشاء المشروع' };
}

// ---------- Tasks ----------
export async function createTask(prev, formData) {
  const me = await requirePerm('view_all_tasks');
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const projectId = String(formData.get('projectId') || '');
  const priority = String(formData.get('priority') || 'متوسطة');
  const deadlineStr = String(formData.get('deadline') || '');
  const assigneeIds = formData.getAll('assignees').map(String);
  if (!title || !projectId) return { error: 'العنوان والمشروع مطلوبان' };
  const task = await db.task.create({
    data: {
      title, description, projectId, priority, createdBy: me.id,
      deadline: deadlineStr ? new Date(deadlineStr + 'T12:00:00') : null,
      assignees: { create: assigneeIds.map(userId => ({ userId })) },
    },
  });
  await log(task.id, me.id, 'أنشأ المهمة');
  await notify(assigneeIds, 'assign', `أُسندت إليك مهمة جديدة: "${title}"`, task.id);
  revalidatePath('/admin');
  return { ok: 'تم إنشاء المهمة', taskId: task.id };
}

export async function createFromTemplate(prev, formData) {
  const me = await requirePerm('view_all_tasks');
  const templateId = String(formData.get('templateId') || '');
  const projectId = String(formData.get('projectId') || '');
  const startStr = String(formData.get('start') || '');
  if (!templateId || !projectId) return { error: 'اختر القالب والمشروع' };
  const template = await db.template.findUnique({ where: { id: templateId }, include: { steps: { orderBy: { order: 'asc' } } } });
  if (!template || !template.steps.length) return { error: 'القالب غير موجود أو بلا خطوات' };
  const base = startStr ? new Date(startStr + 'T12:00:00') : new Date();
  for (const step of template.steps) {
    const deadline = new Date(base);
    deadline.setDate(deadline.getDate() + step.daysOffset);
    const task = await db.task.create({
      data: { title: step.title, description: `من قالب: ${template.name}`, projectId, priority: step.priority, deadline, createdBy: me.id },
    });
    await log(task.id, me.id, 'أنشأ المهمة من قالب', template.name);
  }
  revalidatePath('/admin');
  return { ok: `تم إنشاء ${template.steps.length} مهام من القالب` };
}

export async function changeState(prev, formData) {
  const me = await requireUser();
  const taskId = String(formData.get('taskId') || '');
  const next = String(formData.get('state') || '');
  const revisionNote = String(formData.get('revisionNote') || '').trim();
  if (!STATES.includes(next)) return { error: 'حالة غير صالحة' };
  const task = await db.task.findUnique({ where: { id: taskId }, include: { assignees: true } });
  if (!task) return { error: 'المهمة غير موجودة' };
  const isAssignee = task.assignees.some(a => a.userId === me.id);
  const reviewer = can(me, 'review_tasks');
  const allowed = reviewer ||
    (isAssignee && ['جديدة', 'قيد التنفيذ', 'مستنية مراجعة', 'عندها تعديلات'].includes(task.state) && next !== 'مكتملة');
  if (!allowed) return { error: 'غير مسموح بهذا الانتقال' };
  if (next === 'عندها تعديلات' && !revisionNote) return { error: 'اكتب سبب التعديلات المطلوبة' };
  await db.task.update({ where: { id: taskId }, data: { state: next } });
  if (revisionNote) {
    await db.comment.create({ data: { taskId, userId: me.id, body: revisionNote, kind: 'revision' } });
  }
  await log(taskId, me.id, 'غيّر الحالة', `${task.state} ← ${next}`);
  const watchers = await taskWatchers(task, me.id);
  await notify(watchers, 'state', `تغيّرت حالة "${task.title}" إلى: ${next}`, taskId);
  if (next === 'مستنية مراجعة') {
    await notify(await reviewers(), 'review', `مهمة "${task.title}" بانتظار المراجعة`, taskId);
  }
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath('/tasks');
  revalidatePath('/admin');
  return { ok: 'تم تحديث الحالة' };
}

export async function addComment(prev, formData) {
  const me = await requireUser();
  const taskId = String(formData.get('taskId') || '');
  const body = String(formData.get('body') || '').trim();
  if (!body) return { error: 'اكتب تعليقًا أولًا' };
  const task = await db.task.findUnique({ where: { id: taskId }, include: { assignees: true } });
  if (!task) return { error: 'المهمة غير موجودة' };
  await db.comment.create({ data: { taskId, userId: me.id, body } });
  await log(taskId, me.id, 'أضاف تعليقًا');
  const watchers = await taskWatchers(task, me.id);
  await notify(watchers, 'comment', `تعليق جديد من ${me.name} على "${task.title}"`, taskId);
  revalidatePath(`/tasks/${taskId}`);
  return { ok: 'تم' };
}

export async function addLink(prev, formData) {
  const me = await requireUser();
  const taskId = String(formData.get('taskId') || '');
  const title = String(formData.get('title') || '').trim();
  const url = String(formData.get('url') || '').trim();
  if (!title || !url) return { error: 'العنوان والرابط مطلوبان' };
  await db.attachmentLink.create({ data: { taskId, title, url } });
  await log(taskId, me.id, 'أضاف رابطًا', title);
  revalidatePath(`/tasks/${taskId}`);
  return { ok: 'تم' };
}

// ---------- Templates ----------
export async function createTemplate(prev, formData) {
  await requirePerm('manage_templates');
  const name = String(formData.get('name') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const stepsJson = String(formData.get('steps') || '[]');
  let steps;
  try { steps = JSON.parse(stepsJson); } catch { return { error: 'خطوات غير صالحة' }; }
  steps = steps.filter(s => s.title && s.title.trim());
  if (!name) return { error: 'اسم القالب مطلوب' };
  if (!steps.length) return { error: 'أضف خطوة واحدة على الأقل' };
  await db.template.create({
    data: {
      name, description,
      steps: { create: steps.map((s, i) => ({ title: s.title.trim(), order: i + 1, daysOffset: Math.max(1, parseInt(s.daysOffset) || 1), priority: s.priority || 'متوسطة' })) },
    },
  });
  revalidatePath('/admin/templates');
  return { ok: 'تم حفظ القالب' };
}
export async function deleteTemplate(prev, formData) {
  await requirePerm('manage_templates');
  await db.template.delete({ where: { id: String(formData.get('id')) } });
  revalidatePath('/admin/templates');
  return { ok: 'تم الحذف' };
}

// ---------- Notifications ----------
export async function markAllRead() {
  const me = await requireUser();
  await db.notification.updateMany({ where: { userId: me.id, read: false }, data: { read: true } });
  revalidatePath('/notifications');
}
