function getCmsBasePath() {
  return window.location.pathname.startsWith('/admin-control') ? '/admin-control' : '/admin';
}

const LOCAL_CMS_USERNAME = 'adhil';
const LOCAL_CMS_PASSWORD = 'password2653';
const LOCAL_SESSION_KEY = 'arabesque_cms_local_session';

function isLocalMode() {
  return ['localhost', '127.0.0.1'].includes(window.location.hostname) || window.location.protocol === 'file:';
}

function getLocalSession() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

function setLocalSession(username) {
  localStorage.setItem(
    LOCAL_SESSION_KEY,
    JSON.stringify({
      cmsAuthenticated: true,
      user: username,
      authType: 'password',
      panel: 'cms',
      issuedAt: Date.now()
    })
  );
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const raw = await response.text();
  let payload = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || raw || `Request failed (${response.status}).`);
  }
  return payload || {};
}

async function fetchJsonWithFallback(urls, options) {
  let lastError = null;
  for (const url of urls) {
    try {
      return await fetchJson(url, options);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Request failed.');
}

async function attemptLogin(payload) {
  try {
    return await fetchJsonWithFallback(['/api/auth/password-login', '/api/auth/password-login.js'], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (postError) {
    return fetchJsonWithFallback(
      [
        `/api/auth/password-login?username=${encodeURIComponent(payload.username)}&password=${encodeURIComponent(payload.password)}`,
        `/api/auth/password-login.js?username=${encodeURIComponent(payload.username)}&password=${encodeURIComponent(payload.password)}`
      ],
      { method: 'GET' }
    );
  }
}

function setStatus(message, isError = false) {
  const status = document.getElementById('cms-status');
  status.textContent = message;
  status.style.color = isError ? '#fca5a5' : '';
}

async function init() {
  const cmsBasePath = getCmsBasePath();
  const dashboardPath = `${cmsBasePath}/dashboard.html`;
  const loginForm = document.getElementById('cms-login-form');
  const loginSubmit = document.getElementById('cms-login-submit');
  const localMode = isLocalMode();

  try {
    const session = await fetchJsonWithFallback(['/api/session', '/api/session.js']);
    if (session.cmsAuthenticated) {
      window.location.replace(dashboardPath);
      return;
    }
  } catch {
    if (localMode && getLocalSession()?.cmsAuthenticated) {
      window.location.replace(dashboardPath);
      return;
    }
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      loginSubmit.disabled = true;
      setStatus('Signing in...');
      const formData = new FormData(loginForm);

      const payload = {
        username: String(formData.get('username') || '').trim(),
        password: String(formData.get('password') || '').trim()
      };

      let session = null;
      let result = null;
      try {
        result = await attemptLogin(payload);
        session = await fetchJsonWithFallback(['/api/session', '/api/session.js']);
      } catch (apiError) {
        if (!localMode) throw apiError;
      }

      if (session?.cmsAuthenticated || getLocalSession()?.cmsAuthenticated) {
        window.location.replace(dashboardPath);
        return;
      }

      if (localMode && payload.username === LOCAL_CMS_USERNAME && payload.password === LOCAL_CMS_PASSWORD) {
        setLocalSession(payload.username);
        window.location.replace(dashboardPath);
        return;
      }

      if (!result?.ok) {
        throw new Error(result?.message || 'Invalid username or password.');
      }

      throw new Error('Login completed but session was not created. Check cookie/security settings.');
    } catch (error) {
      setStatus(error.message || 'Login failed.', true);
      loginSubmit.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
