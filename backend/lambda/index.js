import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const dynamoClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(dynamoClient);
const s3 = new S3Client({});
const ssm = new SSMClient({});
const snsClient = new SNSClient({});

const TABLE_NAME = process.env.TABLE_NAME;
const ASSETS_BUCKET = process.env.ASSETS_BUCKET;
const GITHUB_TOKEN_PARAM = process.env.GITHUB_TOKEN_PARAM;
const CONTACT_TOPIC_ARN = process.env.CONTACT_TOPIC_ARN;

// IP rate limit for contact form: ip → lastSubmittedAt timestamp
const contactRateLimit = new Map();
const RATE_LIMIT_MS = 10 * 60 * 1000; // 10 minutes per IP

// Module-level cache for GitHub contribution data (1 hour TTL)
let githubContribCache = null;
let githubContribCachedAt = 0;
const GITHUB_CACHE_TTL_MS = 60 * 60 * 1000;

async function fetchGitHubContributions() {
  const ssmResult = await ssm.send(new GetParameterCommand({
    Name: GITHUB_TOKEN_PARAM,
    WithDecryption: true,
  }));
  const token = ssmResult.Parameter.Value;

  const query = `{
    viewer {
      login
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              weekday
            }
          }
        }
      }
    }
  }`;

  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'portfolio-lambda',
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  const json = await res.json();
  if (json.errors) throw new Error(`GitHub GraphQL error: ${JSON.stringify(json.errors)}`);

  const viewer = json.data.viewer;
  const calendar = viewer.contributionsCollection.contributionCalendar;

  return {
    username: viewer.login,
    totalContributions: calendar.totalContributions,
    weeks: calendar.weeks.map((w) => ({
      days: w.contributionDays.map((d) => ({
        date: d.date,
        count: d.contributionCount,
        weekday: d.weekday,
      })),
    })),
  };
}

const defaultSettings = {
  theme: 'modern-1',
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  textColor: '#111827',
  fontFamily: 'geist',
  multilanguage: false,
  defaultLanguage: 'en',
};

const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify(body),
});

const isEditorRequest = (event) => {
  const headers = event.headers || {};
  return (
    headers['x-editor-allowed'] === 'true' ||
    headers['X-Editor-Allowed'] === 'true'
  );
};

