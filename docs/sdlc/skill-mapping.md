# SDLC Skill & Agent Mapping

Đề xuất **skill** (gọi qua `/`) và **sub-agent** (gọi qua Agent tool) cho từng vai trò trong pipeline. Tier model theo quy ước workflow (4 mức, chọn theo độ khó của task): **lead = Opus 4.8** cho plan/logic/review; **execution logic vừa = Sonnet 5** cho business logic, integration, refactor (chất lượng coding gần Opus nhưng ~60% giá); **execution cơ học = Haiku 4.5** cho boilerplate, CRUD, config, test theo mẫu; **escalation = Fable 5** — CHỈ cho bài toán khó nhất (kiến trúc mới/phức tạp, audit hệ thống critical) vì giá gấp đôi Opus, không bao giờ là mặc định. Đừng mặc định Haiku cho mọi việc — sai logic thì phải nhờ Opus sửa lại, tổng chi phí còn cao hơn làm đúng một lần trên Sonnet 5.

> **Gate theo độ khó (INTEGRATION.md §2.4):** skill/agent dưới đây chỉ đáng gọi khi task đủ phức tạp. Trivial (1 file) → không engine nào, sửa trực tiếp; Small (1–3 file) → chỉ `systematic-debugging`/`test-driven-development`; Medium (3–10 file) → thêm `writing-plans` + feature-dev explore/architecture + `context7`; Large/Epic → full set (brainstorming, feature-dev 7-phase, subagent-driven, code-review, security-guidance). Plugin đã cài + tier đạt ngưỡng → bắt buộc dùng; dưới ngưỡng → bỏ ceremony.

> **Đổi model giữa session sẽ phá prompt cache.** Để tiết kiệm đúng cách: giữ mỗi agent ở một model, và **spawn sub-agent ở tier rẻ hơn** cho subtask (Tech Lead chạy Opus 4.8 → giao việc cơ học cho sub-agent Haiku 4.5) thay vì đổi model của agent đang chạy.

> **Lưu ý:** Tên skill/agent dưới đây theo bộ skill của Claude Code; tùy môi trường (Cursor/Codex/Antigravity) tên gọi có thể khác — ánh xạ theo *mục đích* của từng cột.

---

## Phase 1 — PO (Product Owner) · Opus 4.8
| Mục đích | Skill / Agent |
|---|---|
| **Phân tích bài bản (built-in, không cần cài)** ⭐ | `/sdlc-workflow:po` → chạy **Analysis lenses** trong `po/README.md` (JTBD, 5 Whys, Impact Mapping, Opportunity-Solution Tree, assumption mapping, Kano, RICE/WSJF) |
| **Tuân thủ theo ngành (built-in)** | `domain-packs.md` — phân loại domain → kéo nghĩa vụ compliance + must-have requirements |
| Tinh chỉnh ý tưởng thô (external, nếu đã cài) | `/idea-refine` |
| Đào yêu cầu khi đề bài mơ hồ ("build me X") | `/interview-me` |
| Viết spec/PRD có cấu trúc | `/spec` (spec-driven-development) |

## Phase 2 — Business BA
| Mục đích | Skill / Agent |
|---|---|
| **Phân tích bài bản (built-in, không cần cài)** ⭐ | `/sdlc-workflow:ba` → chạy **Analysis lenses** trong `ba/business/README.md` (Event Storming, decision tables, state machine, CRUD/authority matrix, edge-case taxonomy, data-flow + classification) |
| **Compliance matrix theo ngành (built-in)** | `domain-packs.md` → mỗi dòng áp dụng thành FR/NFR + Gherkin AC + entry (regulation ↔ requirement ↔ test) |
| FRS, NFR, use case dạng spec (external) | `/spec` (spec-driven-development) |
| Ghi lại quyết định nghiệp vụ | `/documentation-and-adrs` |

## Phase 3 — Design / UX (chỉ app/web)
| Mục đích | Skill / Agent |
|---|---|
| Design "Anti-AI", không trông như AI tạo ⭐ | `/frontend-design` |
| Layout/component chất lượng production | `/frontend-ui-engineering` |
| Wireframe / sync sang Figma | `figma:figma-generate-design`, `figma:figma-use` |

## Phase 4 — Architect · Opus 4.8 (escalate Fable 5 cho hệ thống mới/phức tạp)
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

> QE Lead = Opus 4.8; Senior QE = Sonnet 5 cho test logic-bearing (E2E, integration), Haiku 4.5 cho test cơ học/theo mẫu.

## Phase 5b / 7 — Dev (Tech Lead + Senior Dev)
| Vai trò | Skill / Agent |
|---|---|
| **Tech Lead** (Opus 4.8): plan, review | agent `Plan`, `/plan`, `/code-review-and-quality` |
| **Senior Dev** (Sonnet 5 cho logic, Haiku 4.5 cho code cơ học): code từng bước | `/build`, `/incremental-implementation` |
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
