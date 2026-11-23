import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '../../lib/db';
import { getCurrentUser } from '../../lib/auth';
import { markAllRead } from '../../lib/actions';
import Shell from '../../components/shell';
import { Icon, fmtDateTime } from '../../components/ui';

export const dynamic = 'force-dynamic';

const ICONS = {
  assign: { icon: 'pin', bg: '#e0f2fe', fg: '#0284c7' },
  comment: { icon: 'message', bg: '#ede9fe', fg: '#7c3aed' },
  state: { icon: 'refresh', bg: '#fef3c7', fg: '#d97706' },
  review: { icon: 'eye', bg: '#e0e7ff', fg: '#4f46e5' },
  reminder: { icon: 'clock', bg: '#f1f5f9', fg: '#64748b' },
};

export default async function Notifications() {
  const me = await getCurrentUser();
  if (!me) redirect('/login');
  const items = await db.notification.findMany({ where: { userId: me.id }, orderBy: { createdAt: 'desc' }, take: 60 });
  const unread = items.filter(i => !i.read).length;
  return (
    <Shell active="/notifications">
      <div className="page-head">
        <div>
          <div className="page-title">الإشعارات</div>
          <div className="page-sub">{unread} غير مقروء</div>
        </div>
        {unread > 0 && <form action={markAllRead}><button className="btn btn-ghost btn-sm">تحديد الكل كمقروء</button></form>}
      </div>
      <div className="card card-pad" style={{ padding: '8px 20px' }}>
        {items.map(n => (
          <Link key={n.id} href={n.taskId ? `/tasks/${n.taskId}` : '/notifications'} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '13px 0', borderBottom: '1px solid var(--border)', opacity: n.read ? .6 : 1 }}>
            <span className="n-icon" style={{ background: (ICONS[n.type] || ICONS.reminder).bg, color: (ICONS[n.type] || ICONS.reminder).fg }}><Icon name={(ICONS[n.type] || ICONS.reminder).icon} size={18} /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: n.read ? 500 : 700, fontSize: '.92rem' }}>{n.text}</div>
              <div style={{ color: 'var(--text-3)', fontSize: '.76rem' }}>{fmtDateTime(n.createdAt)}</div>
            </div>
            {!n.read && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--primary)' }} />}
          </Link>
        ))}
        {!items.length && <div className="empty"><div className="big"><Icon name="bellOff" size={28} /></div>لا إشعارات بعد</div>}
      </div>
    </Shell>
  );
}
