'use client';
import { useState } from 'react';
import { useFormState } from 'react-dom';
import { changeState } from '../lib/actions';

export default function StateActions({ taskId, state, isAssignee, isReviewer }) {
  const [showRevision, setShowRevision] = useState(false);
  const [res, action] = useFormState(changeState, {});
  return (
    <div>
      {res?.error && <div className="form-error">{res.error}</div>}
      {res?.ok && <div className="form-ok">{res.ok}</div>}
      <form action={action}>
        <input type="hidden" name="taskId" value={taskId} />
        <div className="state-actions">
          {isAssignee && state === 'جديدة' && <Btn name="state" value="قيد التنفيذ" className="btn btn-primary btn-sm" label="▶ ابدأ التنفيذ" />}
          {isAssignee && state === 'قيد التنفيذ' && <Btn name="state" value="مستنية مراجعة" className="btn btn-primary btn-sm" label="📤 إرسال للمراجعة" />}
          {isAssignee && state === 'عندها تعديلات' && <Btn name="state" value="قيد التنفيذ" className="btn btn-primary btn-sm" label="🔧 ابدأ العمل على التعديلات" />}
          {isReviewer && state === 'مستنية مراجعة' && <>
            <Btn name="state" value="مكتملة" className="btn btn-success btn-sm" label="✓ اعتماد كمكتملة" />
            <button type="button" className="btn btn-danger btn-sm" onClick={() => setShowRevision(v => !v)}>↩ إرجاع بتعديلات</button>
          </>}
          {isReviewer && state !== 'مكتملة' && state !== 'مستنية مراجعة' && <Btn name="state" value="مكتملة" className="btn btn-success btn-sm" label="✓ إغلاق كمكتملة" />}
        </div>
        {showRevision && (
          <div style={{ marginTop: 12 }}>
            <textarea className="textarea" name="revisionNote" placeholder="اكتب التعديلات المطلوبة…" required />
            <div style={{ marginTop: 8 }}>
              <Btn name="state" value="عندها تعديلات" className="btn btn-danger btn-sm" label="إرجاع المهمة" />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
function Btn({ name, value, className, label }) {
  return <button type="submit" name={name} value={value} className={className}>{label}</button>;
}
