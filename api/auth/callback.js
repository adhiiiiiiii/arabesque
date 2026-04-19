const { exchangeCodeForToken, getGitHubUser } = require('../_lib/github');
const { setSession } = require('../_lib/session');

module.exports = async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const redirectUri = `${protocol}://${host}/api/auth/callback`;
  const code = req.query.code;

  if (!code) {
    res.statusCode = 400;
    res.end('Missing OAuth code.');
    return;
  }

  try {
    const token = await exchangeCodeForToken(code, redirectUri);
    const user = await getGitHubUser(token);
    const allowed = (process.env.CMS_ALLOWED_USERS || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (allowed.length > 0 && !allowed.includes(user.login)) {
      res.statusCode = 403;
      res.end('This GitHub account is not allowed to access the CMS.');
      return;
    }

    setSession(res, {
      login: user.login,
      token
    });

    res.statusCode = 302;
    res.setHeader('Location', '/admin/dashboard.html');
    res.end();
  } catch (error) {
    res.statusCode = 500;
    res.end(error.message || 'GitHub login failed.');
  }
};
