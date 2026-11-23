import { db } from '../../../lib/db';
import { createUser } from '../../../lib/actions';
import Shell from '../../../components/shell';
import { Form, SubmitButton } from '../../../components/form';
import { Avatar } from '../../../components/ui';

export const dynamic = 'force-dynamic';

export default async function Users() {
  const [users, roles] = await Promise.all([
    db.user.findMany({ include: { role: true, assignees: true }, orderBy: { createdAt: 'asc' } }),
    db.role.findMany({ orderBy: { createdAt: 'asc' } }),
  ]);
  return (
    <Shell active="/admin/users">
      <div className="page-head"><div><div className="page-title">المستخدمون</div><div className="page-sub">{users.length} عضو في الفريق</div></div></div>
      <div className="detail-grid">
        <div className="grid">
          {users.map(u => (
            <div key={u.id} className="card card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Avatar name={u.name} size={44} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800 }}>{u.name}</div>
                <div style={{ color: 'var(--text-3)', fontSize: '.8rem' }} dir="ltr">{u.email} · @{u.username}</div>
              </div>
              <span className="badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>{u.role.name}</span>
              <span style={{ color: 'var(--text-2)', fontSize: '.82rem' }}>{u.assignees.length} مهمة</span>
            </div>
          ))}
        </div>
        <div className="card card-pad">
          <div className="section-title">+ حساب جديد</div>
          <Form action={createUser}>
            <div className="field"><label className="label">الاسم</label><input className="input" name="name" required /></div>
            <div className="field"><label className="label">اسم المستخدم</label><input className="input" name="username" required dir="ltr" /></div>
            <div className="field"><label className="label">البريد الإلكتروني</label><input className="input" name="email" type="email" required dir="ltr" /></div>
            <div className="field"><label className="label">كلمة المرور</label><input className="input" name="password" type="password" required dir="ltr" /></div>
            <div className="field"><label className="label">الدور</label>
              <select className="select" name="roleId" required>
                <option value="">اختر دورًا…</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <SubmitButton>إنشاء الحساب</SubmitButton>
          </Form>
        </div>
      </div>
    </Shell>
  );
}
