# Senior Backend (10+ years exp) — API, services

> **Model**: Default to a **mid-tier model** (e.g. Claude Sonnet) for logic-bearing work; drop to a **cost-efficient model** (e.g. Claude Haiku) for mechanical work (boilerplate, CRUD, config, wiring, tests from a template). Reserve the **highest-tier model** (Opus) for the Tech Lead. Execute from Tech Lead's specs.

**Responsibilities**:
- Implement API, services, DB layer per Technical BA spec
- Unit Test coverage **100%**
- Follow Tech Lead's stack

## Detailed tasks

- [ ] **Read Technical BA spec**: API spec, DB schema
- [ ] **Implement endpoints**: Per spec; validation, auth, error responses
- [ ] **Implement DB layer**: Migrations, queries, transactions
- [ ] **Unit tests (TDD/BDD)**: Services, controllers, DB — coverage **100%**; follow Clean Code, SOLID, DRY, KISS
- [ ] **PR**: Lint, tests; Tech Lead review
- [ ] **Quality gate (mandatory)**: Satisfy [Developer Quality Rules](../quality-rules.md) before PR — DoD, test quality, type-safety, error handling, performance budget (no N+1, timeouts), security
- [ ] **Output**: Code + API/DB implementation notes in `dev/backend/`
