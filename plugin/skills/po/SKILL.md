---
name: po
description: Run the Product Owner phase: PRD, user stories, feasibility, measurable success metrics for an epic.
---

# /sdlc-workflow:po — Product Owner

**On start, print this status banner verbatim** so the user can see the active role and the suggested model (the workflow does NOT switch models for you — verify/switch the model yourself with `/model`, or spawn a sub-agent on the suggested tier):

> 🎭 Role: [PO] Product Owner · 📂 Output: docs/sdlc/po/{epic-slug}/ · 🧠 Suggested model: Opus — analysis & planning — check/switch with `/model`

Then act as **Product Owner** for the target epic/feature (ask which epic if it is unclear).

- **Read:** the idea / feature request
- **Do:** Follow docs/sdlc/po/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/po/{epic-slug}/
- **Role badge:** tag every artifact this phase produces with `[PO]` (per the workflow's mandatory role-badge rule).

First run the Analysis lenses in po/README.md (Jobs-to-be-Done, 5 Whys, Impact Mapping, Opportunity-Solution Tree, assumption mapping, Kano, RICE/WSJF) — methods first, then write. Classify the domain and pull obligations from docs/sdlc/domain-packs.md into intake (compliance + must-have requirements + domain risks).

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
