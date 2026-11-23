import { db } from '../../../lib/db';
import { createRole, updateRole } from '../../../lib/actions';
import Shell from '../../../components/shell';
import { Form, SubmitButton } from '../../../components/form';
import { PERMISSIONS } from '../../../lib/constants';

export const dynamic = 'force-dynamic';

export default async function Roles() {
  const roles = await db.role.findMany({ include: { _count: { select: { users: true } } }, orderBy: { createdAt: 'asc' } });
  return (
    <Shell active="/admin/roles">
      <div className="page-head"><div><div className="page-title">الأدوار والصلاحيات</div><div className="page-sub">أضف أدوارًا جديدة وعدّل صلاحياتها بدون تعديل الكود</div></div></div>
      <div className="grid" style={{ marginBottom: 18 }}>
        {roles.map(r => {
          const perms = JSON.parse(r.permissions || '[]');
          return (
            <div key={r.id} className="card card-pad">
              <Form action={updateRole}>
                <input type="hidden" name="id" value={r.id} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>{r.name}</span>
                    <span style={{ color: 'var(--text-3)', fontSize: '.8rem', marginInlineStart: 8 }}>{r._count.users} مستخدم</span>
                  </div>
                  <SubmitButton className="btn btn-ghost btn-sm">حفظ</SubmitButton>
                </div>
                <div className="field"><input className="input" name="description" defaultValue={r.description} placeholder="وصف الدور" /></div>
                <div className="checks">
                  {PERMISSIONS.map(p => (
                    <label key={p.key} className="check-chip">
                      <input type="checkbox" name="permissions" value={p.key} defaultChecked={perms.includes(p.key)} />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </Form>
            </div>
          );
        })}
      </div>
      <div className="card card-pad">
        <div className="section-title">+ دور جديد</div>
        <Form action={createRole}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
            <div className="field"><label className="label">اسم الدور</label><input className="input" name="name" required placeholder="مثال: مصمم جرافيك" /></div>
            <div className="field"><label className="label">الوصف</label><input className="input" name="description" placeholder="مسؤول عن…" /></div>
          </div>
          <div className="field"><label className="label">الصلاحيات</label>
            <div className="checks">{PERMISSIONS.map(p => <label key={p.key} className="check-chip"><input type="checkbox" name="permissions" value={p.key} /><span>{p.label}</span></label>)}</div>
          </div>
          <SubmitButton>إنشاء الدور</SubmitButton>
        </Form>
      </div>
    </Shell>
  );
}
