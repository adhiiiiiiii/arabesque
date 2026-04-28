const fs = require('fs');
const path = require('path');

const ENV_DIR_CANDIDATES = [
  path.join(process.cwd(), 'env'),
  path.resolve(__dirname, '../../env')
];

function findExistingEnvDir() {
  return ENV_DIR_CANDIDATES.find((dirPath) => fs.existsSync(dirPath)) || ENV_DIR_CANDIDATES[0];
}

function readLocalSecret(key) {
  try {
    const filePath = path.join(findExistingEnvDir(), key);
    if (!fs.existsSync(filePath)) return null;
    const value = fs.readFileSync(filePath, 'utf8').trim();
    return value || null;
  } catch {
    return null;
  }
}

function getConfigValue(key, fallback = '') {
  return readLocalSecret(key) || process.env[key] || fallback;
}

module.exports = {
  getConfigValue
};
