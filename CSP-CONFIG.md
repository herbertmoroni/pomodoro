# Content Security Policy (CSP) Configuration

This document provides Content Security Policy header configurations for various hosting platforms.

## What is CSP?

Content Security Policy (CSP) is a security header that helps protect your application from Cross-Site Scripting (XSS), code injection, and other attacks by controlling which sources of content are allowed to load.

## Recommended CSP Header

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://clarity.microsoft.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';
```

### Policy Breakdown

- `default-src 'self'` - Only load resources from same origin by default
- `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms` - Allow scripts from self, inline scripts (for GTM/Clarity), and tracking domains
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` - Allow styles from self, inline styles (for Angular Material), and Google Fonts
- `font-src 'self' https://fonts.gstatic.com` - Allow fonts from self and Google Fonts CDN
- `img-src 'self' data: https:` - Allow images from self, data URIs, and HTTPS sources
- `connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://clarity.microsoft.com` - Allow AJAX/fetch to analytics domains
- `frame-src 'none'` - Disallow embedding in frames
- `object-src 'none'` - Disallow plugins like Flash
- `base-uri 'self'` - Restrict base tag to same origin
- `form-action 'self'` - Restrict form submissions to same origin

## Platform-Specific Configuration

### Netlify

Create a `netlify.toml` file in the project root:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://clarity.microsoft.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
```

### Vercel

Create a `vercel.json` file in the project root:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://clarity.microsoft.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### Firebase Hosting

Add to `firebase.json`:

```json
{
  "hosting": {
    "public": "dist/pomodoro",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://clarity.microsoft.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          }
        ]
      }
    ]
  }
}
```

### AWS CloudFront

Add custom headers in CloudFront response headers policy or use Lambda@Edge:

```javascript
exports.handler = async (event) => {
  const response = event.Records[0].cf.response;
  const headers = response.headers;

  headers['content-security-policy'] = [{
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://clarity.microsoft.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';"
  }];

  return response;
};
```

### Nginx

Add to server configuration:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://clarity.microsoft.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
```

### Apache (.htaccess)

```apache
<IfModule mod_headers.c>
  Header set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://clarity.microsoft.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';"
  Header set X-Frame-Options "DENY"
  Header set X-Content-Type-Options "nosniff"
</IfModule>
```

## Testing CSP

After deploying with CSP headers:

1. Open browser DevTools (F12)
2. Go to the Console tab
3. Look for CSP violation warnings
4. Adjust policy as needed

### Online Testing Tools

- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [SecurityHeaders.com](https://securityheaders.com/)

## Improving CSP (Removing 'unsafe-inline')

The current policy uses `'unsafe-inline'` for scripts and styles due to:
- Google Tag Manager inline scripts
- Microsoft Clarity inline scripts
- Angular Material inline styles

To improve security:

1. **Use CSP nonces**: Generate random nonces for each request and add them to inline scripts
2. **Externalize scripts**: Move inline tracking code to external files
3. **Use hash-based CSP**: Calculate SHA hashes of inline scripts and whitelist them

## Additional Security Headers

Consider adding these headers as well:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Notes

- `'unsafe-inline'` is required for GTM and Clarity but reduces CSP protection
- Consider implementing CSP in report-only mode first: `Content-Security-Policy-Report-Only`
- Monitor CSP violations to catch issues before enforcing
- Update the policy when adding new third-party services
