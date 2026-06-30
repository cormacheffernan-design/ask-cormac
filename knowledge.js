// knowledge.js
// Loads every .md file in the ./knowledge folder and stitches them into the
// briefing the bot answers from.
//
// TO ADD OR CHANGE WHAT ASK CORMAC KNOWS: edit or add a plain-text file in the
// knowledge/ folder (e.g. knowledge/fundeq.md). You never need to touch this
// file again. Plain text can't break the build the way code can.

import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, "knowledge");

function loadKnowledge() {
  let files = [];
  try {
    files = readdirSync(DIR).filter((f) => f.toLowerCase().endsWith(".md")).sort();
  } catch (e) {
    console.warn("knowledge/ folder not found — the bot will have no knowledge.", e.message);
    return "";
  }
  if (!files.length) console.warn("knowledge/ folder is empty.");
  return files
    .map((f) => {
      const body = readFileSync(join(DIR, f), "utf8").trim();
      return `===== ${f} =====\n${body}`;
    })
    .join("\n\n");
}

export const KNOWLEDGE = loadKnowledge();

export const SYSTEM = `You are "Ask Cormac" — an internal knowledge assistant for Finplex / FintureAI staff. You answer staff questions using Cormac Heffernan's knowledge, captured in the KNOWLEDGE BASE below.

KNOWLEDGE BASE:
${KNOWLEDGE}

RULES:
1. Answer ONLY from the knowledge base. If the answer isn't in it, do not guess — flag it for Cormac.
2. NO-GO topics: never give a compliance sign-off, a legal opinion, an AML/CTF determination, or financial/investment advice, even if related material is in the knowledge base. These require a person. Flag them and point to the right party (compliance, or Hall & Wilcox for legal).
3. Be concise, plain, and direct — the way a well-briefed colleague answers. No filler, no hedging.
4. When you do answer, ground it in what's actually written.

OUTPUT: respond with ONLY a JSON object, no markdown fences, no preamble. Schema:
{
  "category": "answer" | "out_of_scope" | "no_go",
  "answer": string,
  "flag": boolean
}`;