export const handler = async (event) => {
  const method = event.httpMethod;
  const requestPath = event.path;
  const isEditor = isEditorRequest(event);

  try {
    // ── GET /content ─────────────────────────────────────────────
    if (method === 'GET' && requestPath.endsWith('/content')) {
      const result = await ddb.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { pk: 'CONTENT', sk: 'MAIN' },
        })
      );

      return jsonResponse(200, {
        hero: result.Item?.hero || {},
        sections: result.Item?.sections || [],   // FIX: was missing
        updatedAt: result.Item?.updatedAt || null,
        editor: {
          allowed: isEditor,
          viewerIp:
            event.headers?.['x-viewer-ip'] ||
            event.headers?.['X-Viewer-Ip'] ||
            null,
        },
      });
    }

    // ── PUT /content ─────────────────────────────────────────────
    if (method === 'PUT' && requestPath.endsWith('/content')) {
      if (!isEditor) return jsonResponse(403, { error: 'Forbidden' });

      const body = JSON.parse(event.body || '{}');

      await ddb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            pk: 'CONTENT',
            sk: 'MAIN',
            hero: body.hero || {},
            sections: body.sections || [],       // FIX: was missing
            updatedAt: new Date().toISOString(),
          },
        })
      );

      return jsonResponse(200, { success: true });
    }

    // ── GET /settings ─────────────────────────────────────────────
    // FIX: route was completely missing
    if (method === 'GET' && requestPath.endsWith('/settings')) {
      const result = await ddb.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { pk: 'SETTINGS', sk: 'MAIN' },
        })
      );

      return jsonResponse(200, {
        ...defaultSettings,
        ...(result.Item?.settings || {}),
      });
    }

    // ── PUT /settings ─────────────────────────────────────────────
    // FIX: route was completely missing
    if (method === 'PUT' && requestPath.endsWith('/settings')) {
      if (!isEditor) return jsonResponse(403, { error: 'Forbidden' });

      const body = JSON.parse(event.body || '{}');

      await ddb.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            pk: 'SETTINGS',
            sk: 'MAIN',
            settings: body,
            updatedAt: new Date().toISOString(),
          },
        })
      );

      return jsonResponse(200, { success: true });
    }

    // ── POST /upload ─────────────────────────────────────────────
    if (method === 'POST' && requestPath.endsWith('/upload')) {
      if (!isEditor) return jsonResponse(403, { error: 'Forbidden' });

      const body = JSON.parse(event.body || '{}');

      const fileName = body.fileName;             // FIX: was body.filename (lowercase n)
      const contentType = body.contentType || 'application/octet-stream';

      if (!fileName) {
        return jsonResponse(400, { error: 'fileName is required' });
      }

      const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-');
      const key = `uploads/${Date.now()}-${safeFileName}`;

      const command = new PutObjectCommand({
        Bucket: ASSETS_BUCKET,
        Key: key,
        ContentType: contentType,
      });

      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });

      return jsonResponse(200, {
        uploadUrl,
        key,
        publicUrl: `/${key}`,                    // FIX: was publicPath (frontend expected publicUrl)
      });
    }

    // ── POST /contact ─────────────────────────────────────────
    if (method === 'POST' && requestPath.endsWith('/contact')) {
      const body = JSON.parse(event.body || '{}');

      // Layer 1: honeypot — bots fill the hidden "website" field
      if (body.website) {
        return jsonResponse(200, { success: true });
      }

      // Layer 2: minimum form time (must be ≥ 3 seconds since page noted _t)
      const formAge = Date.now() - (Number(body._t) || 0);
      if (formAge < 3000) {
        return jsonResponse(200, { success: true });
      }

      // Layer 3: IP rate limit
      const ip =
        event.headers?.['x-viewer-ip'] ||
        event.headers?.['X-Viewer-Ip'] ||
        'unknown';
      const lastSubmit = contactRateLimit.get(ip);
      if (lastSubmit && Date.now() - lastSubmit < RATE_LIMIT_MS) {
        return jsonResponse(429, { error: 'Too many requests. Please wait before trying again.' });
      }

      // Validate required fields
      const firstName = (body.firstName || '').trim();
      const lastName  = (body.lastName  || '').trim();
      const message   = (body.message   || '').trim();
      const org       = (body.organisation || '').trim();

      if (!firstName || !lastName || !message) {
        return jsonResponse(400, { error: 'First name, last name, and message are required.' });
      }
      if (message.length > 2000) {
        return jsonResponse(400, { error: 'Message must be 2000 characters or fewer.' });
      }

      if (!CONTACT_TOPIC_ARN) {
        return jsonResponse(503, { error: 'Contact form not configured.' });
      }

      const lines = [
        org ? `Organisation: ${org}` : null,
        `Name: ${firstName} ${lastName}`,
        '',
        message,
      ].filter((l) => l !== null).join('\n');

      await snsClient.send(new PublishCommand({
        TopicArn: CONTACT_TOPIC_ARN,
        Subject: `Portfolio contact from ${firstName} ${lastName}`,
        Message: lines,
      }));

      contactRateLimit.set(ip, Date.now());

      return jsonResponse(200, { success: true });
    }

    // ── GET /github-contributions ─────────────────────────────
    if (method === 'GET' && requestPath.endsWith('/github-contributions')) {
      if (!GITHUB_TOKEN_PARAM) {
        return jsonResponse(503, { error: 'GitHub integration not configured' });
      }

      const now = Date.now();
      if (!githubContribCache || now - githubContribCachedAt > GITHUB_CACHE_TTL_MS) {
        githubContribCache = await fetchGitHubContributions();
        githubContribCachedAt = now;
      }

      return jsonResponse(200, githubContribCache);
    }

    return jsonResponse(404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    return jsonResponse(500, { error: error.message });
  }
};
