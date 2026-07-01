// feedback.js — user-submitted corrections for "Ask Clonemac"
//
// When someone hits "I don't agree" / "out of date" in the chat, the front-end
// POSTs their proposed correct answer here. Corrections persist and are read
// back into the existing Review-log view (the front-end merges GET /api/feedback
// into the log), so you see them where you already review everything.
//
// Wire-up (server.js): add ONE line after your express app is created:
//     app.use(require('./feedback'));
//
// Env (Azure App Service > Configuration > Application settings), all optional:
//   FEEDBACK_DIR         = /home/data              (default; /home persists on App Service)
//   FEEDBACK_ADMINS      = you@fundeq.com.au,...   (who may READ corrections; matched to the
//                                                   signed-in user via App Service auth. If unset,
//                                                   reads are allowed - fine for an internal app.)
//   FEEDBACK_ADMIN_TOKEN = <secret>                (alternative: ?token=<secret> to read/export)

const fs = require('fs');
const path = require('path');
const express = require('express');

const DATA_DIR =
  process.env.FEEDBACK_DIR ||
  (fs.existsSync('/home') ? '/home/data' : path.join(__dirname, 'data'));
const LOG_PATH = path.join(DATA_DIR, 'feedback.jsonl');
const ADMINS = (process.env.FEEDBACK_ADMINS || '')
  .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
const ADMIN_TOKEN = process.env.FEEDBACK_ADMIN_TOKEN || '';

fs.mkdirSync(DATA_DIR, { recursive: true });

// Azure App Service Authentication (EasyAuth) injects the signed-in user here.
function principal(req) {
  return String(req.headers['x-ms-client-principal-name'] || '').toLowerCase();
}
function isAdmin(req) {
  if (ADMIN_TOKEN && req.query.token === ADMIN_TOKEN) return true;
  if (!ADMINS.length) return true; // no allowlist configured -> internal app, allow reads
  return ADMINS.includes(principal(req));
}
function readAll() {
  let raw = '';
  try { raw = fs.readFileSync(LOG_PATH, 'utf8'); } catch { raw = ''; }
  return raw.trim()
    ? raw.trim().split('\n').map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean)
    : [];
}
function writeAll(rows) {
  fs.writeFileSync(LOG_PATH, rows.map((r) => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : ''), 'utf8');
}

const router = express.Router();
router.use(express.json({ limit: '64kb' }));

// Any staff member can submit a correction.
router.post('/api/feedback', (req, res) => {
  const { kind, question, answer, correction } = req.body || {};
  if (!correction || !String(correction).trim()) {
    return res.status(400).json({ ok: false, error: 'correction required' });
  }
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    at: new Date().toISOString(),
    user: principal(req) || 'unknown',
    kind: kind === 'out_of_date' ? 'out_of_date' : 'disagree',
    question: String(question || '').slice(0, 4000),
    answer: String(answer || '').slice(0, 8000),
    correction: String(correction).slice(0, 8000),
    status: 'open'
  };
  try {
    fs.appendFileSync(LOG_PATH, JSON.stringify(entry) + '\n', 'utf8');
    res.json({ ok: true, id: entry.id });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'could not save' });
  }
});

// Read corrections (newest first). 403 for non-admins, like /api/log.
router.get('/api/feedback', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ ok: false });
  const limit = Math.min(parseInt(req.query.limit, 10) || 500, 2000);
  res.json(readAll().reverse().slice(0, limit));
});

// Mark a correction resolved / reopen it.
router.patch('/api/feedback/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ ok: false });
  const rows = readAll();
  const i = rows.findIndex((r) => r.id === req.params.id);
  if (i < 0) return res.status(404).json({ ok: false });
  if (typeof (req.body || {}).status === 'string') rows[i].status = req.body.status;
  writeAll(rows);
  res.json({ ok: true });
});

// Download all corrections as JSON.
router.get('/api/feedback/export', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ ok: false });
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="corrections.json"');
  res.send(JSON.stringify(readAll().reverse(), null, 2));
});

module.exports = router;
