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

async function init() {
  const loginForm = document.getElementById('cms-login-form');
  const loginSubmit = document.getElementById('cms-login-submit');

  try {
    const session = await fetchJson('/api/session');
    if (session.authenticated) {
      window.location.replace('/admin/dashboard.html');
      return;
    }
  } catch {
    // keep login form visible
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      loginSubmit.disabled = true;
      setStatus('Signing in…');
      const formData = new FormData(loginForm);

      await fetchJson('/api/auth/password-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.get('username'),
          password: formData.get('password')
        })
      });

      window.location.replace('/admin/dashboard.html');
    } catch (error) {
      setStatus(error.message || 'Login failed.', true);
      loginSubmit.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
