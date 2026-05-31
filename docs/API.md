# API & Data Model

## DynamoDB Data Model

**Table name:** `portfolio-content-{stage}` (e.g. `portfolio-content-dev`, `portfolio-content-prod`)

**Region:** `eu-central-1`

**Billing:** on-demand (`PAY_PER_REQUEST`)

**Keys:** composite primary key `pk` (partition) + `sk` (sort)

The table stores exactly **two items** per stage — no GSIs, no relational joins. All portfolio content is denormalised into JSON documents.

### Key design

| pk | sk | Record | Access pattern |
|---|---|---|---|
| `CONTENT` | `MAIN` | Hero + ordered sections array | `GetItem` / `PutItem` on every content read/write |
| `SETTINGS` | `MAIN` | Theme, colours, font, language flags | `GetItem` / `PutItem` on every settings read/write |

### CONTENT record schema

```json
{
  "pk": "CONTENT",
  "sk": "MAIN",
  "hero": {
    "firstName": "string",
    "lastName": "string",
    "occupation_en": "string",
    "occupation_de": "string",
    "summary_en": "string",
    "summary_de": "string",
    "profile_image": "string",
    "profile_image_position": "string",
    "profile_image_zoom": 1.0,
    "navLabel": "string",
    "navLabel_en": "string",
    "navLabel_de": "string",
    "secondaryBackground": false,
    "links": [{ "name": "string", "href": "string", "iconUrl": "string" }]
  },
  "sections": [
    {
      "id": "uuid",
      "type": "timeline | text | image | skills | insights | github | contact",
      "order": 0,
      "title": "string",
      "title_en": "string",
      "title_de": "string",
      "subtext": "string",
      "description": "string",
      "iconUrl": "string",
      "navLabel": "string",
      "data": {}
    }
  ],
  "updatedAt": "2026-05-31T12:00:00.000Z"
}
```

