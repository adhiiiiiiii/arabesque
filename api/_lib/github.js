const fs = require('fs');
const path = require('path');

const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const REPO_NAME = process.env.GITHUB_REPO_NAME;
const REPO_BRANCH = process.env.GITHUB_DEFAULT_BRANCH || 'main';

async function githubRequest(url, token, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'arabesque-cms',
      ...options.headers
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub request failed: ${response.status} ${text}`);
  }

  return response;
}

async function exchangeCodeForToken(code, redirectUri) {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri
    })
  });

  if (!response.ok) {
    throw new Error('Failed to exchange GitHub OAuth code.');
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error(data.error_description || 'GitHub OAuth token missing.');
  }

  return data.access_token;
}

async function getGitHubUser(token) {
  const response = await githubRequest('https://api.github.com/user', token);
  return response.json();
}

async function getRepoFile(repoPath, token) {
  const encodedPath = repoPath.split(path.sep).join('/');
  const response = await githubRequest(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodedPath}?ref=${REPO_BRANCH}`,
    token
  );
  return response.json();
}

async function updateRepoFile(repoPath, content, message, token) {
  const normalizedPath = repoPath.split(path.sep).join('/');
  let sha;

  try {
    const existing = await getRepoFile(normalizedPath, token);
    sha = existing.sha;
  } catch {
    sha = undefined;
  }

  await githubRequest(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${normalizedPath}`,
    token,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        content: Buffer.from(content, 'utf8').toString('base64'),
        branch: REPO_BRANCH,
        sha
      })
    }
  );
}

function readLocalContent() {
  const filePath = path.join(process.cwd(), 'content', 'site.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

module.exports = {
  exchangeCodeForToken,
  getGitHubUser,
  getRepoFile,
  updateRepoFile,
  readLocalContent
};
