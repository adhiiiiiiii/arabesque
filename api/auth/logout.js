const { clearSession } = require('../_lib/session');

module.exports = async function handler(req, res) {
  clearSession(req, res);
  res.statusCode = 302;
  const referer = String(req.headers.referer || '');
  const cmsBasePath = referer.includes('/admin-control') ? '/admin-control/' : '/admin/';
  res.setHeader('Location', cmsBasePath);
  res.end();
};
