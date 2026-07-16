# Features — review hub (one card per feature/task)

Every feature/task gets **one card**: `features/{epic-slug}.md`, created **at intake** from `feature-card.template.md` — before any other artifact. The card links everything the pipeline produced for that feature (PRD, requirements, design, ADRs, API spec, code notes, tests + evidence, audit, deploy, guideline) plus per-phase status, so a reviewer can follow the whole story from one file.

## Rules

- **Create at intake.** The moment a feature/task is accepted (PO phase or task start), copy the template to `features/{epic-slug}.md` and fill the header (slug, complexity tier, QE depth, mode/profile).
- **Every phase updates its own row** when it completes — status ✅ + artifact links + a one-line note. **A handoff is not complete until the card row is updated.**
- **Skipped phases are recorded too** — ⏭ + the reason (`disabled in sdlc-config` / `dynamic: Trivial tier` / `non-UI project`). The card shows the *whole* story, including what deliberately didn't run.
- **Keep it an index, not a document.** One line per artifact; details live in the linked docs. If you're writing paragraphs on the card, the content belongs in a phase artifact instead.
- **Key decisions** get one line each with a link to the ADR/doc that holds the rationale.
- **Sign-offs land on the card** (QE 0-bugs, Security/PE 0 Critical/High, UAT) — the card is where "done" is visible.

## Review flow

Start at the card → scan the Pipeline trace table for status + skipped reasons → open only the artifacts you need. For a shipped feature the card answers: what was asked (PO), what was decided (ADR), what changed (Dev), how it was proven (QE evidence), who signed off.
