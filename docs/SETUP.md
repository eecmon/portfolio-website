# Setup

## Prerequisites

| Requirement | Version / detail |
|---|---|
| **Node.js** | **20.x** (matches Lambda runtime and GitHub Actions; 20 LTS recommended) |
| **npm** | 10+ (ships with Node 20) |
| **AWS CLI** | **v2** — `aws --version` should show `aws-cli/2.x` |
| **AWS CDK CLI** | **2.1124.1** (pinned in `infrastructure/package.json`; install globally or use `npx aws-cdk`) |
| **AWS account** | Active account with programmatic access configured (`aws configure` or SSO) |
| **GitHub PAT** | Personal Access Token with **`read:user`** scope — used server-side to fetch your contribution calendar (including private repos). Classic or fine-grained token; stored in SSM, never in git. |
| **jq** | Optional but used in CI/CD output parsing (`brew install jq` on macOS) |

Verify your toolchain:

```bash
node --version    # expect v20.x.x
aws --version     # expect aws-cli/2.x
aws sts get-caller-identity   # confirms credentials work
```

For production custom domains you also need **Route 53** (or another DNS provider) and an **ACM certificate in `us-east-1`** — CloudFront requires certificates in that region. The CDK stack outputs a CloudFront URL; custom domain wiring (A/AAAA alias records) is configured outside the stack.

## Environment Variables & SSM Parameters

### Frontend (`.env.local` — gitignored)

Create `frontend/.env.local` for local development:

```bash
# local = localStorage + blob URLs (no AWS)
# api   = real /api/* endpoints (default when unset)
VITE_DATA_MODE=local
```

| Variable | Required | Description |
|---|---|---|
| `VITE_DATA_MODE` | No | `local` for offline dev; `api` to hit a deployed backend |

### CDK deploy (shell environment)

Used for local/manual deploys. CI/CD injects the same values from GitHub Secrets.

| Variable | Required | Description |
|---|---|---|
| `CONTACT_EMAIL` | Yes (prod) | Email address that receives contact-form notifications via SNS. Must confirm the SNS subscription email after first deploy. |
| `ADMIN_ALLOWED_IPS` | Yes | Comma-separated editor IPs. IPv4: exact match. IPv6: first four colon groups (`/64` prefix). Example: `203.0.113.10,2001:db8:1234:5678::1` |
| `CDK_DEFAULT_ACCOUNT` | Auto | Set by AWS CLI profile; CDK reads your account ID from `aws sts get-caller-identity` |
| `CDK_DEFAULT_REGION` | Yes | **`eu-central-1`** — all stack resources deploy here |

```bash
export CDK_DEFAULT_REGION=eu-central-1
export CONTACT_EMAIL="you@example.com"
export ADMIN_ALLOWED_IPS="203.0.113.10"
```

### SSM Parameter Store (written at deploy time)

| Parameter | Type | Set by | Description |
|---|---|---|---|
| `/portfolio/dev/github-token` | `SecureString` | CI/CD or manual `aws ssm put-parameter` | GitHub PAT for contribution heatmap |
| `/portfolio/prod/github-token` | `SecureString` | CI/CD or manual `aws ssm put-parameter` | Same token, prod stage |

Manual write (before or after first deploy):

```bash
aws ssm put-parameter \
  --region eu-central-1 \
  --name "/portfolio/dev/github-token" \
  --value "ghp_xxxxxxxxxxxxxxxxxxxx" \
  --type SecureString \
  --overwrite
```

### Lambda runtime (set automatically by CDK)

These are injected by the stack — no manual configuration needed:

| Variable | Source |
|---|---|
| `TABLE_NAME` | DynamoDB table `portfolio-content-{stage}` |
| `STAGE` | `dev` or `prod` |
| `ASSETS_BUCKET` | S3 assets bucket name |
| `GITHUB_TOKEN_PARAM` | `/portfolio/{stage}/github-token` |
| `CONTACT_TOPIC_ARN` | SNS topic ARN |

