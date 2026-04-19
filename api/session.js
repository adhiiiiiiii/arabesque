const { getSession } = require('./_lib/session');

module.exports = async function handler(req, res) {
  const session = getSession(req);

  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      authenticated: Boolean(session?.login && session?.token),
      user: session?.login || null
    })
  );
};
