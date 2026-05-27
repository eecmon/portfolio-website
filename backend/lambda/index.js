import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const dynamoClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(dynamoClient);
const s3 = new S3Client({});

const TABLE_NAME = process.env.TABLE_NAME;
const ASSETS_BUCKET = process.env.ASSETS_BUCKET;

const defaultSettings = {
  theme: 'modern-1',
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  textColor: '#111827',
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

    return jsonResponse(404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    return jsonResponse(500, { error: error.message });
  }
};