### GitHub Actions secrets (per environment: `dev`, `prod`)

Configure in **Settings → Environments**. See [Deployment — GitHub Secrets](DEPLOYMENT.md#github-secrets) for full documentation, examples, and OIDC setup.

| Secret | Description |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | IAM role ARN for OIDC authentication (no long-lived AWS keys) |
| `CONTACT_EMAIL` | Contact form recipient |
| `ADMIN_ALLOWED_IPS` | Comma-separated editor IPs (baked into CloudFront Function at deploy) |
| `PORTFOLIO_GITHUB_PAT` | GitHub PAT — synced to SSM on every deploy |

### `infrastructure/config/stages.ts` (gitignored)

Copy from example and fill in non-secret defaults. In CI, `contactEmail` and `adminAllowedIps` are overridden by env vars / secrets.

| Field | Description |
|---|---|
| `region` | `eu-central-1` |
| `domainName` | Custom domain for prod (informational) or `undefined` for dev |
| `allowedOrigins` | CORS origins for assets bucket — `['*']` for dev, `['https://yourdomain.com']` for prod |
| `contactEmail` | Fallback if `CONTACT_EMAIL` env var is unset |
| `adminAllowedIps` | Fallback if `ADMIN_ALLOWED_IPS` env var is unset |

## AWS Account Requirements

### Regions

| Region | Purpose |
|---|---|
| **`eu-central-1`** | Primary — CDK stack, Lambda, DynamoDB, S3, API Gateway, SNS, SSM, CloudFront (distribution resource) |
| **`us-east-1`** | ACM certificate for custom CloudFront domain only (not created by this CDK stack) |

### IAM permissions

**Local / manual deploy:** the IAM user or role running `cdk deploy` needs permissions to create and manage:

- CloudFormation stacks
- S3 buckets and objects
- CloudFront distributions and functions
- Lambda functions and execution roles
- API Gateway REST APIs
- DynamoDB tables
- SNS topics and subscriptions
- SSM parameters
- IAM roles and policies (CDK generates these)

For a first-time setup, `AdministratorAccess` on the deployer principal is the simplest path. For CI/CD, use a dedicated OIDC role scoped to this repository (see [Deployment — OIDC setup](DEPLOYMENT.md#aws-oidc-setup-one-time)).

**Lambda execution role** (created by CDK): read/write DynamoDB, read/write S3 assets bucket, `ssm:GetParameter` on the GitHub token path, `sns:Publish` on the contact topic.

### One-time CDK bootstrap

CDK needs an S3 bucket and IAM roles in your account/region before the first deploy:

```bash
export CDK_DEFAULT_REGION=eu-central-1
npx aws-cdk bootstrap aws://$(aws sts get-caller-identity --query Account --output text)/eu-central-1
```

### Service limits (typical defaults — sufficient for this project)

| Service | Default limit | Project usage |
|---|---|---|
| Lambda | 1,000 concurrent executions / region | Single function, low traffic |
| DynamoDB | On-demand, no pre-provisioned capacity | Two items (`CONTENT`, `SETTINGS`) |
| API Gateway | 10,000 requests/s steady-state | REST API, proxy to Lambda |
| CloudFront | 200 distributions / account | One distribution per stage |
| SSM Standard parameters | 10,000 / account | One SecureString per stage |
| SNS email | Subscription confirmation required | One email subscription per stage |

After the first deploy, AWS sends an **SNS subscription confirmation** email to `CONTACT_EMAIL` — click the link once per stage or contact-form delivery will not work.

## Setup — Step by Step

### 1. Clone and install dependencies

```bash
git clone https://github.com/eecmon/portfolio-website.git
cd portfolio-website

cd frontend && npm ci && cd ..
cd backend && npm ci && cd ..
cd infrastructure && npm ci && cd ..
```

### 2. Configure AWS CLI

```bash
aws configure
# Or, with SSO:
# aws configure sso

aws sts get-caller-identity
export CDK_DEFAULT_REGION=eu-central-1
```

### 3. Create a GitHub Personal Access Token

1. GitHub → **Settings → Developer settings → Personal access tokens**
2. Create a token with **`read:user`** scope (classic token) or equivalent user-read permission (fine-grained)
3. Copy the token — you will store it in SSM, not in the repository

### 4. Create infrastructure stage config

```bash
cp infrastructure/config/stages.example.ts infrastructure/config/stages.ts
```

Edit `stages.ts`: set your email, editor IPs, and `allowedOrigins`. Get your current IPs:

```bash
curl -4 https://checkip.amazonaws.com   # IPv4
curl -6 https://checkip.amazonaws.com   # IPv6 — use first 4 groups as prefix
```

### 5. Bootstrap CDK (once per account/region)

```bash
cd infrastructure
npx aws-cdk bootstrap aws://$(aws sts get-caller-identity --query Account --output text)/eu-central-1
```

### 6. Store GitHub token in SSM

```bash
aws ssm put-parameter \
  --region eu-central-1 \
  --name "/portfolio/dev/github-token" \
  --value "ghp_YOUR_TOKEN_HERE" \
  --type SecureString \
  --overwrite
```

### 7. Deploy infrastructure (dev)

```bash
cd infrastructure
npm run build

export CONTACT_EMAIL="you@example.com"
export ADMIN_ALLOWED_IPS="$(curl -s https://checkip.amazonaws.com | tr -d '\n')"

npx cdk deploy --require-approval never -c stage=dev --outputs-file cdk-outputs.json
```

Note the outputs: `WebsiteBucketName`, `DistributionId`, `CloudFrontUrl`.

### 8. Build and deploy frontend

```bash
cd ../frontend
npm run build

cd ../infrastructure
BUCKET=$(jq -r '."PortfolioStack-dev".WebsiteBucketName' cdk-outputs.json)
DIST_ID=$(jq -r '."PortfolioStack-dev".DistributionId' cdk-outputs.json)

aws s3 sync ../frontend/dist "s3://${BUCKET}" --delete --region eu-central-1
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"
```

### 9. Verify deployment

```bash
CLOUDFRONT_URL=$(jq -r '."PortfolioStack-dev".CloudFrontUrl' cdk-outputs.json)

curl -s "${CLOUDFRONT_URL}/api/content" | jq '{editor, updatedAt}'
curl -sI "${CLOUDFRONT_URL}" | grep -E "HTTP|x-cache"
```

Confirm `editor.allowed` is `true` when curling from an allowlisted IP. If the Edit button is missing in the browser, compare `editor.viewerIp` against `ADMIN_ALLOWED_IPS`.

### 10. Confirm SNS email subscription

Check the inbox for `CONTACT_EMAIL` and click the AWS SNS confirmation link.

### 11. Local frontend development (no AWS)

```bash
cd frontend
echo 'VITE_DATA_MODE=local' > .env.local
npm run dev
```

Open `http://localhost:5173`. Content persists in `localStorage`; editor mode is always enabled.

To develop against the deployed API instead:

```bash
echo 'VITE_DATA_MODE=api' > .env.local
npm run dev
```

Use a dev-server proxy or open the CloudFront URL directly — the Vite dev server does not proxy `/api` by default.

### 12. Run tests

```bash
cd frontend && npx vitest run
cd ../backend && npm test
```

### 13. Deploy to production

Repeat steps 6–9 with `stage=prod`, prod SSM path (`/portfolio/prod/github-token`), and prod GitHub Environment secrets. Alternatively, use the commands in [Deployment — Manual Deployment](DEPLOYMENT.md#manual-deployment). Once GitHub Actions is configured, pushing to `main` triggers `deploy-prod.yml` automatically.
