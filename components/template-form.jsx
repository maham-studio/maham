'use client';
import { useState } from 'react';
import { useFormState } from 'react-dom';
import { createTemplate } from '../lib/actions';
import { SubmitButton } from './form';
import { PRIORITIES } from '../lib/constants';

export default function TemplateForm() {
  const [steps, setSteps] = useState([{ title: '', daysOffset: 1, priority: 'متوسطة' }]);
  const [state, action] = useFormState(createTemplate, {});
  const set = (i, k, v) => setSteps(s => s.map((st, j) => j === i ? { ...st, [k]: v } : st));
  return (
    <form action={action}>
      {state?.error && <div className="form-error">{state.error}</div>}
      {state?.ok && <div className="form-ok">{state.ok}</div>}
      <input type="hidden" name="steps" value={JSON.stringify(steps)} />
      <div className="field"><label className="label">اسم القالب</label><input className="input" name="name" required placeholder="مثال: ريل إنتاج كامل" /></div>
      <div className="field"><label className="label">الوصف</label><input className="input" name="description" placeholder="خط إنتاج من التصوير حتى النشر" /></div>
      <label className="label">الخطوات</label>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 90px 110px 36px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <input className="input" placeholder={`خطوة ${i + 1}: مثال تصوير`} value={s.title} onChange={e => set(i, 'title', e.target.value)} />
          <input className="input" type="number" min="1" title="أيام من البدء" value={s.daysOffset} onChange={e => set(i, 'daysOffset', e.target.value)} />
          <select className="select" value={s.priority} onChange={e => set(i, 'priority', e.target.value)}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSteps(st => st.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSteps(s => [...s, { title: '', daysOffset: s.length + 1, priority: 'متوسطة' }])}>+ خطوة</button>
        <SubmitButton>حفظ القالب</SubmitButton>
      </div>
    </form>
  );
}
