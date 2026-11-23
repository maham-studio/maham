import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser, can } from '../lib/auth';
import { logout } from '../lib/actions';
import { db } from '../lib/db';
import { sweepReminders } from '../lib/notify';
import { Avatar } from './ui';

const ITEMS = [
  { href: '/tasks', icon: '✓', label: 'مهامي' },
  { href: '/notifications', icon: '🔔', label: 'الإشعارات' },
];
const ADMIN_ITEMS = [
  { href: '/admin', icon: '📊', label: 'لوحة التحكم', perm: 'view_all_tasks' },
  { href: '/admin/projects', icon: '🗂', label: 'المشاريع', perm: 'manage_projects' },
  { href: '/admin/templates', icon: '📋', label: 'القوالب', perm: 'manage_templates' },
  { href: '/admin/users', icon: '👥', label: 'المستخدمون', perm: 'manage_users' },
  { href: '/admin/roles', icon: '🛡', label: 'الأدوار', perm: 'manage_roles' },
];

export default async function Shell({ children, active }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  await sweepReminders();
  const unread = await db.notification.count({ where: { userId: user.id, read: false } });
  const adminItems = ADMIN_ITEMS.filter(i => can(user, i.perm));

  const NavLink = ({ item }) => (
    <Link key={item.href} href={item.href} className={`nav-item ${active === item.href ? 'active' : ''}`}>
      <span className="icon">{item.icon}</span>{item.label}
      {item.href === '/notifications' && unread > 0 && <span className="nav-badge">{unread}</span>}
    </Link>
  );

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">م</div>
          <div><div className="brand-name">مهام</div><div className="brand-sub">استوديو الإنتاج</div></div>
        </div>
        <nav className="nav">
          {ITEMS.map(i => <NavLink key={i.href} item={i} />)}
          {adminItems.length > 0 && <div className="nav-section">الإدارة</div>}
          {adminItems.map(i => <NavLink key={i.href} item={i} />)}
        </nav>
        <div className="sidebar-user">
          <Avatar name={user.name} />
          <div><div className="name">{user.name}</div><div className="role">{user.role.name}</div></div>
          <form action={logout}><button className="logout-btn" title="تسجيل الخروج">⎋</button></form>
        </div>
      </aside>
      <div className="main">
        <div className="topbar">
          <div className="brand-logo" style={{ width: 32, height: 32, fontSize: '1rem' }}>م</div>
          <strong>مهام</strong>
          <span style={{ marginInlineStart: 'auto', fontSize: '.85rem', color: '#cbd5e1' }}>{user.name}</span>
          <form action={logout}><button className="logout-btn" style={{ color: '#cbd5e1' }}>⎋</button></form>
        </div>
        <main className="content">{children}</main>
      </div>
      <nav className="bottom-nav">
        {[...ITEMS, ...adminItems.slice(0, 3)].map(i => <NavLink key={i.href} item={i} />)}
      </nav>
    </div>
  );
}
