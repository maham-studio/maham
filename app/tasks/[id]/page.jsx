import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { db } from '../../../lib/db';
import { getCurrentUser, can } from '../../../lib/auth';
import { addComment, addLink } from '../../../lib/actions';
import Shell from '../../../components/shell';
import StateActions from '../../../components/state-actions';
import { Form, SubmitButton } from '../../../components/form';
import { StateBadge, PriorityTag, Avatar, fmtDate, fmtDateTime, isOverdue } from '../../../components/ui';

export const dynamic = 'force-dynamic';

export default async function TaskPage({ params }) {
  const me = await getCurrentUser();
  if (!me) redirect('/login');
  const task = await db.task.findUnique({
    where: { id: params.id },
    include: {
      project: true,
      assignees: { include: { user: { include: { role: true } } } },
      comments: { include: { user: true }, orderBy: { createdAt: 'desc' } },
      links: { orderBy: { createdAt: 'desc' } },
      activities: { include: { user: true }, orderBy: { createdAt: 'desc' }, take: 30 },
    },
  });
  if (!task) notFound();
  const isAssignee = task.assignees.some(a => a.userId === me.id);
  const isReviewer = can(me, 'review_tasks');
  if (!isAssignee && !can(me, 'view_all_tasks')) notFound();

  return (
    <Shell active="/tasks">
      <div style={{ marginBottom: 16 }}><Link href="/tasks" style={{ color: 'var(--text-2)', fontSize: '.88rem' }}>← رجوع للمهام</Link></div>
      <div className="page-head">
        <div>
          <div className="page-title">{task.title}</div>
          <div className="page-sub">{task.project.client} · {task.project.name}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <PriorityTag p={task.priority} />
          <StateBadge state={task.state} />
        </div>
      </div>
      <div className="detail-grid">
        <div>
          <div className="card card-pad" style={{ marginBottom: 16 }}>
            <div className="section-title">⚙️ إجراءات الحالة</div>
            <StateActions taskId={task.id} state={task.state} isAssignee={isAssignee} isReviewer={isReviewer} />
          </div>
          <div className="card card-pad" style={{ marginBottom: 16 }}>
            <div className="section-title">📝 الوصف</div>
            <p style={{ color: 'var(--text-2)', whiteSpace: 'pre-wrap' }}>{task.description || 'بدون وصف'}</p>
          </div>
          <div className="card card-pad" style={{ marginBottom: 16 }}>
            <div className="section-title">💬 التعليقات ({task.comments.length})</div>
            {task.comments.map(c => (
              <div key={c.id} className={`comment ${c.kind === 'revision' ? 'revision' : ''}`}>
                <div className="head">
                  <span className="who">{c.kind === 'revision' ? '↩ تعديلات مطلوبة · ' : ''}{c.user.name}</span>
                  <span className="when">{fmtDateTime(c.createdAt)}</span>
                </div>
                <div style={{ fontSize: '.92rem' }}>{c.body}</div>
              </div>
            ))}
            {!task.comments.length && <p style={{ color: 'var(--text-3)', fontSize: '.88rem', marginBottom: 12 }}>لا تعليقات بعد</p>}
            <Form action={addComment}>
              <input type="hidden" name="taskId" value={task.id} />
              <textarea className="textarea" name="body" placeholder="أضف تعليقًا…" />
              <div style={{ marginTop: 8 }}><SubmitButton className="btn btn-primary btn-sm">إرسال</SubmitButton></div>
            </Form>
          </div>
          <div className="card card-pad">
            <div className="section-title">🕓 سجل النشاط</div>
            <div className="timeline">
              {task.activities.map(a => (
                <div key={a.id} className="timeline-item">
                  <div className="timeline-dot">•</div>
                  <div className="timeline-body">
                    <span className="who">{a.user?.name || 'النظام'}</span>{' '}
                    <span className="what">{a.action}{a.detail ? ` — ${a.detail}` : ''}</span>
                    <div className="when">{fmtDateTime(a.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="card card-pad" style={{ marginBottom: 16 }}>
            <div className="section-title">ℹ️ التفاصيل</div>
            <div style={{ display: 'grid', gap: 12, fontSize: '.9rem' }}>
              <div><div className="label">موعد التسليم</div>{task.deadline ? <span className={isOverdue(task) ? 'overdue' : ''}>{isOverdue(task) ? 'متأخرة · ' : ''}{fmtDate(task.deadline)}</span> : '—'}</div>
              <div><div className="label">المسند إليهم</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {task.assignees.map(a => <div key={a.userId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar name={a.user.name} size={30} /><div><div style={{ fontWeight: 700, fontSize: '.88rem' }}>{a.user.name}</div><div style={{ color: 'var(--text-3)', fontSize: '.74rem' }}>{a.user.role.name}</div></div></div>)}
                  {!task.assignees.length && <span style={{ color: 'var(--text-3)' }}>غير مسندة</span>}
                </div>
              </div>
              <div><div className="label">تاريخ الإنشاء</div>{fmtDateTime(task.createdAt)}</div>
            </div>
          </div>
          <div className="card card-pad">
            <div className="section-title">🔗 روابط المرفقات</div>
            {task.links.map(l => (
              <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className="link-item">
                <span className="ic">↗</span>
                <span style={{ fontWeight: 600, fontSize: '.88rem' }}>{l.title}</span>
              </a>
            ))}
            <Form action={addLink}>
              <input type="hidden" name="taskId" value={task.id} />
              <div className="field"><input className="input" name="title" placeholder="عنوان الرابط (مثال: فيديو المراجعة)" /></div>
              <div className="field"><input className="input" name="url" type="url" placeholder="https://drive.google.com/…" dir="ltr" /></div>
              <SubmitButton className="btn btn-ghost btn-sm">+ إضافة رابط</SubmitButton>
            </Form>
          </div>
        </div>
      </div>
    </Shell>
  );
}
