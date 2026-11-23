import { db } from '../../../lib/db';
import { createProject } from '../../../lib/actions';
import Shell from '../../../components/shell';
import { Form, SubmitButton } from '../../../components/form';
import { STATES } from '../../../lib/constants';

export const dynamic = 'force-dynamic';

export default async function Projects() {
  const projects = await db.project.findMany({ include: { tasks: true }, orderBy: { createdAt: 'desc' } });
  return (
    <Shell active="/admin/projects">
      <div className="page-head"><div><div className="page-title">المشاريع</div><div className="page-sub">كل عميل = مشروع</div></div></div>
      <div className="detail-grid">
        <div className="grid">
          {projects.map(p => (
            <div key={p.id} className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{p.name}</div>
                  <div style={{ color: 'var(--text-2)', fontSize: '.85rem' }}>{p.client}</div>
                  {p.description && <p style={{ color: 'var(--text-3)', fontSize: '.84rem', marginTop: 6 }}>{p.description}</p>}
                </div>
                <span className="badge" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>{p.tasks.length} مهمة</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {STATES.map(s => { const n = p.tasks.filter(t => t.state === s).length; return n ? <span key={s} style={{ fontSize: '.76rem', color: 'var(--text-2)' }}>{s}: <b>{n}</b></span> : null; })}
              </div>
            </div>
          ))}
        </div>
        <div className="card card-pad">
          <div className="section-title">+ مشروع جديد</div>
          <Form action={createProject}>
            <div className="field"><label className="label">اسم المشروع</label><input className="input" name="name" required placeholder="حملة إطلاق المنتج" /></div>
            <div className="field"><label className="label">العميل</label><input className="input" name="client" required placeholder="اسم العميل" /></div>
            <div className="field"><label className="label">وصف</label><textarea className="textarea" name="description" /></div>
            <SubmitButton>إنشاء المشروع</SubmitButton>
          </Form>
        </div>
      </div>
    </Shell>
  );
}
