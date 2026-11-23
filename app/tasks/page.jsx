import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '../../lib/db';
import { getCurrentUser } from '../../lib/auth';
import Shell from '../../components/shell';
import { StateBadge, PriorityTag, Avatar, fmtDate, isOverdue } from '../../components/ui';
import { STATES } from '../../lib/constants';

export const dynamic = 'force-dynamic';

export default async function MyTasks() {
  const me = await getCurrentUser();
  if (!me) redirect('/login');
  const tasks = await db.task.findMany({
    where: { assignees: { some: { userId: me.id } } },
    include: { project: true, assignees: { include: { user: true } }, _count: { select: { comments: true } } },
    orderBy: [{ state: 'asc' }, { deadline: 'asc' }],
  });
  const open = tasks.filter(t => t.state !== 'مكتملة');
  return (
    <Shell active="/tasks">
      <div className="page-head">
        <div>
          <div className="page-title">مهامي</div>
          <div className="page-sub">{open.length} مهمة مفتوحة · {tasks.length} إجمالًا</div>
        </div>
      </div>
      {STATES.map(state => {
        const list = tasks.filter(t => t.state === state);
        if (!list.length) return null;
        return (
          <div key={state} style={{ marginBottom: 24 }}>
            <div className="section-title"><StateBadge state={state} /><span style={{ color: 'var(--text-3)', fontSize: '.82rem', fontWeight: 500 }}>{list.length}</span></div>
            <div className="grid">
              {list.map(t => (
                <Link key={t.id} href={`/tasks/${t.id}`} className="card task-card">
                  <div className="top">
                    <div>
                      <div className="task-title">{t.title}</div>
                      <div className="task-project">{t.project.client} · {t.project.name}</div>
                    </div>
                    <PriorityTag p={t.priority} />
                  </div>
                  <div className="task-meta">
                    {t.deadline && <span className={`item ${isOverdue(t) ? 'overdue' : ''}`}>📅 {isOverdue(t) ? 'متأخرة · ' : ''}{fmtDate(t.deadline)}</span>}
                    {t._count.comments > 0 && <span className="item">💬 {t._count.comments}</span>}
                    <span className="avatars" style={{ marginInlineStart: 'auto' }}>
                      {t.assignees.map(a => <Avatar key={a.userId} name={a.user.name} />)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
      {!tasks.length && <div className="empty card"><div className="big">🎉</div>لا توجد مهام مسندة إليك حاليًا</div>}
    </Shell>
  );
}
