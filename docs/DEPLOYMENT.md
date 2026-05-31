# Deployment

## CI/CD Pipeline

Two workflow files in `.github/workflows/` deploy to isolated AWS stages. Both are structurally identical — only the trigger branch, GitHub Environment name, and CDK stage context differ.

| Workflow file | Trigger | Branch | GitHub Environment | CDK stage | Stack name |
|---|---|---|---|---|---|
| `deploy-dev.yml` | `push` | `dev` | `dev` | `dev` | `PortfolioStack-dev` |
| `deploy-prod.yml` | `push` | `main` | `prod` | `prod` | `PortfolioStack-prod` |

Each workflow declares `permissions: id-token: write` (required for AWS OIDC) and `contents: read`.

### Job execution order

Jobs run **sequentially** — the deploy job never starts if tests fail.

```
push to dev or main
        │
        ▼
┌───────────────────┐
│  Job 1: test      │  ubuntu-latest, Node 20, no AWS credentials
│  (always runs)    │
└─────────┬─────────┘
          │ needs: test ✓
          ▼
┌───────────────────┐
│  Job 2: deploy    │  ubuntu-latest, Node 20, OIDC → AWS
│  (gate on tests)  │
└───────────────────┘
```

### Job 1 — `test`

**Purpose:** Gate all deployments. No AWS access.

| Step # | Step name | Working dir | Command |
|---|---|---|---|
| 1 | Checkout | — | `actions/checkout@v4` |
| 2 | Setup Node 20 | — | `actions/setup-node@v4` |
| 3 | Install frontend dependencies | `frontend/` | `npm ci` |
| 4 | Frontend tests | `frontend/` | `npx vitest run` |
| 5 | Install backend dependencies | `backend/` | `npm ci` |
| 6 | Backend tests | `backend/` | `npm test` |

If any step fails, the workflow stops and **Job 2 does not run**.

### Job 2 — `deploy`

**Purpose:** Sync secrets, deploy infrastructure, build frontend, publish to S3, invalidate CloudFront.

**Depends on:** `needs: test`

**GitHub Environment:** `dev` or `prod` — resolves environment-scoped secrets (`AWS_DEPLOY_ROLE_ARN`, etc.).

| Step # | Step name | Working dir | What it does |
|---|---|---|---|
| 1 | Checkout | — | Fresh copy of the repo |
| 2 | Setup Node 20 | — | Node 20 with npm cache for `infrastructure/` and `frontend/` lockfiles |
| 3 | Configure AWS credentials (OIDC) | — | Assumes `AWS_DEPLOY_ROLE_ARN` via `aws-actions/configure-aws-credentials@v4` in `eu-central-1` |
| 4 | Write GitHub PAT to SSM | — | `aws ssm put-parameter` → `/portfolio/{stage}/github-token` (SecureString, `--overwrite`) |
| 5 | Generate stages.ts | `infrastructure/` | `cp config/stages.example.ts config/stages.ts` |
| 6 | Install infrastructure dependencies | `infrastructure/` | `npm ci` |
| 7 | Build CDK | `infrastructure/` | `npm run build` (TypeScript → JS) |
| 8 | CDK deploy | `infrastructure/` | `npx cdk deploy --require-approval never -c stage={stage} --outputs-file cdk-outputs.json` with `CONTACT_EMAIL` and `ADMIN_ALLOWED_IPS` from secrets |
| 9 | Install frontend dependencies | `frontend/` | `npm ci` |
| 10 | Build frontend | `frontend/` | `npm run build` → `frontend/dist/` |
| 11 | Sync frontend to S3 | `infrastructure/` | `aws s3 sync ../frontend/dist s3://$BUCKET --delete` (bucket from `cdk-outputs.json`) |
| 12 | Invalidate CloudFront cache | `infrastructure/` | `aws cloudfront create-invalidation --paths "/*"` (distribution ID from `cdk-outputs.json`) |

**CDK outputs used after deploy:**

