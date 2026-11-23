import crypto from 'crypto';
import { cookies } from 'next/headers';
import { db } from './db';

function getSecret() {
  const s = process.env.AUTH_SECRET;
  if (!s && process.env.NODE_ENV === 'production') throw new Error('AUTH_SECRET is required in production');
  return s || 'maham-dev-secret';
}
const COOKIE = 'maham_session';

function sign(payload) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function createSession(userId) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + 30 * 24 * 3600 * 1000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifySession(token) {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig || sign(payload) !== sig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (data.exp < Date.now()) return null;
    return data.uid;
  } catch { return null; }
}

export async function getCurrentUser() {
  const token = cookies().get(COOKIE)?.value;
  const uid = verifySession(token);
  if (!uid) return null;
  const user = await db.user.findUnique({ where: { id: uid }, include: { role: true } });
  return user;
}

export function can(user, perm) {
  if (!user) return false;
  try { return JSON.parse(user.role.permissions).includes(perm); } catch { return false; }
}

export function setSessionCookie(userId) {
  cookies().set(COOKIE, createSession(userId), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 30 * 24 * 3600 });
}
export function clearSessionCookie() {
  cookies().delete(COOKIE);
}
