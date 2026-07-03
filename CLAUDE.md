# Ask Cormac (Clonemac) — project guide for Claude Code

## What this is
Internal staff knowledge bot for Finplex / FundEQ / FintureAI. Node/Express backend
(server.js) answers staff questions from the knowledge base via the Anthropic API,
logs every exchange to Azure Table Storage, and exposes an admin review API plus a
corrections (feedback) API. Front end lives in public/index.html. Auth is handled
by Azure App Service Easy Auth (Microsoft Entra ID) — no auth code in the app.

## Deployment — do not overthink this
Every push to `main` auto-deploys to the Azure Web App `ask-cormac` via
.github/workflows/main_ask-cormac.yml. There is no build step. To deploy anything,
commit and push to main. That is the entire pipeline.

## The most common task: updating knowledge
The bot's knowledge is every `.md` file in the `knowledge/` folder. knowledge.js
stitches them all into the system prompt automatically at startup — no code changes
needed to add, edit, or remove knowledge files.

Workflow for "add/update knowledge and deploy":
1. Create or edit the `.md` file in `knowledge/`.
2. Commit with a plain message describing the change.
3. Push to main. Done — live in about two minutes.

## Writing rules for knowledge files and any documents produced here
- Never use the tilde character anywhere. Write "approximately", "around", or the number.
- Never use the word "teaser".
- Continuous prose preferred; Cormac uses a voice interface.
- Knowledge files answer in Cormac's voice: first person, direct, minimal, candid
  (internal audience). Where something isn't settled, say so and name the owner.
- Respect the operating rules at the top of knowledge/fundeq.md (returns discipline,
  cash-figure discipline, redemption language, no ESG content, roster exclusions).
  Read that section before writing anything fund-related.

## Guardrails
- Never commit secrets. API keys and connection strings live only in Azure App
  Service application settings (see env.example for the key names).
- Don't restructure server.js, storage.js, or feedback.js without being asked —
  small, surgical changes only.
- The knowledge base may contain commercially sensitive internal material. Never
  copy its contents into commit messages, PR descriptions, or issue text.

## Useful references
- Admin log API: GET /api/log, PATCH /api/log/:id, GET /api/log/export (Entra-gated,
  ADMIN_USERS app setting).
- Corrections API: POST/GET/PATCH /api/feedback, GET /api/feedback/export
  (FEEDBACK_ADMINS app setting gates reads).
- Health check: GET /api/health.