| Output key | Used for |
|---|---|
| `WebsiteBucketName` | S3 sync target |
| `DistributionId` | CloudFront invalidation |
| `CloudFrontUrl` | Live site URL (dev uses this; prod uses custom domain) |

### Typical branch workflow

```
feature branch  →  merge to dev   →  deploy-dev.yml runs  →  PortfolioStack-dev
dev tested      →  merge to main  →  deploy-prod.yml runs →  PortfolioStack-prod
```

Updating `ADMIN_ALLOWED_IPS` requires a redeploy — the allowlist is compiled into the CloudFront Function at CDK deploy time.

## GitHub Secrets

Secrets are **not** stored in the repository. Configure them in the GitHub repo under **Settings → Environments** — create two environments: `dev` and `prod`. Each environment has its own independent secret values.

### Required secrets (both environments)

| Secret | Example value | Description |
|---|---|---|
| `AWS_DEPLOY_ROLE_ARN` | `arn:aws:iam::123456789012:role/github-actions-portfolio` | IAM role ARN for OIDC. The role trust policy must allow `token.actions.githubusercontent.com` and be scoped to this repository. Needs permissions for CDK deploy, SSM, S3, and CloudFront invalidation. |
| `CONTACT_EMAIL` | `you@example.com` | Recipient for contact-form emails. Passed to CDK as `CONTACT_EMAIL` → SNS email subscription. Confirm the SNS subscription email after first deploy. |
| `ADMIN_ALLOWED_IPS` | `203.0.113.10,2001:db8:1234:5678::1` | Comma-separated IPs for editor mode. IPv4: exact match. IPv6: only the first four colon groups are compared (`/64` prefix). No spaces unless trimmed by the deploy script. |
| `PORTFOLIO_GITHUB_PAT` | `ghp_xxxxxxxxxxxx` | GitHub Personal Access Token with **`read:user`** scope. Written to SSM at `/portfolio/{stage}/github-token` on every deploy. Never exposed to the browser. |

### Where each secret is consumed

| Secret | Consumed by | Effect |
|---|---|---|
| `AWS_DEPLOY_ROLE_ARN` | `aws-actions/configure-aws-credentials` | Temporary AWS session for all deploy steps |
| `CONTACT_EMAIL` | CDK deploy env var → `InfrastructureStack` → SNS subscription | Contact form delivery target |
| `ADMIN_ALLOWED_IPS` | CDK deploy env var → CloudFront Function inline code | Controls `x-editor-allowed` header |
| `PORTFOLIO_GITHUB_PAT` | `aws ssm put-parameter` before CDK deploy | Lambda reads token at runtime for GitHub GraphQL |

### One-time OIDC setup

Before the workflows can authenticate, configure an AWS IAM OIDC identity provider for GitHub Actions and create the deploy role. Full steps:

**Settings → Environments → New environment** → name it `dev`, repeat for `prod` → add all four secrets to each.

