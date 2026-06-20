# Developer Quality Rules

Mandatory quality bar for **all implementation roles**. Tech Lead enforces at review; every Senior role must satisfy this **before opening a PR**. Applies **on top of** the existing baseline (100% branch coverage, TDD/BDD, Clean Code, SOLID, DRY, KISS, SoC, security shift-left).

> **Stack-specific rules** (Java, Spring Boot, Kafka, TypeScript, NestJS, Next.js, …) live in `tech/` — generate them with `npx sdlc-workflow tech <stack...>`. The general bar here always holds; stack files add language/framework rules on top.

## 1. Definition of Done (gate before PR)
- [ ] Tests pass locally; **100% branch** coverage (not just line).
- [ ] Lint + formatter + type-check: **0 warnings** (CI treats warnings as errors).
- [ ] No `TODO`/`FIXME`, dead code, commented-out blocks, or debug `console.log`/prints left.
- [ ] Public API / technical-decision changes reflected in docs or an ADR.
- [ ] Author has self-reviewed the diff before requesting review.

## 2. Test quality (beyond the % number)
- Coverage ≠ quality: **≥ 3 negative/edge cases per happy path**; every assertion checks real behavior (no empty asserts).
- **AAA** (Arrange-Act-Assert); one reason to fail per test; test names describe behavior.
- **Zero flaky**: no dependence on wall-clock, run order, or network; mock external I/O.
- (Recommended) **mutation testing** on core-logic modules to catch fake tests.

## 3. Type safety & static analysis
- **Strict mode** maxed out (TS `strict`, mypy `--strict`, etc.). **No `any`/`@ts-ignore`** without an inline justification + issue ID.
- SAST (Semgrep/SonarQube) in CI; **block on any High finding**.

## 4. Error handling, logging & observability (shift-left, at code time)

### Error handling
- **No swallowed errors** (empty `catch {}`); log with context or re-throw meaningfully — never lose the original cause.
- **Classify errors**: expected/business (→ 4xx, no stack trace, WARN/INFO) vs unexpected (→ 5xx, full stack, ERROR); map both to a consistent error response (problem+json).
- Validate input **at the boundary** (API edge); fail fast with a clear message.
- Critical write operations must be **idempotent** where retries are possible.

### Logging — format & levels
- **Two output formats**: human-readable **text** for local/dev and **JSON** for staging/prod (machine-parseable for aggregation). Switch via config/env (e.g. `LOG_FORMAT=json|text`) — never edit call sites to change format.
- **Correct levels**: ERROR (actionable failure) · WARN (recoverable/degraded) · INFO (lifecycle + business events) · DEBUG (diagnostics, off in prod) · TRACE (verbose). Level configurable **per logger/package** at runtime.
- **One structured event per line**: a stable message + key/value fields; never string-interpolate data into the message (keeps logs queryable, low-cardinality).
- **Timestamps in UTC ISO-8601**; every line carries service name, environment, and version/commit.

### Context propagation (MDC / async-local storage)
- Every log line carries: **requestId**, **traceId**, **spanId**, **correlationId**, **userId** + **username** (when authenticated), **clientIp** (if relevant).
- Populate via MDC (Logback), AsyncLocalStorage (Node), or context vars — **set at request entry, cleared at exit**, surviving async boundaries.
- **Cross-service propagation**: forward **W3C Trace Context** (`traceparent`/`tracestate`) + correlationId on every outbound call — HTTP headers **and** message headers (Kafka/RabbitMQ). Inbound middleware reads them or generates new ones, stitching logs across microservices into one trace.

### Deep redaction — never log sensitive data
- **Deny-by-default**: redact passwords, tokens/secrets/API keys, `Authorization` headers, cookies, and PII (email, phone, national id, full card PAN, CVV, health/financial data).
- **Deep/recursive redaction** of nested objects and arrays — not just top-level keys; match by key-name patterns **and** typed annotations; mask fully (`***`) or partially (e.g. card last-4).
- Redact **in the logging layer** (a serializer/redactor) so a stray log call can't leak; also redact stack traces and request/response bodies.
- **Don't log full bodies** by default — allowlist safe fields; log ids/sizes instead. Align redaction with the data classification from BA and GDPR/PCI.
- **Prevent log injection**: strip/escape CR/LF in user-supplied values before logging.

