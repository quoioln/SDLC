# Architect

ADRs, system diagrams, tech stack decisions.
Use adr.template.md for new ADRs.

## Detailed tasks

- [ ] **Read Business BA outputs**: Functional requirements, process flows, use cases
- [ ] **Read Design (if app/web)**: design-spec.md in `design/{epic-slug}/` — design informs architecture
- [ ] **Context diagram**: System boundary, external actors, integrations
- [ ] **Container diagram**: Main components/services and their responsibilities
- [ ] **Tech stack decisions**: Languages, frameworks, databases; document in ADRs
- [ ] **ADR per decision**: Context, decision, consequences (scope: backend, frontend, mobile, etc.)
- [ ] **Non-functional alignment**: Performance, security, scalability, compliance — reference NFRs from Business BA
- [ ] **Security by design (Shift Left)**: Threat model (STRIDE/attack surface), auth/authz architecture, data encryption at rest/transit, secrets management approach, dependency security policy. Document in ADR
- [ ] **Engineering principles alignment**: Verify architecture follows — SOLID, DRY, KISS, SoC, LoD, CoI, GRASP, High Availability, CQRS (if applicable), Zero Trust, EDA (if applicable), Statelessness, Disposability, Backing Services, Config (externalize), Database Sharding/Partitioning (if applicable), Codebase (single per service), Logging & Tracing, Monitoring & Alerting
- [ ] **ADR alternatives & trade-offs**: Each ADR records the options considered and rejected, with trade-offs — not just the chosen decision
- [ ] **C4 completeness**: Add a Component view for complex services + a Deployment diagram (beyond context/container)
- [ ] **Quality-attribute scenarios / fitness functions**: Make each NFR architecturally verifiable (stimulus → response → measure)
- [ ] **Capacity & scalability plan**: Expected load, scaling strategy (horizontal/vertical), identified bottlenecks
- [ ] **Failure modes & resilience**: Failure domains, fallback/degradation, disaster recovery with RTO/RPO targets
- [ ] **Data architecture**: Data flow, ownership, consistency model, storage choices
- [ ] **Observability architecture**: Concrete logging/metrics/tracing strategy as a deliverable
- [ ] **Cost & lock-in**: FinOps cost considerations and build-vs-buy / vendor lock-in noted in ADRs
- [ ] **Handoff to Technical BA**: Architecture docs, ADRs in `architecture/`
