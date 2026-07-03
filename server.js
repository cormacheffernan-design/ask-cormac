// server.js — Ask Cormac backend
import "dotenv/config";
import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM } from "./knowledge.js";
import { appendEntry, listEntries, updateEntry } from "./storage.js";
import feedbackRouter from "./feedback.js";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(cors()); // tighten to your App Service origin in production
app.use(feedbackRouter); // corrections: POST /api/feedback, GET /api/feedback, PATCH /api/feedback/:id, GET /api/feedback/export

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.MODEL || "claude-sonnet-4-6";
const ADMIN_USERS = (process.env.ADMIN_USERS || "")
  .toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);

// ── Identity comes free from Azure App Service "Easy Auth" (Entra ID). ──
// Once authentication is enabled on the App Service, the platform injects the
// signed-in user's email. No auth code needed here — only tenant users get in.
const getUser = (req) =>
  (req.header("X-MS-CLIENT-PRINCIPAL-NAME") || "anonymous").toLowerCase();
const isAdmin = (req) => ADMIN_USERS.includes(getUser(req));
const requireAdmin = (req, res, next) =>
  isAdmin(req) ? next() : res.status(403).json({ error: "Admins only" });

app.get("/api/health", (_req, res) => res.json({ ok: true, model: MODEL }));

// ── Staff ask here. Every exchange is logged centrally. ──
app.post("/ask", async (req, res) => {
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : null;
  if (!messages?.length) return res.status(400).json({ error: "messages required" });

  const user = getUser(req);
  const q = messages[messages.length - 1]?.content || "";

  try {
    const r = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: SYSTEM,
      messages: messages.map((m) => ({ role: m.role, content: String(m.content || "") })),
    });

    const raw = (r.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      parsed = { category: "answer", answer: raw, flag: false };
    }

    const out = {
      category: parsed.category || "answer",
      answer: parsed.answer || "",
      flag: !!parsed.flag,
    };

    // log, but never let a logging hiccup break the staff member's answer
    appendEntry({ user, q, a: out.answer, category: out.category, flag: out.flag })
      .catch((e) => console.error("log append failed:", e.message));

    res.json(out);
  } catch (e) {
    console.error("ask failed:", e.message);
    res.status(502).json({ error: "knowledge service unavailable" });
  }
});

// ── Review API (admins only): read, rate/correct, export the log. ──
app.get("/api/log", requireAdmin, async (req, res) => {
  const filter = ["all", "flagged", "rated"].includes(req.query.filter) ? req.query.filter : "all";
  const limit = Math.min(parseInt(req.query.limit, 10) || 500, 5000);
  res.json(await listEntries({ filter, limit }));
});

app.patch("/api/log/:id", requireAdmin, async (req, res) => {
  const { rating, note } = req.body || {};
  if (rating !== undefined && ![null, "", "good", "needs"].includes(rating))
    return res.status(400).json({ error: "bad rating" });
  const ok = await updateEntry(req.params.id, { rating, note });
  res.status(ok ? 200 : 404).json({ ok });
});

app.get("/api/log/export", requireAdmin, async (_req, res) => {
  const entries = await listEntries({ filter: "all", limit: 100000 });
  res.setHeader("Content-Type", "application/json");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="ask-cormac-log-${new Date().toISOString().slice(0, 10)}.json"`
  );
  res.send(JSON.stringify(entries, null, 2));
});

// serve the built front end if you co-host it (optional)
app.use(express.static("public"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Ask Cormac backend on :${port} · model ${MODEL}`));
