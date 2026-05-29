// Copy this file to stages.ts and fill in your own values.
// stages.ts is gitignored — never commit your real IPs or email.
//
// For CI/CD, the sensitive fields (contactEmail, adminAllowedIps) are
// injected via environment variables (CONTACT_EMAIL, ADMIN_ALLOWED_IPS).
// See .github/workflows/ for the GitHub Actions setup.

export const stages = {
  dev: {
    stage: 'dev',
    region: 'eu-central-1',
    domainName: undefined,
    // '*' lets any origin PUT to presigned URLs — fine for dev since the presigned
    // URL itself is the security gate. Replace with your specific CloudFront URL
    // (e.g. 'https://xxxx.cloudfront.net') for a tighter policy.
    allowedOrigins: ['*'],
    contactEmail: 'you@example.com',
    adminAllowedIps: [
      '1.2.3.4',        // your home IPv4
      '2001:db8::1',    // your home IPv6 (optional)
    ],
  },
  prod: {
    stage: 'prod',
    region: 'eu-central-1',
    domainName: 'mantasec.dev',
    allowedOrigins: ['https://mantasec.dev'],
    contactEmail: 'you@example.com',   // overridden by CONTACT_EMAIL secret
    adminAllowedIps: ['1.2.3.4'],      // overridden by ADMIN_ALLOWED_IPS secret
  },
} as const;

export type StageName = keyof typeof stages;