The `sections[].data` object is type-specific — see [Section data payloads](#section-data-payloads) below. Unknown section types are skipped at render time.

`editor` is **not stored** — it is computed at read time by Lambda from the `x-editor-allowed` header.

### SETTINGS record schema

```json
{
  "pk": "SETTINGS",
  "sk": "MAIN",
  "settings": {
    "theme": "modern-1",
    "primaryColor": "#2563eb",
    "secondaryColor": "#64748b",
    "textColor": "#111827",
    "fontFamily": "geist",
    "multilanguage": false,
    "defaultLanguage": "en"
  },
  "updatedAt": "2026-05-31T12:00:00.000Z"
}
```

`GET /api/settings` merges stored settings with Lambda defaults for any missing keys.

### S3 assets (not DynamoDB)

Uploaded images are **not** stored in DynamoDB — only URL strings (e.g. `/uploads/1717171717171-photo.jpg`) are saved in content JSON. Binary files live in the S3 assets bucket under `uploads/{timestamp}-{filename}`.

## API Reference

All routes are served under `/api/*` via CloudFront → API Gateway → Lambda. Paths below are relative to the site origin (e.g. `https://mantasec.dev/api/content`).

**Auth legend:** `Public` = no editor IP required. `Editor` = requires `x-editor-allowed: true` header set by CloudFront Function (see [Security](SECURITY.md)).

### Summary

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/content` | Public | Read hero + sections + editor status |
| `PUT` | `/api/content` | Editor | Save hero + sections |
| `GET` | `/api/settings` | Public | Read theme/settings (merged with defaults) |
| `PUT` | `/api/settings` | Editor | Save theme/settings |
| `POST` | `/api/upload` | Editor | Get presigned S3 upload URL |
| `GET` | `/api/github-contributions` | Public | GitHub contribution calendar (cached 1 h) |
| `POST` | `/api/contact` | Public | Submit contact form → SNS email |

---

### `GET /api/content`

**Auth:** Public

**Response `200`:**

```json
{
  "hero": { "firstName": "…", "lastName": "…", "links": [], "…": "…" },
  "sections": [{ "id": "…", "type": "timeline", "order": 0, "data": {}, "…": "…" }],
  "updatedAt": "2026-05-31T12:00:00.000Z",
  "editor": {
    "allowed": true,
    "viewerIp": "203.0.113.10"
  }
}
```

| Field | Notes |
|---|---|
| `editor.allowed` | `true` if viewer IP matches allowlist — controls Edit button in UI |
| `editor.viewerIp` | Client IP from CloudFront — useful for debugging allowlist |

---

### `PUT /api/content`

**Auth:** Editor

**Request body:**

```json
{
  "hero": { "firstName": "…", "lastName": "…", "links": [] },
  "sections": [{ "id": "…", "type": "text", "order": 0, "title": "…", "data": {} }]
}
```

Do not send `editor` — it is stripped client-side and ignored server-side.

**Response `200`:** `{ "success": true }`

**Response `403`:** `{ "error": "Forbidden" }`

---

### `GET /api/settings`

**Auth:** Public

**Response `200`:**

```json
{
  "theme": "modern-1",
  "primaryColor": "#2563eb",
  "secondaryColor": "#64748b",
  "textColor": "#111827",
  "fontFamily": "geist",
  "multilanguage": false,
  "defaultLanguage": "en"
}
```

Missing keys in DynamoDB are filled from Lambda defaults.

---

### `PUT /api/settings`

**Auth:** Editor

**Request body:** flat settings object (same shape as GET response)

**Response `200`:** `{ "success": true }`

**Response `403`:** `{ "error": "Forbidden" }`

---

### `POST /api/upload`

**Auth:** Editor

**Request body:**

```json
{
  "fileName": "photo.jpg",
  "contentType": "image/jpeg"
}
```

**Response `200`:**

```json
{
  "uploadUrl": "https://portfolio-assets-dev-….s3.eu-central-1.amazonaws.com/uploads/…?X-Amz-…",
  "key": "uploads/1717171717171-photo.jpg",
  "publicUrl": "/uploads/1717171717171-photo.jpg"
}
```

**Client flow:** `POST /api/upload` → `PUT uploadUrl` with file body → store `publicUrl` in content JSON.

| Field | Notes |
|---|---|
| `uploadUrl` | Presigned S3 PUT URL, expires in 5 minutes |
| `publicUrl` | Relative path served via CloudFront `/uploads/*` |

**Response `400`:** `{ "error": "fileName is required" }`

**Response `403`:** `{ "error": "Forbidden" }`

---

### `GET /api/github-contributions`

**Auth:** Public

**Response `200`:**

```json
{
  "username": "your-github-handle",
  "totalContributions": 1234,
  "weeks": [
    {
      "days": [
        { "date": "2025-05-26", "count": 3, "weekday": 1 }
      ]
    }
  ]
}
```

Cached in Lambda memory for 1 hour. GitHub PAT read from SSM at cache miss.

**Response `503`:** `{ "error": "GitHub integration not configured" }`

---

### `POST /api/contact`

**Auth:** Public (rate-limited)

**Request body:**

```json
{
  "organisation": "Acme Corp",
  "firstName": "Jane",
  "lastName": "Doe",
  "message": "Hello…",
  "website": "",
  "_t": 1717171717000
}
```

| Field | Required | Notes |
|---|---|---|
| `firstName` | Yes | Trimmed; empty → `400` |
| `lastName` | Yes | Trimmed; empty → `400` |
| `message` | Yes | Max 2000 chars |
| `organisation` | No | Included in email if present |
| `website` | — | Honeypot — must be empty; non-empty → silent `200`, no email |
| `_t` | — | Page mount timestamp — submissions within 3 s of page load → silent `200` |

**Response `200`:** `{ "success": true }`

**Response `400`:** `{ "error": "First name, last name, and message are required." }` or message length error

**Response `429`:** `{ "error": "Too many requests. Please wait before trying again." }` — max 1 success per IP per 10 minutes

**Response `503`:** `{ "error": "Contact form not configured." }`

---

### Error responses (all routes)

| Status | Body | When |
|---|---|---|
| `404` | `{ "error": "Not found" }` | Unknown path or method |
| `500` | `{ "error": "<message>" }` | Unhandled Lambda exception |

## Section data payloads

| Type | Editable `data` fields |
|---|---|
| `timeline` | Array of `{ date, title, description, iconUrl? }` items |
| `text` | Rich body via `description` fields (no separate data object) |
| `image` | `{ images: [{ url, caption?, alt? }] }` |
| `skills` | `{ categories: [{ name, skills: [{ name, level? }] }] }` |
| `insights` | `{ items: [{ header, description, details?: [{ header, description }] }] }` |
| `github` | `{ showGraph: boolean }` — heatmap on/off |
| `contact` | No editable data — form fields are fixed |

All sections share common fields: `title`, `subtext`, `description`, `iconUrl`, `navLabel` (each with optional `_en` / `_de` variants), plus `type`, `id`, and `order`.
