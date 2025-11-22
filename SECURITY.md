# Security Policy

## Dependency Scanning

This project uses multiple layers of dependency security scanning:

### Automated Scanning

1. **npm audit** - Built-in npm vulnerability scanner
2. **GitHub CodeQL** - Advanced security analysis (via GitHub Actions)
3. **Dependabot** - Automated dependency updates (if enabled on GitHub)

### Running Security Checks Locally

```bash
# Run npm audit to check for vulnerabilities
npm run audit

# Automatically fix vulnerabilities (if possible)
npm run audit:fix

# Check for outdated packages
npm run update:check

# Run comprehensive security check
npm run security:check
```

### GitHub Actions Workflows

The project includes two CI/CD workflows:

#### 1. Security Scan (`security-scan.yml`)
- Runs on push to main/master
- Runs on pull requests
- Runs weekly on Monday at 9:00 UTC
- Checks:
  - npm audit for vulnerabilities
  - Outdated packages
  - CodeQL security analysis

#### 2. CI Workflow (`ci.yml`)
- Runs on push and pull requests
- Checks:
  - Code linting (ESLint)
  - Code formatting (Prettier)
  - Unit tests
  - Build success

### Manual Security Review

When adding new dependencies:

1. Check npm package reputation and download count
2. Review package maintainers
3. Check for known vulnerabilities: https://snyk.io/vuln/
4. Verify package license compatibility
5. Review package source code if critical

### Vulnerability Severity Levels

- **Critical**: Requires immediate action
- **High**: Should be fixed within 7 days
- **Moderate**: Should be fixed within 30 days
- **Low**: Fix when convenient

### Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do NOT** open a public issue
2. Email the maintainer directly (see package.json author field)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Security Best Practices

This project follows these security practices:

- ✅ Strict TypeScript compilation
- ✅ Content Security Policy (CSP) headers
- ✅ No inline scripts (except third-party analytics)
- ✅ Input validation and error handling
- ✅ Secure localStorage usage with fallbacks
- ✅ Regular dependency updates
- ✅ Automated security scanning
- ✅ Code review for all changes

### Third-Party Services

The application uses these third-party services:

- **Google Tag Manager**: Analytics and tracking
- **Microsoft Clarity**: User behavior analytics
- **Firebase**: Authentication and database backend

These services are loaded from trusted CDNs and follow best security practices.

#### Optional: Firebase API Key Domain Restrictions

For extra security, you can restrict your Firebase API key to only work on `focusgo.app`:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your focusgo project
3. **APIs & Services** → **Credentials**
4. Find your API key
5. Add **Application restrictions** → **HTTP referrers**
6. Add:
   - `https://focusgo.app/*`
   - `http://localhost/*`

### Browser Security

The application respects browser security policies:

- Feature detection before using browser APIs
- Graceful degradation when features unavailable
- No cookies or sensitive data storage
- PWA follows security best practices

## Update Policy

- **Dependencies**: Reviewed and updated monthly
- **Angular**: Updated to latest stable within 3 months of release
- **Security patches**: Applied within 7 days of disclosure

## Security Headers

When deploying, ensure these security headers are configured:

```
Content-Security-Policy: [See CSP-CONFIG.md]
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

See `CSP-CONFIG.md` for detailed CSP configuration.

## License Compliance

All dependencies are reviewed for license compatibility:

- Prefer MIT, Apache 2.0, BSD licenses
- Avoid copyleft licenses (GPL, AGPL) for client-side code
- Document all third-party licenses

## Audit Trail

Security audits are performed:

- **Automated**: Weekly via GitHub Actions
- **Manual**: Monthly dependency review
- **Code review**: All pull requests

---

Last updated: 2025-11-18
