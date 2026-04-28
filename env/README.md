Local-only admin secrets live in this folder.

Create these files for local testing:

- `env/CMS_ADMIN_USERNAME`
- `env/CMS_ADMIN_PASSWORD`
- `env/CMS_SESSION_SECRET`

Put only the raw secret value in each file with no JSON wrapper.

Example:

`env/CMS_ADMIN_USERNAME`
`admin`

`env/CMS_ADMIN_PASSWORD`
`test-password-123`

`env/CMS_SESSION_SECRET`
`replace-this-with-a-long-random-string`

These files are ignored by git via the repo `.gitignore`.
