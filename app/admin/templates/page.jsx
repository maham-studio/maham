import { db } from '../../../lib/db';
import { deleteTemplate } from '../../../lib/actions';
import Shell from '../../../components/shell';
import TemplateForm from '../../../components/template-form';
import { PriorityTag } from '../../../components/ui';

export const dynamic = 'force-dynamic';

export default async function Templates() {
  const templates = await db.template.findMany({ include: { steps: { orderBy: { order: 'asc' } } }, orderBy: { createdAt: 'desc' } });
  return (
    <Shell active="/admin/templates">
      <div className="page-head"><div><div className="page-title">قوالب المهام</div><div className="page-sub">خطوط إنتاج جاهزة تولّد كل مهامها بضغطة واحدة</div></div></div>
      <div className="detail-grid">
        <div className="grid">
          {templates.map(t => (
            <div key={t.id} className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{t.name}</div>
                  {t.description && <div style={{ color: 'var(--text-2)', fontSize: '.84rem' }}>{t.description}</div>}
                </div>
                <DeleteButton id={t.id} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {t.steps.map((s, i) => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '.88rem' }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', fontSize: '.75rem', fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontWeight: 600, flex: 1 }}>{s.title}</span>
                    <span style={{ color: 'var(--text-3)', fontSize: '.78rem' }}>بعد {s.daysOffset} {s.daysOffset === 1 ? 'يوم' : 'أيام'}</span>
                    <PriorityTag p={s.priority} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="card card-pad">
          <div className="section-title">+ قالب جديد</div>
          <TemplateForm />
        </div>
      </div>
    </Shell>
  );
}

import { Form, SubmitButton } from '../../../components/form';
function DeleteButton({ id }) {
  return (
    <Form action={deleteTemplate}>
      <input type="hidden" name="id" value={id} />
      <SubmitButton className="btn btn-danger btn-sm">حذف</SubmitButton>
    </Form>
  );
}
