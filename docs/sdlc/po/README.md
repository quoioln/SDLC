# PO (Product Owner)

**One folder per epic/feature.** Do not put all epics in one file.

- Create a folder per epic: `docs/sdlc/po/{epic-slug}/`
- Folder name = epic/feature slug (e.g. `job-scheduler-event-bus`, `user-auth`).
- Inside that folder: `epic-brief.md`, `user-stories.md`, `prd.md` (or similar) for that epic only.

## Detailed tasks

- [ ] **Feasibility study**: Assess technical feasibility (can we build it?), operational feasibility (can we run it?), economic feasibility (is the ROI worth it?). Document go/no-go recommendation
- [ ] **Clarify vision**: Capture business problem, goals, success metrics
- [ ] **Define scope**: Boundaries, in/out of scope, MVP vs later
- [ ] **Write epic brief**: Problem, success metrics, high-level approach, project type
- [ ] **Break into user stories**: As a [role], I want [goal] so that [benefit]; acceptance criteria per story
- [ ] **Prioritize**: Must / Should / Could have; order by value and risk
- [ ] **Identify dependencies**: External teams, systems, blockers
- [ ] **Call out risks**: Technical, schedule, compliance
- [ ] **Feasibility assessment**: Evaluate technical feasibility, resource availability, timeline viability, and budget constraints. Flag blockers early. Document go/no-go recommendation
- [ ] **Measurable success metrics**: Each metric has baseline + target + timeframe and traces to a business KPI / North Star
- [ ] **Prioritization framework**: Apply RICE or WSJF (not only MoSCoW); order by value vs effort vs risk
- [ ] **MVP & non-goals**: Define the smallest releasable slice; state explicit non-goals / out-of-scope
- [ ] **Definition of Ready (INVEST)**: Stories are Independent, Negotiable, Valuable, Estimable, Small, Testable before handoff; AC must be verifiable
- [ ] **Riskiest assumptions**: Identify the riskiest assumption per epic and how to validate (de-risk) it
- [ ] **Compliance & privacy at intake**: Classify data; flag GDPR / PCI / HIPAA / SOC2 obligations early
- [ ] **Rollout & post-launch measurement**: Release strategy + the analytics events/instrumentation needed to measure success metrics
- [ ] **Handoff to Business BA**: Deliverables in `po/{epic-slug}/`

Use epic-brief.template.md as starting point for each epic.
