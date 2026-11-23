import Link from 'next/link';
import { db } from '../../lib/db';
import Shell from '../../components/shell';
import { StateBadge, PriorityTag, Avatar, Icon, fmtDate, isOverdue } from '../../components/ui';
import { STATES, PRIORITIES } from '../../lib/constants';

const STAT_META = {
  'جديدة': { icon: 'sparkles', bg: '#e0f2fe', fg: '#0284c7' },
  'قيد التنفيذ': { icon: 'gear', bg: '#fef3c7', fg: '#d97706' },
  'مستنية مراجعة': { icon: 'eye', bg: '#ede9fe', fg: '#7c3aed' },
  'عندها تعديلات': { icon: 'undo', bg: '#ffe4e6', fg: '#e11d48' },
  'مكتملة': { icon: 'check', bg: '#dcfce7', fg: '#16a34a' },
};

export const dynamic = 'force-dynamic';

export default async function AdminDashboard({ searchParams }) {
  const { state = '', user = '', project = '' } = searchParams;
  const [tasks, users, projects] = await Promise.all([
    db.task.findMany({
      where: {
        ...(state ? { state } : {}),
        ...(project ? { projectId: project } : {}),
        ...(user ? { assignees: { some: { userId: user } } } : {}),
      },
      include: { project: true, assignees: { include: { user: true } }, _count: { select: { comments: true } } },
      orderBy: [{ deadline: 'asc' }, { createdAt: 'desc' }],
    }),
    db.user.findMany({ orderBy: { name: 'asc' } }),
    db.project.findMany({ orderBy: { createdAt: 'asc' } }),
  ]);
  const counts = Object.fromEntries(STATES.map(s => [s, tasks.filter(t => t.state === s).length]));
  const qs = (k, v) => {
    const p = new URLSearchParams(); if (state) p.set('state', state); if (user) p.set('user', user); if (project) p.set('project', project);
    if (v) p.set(k, v); else p.delete(k);
    const s = p.toString(); return s ? `?${s}` : '/admin';
  };
  return (
    <Shell active="/admin">
      <div className="page-head">
        <div>
          <div className="page-title">لوحة التحكم</div>
          <div className="page-sub">كل مهام الاستوديو في نظرة واحدة</div>
        </div>
        <Link href="/admin/tasks/new" className="btn btn-primary"><Icon name="plus" size={16} /> مهمة جديدة</Link>
      </div>
      <div className="stats">
        {STATES.map(s => (
          <Link key={s} href={state === s ? qs('state') : qs('state', s)} className="stat" style={state === s ? { borderColor: 'var(--primary)', boxShadow: '0 0 0 2px rgba(79,70,229,.15)' } : {}}>
            <div className="stat-icon" style={{ background: STAT_META[s].bg, color: STAT_META[s].fg }}>
              <Icon name={STAT_META[s].icon} size={21} />
            </div>
            <div><div className="stat-num">{counts[s]}</div><div className="stat-label">{s}</div></div>
          </Link>
        ))}
      </div>
      <form className="filters" method="get" action="/admin">
        <select className="select" name="user" defaultValue={user} onChange={undefined}>
          <option value="">كل الأشخاص</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select className="select" name="state" defaultValue={state}>
          <option value="">كل الحالات</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="select" name="project" defaultValue={project}>
          <option value="">كل المشاريع</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.client} — {p.name}</option>)}
        </select>
        <button className="btn btn-ghost btn-sm" type="submit">تصفية</button>
        {(state || user || project) && <Link href="/admin" className="btn btn-ghost btn-sm">مسح</Link>}
      </form>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>المهمة</th><th>المشروع</th><th>المسند إليهم</th><th>الحالة</th><th>الأولوية</th><th>التسليم</th><th></th></tr></thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t.id}>
                <td><Link href={`/tasks/${t.id}`} style={{ fontWeight: 700 }}>{t.title}</Link>{t._count.comments > 0 && <span style={{ color: 'var(--text-3)', fontSize: '.76rem', display: 'inline-flex', alignItems: 'center', gap: 3, marginInlineStart: 6 }}><Icon name="message" size={12} />{t._count.comments}</span>}</td>
                <td style={{ color: 'var(--text-2)' }}>{t.project.client}</td>
                <td><span className="avatars">{t.assignees.map(a => <Avatar key={a.userId} name={a.user.name} />)}</span></td>
                <td><StateBadge state={t.state} /></td>
                <td><PriorityTag p={t.priority} /></td>
                <td className={isOverdue(t) ? 'overdue' : ''} style={{ whiteSpace: 'nowrap' }}>{t.deadline ? fmtDate(t.deadline) : '—'}</td>
                <td><Link href={`/tasks/${t.id}`} className="btn btn-ghost btn-sm">فتح</Link></td>
              </tr>
            ))}
            {!tasks.length && <tr><td colSpan={7}><div className="empty"><div className="big"><Icon name="clipboard" size={28} /></div>لا مهام مطابقة للتصفية</div></td></tr>}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
