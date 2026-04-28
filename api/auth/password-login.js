const crypto = require('crypto');
const { setSession } = require('../_lib/session');
const { getConfigValue } = require('../_lib/runtime-config');

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));

  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}

async function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');

  const raw = await readBody(req);
  return raw ? JSON.parse(raw) : {};
}

function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    res.end();
    return;
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    json(res, 405, { ok: false, message: 'Method not allowed.' });
    return;
  }

  const expectedUsername = String(getConfigValue('CMS_ADMIN_USERNAME') || '').trim();
  const expectedPassword = String(getConfigValue('CMS_ADMIN_PASSWORD') || '').trim();

  if (!expectedUsername || !expectedPassword) {
    json(res, 500, {
      ok: false,
      message: 'CMS credentials are not configured. Add CMS_ADMIN_USERNAME and CMS_ADMIN_PASSWORD.'
    });
    return;
  }

  try {
    const body = req.method === 'GET' ? (req.query || {}) : await parseBody(req);
    const username = String(body?.username || '').trim();
    const password = String(body?.password || '').trim();

    if (!safeEqual(username, expectedUsername) || !safeEqual(password, expectedPassword)) {
      json(res, 401, { ok: false, message: 'Invalid username or password.' });
      return;
    }

    setSession(req, res, {
      login: username,
      authType: 'password',
      panel: 'cms',
      issuedAt: Date.now()
    });

    json(res, 200, { ok: true, user: username, authType: 'password' });
  } catch (error) {
    json(res, 400, { ok: false, message: error.message || 'Invalid login payload.' });
  }
};
