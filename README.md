# BrownieBites (Fixed Project)

This is a fixed and cleaned-up version of the BrownieBites mini web app (PHP, MySQL, Tailwind).
Files were corrected for syntax, include paths, and minor security/output issues.

## Setup (local)
1. Clone / extract this repository to your web server document root (e.g., `htdocs` or `www`).
2. Create a MySQL database named `browniebites_db` (or change the name in `common/config.php`).
3. Update database credentials in `common/config.php` if necessary (defaults are `root` / empty password).
4. Run `install.php` once in your browser (e.g., `http://localhost/browniebites/install.php`) to create tables and default admin user.
5. After install, **DELETE** `install.php` for security.
6. Visit `login.php` for user login, or `admin/login.php` for admin login.

## Default Admin Credentials (created by installer)
- Email: `admin@browniebites.com`
- Password: `admin123`

## Notes
- This repo uses Tailwind and Font Awesome via CDN for convenience.
- The project intentionally disables some browser UX (right-click, save) in `assets/js/main.js` and via CSS `user-select: none`.
- For production, remove the UX restrictions, use environment variables for DB credentials, and enable HTTPS.

## License
Use as you wish. Remove or change default passwords before deploying publicly.
