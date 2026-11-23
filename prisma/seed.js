const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const db = new PrismaClient();

const ALL = ['view_all_tasks', 'review_tasks', 'manage_projects', 'manage_templates', 'manage_users', 'manage_roles'];

async function main() {
  const count = await db.user.count();
  if (count > 0) { console.log('قاعدة البيانات تحتوي بيانات بالفعل، تخطّي البذر'); return; }

  const adminRole = await db.role.create({ data: { name: 'مدير', description: 'صلاحيات كاملة على النظام', permissions: JSON.stringify(ALL) } });
  const photogRole = await db.role.create({ data: { name: 'مصور', description: 'تنفيذ مهام التصوير', permissions: JSON.stringify([]) } });
  const editorRole = await db.role.create({ data: { name: 'مونتير', description: 'مونتاج الفيديو والصور', permissions: JSON.stringify([]) } });
  const assistantRole = await db.role.create({ data: { name: 'مساعد مصور', description: 'مساندة فريق التصوير', permissions: JSON.stringify([]) } });

  const hash = p => bcrypt.hashSync(p, 10);
  const admin = await db.user.create({ data: { name: 'أحمد مدير', username: 'admin', email: 'admin@maham.studio', passwordHash: hash('admin123'), roleId: adminRole.id } });
  const sara = await db.user.create({ data: { name: 'سارة المصورة', username: 'sara', email: 'sara@maham.studio', passwordHash: hash('sara123'), roleId: photogRole.id } });
  const omar = await db.user.create({ data: { name: 'عمر المونتير', username: 'omar', email: 'omar@maham.studio', passwordHash: hash('omar123'), roleId: editorRole.id } });
  const layla = await db.user.create({ data: { name: 'ليلى مساعدة', username: 'layla', email: 'layla@maham.studio', passwordHash: hash('layla123'), roleId: assistantRole.id } });
  const karim = await db.user.create({ data: { name: 'كريم المصور', username: 'karim', email: 'karim@maham.studio', passwordHash: hash('karim123'), roleId: photogRole.id } });

  const p1 = await db.project.create({ data: { name: 'حملة مقهى النيل', client: 'مقهى النيل', description: 'حملة سوشيال ميديا للافتتاح الجديد' } });
  const p2 = await db.project.create({ data: { name: 'فيديوهات عقارات الدقي', client: 'شركة الدقي للعقارات', description: 'جولة مصورة لثلاث وحدات سكنية' } });

  const reel = await db.template.create({
    data: {
      name: 'ريل إنتاج كامل', description: 'خط إنتاج ريل من التصوير حتى النشر',
      steps: { create: [
        { title: 'تصوير', order: 1, daysOffset: 2, priority: 'عالية' },
        { title: 'مونتاج', order: 2, daysOffset: 4, priority: 'عالية' },
        { title: 'مراجعة داخلية', order: 3, daysOffset: 5, priority: 'متوسطة' },
        { title: 'مراجعة عميل', order: 4, daysOffset: 7, priority: 'متوسطة' },
        { title: 'نشر', order: 5, daysOffset: 8, priority: 'عاجلة' },
      ] },
    },
  });
  await db.template.create({
    data: {
      name: 'جلسة تصوير بورتريه', description: 'تصوير ومعالجة صور شخصية',
      steps: { create: [
        { title: 'تجهيز المعدات', order: 1, daysOffset: 1, priority: 'منخفضة' },
        { title: 'التصوير', order: 2, daysOffset: 2, priority: 'عالية' },
        { title: 'معالجة الصور', order: 3, daysOffset: 5, priority: 'متوسطة' },
      ] },
    },
  });

  const day = 24 * 3600 * 1000;
  const mk = (offset) => new Date(Date.now() + offset * day);
  async function task(data, assignees, activities) {
    const t = await db.task.create({ data: { ...data, assignees: { create: assignees.map(userId => ({ userId })) } } });
    await db.activity.create({ data: { taskId: t.id, userId: admin.id, action: 'أنشأ المهمة' } });
    for (const a of activities || []) await db.activity.create({ data: { taskId: t.id, ...a } });
    return t;
  }

  const t1 = await task(
    { title: 'تصوير منيو المشروبات الجديدة', description: 'تصوير 15 مشروبًا بإضاءة طبيعية، خلفية خشبية داكنة', projectId: p1.id, state: 'قيد التنفيذ', priority: 'عالية', deadline: mk(1), createdBy: admin.id },
    [sara.id, layla.id],
    [{ userId: sara.id, action: 'غيّر الحالة', detail: 'جديدة ← قيد التنفيذ' }]
  );
  await db.comment.create({ data: { taskId: t1.id, userId: admin.id, body: 'العميل طلب صورًا عمودية للستوري كمان' } });
  await db.attachmentLink.create({ data: { taskId: t1.id, title: 'مرجع الستايل', url: 'https://drive.google.com/drive/folders/example-style' } });

  const t2 = await task(
    { title: 'مونتاج ريل الافتتاح', description: 'ريل 30 ثانية مع ترند صوتي متفق عليه', projectId: p1.id, state: 'مستنية مراجعة', priority: 'عاجلة', deadline: mk(1), createdBy: admin.id },
    [omar.id],
    [{ userId: omar.id, action: 'غيّر الحالة', detail: 'قيد التنفيذ ← مستنية مراجعة' }]
  );
  await db.attachmentLink.create({ data: { taskId: t2.id, title: 'نسخة أولى من الريل', url: 'https://drive.google.com/file/d/example-reel-v1' } });

  await task(
    { title: 'تصوير واجهة المقهى الخارجية', description: 'وقت الغروب، مع تصريح التصوير', projectId: p1.id, state: 'جديدة', priority: 'متوسطة', deadline: mk(4), createdBy: admin.id },
    [karim.id]
  );

  const t4 = await task(
    { title: 'مونتاج جولة الوحدة الأولى', description: 'فيديو 90 ثانية، موسيقى هادئة، لوجو الشركة في النهاية', projectId: p2.id, state: 'عندها تعديلات', priority: 'عالية', deadline: mk(2), createdBy: admin.id },
    [omar.id],
    [{ userId: admin.id, action: 'غيّر الحالة', detail: 'مستنية مراجعة ← عندها تعديلات' }]
  );
  await db.comment.create({ data: { taskId: t4.id, userId: admin.id, body: 'قصّ أول 10 ثواني، بطيئة أوي. واللوجو أكبر شوية في الآخر', kind: 'revision' } });

  await task(
    { title: 'تصوير الوحدة الثانية', description: 'إضاءة نهارية، عدسة واسعة', projectId: p2.id, state: 'مكتملة', priority: 'متوسطة', deadline: mk(-2), createdBy: admin.id },
    [sara.id],
    [{ userId: admin.id, action: 'غيّر الحالة', detail: 'مستنية مراجعة ← مكتملة' }]
  );
  await task(
    { title: 'تجهيز إضاءة جلسة الافتتاح', description: 'مراجعة البطاريات والسوفت بوكس', projectId: p1.id, state: 'جديدة', priority: 'منخفضة', deadline: mk(1), createdBy: admin.id },
    [layla.id]
  );

  await db.notification.createMany({ data: [
    { userId: sara.id, taskId: t1.id, type: 'assign', text: 'أُسندت إليك مهمة جديدة: "تصوير منيو المشروبات الجديدة"' },
    { userId: omar.id, taskId: t4.id, type: 'state', text: 'تغيّرت حالة "مونتاج جولة الوحدة الأولى" إلى: عندها تعديلات' },
    { userId: admin.id, taskId: t2.id, type: 'review', text: 'مهمة "مونتاج ريل الافتتاح" بانتظار المراجعة' },
  ] });

  console.log('تم بذر البيانات: admin/admin123، sara/sara123، omar/omar123، layla/layla123، karim/karim123');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
