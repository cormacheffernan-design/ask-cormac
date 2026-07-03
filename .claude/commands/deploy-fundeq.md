---
description: Pick up the latest FundEQ knowledge file from Google Drive and deploy it live
---

Deploy the latest FundEQ knowledge file, Google Drive to live, in one shot.

1. **Find the file.** Search my Google Drive for markdown files named `fundeq` (title contains `fundeq`, mimeType `text/markdown`). There are usually several with `(2)`, `(3)` suffixes — pick the **most recently modified** one. Tell me which file you're using (name + modified date) before writing.
2. **Write it in.** Download that file's contents and overwrite `knowledge/fundeq.md` in this repo with them.
3. **Check the writing rules.** The file must contain **no tilde character** and **not** the word "teaser". If either is present, stop and tell me — don't deploy. Show me the `git diff --stat`.
4. **Commit and deploy.** Commit with a plain, descriptive message (never put knowledge-base contents in the commit message). Push straight to `main` — you have standing permission to push to `main` for this task, and the push auto-deploys via `.github/workflows/main_ask-cormac.yml`. There is no build step; deploy is just the push.
5. **Confirm.** Watch the `main_ask-cormac.yml` Actions run in `cormacheffernan-design/ask-cormac` and tell me when it finishes (success or failure, with the run link).
6. **Hand back for the Claude Project.** Send me the final `knowledge/fundeq.md` so I can drag it into the **CMT -FundEQ** Claude Project knowledge myself. Do not try to automate the claude.ai UI — Project knowledge has no API and that step is manual.

Notes:
- If `$ARGUMENTS` names a specific file, use that instead of auto-picking the newest.
- If the designated feature branch is what I want instead of `main`, I'll say so — default is `main` because that's the deploy trigger.
