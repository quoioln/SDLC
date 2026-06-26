# SDLC Skill & Agent Mapping

Đề xuất **skill** (gọi qua `/`) và **sub-agent** (gọi qua Agent tool) cho từng vai trò trong pipeline. Tier model theo quy ước workflow (3 mức, chọn theo độ khó của task): **lead = model mạnh nhất (Opus)** cho plan/logic/review; **execution logic vừa = model tầm trung (Sonnet)** cho business logic, integration, refactor; **execution cơ học = model tiết kiệm (Haiku)** cho boilerplate, CRUD, config, test theo mẫu. Đừng mặc định Haiku cho mọi việc — sai logic thì phải nhờ Opus sửa lại, tổng chi phí còn cao hơn làm đúng một lần trên Sonnet.

> **Đổi model giữa session sẽ phá prompt cache.** Để tiết kiệm đúng cách: giữ mỗi agent ở một model, và **spawn sub-agent ở tier rẻ hơn** cho subtask (Tech Lead chạy Opus → giao việc cơ học cho sub-agent Haiku) thay vì đổi model của agent đang chạy.

> **Lưu ý:** Tên skill/agent dưới đây theo bộ skill của Claude Code; tùy môi trường (Cursor/Codex/Antigravity) tên gọi có thể khác — ánh xạ theo *mục đích* của từng cột.

---

## Phase 1 — PO (Product Owner) · Opus
| Mục đích | Skill / Agent |
|---|---|
| Tinh chỉnh ý tưởng thô | `/idea-refine` |
| Đào yêu cầu khi đề bài mơ hồ ("build me X") | `/interview-me` |
| Viết spec/PRD có cấu trúc | `/spec` (spec-driven-development) |

## Phase 2 — Business BA
| Mục đích | Skill / Agent |
|---|---|
| FRS, NFR, use case dạng spec | `/spec` (spec-driven-development) |
| Ghi lại quyết định nghiệp vụ | `/documentation-and-adrs` |

## Phase 3 — Design / UX (chỉ app/web)
| Mục đích | Skill / Agent |
|---|---|
| Design "Anti-AI", không trông như AI tạo ⭐ | `/frontend-design` |
| Layout/component chất lượng production | `/frontend-ui-engineering` |
| Wireframe / sync sang Figma | `figma:figma-generate-design`, `figma:figma-use` |

## Phase 4 — Architect · Opus
| Mục đích | Skill / Agent |
|---|---|
| ADR (rationale + trade-off) ⭐ | `/documentation-and-adrs` |
| Ranh giới module, hợp đồng FE/BE | `/api-and-interface-design` |
| Security by design (Zero Trust, threat model) | `/security-and-hardening` |
| C4 / sequence / ERD diagram | `figma:figma-generate-diagram` |
| Quyết định bám tài liệu chính thống | `/source-driven-development` |

## Phase 5 — Technical BA
| Mục đích | Skill / Agent |
|---|---|
| API spec (OpenAPI 3.x), type contract ⭐ | `/api-and-interface-design` |
| Team breakdown, chia task | `/planning-and-task-breakdown`, agent `Plan` |

## Phase 5a / 6 — QE (docs: test plan, test case)
| Mục đích | Skill / Agent |
|---|---|
| Thiết kế test suite, chiến lược ⭐ | agent `agent-skills:test-engineer` |
| TDD/BDD plan | `/test` (test-driven-development) |

> QE Lead = Opus; Senior QE = Sonnet cho test logic-bearing (E2E, integration), Haiku cho test cơ học/theo mẫu.

## Phase 5b / 7 — Dev (Tech Lead + Senior Dev)
| Vai trò | Skill / Agent |
|---|---|
| **Tech Lead** (Opus): plan, review | agent `Plan`, `/plan`, `/code-review-and-quality` |
| **Senior Dev** (Sonnet cho logic, Haiku cho code cơ học): code từng bước | `/build`, `/incremental-implementation` |
| TDD bắt buộc (coverage 100%) | `/test-driven-development` |
| Bám docs framework | `/source-driven-development` |
| FE | `/frontend-ui-engineering` |
| BE / API | `/api-and-interface-design` |
| Logic rủi ro cao, irreversible | `/doubt-driven-development` |
| Debug khi build/test fail | `/debugging-and-error-recovery` |
| Commit/branch sạch | `/git-workflow-and-versioning` |
| Dọn code rườm rà | `/simplify` (code-simplification) |

## Phase 8 — QE testing + UAT (bug-fix loop)
| Mục đích | Skill / Agent |
|---|---|
| Viết/chạy test, đánh giá coverage | agent `agent-skills:test-engineer`, `/test` |
| UAT trong trình duyệt thật | `/browser-testing-with-devtools` |
| Verify UI runtime (DOM/layout/input/console) | `/browser-testing-with-devtools` |
| Visual regression + layout integrity (UI) | visual-diff tool (Playwright `toHaveScreenshot` / Percy / Chromatic) + `/browser-testing-with-devtools` |
| Xác minh fix chạy thật | `/verify` |
| Soát lỗi diff | `/code-review` |
| Truy nguyên bug | `/debugging-and-error-recovery` |

## Phase 9 — Security + Principle Engineer + Performance (audit loop)
| Vai trò | Skill / Agent |
|---|---|
| **[SEC]** OWASP/STRIDE/CVE ⭐ | agent `agent-skills:security-auditor`, `/security-review`, `/security-and-hardening` |
| **[PE]** audit logic/architecture | agent `agent-skills:code-reviewer`, `/review`, `/doubt-driven-development` |
| **[PERF]** p95<500ms, N+1 | agent `agent-skills:web-performance-auditor`, `/webperf`, `/performance-optimization` |

## Phase 10 — Deploy (OPS)
| Mục đích | Skill / Agent |
|---|---|
| CI/CD pipeline, quality gate ⭐ | `/ci-cd-and-automation` |
| Pre-launch checklist, rollout/rollback | `/ship` (shipping-and-launch) |
| Instrument trước khi lên prod | `/observability-and-instrumentation` |

## Phase 11 — Maintenance
| Mục đích | Skill / Agent |
|---|---|
| Monitoring, logging, alerting | `/observability-and-instrumentation` |
| Triage & fix bug | `/debugging-and-error-recovery` |
| Gỡ/migrate hệ thống cũ | `/deprecation-and-migration` |
| Tuning hiệu năng | `/performance-optimization` |
| Job định kỳ (check deploy, monitor) | `/schedule`, `/loop` |

---

## Xuyên suốt (mọi phase)
| Mục đích | Skill / Agent |
|---|---|
| Set up context khi bắt đầu session / đổi task | `/context-engineering` |
| Meta-skill: biết skill nào áp dụng | `/using-agent-skills` |
| Feature có dùng LLM / Claude API | `/claude-api` |
| Mọi thay đổi code (commit/branch/merge) | `/git-workflow-and-versioning` |
| Viết/cập nhật guideline tính năng (living docs) | `/documentation-and-adrs` (vai trò Guideline) |
