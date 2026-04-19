let currentContent = null;

function getByPath(object, path) {
  return path.split('.').reduce((acc, segment) => {
    if (acc == null) return undefined;
    const key = Number.isNaN(Number(segment)) ? segment : Number(segment);
    return acc[key];
  }, object);
}

function setByPath(object, path, value) {
  const segments = path.split('.');
  let cursor = object;

  segments.forEach((segment, index) => {
    const key = Number.isNaN(Number(segment)) ? segment : Number(segment);
    const isLast = index === segments.length - 1;

    if (isLast) {
      cursor[key] = value;
      return;
    }

    if (cursor[key] == null) {
      const nextKey = segments[index + 1];
      cursor[key] = Number.isNaN(Number(nextKey)) ? {} : [];
    }

    cursor = cursor[key];
  });
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

function setStatus(message, isError = false) {
  const status = document.getElementById('cms-status');
  status.textContent = message;
  status.style.color = isError ? '#8a3b2c' : '';
}

function fillForm(content) {
  document.querySelectorAll('[data-path]').forEach((field) => {
    const value = getByPath(content, field.dataset.path);
    field.value = value ?? '';
  });
}

function readForm(content) {
  const next = structuredClone(content);
  document.querySelectorAll('[data-path]').forEach((field) => {
    setByPath(next, field.dataset.path, field.value);
  });
  return next;
}

async function init() {
  const logoutLink = document.getElementById('cms-logout');
  const saveButton = document.getElementById('cms-save');
  const form = document.getElementById('cms-form');
  const sessionNode = document.getElementById('cms-session');

  try {
    const session = await fetchJson('/api/session');

    if (!session.authenticated) {
      window.location.replace('/admin/');
      return;
    }

    logoutLink.hidden = false;
    saveButton.hidden = false;
    form.hidden = false;
    sessionNode.textContent = `Signed in as ${session.user}`;

    currentContent = await fetchJson('/api/content');
    fillForm(currentContent);
    setStatus('Content loaded. Changes save back to GitHub and will trigger a new Vercel deployment.');
  } catch (error) {
    setStatus(error.message || 'Failed to load CMS.', true);
    return;
  }

  saveButton.addEventListener('click', async () => {
    try {
      saveButton.disabled = true;
      setStatus('Saving changes to GitHub…');
      const nextContent = readForm(currentContent);

      await fetchJson('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nextContent)
      });

      currentContent = nextContent;
      setStatus('Saved. GitHub has been updated and Vercel should redeploy shortly.');
    } catch (error) {
      setStatus(error.message || 'Failed to save content.', true);
    } finally {
      saveButton.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
