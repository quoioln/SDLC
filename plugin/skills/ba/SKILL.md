---
name: ba
description: Run the Business BA phase: functional + non-functional requirements, Gherkin acceptance criteria, process flows, traceability.
---

# /sdlc-workflow:ba — Business BA

Act as **Business BA** for the target epic/feature (ask which epic if it is unclear).

- **Read:** the PO outputs in docs/sdlc/po/{epic-slug}/
- **Do:** Follow docs/sdlc/ba/business/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/ba/business/{epic-slug}/

First run the Analysis lenses in ba/business/README.md (Event Storming, decision tables, state machines, CRUD/authority matrix, edge-case taxonomy, data-flow + classification). For the epic's domain(s), turn each applicable row of docs/sdlc/domain-packs.md into FR/NFR + Gherkin AC + a compliance-matrix entry (regulation <-> requirement ID <-> test ID).

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