### Request/response logging middleware (filter / interceptor)
- A single middleware logs **every request**: method, **templated route** (not raw path with ids — avoids cardinality blow-up), status code, **duration in ms**, requestId/traceId, userId, response size, outcome.
- Log **completion** at INFO (2xx/3xx), WARN (4xx), ERROR (5xx); include exception type + redacted message on failure; optional DEBUG line at start.
- **Skip or sample** health-check/noise endpoints. Emit a **latency metric + error counter** alongside the log (logs + metrics share the traceId).

### ORM / database logging (config, not ad-hoc)
- Configurable channels: **migration** (INFO — log applied versions), **DDL/schema** (INFO non-prod), **query** (DEBUG only, **off in prod**), **bound parameters** (DEBUG and **redacted** — never log PII params in prod), **slow query** (WARN above a threshold, e.g. 200–500ms), **errors** (ERROR with SQL + sanitized params).
- **Never enable full SQL/param logging in prod** (perf cost + PII leak) — rely on slow-query logs + metrics. See `tech/` stack files for concrete config.

### HTTP client / service-to-service logging
- Log every outbound call: target service, method, **sanitized URL** (no secrets/PII in query string), status, **duration**, retry count, propagated traceId.
- On failure, log status + **sanitized** response body; correlate with timeout/circuit-breaker state. **Redact** `Authorization`/cookie headers — never log full bearer tokens.

### Operability gates
- **No PII/secret in logs** is a release gate (scan or review).
- Logs ↔ traces ↔ metrics correlate by traceId; prefer **OpenTelemetry** as the unifying signal.
- Define **retention + sampling** (sample high-volume DEBUG; always keep ERROR).
- Write logs to **stdout** (12-factor); the platform ships/aggregates them — the app does not manage log files.

## 5. Performance budget (at code time — not only Phase 8)
- **No N+1 queries**; use batch/eager-load; every list query has **pagination + index**.
- All external I/O is **async/non-blocking** and has a **timeout**.
- Avoid premature optimization, but stay conscious of complexity (no O(n²) on large data).

## 6. Security (beyond OWASP baseline)
- **Least privilege** for tokens/DB/roles; **deny by default**.
- Output encoding against XSS; **parameterized queries** mandatory (never string-concat SQL).
- Secrets only via env/Vault/SSM; **secret-scan** (gitleaks) blocks at pre-commit + CI.

## 7. Git & PR hygiene
- **Conventional Commits**; atomic commits; **PR ≤ ~400 lines** of diff (split larger ones).
- Each PR maps to one user story / issue ID; do **not** mix refactor + feature in one PR.
- Branch protection: no merge while CI is red; squash to keep history clean.

## 8. Dependencies
- **Pin versions** (commit the lockfile); `npm/pip audit` blocks High/Critical.
- Don't add a dependency for something small you can write; remove unused deps.

## 9. Documentation
- Public functions/classes have a **docstring** (purpose, params, return, throws).
- README/setup runs from scratch; ADRs updated when technical direction changes.

## 10. Frontend / UI (if applicable)
- **WCAG 2.1 AA**; keyboard-navigable; semantic HTML.
- No hardcoded colors/spacing — use **design tokens**.
- Handle **loading / empty / error** states for every async UI.

## 11. Internationalization (i18n) & Localization (l10n) — if UI/text-facing
**When:** Any user-facing text (web, mobile, emails, CLI messages).
- [ ] **No hardcoded user-facing strings** — all text via an i18n catalog (keys, not literals); lint rule fails the build on literal UI text.
- [ ] **Externalize from day one** — even single-language projects route text through the i18n layer so adding locales later is non-breaking.
- [ ] **ICU MessageFormat** for plurals/gender/select; **never concatenate translated fragments** (word order differs per language).
- [ ] **Locale-aware formatting** — dates, numbers, currency, units via `Intl`/locale APIs, never manual formatting.
- [ ] **RTL support** — logical CSS properties (`margin-inline`, `text-align: start`), `dir` attribute; test Arabic/Hebrew.
- [ ] **Layout tolerates ~+30–40% text expansion** vs English; no fixed-width controls that clip translations.
- [ ] **UTF-8 everywhere**; correct `lang`/charset attributes; no text baked into images (provide translatable alt text).
- [ ] **Translation keys carry context** for translators; no reusing one key across different contexts.
- [ ] **Pseudolocalization** in QA to catch hardcoded strings and truncation before real locales are added.

