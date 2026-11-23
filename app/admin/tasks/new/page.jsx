import { db } from '../../../../lib/db';
import { createTask, createFromTemplate } from '../../../../lib/actions';
import Shell from '../../../../components/shell';
import { Form, SubmitButton } from '../../../../components/form';
import { PRIORITIES } from '../../../../lib/constants';
import { Icon } from '../../../../components/ui';

export const dynamic = 'force-dynamic';

export default async function NewTask() {
  const [projects, users, templates] = await Promise.all([
    db.project.findMany(), db.user.findMany({ include: { role: true }, orderBy: { name: 'asc' } }),
    db.template.findMany({ include: { steps: { orderBy: { order: 'asc' } } } }),
  ]);
  return (
    <Shell active="/admin">
      <div className="page-head"><div><div className="page-title">مهمة جديدة</div><div className="page-sub">أنشئ مهمة يدويًا أو ولّد مجموعة مهام من قالب</div></div></div>
      <div className="detail-grid">
        <div className="card card-pad">
          <div className="section-title"><Icon name="plus" size={18} /> مهمة يدوية</div>
          <Form action={createTask}>
            <div className="field"><label className="label">عنوان المهمة</label><input className="input" name="title" required placeholder="مثال: تصوير فيديو إعلاني" /></div>
            <div className="field"><label className="label">الوصف</label><textarea className="textarea" name="description" placeholder="تفاصيل المطلوب…" /></div>
            <div className="field"><label className="label">المشروع</label>
              <select className="select" name="projectId" required>
                <option value="">اختر مشروعًا…</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.client} — {p.name}</option>)}
              </select>
            </div>
            <div className="field"><label className="label">المسند إليهم</label>
              <div className="checks">{users.map(u => <label key={u.id} className="check-chip"><input type="checkbox" name="assignees" value={u.id} /><span>{u.name} · {u.role.name}</span></label>)}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field"><label className="label">الأولوية</label>
                <select className="select" name="priority">{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select>
              </div>
              <div className="field"><label className="label">موعد التسليم</label><input className="input" type="date" name="deadline" /></div>
            </div>
            <SubmitButton>إنشاء المهمة</SubmitButton>
          </Form>
        </div>
        <div className="card card-pad">
          <div className="section-title"><Icon name="clipboard" size={18} /> إنشاء من قالب</div>
          <Form action={createFromTemplate}>
            <div className="field"><label className="label">القالب</label>
              <select className="select" name="templateId" required>
                <option value="">اختر قالبًا…</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.steps.length} خطوات)</option>)}
              </select>
            </div>
            <div className="field"><label className="label">المشروع</label>
              <select className="select" name="projectId" required>
                <option value="">اختر مشروعًا…</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.client} — {p.name}</option>)}
              </select>
            </div>
            <div className="field"><label className="label">تاريخ البدء</label><input className="input" type="date" name="start" /></div>
            <SubmitButton className="btn btn-ghost">توليد المهام</SubmitButton>
          </Form>
          <div style={{ marginTop: 18 }}>
            {templates.map(t => (
              <div key={t.id} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{t.name}</div>
                <div style={{ color: 'var(--text-3)', fontSize: '.8rem' }}>{t.steps.map(s => s.title).join(' ← ')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
