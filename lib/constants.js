export const STATES = ['جديدة', 'قيد التنفيذ', 'مستنية مراجعة', 'عندها تعديلات', 'مكتملة'];
export const STATE_COLORS = {
  'جديدة': { bg: '#e0f2fe', fg: '#0369a1', dot: '#0ea5e9' },
  'قيد التنفيذ': { bg: '#fef3c7', fg: '#b45309', dot: '#f59e0b' },
  'مستنية مراجعة': { bg: '#ede9fe', fg: '#6d28d9', dot: '#8b5cf6' },
  'عندها تعديلات': { bg: '#ffe4e6', fg: '#be123c', dot: '#f43f5e' },
  'مكتملة': { bg: '#dcfce7', fg: '#15803d', dot: '#22c55e' },
};
export const PRIORITIES = ['منخفضة', 'متوسطة', 'عالية', 'عاجلة'];
export const PRIORITY_COLORS = {
  'منخفضة': '#64748b',
  'متوسطة': '#0284c7',
  'عالية': '#ea580c',
  'عاجلة': '#dc2626',
};
export const PERMISSIONS = [
  { key: 'view_all_tasks', label: 'عرض كل المهام' },
  { key: 'review_tasks', label: 'مراجعة واعتماد المهام' },
  { key: 'manage_projects', label: 'إدارة المشاريع' },
  { key: 'manage_templates', label: 'إدارة القوالب' },
  { key: 'manage_users', label: 'إدارة المستخدمين' },
  { key: 'manage_roles', label: 'إدارة الأدوار والصلاحيات' },
];
export const ALL_PERMISSIONS = PERMISSIONS.map(p => p.key);