## 12. Backend / API & data services (if applicable)

### A. API contract & compatibility
- [ ] **Version the API** (`/v1`); no breaking change without a version bump. Deprecations carry a `Sunset` header + timeline.
- [ ] **Consistent error schema** (RFC 7807 `application/problem+json`); **semantically correct HTTP status codes** (404 vs 403 vs 409 vs 422).
- [ ] **Mass-assignment protection**: bind via DTO/allowlist fields; never map a request body straight onto an entity.
- [ ] (Public API) **consumer-driven contract tests** so clients don't break on change.

### B. Resilience & operability
- [ ] **Idempotency-Key** for non-idempotent endpoints (resource creation, payments) so retries are safe.
- [ ] **Retry with exponential backoff + jitter**; **circuit breaker** for downstreams; **bulkhead** to isolate pools.
- [ ] **Graceful shutdown**: drain in-flight requests, close pools; separate **liveness / readiness / health** probes.

### C. Data integrity & concurrency
- [ ] **Explicit transaction boundaries** with the correct **isolation level**; guard races with **optimistic/pessimistic locking** (avoid lost updates, deadlocks).
- [ ] **Zero-downtime migrations** (expand/contract), **reversible**, forward-only in prod; **never edit an applied migration**.
- [ ] **Money as integer minor units / decimal** (never float); **store timestamps in UTC**.

### D. Throughput protection
- [ ] **Rate limiting / throttling** + **request body size limits**.
- [ ] **Connection pool** sized appropriately; **query timeout** on every query.
- [ ] **Caching** with explicit TTL + **invalidation strategy**; support **ETag / conditional requests** where it fits.

### E. Authorization depth (beyond authentication)
- [ ] **Object-level authorization** on every resource access (prevent **IDOR/BOLA**) — not just "is the caller logged in".
- [ ] **CORS allowlist**; **CSRF** protection for cookie-based auth; **security headers**; **SSRF** guard on outbound URLs.

### F. Eventing / async (if a message bus is used)
- [ ] **Outbox pattern** / transactional messaging to keep DB and events consistent.
- [ ] **Idempotent consumers**; **dead-letter queue**; assume **at-least-once** delivery.

### G. Test depth
- [ ] **Integration tests against a real DB** (e.g. Testcontainers), not only mocks.

## 13. Design patterns & abstraction
- **Fit the context, not the textbook**: a pattern must solve a real, present problem (duplication, a changing axis, testability) — otherwise prefer the simpler direct solution (KISS/YAGNI).
- **Choose by intent**: Strategy (interchangeable algorithms/behaviors), Template Method (fixed skeleton + variable steps), Factory / Abstract Factory (decouple creation / product families), Builder (complex/stepwise construction), Bridge (vary abstraction and implementation independently), Adapter (bridge incompatible interfaces), Decorator (compose behavior without subclass explosion), Observer / Pub-Sub (react to events), Repository / Unit of Work (persistence abstraction).
- **Rule of three**: refactor toward a pattern when the third real case appears — not speculatively on the first.
- **Document the decision**: record the pattern + rationale (and rejected alternatives) in an ADR or implementation note; name classes/abstractions after the pattern's intent.
- **Stay idiomatic**: prefer language/framework-native idioms where they express the same intent more simply (e.g. a higher-order function instead of a Strategy class, the DI container instead of a hand-rolled Factory).
- **Patterns serve SOLID**: use them to honor SRP/OCP/DIP — never let a pattern add indirection that obscures the code.

## 14. Working in existing / legacy code (brownfield)
- **New and changed code meets the full bar**; do not block on pre-existing debt.
- **Diff coverage**: enforce 100% coverage on **changed lines**, not on the whole legacy repo.
- **Ratchet, don't regress**: coverage, lint, and security findings may only improve over time — a gate fails on regression, not on absolute legacy debt.
- **Boy Scout rule**: leave each touched file a little better (naming, a test, a small refactor), scoped to your change.
- **Characterization tests first**: before refactoring untested legacy, capture current behavior with tests, then change safely.
- **Strangler-fig** for replacement: wrap the old path, divert traffic incrementally, retire it — no big-bang rewrites.
- **Don't rewrite working code** just to apply a pattern (see §13) or to chase 100% on untouched legacy.
- **Document as-is** decisions (retroactive ADRs) so future work has context — see `../ADOPTION.md`.
