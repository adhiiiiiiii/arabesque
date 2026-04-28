const crypto = require('crypto');
const { getConfigValue } = require('./runtime-config');

const COOKIE_NAME = 'arabesque_cms_session';

function getSecret() {
  return getConfigValue('CMS_SESSION_SECRET', 'change-me-in-vercel');
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

function isSecureRequest(req) {
  const forwardedProto = String(req?.headers?.['x-forwarded-proto'] || '').toLowerCase();
  const host = String(req?.headers?.host || '');
  return forwardedProto === 'https' || (!host.startsWith('localhost') && !host.startsWith('127.0.0.1'));
}

function setSession(req, res, data) {
  const value = encodeSession(data);
  const secureFlag = isSecureRequest(req) ? ' Secure;' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${value}; Path=/; HttpOnly;${secureFlag} SameSite=Lax; Max-Age=28800`);
}

function clearSession(req, res) {
  const secureFlag = isSecureRequest(req) ? ' Secure;' : '';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly;${secureFlag} SameSite=Lax; Max-Age=0`);
}

module.exports = {
  COOKIE_NAME,
  getSession,
  setSession,
  clearSession
};
