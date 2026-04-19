# Arabesque CMS Setup

## Architecture

- Public site: static HTML/CSS/JS
- Editable content source: `content/site.json`
- Admin dashboard: `admin/index.html`
- Auth and save endpoints: `api/*`
- Save flow: CMS -> GitHub commit -> Vercel redeploy

## Required Vercel Environment Variables

- `CMS_ADMIN_USERNAME`
- `CMS_ADMIN_PASSWORD`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_REPO_OWNER`
- `GITHUB_REPO_NAME`
- `GITHUB_DEFAULT_BRANCH`
- `CMS_ALLOWED_USERS`
- `CMS_SESSION_SECRET`
- `GITHUB_PAT` or `CMS_GITHUB_TOKEN`

## Admin Login

The CMS dashboard now uses a clean username/password login panel at `/admin/`.

Set:

- `CMS_ADMIN_USERNAME`
- `CMS_ADMIN_PASSWORD`

After login, saves still commit back to GitHub using `GITHUB_PAT` or `CMS_GITHUB_TOKEN`.

## Optional GitHub OAuth App

Create a GitHub OAuth App and set:

- Homepage URL: your production site URL
- Authorization callback URL: `https://your-domain.com/api/auth/callback`

For local testing, use:

- `http://localhost:3000/api/auth/callback`

## Access Control

`CMS_ALLOWED_USERS` should be a comma-separated list of GitHub usernames allowed into the CMS.

Example:

`yourusername,teammateusername`

## How Publishing Works

1. Log in to `/admin/` with your CMS username and password.
2. Edit content in the dashboard.
3. Save changes.
4. The CMS commits `content/site.json` back to GitHub.
5. Vercel detects the new commit and redeploys the site.

## SEO Notes

- `robots.txt` and `site.webmanifest` are already included.
- Core social/meta tags are in `index.html`.
- If you want a production `sitemap.xml` and canonical URL, add your final live domain and generate those next.
