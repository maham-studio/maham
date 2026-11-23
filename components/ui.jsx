import { STATE_COLORS, PRIORITY_COLORS } from '../lib/constants';

export function StateBadge({ state }) {
  const c = STATE_COLORS[state] || { bg: '#f1f5f9', fg: '#475569', dot: '#94a3b8' };
  return <span className="badge" style={{ background: c.bg, color: c.fg }}><span className="dot" style={{ background: c.dot }} />{state}</span>;
}
export function PriorityTag({ p }) {
  const icons = { 'منخفضة': '▽', 'متوسطة': '◦', 'عالية': '▲', 'عاجلة': '🔥' };
  return <span className="priority" style={{ color: PRIORITY_COLORS[p] }}>{icons[p] || '◦'} {p}</span>;
}
export function Avatar({ name, size }) {
  const style = size ? { width: size, height: size, fontSize: size * .4 } : {};
  return <span className="avatar" style={style} title={name}>{(name || '؟').trim()[0]}</span>;
}
export function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
}
export function fmtDateTime(d) {
  return new Date(d).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
export function isOverdue(task) {
  return task.deadline && new Date(task.deadline) < new Date() && task.state !== 'مكتملة';
}
