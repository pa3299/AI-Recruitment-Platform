# Backend (Express + TypeScript)

## Setup

1. Copy `.env.example` to `.env.local` and fill values

```bash
cp server/.env.example server/.env.local
```

2. Install dependencies at repo root

```bash
npm install
```

3. Start backend in development

```bash
npm run server:dev
```

The server listens on PORT (default 8080) and exposes:

- `GET /health`
- `POST /api/ai/text` { userQuery, systemPrompt, useSearch? }
- `POST /api/ai/multimodal` { userQuery, systemPrompt, files: [{ base64, mimeType }] }
- `POST /api/ai/structured` { userQuery, systemPrompt, responseSchema }
- `POST /api/company/generate-field` { field: 'culture'|'orgStructure'|'guidelines', companyName }
- `POST /api/compensation/calculate` { jobTitle, experience, location, industry, companyName }
- `POST /api/candidates/match` { jobDescription, candidates: [{ id, anonymizedResult }] }

## Build

```bash
npm run server:build
npm run server:start
```

## Notes
- AI endpoints require `API_KEY`.
- CORS origin is configurable via `CORS_ORIGIN` (comma-separated allowed origins or `*`).
