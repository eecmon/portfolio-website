import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Shared mock handles ───────────────────────────────────────────
// vi.hoisted() runs BEFORE module evaluation so the mocks below
// can safely reference these fns when the Lambda is first imported.

const { mockDdbSend, mockGetSignedUrl, mockSsmSend, mockSnsSend } = vi.hoisted(() => ({
  mockDdbSend: vi.fn(),
  mockGetSignedUrl: vi.fn(),
  mockSsmSend: vi.fn(),
  mockSnsSend: vi.fn(),
}));

vi.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: vi.fn(() => ({})),
}));

vi.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: { from: vi.fn(() => ({ send: mockDdbSend })) },
  GetCommand: vi.fn((params) => ({ _type: 'GetCommand', ...params })),
  PutCommand: vi.fn((params) => ({ _type: 'PutCommand', ...params })),
}));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: vi.fn(() => ({})),
  PutObjectCommand: vi.fn((params) => ({ _type: 'PutObjectCommand', ...params })),
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: mockGetSignedUrl,
}));

vi.mock('@aws-sdk/client-ssm', () => ({
  SSMClient: vi.fn(() => ({ send: mockSsmSend })),
  GetParameterCommand: vi.fn((params) => ({ _type: 'GetParameterCommand', ...params })),
}));

vi.mock('@aws-sdk/client-sns', () => ({
  SNSClient: vi.fn(() => ({ send: mockSnsSend })),
  PublishCommand: vi.fn((params) => ({ _type: 'PublishCommand', ...params })),
}));

const { handler } = await import('./index.js');

// ── Helpers ───────────────────────────────────────────────────────

function makeEvent({ method = 'GET', path = '/api/content', body = null, isEditor = false } = {}) {
  return {
    httpMethod: method,
    path,
    headers: { 'x-editor-allowed': isEditor ? 'true' : 'false' },
    body: body !== null ? JSON.stringify(body) : null,
  };
}

function parseResponse(res) {
  return { status: res.statusCode, body: JSON.parse(res.body) };
}

// ── Tests ─────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

// ── GET /content ──────────────────────────────────────────────────

