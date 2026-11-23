'use client';
import { useFormState, useFormStatus } from 'react-dom';

export function SubmitButton({ children, className = 'btn btn-primary' }) {
  const { pending } = useFormStatus();
  return <button type="submit" className={className} disabled={pending}>{pending ? 'جارٍ الحفظ…' : children}</button>;
}
export function Form({ action, children, className }) {
  const [state, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className={className}>
      {state?.error && <div className="form-error">{state.error}</div>}
      {state?.ok && <div className="form-ok">{state.ok}</div>}
      {children}
    </form>
  );
}
