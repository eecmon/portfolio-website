#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from '../lib/infrastructure-stack';
import { stages, StageName } from '../config/stages';

const app = new cdk.App();

const stageName = (app.node.tryGetContext('stage') ?? 'dev') as StageName;
const config = stages[stageName];

if (!config) {
  throw new Error(`Unknown stage: ${stageName}`);
}

// Sensitive fields can be overridden via environment variables.
// This is used in CI/CD (GitHub Actions) so that stages.ts never
// needs to be committed to the repository.
//
//   CONTACT_EMAIL        → contactEmail
//   ADMIN_ALLOWED_IPS    → adminAllowedIps  (comma-separated, e.g. "1.2.3.4,2001:db8::1")
const contactEmail =
  process.env.CONTACT_EMAIL ?? config.contactEmail;

const adminAllowedIps = process.env.ADMIN_ALLOWED_IPS
  ? process.env.ADMIN_ALLOWED_IPS.split(',').map((ip) => ip.trim()).filter(Boolean)
  : [...config.adminAllowedIps];

new InfrastructureStack(app, `PortfolioStack-${stageName}`, {
  ...config,
  contactEmail,
  allowedOrigins: [...config.allowedOrigins],
  adminAllowedIps,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: config.region,
  },
});