describe('GET /content', () => {
  it('returns hero and sections from DynamoDB', async () => {
    mockDdbSend.mockResolvedValue({
      Item: {
        hero: { firstName: 'Mantas', lastName: 'Ercius' },
        sections: [{ id: 'sec1', type: 'text', order: 0, title: 'About' }],
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    });

    const res = parseResponse(await handler(makeEvent()));

    expect(res.status).toBe(200);
    expect(res.body.hero.firstName).toBe('Mantas');
    expect(res.body.sections).toHaveLength(1);
    expect(res.body.sections[0].title).toBe('About');
  });

  it('returns empty defaults when DynamoDB item is missing', async () => {
    mockDdbSend.mockResolvedValue({ Item: undefined });

    const res = parseResponse(await handler(makeEvent()));

    expect(res.status).toBe(200);
    expect(res.body.hero).toEqual({});
    expect(res.body.sections).toEqual([]);
  });

  it('includes editor info based on header', async () => {
    mockDdbSend.mockResolvedValue({ Item: {} });

    const editorRes = parseResponse(await handler(makeEvent({ isEditor: true })));
    const visitorRes = parseResponse(await handler(makeEvent({ isEditor: false })));

    expect(editorRes.body.editor.allowed).toBe(true);
    expect(visitorRes.body.editor.allowed).toBe(false);
  });
});

// ── PUT /content ──────────────────────────────────────────────────

describe('PUT /content', () => {
  it('returns 403 when request is not from an editor', async () => {
    const res = parseResponse(
      await handler(makeEvent({ method: 'PUT', path: '/api/content', isEditor: false }))
    );

    expect(res.status).toBe(403);
    expect(mockDdbSend).not.toHaveBeenCalled();
  });

  it('saves hero and sections to DynamoDB', async () => {
    mockDdbSend.mockResolvedValue({});

    const payload = {
      hero: { firstName: 'Mantas' },
      sections: [{ id: 's1', type: 'timeline', order: 0 }],
    };

    const res = parseResponse(
      await handler(makeEvent({ method: 'PUT', path: '/api/content', body: payload, isEditor: true }))
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const putCall = mockDdbSend.mock.calls[0][0];
    expect(putCall.Item.hero.firstName).toBe('Mantas');
    expect(putCall.Item.sections).toHaveLength(1);
    expect(putCall.Item.sections[0].type).toBe('timeline');
  });
});

// ── GET /settings ─────────────────────────────────────────────────

describe('GET /settings', () => {
  it('returns stored settings merged with defaults', async () => {
    mockDdbSend.mockResolvedValue({
      Item: { settings: { theme: 'dark-1', multilanguage: true } },
    });

    const res = parseResponse(
      await handler(makeEvent({ path: '/api/settings' }))
    );

    expect(res.status).toBe(200);
    expect(res.body.theme).toBe('dark-1');
    expect(res.body.multilanguage).toBe(true);
    // defaults still present for keys not overridden
    expect(res.body.primaryColor).toBe('#2563eb');
  });

  it('returns defaults when no settings row exists', async () => {
    mockDdbSend.mockResolvedValue({ Item: undefined });

    const res = parseResponse(
      await handler(makeEvent({ path: '/api/settings' }))
    );

    expect(res.status).toBe(200);
    expect(res.body.theme).toBe('modern-1');
    expect(res.body.defaultLanguage).toBe('en');
  });
});

// ── PUT /settings ─────────────────────────────────────────────────

describe('PUT /settings', () => {
  it('returns 403 when request is not from an editor', async () => {
    const res = parseResponse(
      await handler(makeEvent({ method: 'PUT', path: '/api/settings', isEditor: false }))
    );

    expect(res.status).toBe(403);
    expect(mockDdbSend).not.toHaveBeenCalled();
  });

  it('saves settings to DynamoDB under SETTINGS / MAIN key', async () => {
    mockDdbSend.mockResolvedValue({});

    const settings = { theme: 'dark-1', primaryColor: '#ff0000', multilanguage: true };

    const res = parseResponse(
      await handler(
        makeEvent({ method: 'PUT', path: '/api/settings', body: settings, isEditor: true })
      )
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const putCall = mockDdbSend.mock.calls[0][0];
    expect(putCall.Item.pk).toBe('SETTINGS');
    expect(putCall.Item.sk).toBe('MAIN');
    expect(putCall.Item.settings.theme).toBe('dark-1');
    expect(putCall.Item.settings.multilanguage).toBe(true);
  });
});

// ── POST /upload ──────────────────────────────────────────────────

describe('POST /upload', () => {
  it('returns 403 when request is not from an editor', async () => {
    const res = parseResponse(
      await handler(makeEvent({ method: 'POST', path: '/api/upload', isEditor: false }))
    );

    expect(res.status).toBe(403);
  });

  it('returns 400 when fileName is missing', async () => {
    const res = parseResponse(
      await handler(
        makeEvent({ method: 'POST', path: '/api/upload', body: { contentType: 'image/png' }, isEditor: true })
      )
    );

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/fileName/);
  });

  it('returns uploadUrl and publicUrl on success', async () => {
    mockGetSignedUrl.mockResolvedValue('https://s3.example.com/presigned-url');

    const res = parseResponse(
      await handler(
        makeEvent({
          method: 'POST',
          path: '/api/upload',
          body: { fileName: 'photo.jpg', contentType: 'image/jpeg' },
          isEditor: true,
        })
      )
    );

    expect(res.status).toBe(200);
    expect(res.body.uploadUrl).toBe('https://s3.example.com/presigned-url');
    expect(res.body.publicUrl).toMatch(/^\/uploads\/.+-photo\.jpg$/);
    expect(res.body.key).toMatch(/^uploads\/.+-photo\.jpg$/);
  });

  it('sanitizes special characters in the file name', async () => {
    mockGetSignedUrl.mockResolvedValue('https://s3.example.com/presigned-url');

    const res = parseResponse(
      await handler(
        makeEvent({
          method: 'POST',
          path: '/api/upload',
          body: { fileName: 'my file (1).jpg', contentType: 'image/jpeg' },
          isEditor: true,
        })
      )
    );

    expect(res.status).toBe(200);
    expect(res.body.key).not.toMatch(/[ ()]/);
  });
});

// ── GET /github-contributions ──────────────────────────────────────

describe('GET /github-contributions', () => {
  it('returns 503 when GITHUB_TOKEN_PARAM env var is not set', async () => {
    const res = parseResponse(
      await handler(makeEvent({ path: '/api/github-contributions' }))
    );

    expect(res.status).toBe(503);
  });
});

// ── POST /contact ──────────────────────────────────────────────────

describe('POST /contact', () => {
  const validBody = {
    firstName: 'Jane',
    lastName: 'Doe',
    message: 'Hello there!',
    _t: Date.now() - 5000, // 5 seconds ago — passes timing check
  };

  it('returns 400 when required fields are missing', async () => {
    const res = parseResponse(
      await handler(makeEvent({
        method: 'POST',
        path: '/api/contact',
        body: { firstName: 'Jane', _t: Date.now() - 5000 },
      }))
    );

    expect(res.status).toBe(400);
  });

  it('silently succeeds (200) when honeypot field is filled', async () => {
    const res = parseResponse(
      await handler(makeEvent({
        method: 'POST',
        path: '/api/contact',
        body: { ...validBody, website: 'http://spam.com' },
      }))
    );

    expect(res.status).toBe(200);
    expect(mockSnsSend).not.toHaveBeenCalled();
  });

  it('silently succeeds (200) when form submitted too fast', async () => {
    const res = parseResponse(
      await handler(makeEvent({
        method: 'POST',
        path: '/api/contact',
        body: { ...validBody, _t: Date.now() - 500 }, // only 0.5s ago
      }))
    );

    expect(res.status).toBe(200);
    expect(mockSnsSend).not.toHaveBeenCalled();
  });

  it('returns 503 when CONTACT_TOPIC_ARN is not set', async () => {
    const res = parseResponse(
      await handler(makeEvent({
        method: 'POST',
        path: '/api/contact',
        body: validBody,
      }))
    );

    expect(res.status).toBe(503);
  });
});

// ── Unknown route ─────────────────────────────────────────────────

describe('unknown route', () => {
  it('returns 404', async () => {
    const res = parseResponse(
      await handler(makeEvent({ method: 'GET', path: '/api/unknown' }))
    );

    expect(res.status).toBe(404);
  });
});
