const { getSession } = require('./_lib/session');

module.exports = async function handler(req, res) {
  const session = getSession(req);
  const cmsAuthenticated = Boolean(session?.login && session?.authType === 'password' && session?.panel === 'cms');

  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      authenticated: cmsAuthenticated,
      cmsAuthenticated,
      user: session?.login || null,
      authType: session?.authType || null
    })
  );
};
