const { clearSession } = require('../_lib/session');

module.exports = async function handler(req, res) {
  clearSession(res);
  res.statusCode = 302;
  res.setHeader('Location', '/admin/');
  res.end();
};
