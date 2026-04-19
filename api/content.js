const { readLocalContent, updateRepoFile } = require('./_lib/github');
const { getSession } = require('./_lib/session');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(readLocalContent()));
    return;
  }

  if (req.method !== 'PUT') {
    res.statusCode = 405;
    res.end('Method not allowed');
    return;
  }

  const session = getSession(req);
  const githubToken = session?.token || process.env.GITHUB_PAT || process.env.CMS_GITHUB_TOKEN;

  if (!session?.login || !githubToken) {
    res.statusCode = 401;
    res.end('Unauthorized or missing GitHub token for publishing.');
    return;
  }

  try {
    const nextContent = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const serialized = `${JSON.stringify(nextContent, null, 2)}\n`;

    await updateRepoFile(
      'content/site.json',
      serialized,
      `Update site content via CMS (${session.login})`,
      githubToken
    );

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
  } catch (error) {
    res.statusCode = 500;
    res.end(error.message || 'Failed to save content');
  }
};
