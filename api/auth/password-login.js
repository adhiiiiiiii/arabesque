const crypto = require('crypto');
const { setSession } = require('../_lib/session');

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));

  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method not allowed');
    return;
  }

  const expectedUsername = process.env.CMS_ADMIN_USERNAME;
  const expectedPassword = process.env.CMS_ADMIN_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    res.statusCode = 500;
    res.end('Missing CMS_ADMIN_USERNAME or CMS_ADMIN_PASSWORD.');
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const username = String(body?.username || '').trim();
    const password = String(body?.password || '');

    if (!safeEqual(username, expectedUsername) || !safeEqual(password, expectedPassword)) {
      res.statusCode = 401;
      res.end('Invalid username or password.');
      return;
    }

    setSession(res, {
      login: username,
      authType: 'password'
    });

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true, user: username }));
  } catch (error) {
    res.statusCode = 400;
    res.end(error.message || 'Invalid login payload.');
  }
};