See [AWS OIDC Setup (one-time)](#aws-oidc-setup-one-time) below for IAM trust policy and role creation.

### Dev vs prod secret values

| Secret | Usually different per environment? | Notes |
|---|---|---|
| `AWS_DEPLOY_ROLE_ARN` | Optional | Can share one role or use separate roles per stage |
| `CONTACT_EMAIL` | Optional | Same inbox for both, or separate test address for dev |
| `ADMIN_ALLOWED_IPS` | Rarely | Same home/office IPs typically work for both |
| `PORTFOLIO_GITHUB_PAT` | Optional | Same GitHub account token is fine for both stages |

## AWS OIDC Setup (one-time)

Before workflows can authenticate to AWS, configure an IAM OIDC identity provider for GitHub Actions:

1. IAM → Identity providers → Add OpenID Connect provider
   - URL: `https://token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`
2. IAM → Create role → Web identity → select that provider
   - GitHub organization: `eecmon`, repository: `portfolio-website`
   - Attach `AdministratorAccess` (tighten later)
3. Edit trust policy to restrict to this repo:

```json
{
  "StringEquals": {
    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
  },
  "StringLike": {
    "token.actions.githubusercontent.com:sub": "repo:eecmon/portfolio-website:*"
  }
}
```

4. Copy role ARN → add as `AWS_DEPLOY_ROLE_ARN` in both GitHub environments (`dev` and `prod`)

## Manual Deployment

Use manual deploys for first-time setup, debugging CDK changes, or when GitHub Actions is not configured. Requires AWS CLI credentials locally (not OIDC).

### Prerequisites

```bash
export CDK_DEFAULT_REGION=eu-central-1
aws sts get-caller-identity   # verify credentials

cp infrastructure/config/stages.example.ts infrastructure/config/stages.ts
# edit stages.ts with your values
```

One-time bootstrap (if not done yet):

```bash
cd infrastructure
npx aws-cdk bootstrap aws://$(aws sts get-caller-identity --query Account --output text)/eu-central-1
```

### Store GitHub token in SSM

```bash
# dev
aws ssm put-parameter \
  --region eu-central-1 \
  --name "/portfolio/dev/github-token" \
  --value "ghp_YOUR_TOKEN" \
  --type SecureString \
  --overwrite

# prod
aws ssm put-parameter \
  --region eu-central-1 \
  --name "/portfolio/prod/github-token" \
  --value "ghp_YOUR_TOKEN" \
  --type SecureString \
  --overwrite
```

### Deploy infrastructure (CDK)

```bash
cd infrastructure
npm ci
npm run build

export CONTACT_EMAIL="you@example.com"
export ADMIN_ALLOWED_IPS="203.0.113.10,2001:db8:1234:5678::1"

# Dev stack
npx cdk deploy --require-approval never -c stage=dev --outputs-file cdk-outputs.json

# Prod stack
npx cdk deploy --require-approval never -c stage=prod --outputs-file cdk-outputs.json
```

Other useful CDK commands:

```bash
# Preview changes before deploy
npx cdk diff -c stage=dev

# Synthesize CloudFormation template locally (no deploy)
npx cdk synth -c stage=dev

# Destroy a stack (dev only — prod buckets/tables use RETAIN policy)
npx cdk destroy -c stage=dev
```

### Deploy frontend (after CDK)

CDK does not upload the React build — sync manually after `npm run build`:

```bash
cd frontend
npm ci
npm run build

cd ../infrastructure

# Dev
BUCKET=$(jq -r '."PortfolioStack-dev".WebsiteBucketName' cdk-outputs.json)
DIST_ID=$(jq -r '."PortfolioStack-dev".DistributionId' cdk-outputs.json)
aws s3 sync ../frontend/dist "s3://${BUCKET}" --delete
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"

# Prod — replace stack key if cdk-outputs.json came from prod deploy
BUCKET=$(jq -r '."PortfolioStack-prod".WebsiteBucketName' cdk-outputs.json)
DIST_ID=$(jq -r '."PortfolioStack-prod".DistributionId' cdk-outputs.json)
aws s3 sync ../frontend/dist "s3://${BUCKET}" --delete
aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*"
```

If `cdk-outputs.json` is missing, read outputs from CloudFormation:

```bash
aws cloudformation describe-stacks \
  --stack-name PortfolioStack-dev \
  --region eu-central-1 \
  --query 'Stacks[0].Outputs'
```

### Frontend-only deploy (no infra changes)

When only React code changed and the CDK stack is already up:

```bash
cd frontend && npm ci && npm run build

# Set bucket and distribution ID from a previous deploy or CloudFormation outputs
aws s3 sync dist/ s3://YOUR_BUCKET_NAME --delete --region eu-central-1
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Verify after deploy

```bash
# Dev CloudFront URL from outputs
curl -s "$(jq -r '."PortfolioStack-dev".CloudFrontUrl' cdk-outputs.json)/api/content" | jq '{editor, updatedAt}'

# Prod custom domain
curl -s https://mantasec.dev/api/content | jq '{editor, updatedAt}'
```

Confirm SNS subscription email for `CONTACT_EMAIL` on first deploy.
