const crypto = require('crypto');

const COOKIE_NAME = 'arabesque_cms_session';

function getSecret() {
  return process.env.CMS_SESSION_SECRET || 'change-me-in-vercel';
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
}

function encodeSession(data) {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function decodeSession(value) {
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;
  if (sign(payload) !== signature) return null;

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((acc, pair) => {
    const [rawKey, ...rest] = pair.trim().split('=');
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

function getSession(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  return decodeSession(cookies[COOKIE_NAME]);
}

function setSession(res, data) {
  const value = encodeSession(data);
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`);
}

function clearSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}

module.exports = {
  COOKIE_NAME,
  getSession,
  setSession,
  clearSession
};
