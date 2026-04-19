module.exports = async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const redirectUri = `${protocol}://${host}/api/auth/callback`;
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    res.statusCode = 500;
    res.end('Missing GITHUB_CLIENT_ID.');
    return;
  }

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', 'repo read:user');

  res.statusCode = 302;
  res.setHeader('Location', url.toString());
  res.end();
};
