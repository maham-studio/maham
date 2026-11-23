import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser, can } from '../lib/auth';
import { logout } from '../lib/actions';
import { db } from '../lib/db';
import { sweepReminders } from '../lib/notify';
import { Avatar, Icon } from './ui';

const ITEMS = [
  { href: '/tasks', icon: 'tasks', label: 'مهامي' },
  { href: '/notifications', icon: 'bell', label: 'الإشعارات' },
];
const ADMIN_ITEMS = [
  { href: '/admin', icon: 'grid', label: 'لوحة التحكم', perm: 'view_all_tasks' },
  { href: '/admin/projects', icon: 'folder', label: 'المشاريع', perm: 'manage_projects' },
  { href: '/admin/templates', icon: 'clipboard', label: 'القوالب', perm: 'manage_templates' },
  { href: '/admin/users', icon: 'users', label: 'المستخدمون', perm: 'manage_users' },
  { href: '/admin/roles', icon: 'shield', label: 'الأدوار', perm: 'manage_roles' },
];

export default async function Shell({ children, active }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  await sweepReminders();
  const unread = await db.notification.count({ where: { userId: user.id, read: false } });
  const adminItems = ADMIN_ITEMS.filter(i => can(user, i.perm));

  const NavLink = ({ item }) => (
    <Link key={item.href} href={item.href} className={`nav-item ${active === item.href ? 'active' : ''}`}>
      <span className="icon"><Icon name={item.icon} size={19} /></span>
      <span className="nav-label">{item.label}</span>
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
          <form action={logout}><button className="logout-btn" title="تسجيل الخروج"><Icon name="logout" size={18} /></button></form>
        </div>
      </aside>
      <div className="main">
        <div className="topbar">
          <div className="topbar-brand">
            <div className="brand-logo" style={{ width: 34, height: 34, fontSize: '1.05rem', borderRadius: 11 }}>م</div>
            <strong>مهام</strong>
          </div>
          <div className="topbar-actions">
            <Link href="/notifications" className="icon-btn" aria-label="الإشعارات">
              <Icon name="bell" size={20} />
              {unread > 0 && <span className="nav-badge">{unread}</span>}
            </Link>
            <Avatar name={user.name} size={33} />
            <form action={logout}><button className="icon-btn" title="تسجيل الخروج" aria-label="تسجيل الخروج"><Icon name="logout" size={18} /></button></form>
          </div>
        </div>
        <main className="content">{children}</main>
      </div>
      <nav className="bottom-nav">
        {[...ITEMS, ...adminItems.slice(0, 3)].map(i => <NavLink key={i.href} item={i} />)}
      </nav>
    </div>
  );
}
