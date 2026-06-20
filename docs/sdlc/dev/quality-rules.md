# Developer Quality Rules

Mandatory quality bar for **all implementation roles**. Tech Lead enforces at review; every Senior role must satisfy this **before opening a PR**. Applies **on top of** the existing baseline (100% branch coverage, TDD/BDD, Clean Code, SOLID, DRY, KISS, SoC, security shift-left).

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

## 4. Error handling & observability (shift-left, at code time)
- **No swallowed errors** (empty `catch {}`); log with context or re-throw meaningfully.
- **Structured logging** (JSON, with correlation/trace ID); **never log secrets or PII**.
- Validate input **at the boundary** (API edge); fail fast with a clear message.
- Critical write operations must be **idempotent** where retries are possible.

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
