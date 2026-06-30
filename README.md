# Ask Cormac — backend

The server behind the Ask Cormac Teams page. It holds the Anthropic key, the
knowledge base, the system prompt, and the **central Q&A log** that every staff
question is written to so you can review and refine.

## What it does

| Route | Who | Purpose |
|---|---|---|
| `POST /ask` | any signed-in staff | Answers from the knowledge base, logs the exchange |
| `GET /api/log?filter=all\|flagged\|rated` | admins | Read the central log |
| `PATCH /api/log/:id` | admins | Save a rating (`good`/`needs`) or a correction note |
| `GET /api/log/export` | admins | Download the whole log as JSON |
| `GET /api/health` | — | Liveness |

The log is the same shape as the prototype's: `id, user, q, a, category, flag, at, rating, note`.
The difference is it's now **central** — one record of every staff member's questions,
keyed to who asked, instead of living in separate browsers.

## Files

- `server.js` — the API
- `knowledge.js` — knowledge base + system prompt (the **only** place to edit answers/behaviour)
- `storage.js` — Azure Table Storage wrapper for the log
- `.env.example` — config

## Local run

```bash
npm install
npm install @anthropic-ai/sdk@latest   # pin to current; see https://docs.claude.com
cp .env.example .env                    # fill in the values
npm start
```

## Deploy to Azure

1. **Provision** (one resource group):
   - **Storage account** → it gives you the `AZURE_STORAGE_CONNECTION_STRING`. The
     `AskCormacLog` table is created automatically on first run.
   - **App Service** (Linux, Node 20 LTS).

2. **App settings** (App Service → Configuration). Same keys as `.env`:
   `ANTHROPIC_API_KEY`, `MODEL`, `AZURE_STORAGE_CONNECTION_STRING`, `ADMIN_USERS`.

3. **Lock it to your staff** — App Service → **Authentication** → add identity
   provider **Microsoft (Entra ID)**, restrict to your tenant, require auth on all
   requests. This is what gates the app to staff *and* gives `/ask` the signed-in
   user's email for the log — no auth code needed in the app.

4. **Deploy the code** — zip deploy or a GitHub Action to the App Service.

5. **Surface in Teams** — package the front end as a **Teams personal app (tab)**
   in the Developer Portal, pointing at the App Service URL. Staff click
   "Ask Cormac" in the Teams rail and get the page; they sign in once via Entra.

## Production hardening (later, not blockers)

- Put `ANTHROPIC_API_KEY` in **Key Vault** and reference it from App Settings.
- Use a **managed identity** for Table Storage instead of a connection string.
- Tighten `cors()` to your App Service origin.
- The knowledge currently loads whole-prompt. When the corpus outgrows that,
  add retrieval (RAG) at the marked seam in `knowledge.js`.

## Front end

The prototype page calls Anthropic directly (fine for testing in Claude). The
production page makes the same UI call **`POST /ask` on this backend** instead,
and the review screen reads `GET /api/log` / `PATCH /api/log/:id` /
`GET /api/log/export`. The knowledge no longer ships in the front end — it lives
here. (Ask Claude to produce the production front-end variant wired to these routes.)
