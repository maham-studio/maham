import { redirect } from 'next/navigation';
import { getCurrentUser } from '../../lib/auth';
import { login } from '../../lib/actions';
import { Form, SubmitButton } from '../../components/form';

export default async function LoginPage() {
  if (await getCurrentUser()) redirect('/tasks');
  return (
    <div className="login-wrap">
      <div className="login-side">
        <div className="brand" style={{ border: 'none', padding: 0 }}>
          <div className="brand-logo">م</div>
          <div className="brand-name" style={{ fontSize: '1.4rem' }}>مهام</div>
        </div>
        <div>
          <h1>كل شغل الاستوديو<br />في مكان واحد</h1>
          <p>تابع التصوير والمونتاج والمراجعات، من أول التكليف حتى النشر، مع فريقك كله.</p>
        </div>
        <div className="login-feats">
          <div className="login-feat"><span className="ic">✓</span>مهام ومشاريع ومواعيد تسليم واضحة</div>
          <div className="login-feat"><span className="ic">🔔</span>إشعارات فورية عند كل جديد</div>
          <div className="login-feat"><span className="ic">📋</span>قوالب جاهزة لخطوط الإنتاج المتكررة</div>
        </div>
      </div>
      <div className="login-form-side">
        <div className="login-card">
          <h2>تسجيل الدخول</h2>
          <div className="sub">أهلًا بيك، ادخل بحسابك عشان تكمل شغلك</div>
          <Form action={login}>
            <div className="field">
              <label className="label">اسم المستخدم أو البريد الإلكتروني</label>
              <input className="input" name="username" required autoComplete="username" placeholder="admin" />
            </div>
            <div className="field">
              <label className="label">كلمة المرور</label>
              <input className="input" name="password" type="password" required autoComplete="current-password" placeholder="••••••••" />
            </div>
            <SubmitButton className="btn btn-primary btn-block">دخول</SubmitButton>
          </Form>
          <div className="demo-box">
            حسابات تجريبية — مدير: <code>admin / admin123</code> · مصورة: <code>sara / sara123</code> · مونتير: <code>omar / omar123</code>
          </div>
        </div>
      </div>
    </div>
  );
}
