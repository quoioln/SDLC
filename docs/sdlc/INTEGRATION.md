# SDLC + Superpowers + feature-dev — Hướng dẫn triển khai

> SDLC là **orchestrator** toàn bộ vòng đời (business → ops). Superpowers và feature-dev là **engine kỹ thuật** chạy *bên trong* một số phase. Plugin **bổ sung sức mạnh**, không thay thế khung SDLC.

> ⚠️ **Đọc mục 0 trước khi làm bất cứ gì.** Tên plugin/marketplace/skill dưới đây đã **verify trên `claude-plugins-official` (06/2026)** — xem mục 6. Tuy nhiên *hành vi chi tiết* vẫn phụ thuộc version (re-verify khi cập nhật). Nếu một plugin chưa cài → phase đó **fallback về template SDLC**, pipeline không được hard-fail.

---

## 0. Nguyên tắc nền (bắt buộc)

1. **Orchestrator vs engine.** SDLC quyết định *phase nào, role nào, output ra đâu, gate nào*. Plugin chỉ *thực thi* phần kỹ thuật trong phase. Không để plugin tự ý nhảy phase.
2. **Verify-first (chống lệch version).** Trước lần chạy đầu, xác nhận từng plugin: đã cài chưa, tên skill/command chính xác, hành vi cốt lõi. Xem checklist ở **mục 6**. Đừng tin các claim hành vi trong tài liệu này như chân lý.
3. **Graceful degradation.** Thiếu plugin → dùng template SDLC tương ứng và ghi chú "ran without <plugin>". Không chặn pipeline.
4. **Một chủ sở hữu Git.** SDLC nắm quyền branch + phase-gate commit; TDD chỉ micro-commit *trong* phase Dev trên cùng branch; `finishing-a-development-branch` lo merge cuối. Xem **mục 4** để tránh 4 cơ chế giẫm chân.
5. **Lớp model & chi phí (mục 2) áp cho TẤT CẢ phase.** feature-dev + subagent-driven spawn rất nhiều sub-agent — không gắn tier model + không offload là cách nhanh nhất đốt session. Mỗi phase phải nêu rõ **model tier** và (với QE) **depth tier**.
6. **Đã cài plugin thì phải dùng — nhưng đúng độ khó.** Chọn **complexity tier** (mục 2.4) ngay khi nhận task: plugin đã cài + tier đạt ngưỡng → bắt buộc dùng engine (không tự làm native); tier Trivial/Small → bỏ ceremony (brainstorming/writing-plans/feature-dev full) vì chi phí lớn hơn chính task.

---

## 1. Cài đặt plugin (guideline)

### Bước 1 — Điều kiện
Claude Code có sẵn lệnh `/plugin`. Marketplace **`claude-plugins-official`** được nạp sẵn khi mở Claude Code — **không cần** `marketplace add` cho các plugin official.

### Bước 2 — Cài plugin official (bắt buộc)
```bash
# đã verify trên claude-plugins-official (06/2026)
/plugin install feature-dev@claude-plugins-official
/plugin install code-review@claude-plugins-official
/plugin install security-guidance@claude-plugins-official
/plugin install superpowers@claude-plugins-official

# Khuyến nghị
/plugin install context7@claude-plugins-official
```
> 💡 Khi cài, Claude Code hỏi **scope**: chọn **user** để plugin nạp ở mọi session trên máy này, hoặc **project** để chỉ áp repo hiện tại. Pipeline SDLC dùng nhiều dự án → thường chọn **user**.

### Bước 3 — (tùy chọn) superpowers từ marketplace gốc
Muốn bản mới nhất sớm nhất (tác giả obra/Jesse Vincent), thay vì cài từ official:
```bash
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```
> Chỉ chọn **một** nguồn cho superpowers (official **hoặc** obra) để tránh trùng. `feature-dev`, `code-review`, `security-guidance`, `context7` là plugin official của Anthropic.

### Bước 4 — Xác nhận đã cài
- Mở `/plugin` → tab quản lý → kiểm tra 5 plugin ở trạng thái **enabled**.
- Hoặc chạy verify-first checklist ở **mục 6**.

### Bước 5 — Cập nhật về bản mới nhất
Plugin **version-pinned**, không tự cập nhật:
```bash
/plugin marketplace update <marketplace>    # re-fetch catalog — BẮT BUỘC trước
/plugin install <plugin>@<marketplace>      # cài lại bản đã bump
/reload-plugins                             # áp dụng, không cần restart
```
> Thiếu `marketplace update` thì `install` vẫn thấy version cũ. `/reload-plugins` đủ cho thay đổi text skill; thêm MCP/hook mới thì restart Claude Code.

### Bước 6 — Xử lý nhập nhằng & thiếu plugin
- ⚠️ **`code-review` nhập nhằng:** Claude Code có sẵn skill built-in `/code-review` **lẫn** plugin official `code-review`. Chọn **1**, ghi rõ trong `.claude/CLAUDE.md` (xem Phase 8). Đừng gọi cả hai.
- 🔁 **Thiếu plugin → graceful degradation:** phase tương ứng (mục 3) tự **fallback về template SDLC**, pipeline **không hard-fail**. Ghi chú "ran without <plugin>".

### Plugin nào cho phase nào (tóm tắt)
| Plugin | Phase dùng | Vai trò |
|--------|------------|---------|
| `superpowers` | PO · Technical BA · Dev · QE · Bug-fix · Deploy | brainstorming, writing-plans, TDD, subagent-driven, requesting-code-review, systematic-debugging, finishing-a-development-branch |
| `feature-dev` | Architect · Dev | 7-phase: explore → architecture → implement → review |
| `code-review` | QE (testing) | quality gate trên diff |
| `security-guidance` | Dev → Security (realtime) | three-layer vuln check, chạy tự động |
| `context7` | Architect · Dev | docs lookup, code đúng API framework |

---

## 2. Lớp model & chi phí (áp mọi phase)

### 2.1 — 4 tier model theo độ khó (không phải theo role cứng)

| Tier | Dùng cho | Model | Giá tương đối |
|------|----------|-------|---------------|
| **Escalation (frontier)** | CHỈ bài toán khó nhất: kiến trúc mới/phức tạp, audit security/logic hệ thống critical (money/auth/PII), run tự trị dài | **Fable 5** | 2× Opus — không bao giờ là mặc định |
| **Lead / analysis / audit** | PO, BA, Architect, Tech Lead, QE Lead, Security/PE — planning, logic, review | **Opus 4.8** | chuẩn lead |
| **Logic-bearing execution** | business logic, integration, refactor, test có nhánh | **Sonnet 5** | ~60% Opus — chất lượng coding gần Opus |
| **Cơ học** | boilerplate, CRUD, config, wiring, test theo mẫu | **Haiku 4.5** | ~20% Opus |

Đừng mặc định Haiku cho mọi thứ: sai logic → Opus phải sửa lại, tổng chi phí cao hơn làm đúng một lần trên Sonnet 5. Ngược lại cũng đừng mặc định Fable: phần lớn task lead Opus 4.8 xử lý tốt với nửa giá — chỉ escalate khi Opus thực sự không đủ.

### 2.2 — QE depth tier (right-size độ kỹ theo quy mô feature)

| Depth | Khi nào | Phạm vi | Model |
|-------|---------|---------|-------|
| **Smoke** | Feature nhỏ/low-risk | Happy path + 1–2 edge; KHÔNG cross-browser/visual-regression/responsive matrix | Haiku 4.5 |
| **Standard** (mặc định) | Feature thường | Unit + integration + key edges; UI: 1 breakpoint | Sonnet 5 |
| **Full** | Critical / money-auth-PII / UI-heavy | Full matrix | Opus 4.8 design → Sonnet 5 exec |

### 2.3 — Sub-agent offload (chống đốt session)

feature-dev và subagent-driven-development spawn nhiều sub-agent. **Chạy execution nặng (browser automation, evidence, test run, code-explore) trong sub-agent ở model của tier**, đừng chạy trong session chính — output lớn (trace/screenshot/log) sẽ không nuốt context của orchestrator. Đổi model giữa một agent đang chạy sẽ **phá prompt cache**; spawn sub-agent thì không.

### 2.4 — Task complexity tier: độ khó nào mới dùng plugin engine

**Vấn đề hai chiều:** cài plugin rồi không dùng = phí tiềm năng; nhưng task nhỏ mà chạy đủ ceremony (brainstorming → writing-plans → feature-dev 7-phase) thì **chậm hơn chứ không nhanh hơn** — chi phí ceremony lớn hơn chính task. **Chọn complexity tier NGAY KHI nhận task** (trước khi code) và tuyên bố một dòng: `🧩 Complexity: <tier> → engines: <danh sách>`.

| Tier | Tín hiệu nhận biết | Engine BẮT BUỘC dùng (nếu đã cài) | KHÔNG dùng (ceremony thừa) |
|------|--------------------|-----------------------------------|----------------------------|
| **Trivial** — typo, đổi config, sửa docs, đổi hằng số | 1 file, vài dòng, không logic mới | Không plugin nào — sửa trực tiếp + `/verify` | Tất cả: brainstorming, writing-plans, feature-dev, TDD skill, subagent |
| **Small** — bug fix rõ nguyên nhân, feature nhỏ theo pattern có sẵn | 1–3 file, ít nhánh logic, spec rõ | Bug → superpowers `systematic-debugging` + `verification-before-completion`. Feature → superpowers `test-driven-development` | brainstorming, writing-plans, feature-dev full, subagent-driven |
| **Medium** — feature chạm nhiều module, logic mới, có edge cases | 3–10 file, cần plan trước khi code | + superpowers `writing-plans` (implementation plan), feature-dev (explore + architecture), `context7` (code đúng framework), plugin `code-review` ở QE | brainstorming — trừ khi requirement mơ hồ |
| **Large / Epic** — subsystem mới, kiến trúc mới, cross-cutting, money/auth/PII | nhiều unknowns, nhiều team/role, rủi ro cao | FULL: superpowers `brainstorming` (PO), feature-dev đủ 7 phase, `writing-plans`, `subagent-driven-development` (task song song), `code-review` + `security-guidance`, `context7` | không bỏ gì |

**Quy tắc:**
1. **Plugin đã cài + tier đạt ngưỡng → BẮT BUỘC dùng engine, không tự làm native.** Cài superpowers mà vẫn debug tay là sai quy trình — với bug bất kỳ (tier Small trở lên), `systematic-debugging` là đường mặc định.
2. **Tier Trivial/Small → cấm ceremony.** Không brainstorming, không writing-plans, không spawn subagent cho việc một file.
3. **Phân vân giữa hai tier → chọn tier thấp hơn**, nâng lên khi phát hiện độ phức tạp thật (nói rõ: "nâng lên Medium vì chạm 5 module").
4. Tier này **độc lập** với QE depth tier (2.2) nhưng thường tương quan: Trivial/Small ↔ Smoke, Medium ↔ Standard, Epic ↔ Full.
5. **Dynamic roles (sdlc-config `mode: dynamic`, mặc định BẬT):** complexity tier cũng quyết định **role nào chạy** — Trivial: chỉ Dev, QE bỏ hẳn (Dev tự `/verify`); Small: QE chạy **inline trong role Dev** ở Smoke depth (chạy test + báo 1 dòng — không đổi role, không sub-agent, không evidence ceremony), docs roles bỏ trừ khi requirement mơ hồ; Medium+: QE phase đầy đủ. Role bị bỏ vẫn in banner ⏭. Security guard (money/auth/PII) không bị ảnh hưởng. Tắt bằng "static mode". Khai báo roster ngay khi chọn tier: `🧩 Complexity: <tier> → engines: <list> · roster: <roles>`.

---

## 3. Pipeline tích hợp theo phase

> Mỗi phase: **Plugin (engine) · Model tier · Output · Fallback**. Thứ tự theo SDLC canonical — **Design TRƯỚC Architect** (UX dẫn tech).

### Phase 1 — PO (Product Owner) · Opus 4.8
- **Engine:** Superpowers `brainstorming` (Socratic, tách requirement, validate scope) — **bổ sung**, không thay role PO.
- **Quy trình:** brainstorming → lưu `po/{epic-slug}/brainstorm.md` → PO approve → điền `epic-brief.template.md`. Áp **Analysis lenses** của SDLC (JTBD, 5 Whys, Impact Mapping…).
- **Output:** `docs/sdlc/po/{epic-slug}/epic-brief.md`
- **Fallback:** điền epic-brief bằng Analysis lenses của SDLC.

### Phase 2 — Business BA · Opus 4.8
- **Engine:** Template SDLC + **`domain-packs.md`** (phân loại ngành → nghĩa vụ compliance + must-have requirements).
- **Output:** `docs/sdlc/ba/business/{epic-slug}/functional-requirement.md` + compliance matrix (regulation ↔ requirement ↔ test).
- **Fallback:** (đây là native SDLC — không phụ thuộc plugin).

### Phase 3 — Design (chỉ app/web) · Opus 4.8 (judgment) / Sonnet 5 (component code)
- **Engine:** SDLC (anti-AI design spec + wireframe + PO/BA review loop). Không plugin nào cover phần này.
- **Output:** `docs/sdlc/design/{epic-slug}/design-spec.md` + wireframe.

### Phase 4 — Architect · Opus 4.8 (escalate Fable 5 cho hệ thống mới/phức tạp)
- **Engine:** feature-dev *architecture phase* (sub-agent explore codebase → đề xuất approach + trade-offs) + `context7` / `source-driven-development` để bám API framework chính thống.
- **Giữ nguyên:** ADR vẫn là deliverable SDLC (`adr.template.md`) — feature-dev chỉ cung cấp phân tích, Architect review & chốt ADR.
- **Output:** `docs/sdlc/architecture/{epic-slug}/adr.md`
- **Fallback:** Architect điền ADR thủ công theo template.

### Phase 5 — Technical BA · Opus 4.8 (contract) / Sonnet 5 (điền routine)
- **Engine:** Superpowers `writing-plans` — **BỔ SUNG, KHÔNG thay thế.**
  - `writing-plans` tạo **implementation-plan** (task 2–5 phút, file path cụ thể, snippet đầy đủ, verification steps).
  - **GIỮ NGUYÊN** `api-spec.template.md` (OpenAPI/contract) + `team-breakdown.template.md` — chính API contract mới cho phép **FE/BE chạy song song**. Mất nó là mất parallelism.
- **Output:** `ba/technical/{epic-slug}/` → `api-spec.md` + `team-breakdown.md` + `implementation-plan.md`
- **Fallback:** điền cả 3 bằng template.

### Phase 6 — QE (docs) · Sonnet 5
- **Engine:** Template SDLC. `writing-plans` đã có verification steps; QE Lead nâng thành test-plan + test-cases chính thức. **Chọn depth tier ở đây** (Smoke/Standard/Full) để định hình độ kỹ.
- **Output:** `qe/{epic-slug}/test-plan.md` + `test-cases.md`

### Phase 7 — Dev · Opus 4.8 (Tech Lead) / Sonnet 5 (logic) / Haiku 4.5 (cơ học)
- **Engine:** feature-dev + Superpowers `test-driven-development` + `subagent-driven-development` (+ `context7` cho code đúng framework).
- **Tech Lead (Opus 4.8):** chạy feature-dev (discovery → explore → clarify → architecture → implementation → review → summary). Plan/review giữ ở Opus 4.8.
- **Senior Dev (Sonnet 5, hoặc Haiku 4.5 cho task cơ học):** implement theo TDD **RED → GREEN → REFACTOR**. Task song song → mỗi task một sub-agent (spec + file paths + verification), two-stage review (spec → quality).
- **Coverage:** **100% branch (TDD/BDD)** — theo quality bar SDLC, KHÔNG hạ xuống 90%.
- **Guideline (DoD):** mỗi feature mới/đổi phải tạo/cập nhật `guideline/{epic-slug}.md` trong cùng PR — feature chưa "done" nếu guideline stale.
- **Output:** code + tests + `dev/{epic-slug}/implementation-notes.md` + guideline.
- **Git:** xem mục 4 (một chủ sở hữu).

### Phase 8 — QE (testing + UAT + bug-fix loop) · theo depth tier
- **Chọn depth tier TRƯỚC** (mục 2.2) — đừng chạy Full matrix cho feature nhỏ; offload execution sang sub-agent.
- **Bước 1 — spec compliance:** Superpowers `requesting-code-review` (đúng spec? edge case đã handle?).
- **Bước 2 — quality gate:** code-review (phân biệt rõ: plugin official `code-review` **hay** skill built-in `/code-review` của Claude Code — chọn 1, đừng nhầm). Chỉ nhận finding confidence cao.
- **Bug-fix loop:** bug → Dev fix bằng `systematic-debugging` (4 phase: Reproduce → Isolate → Hypothesize → Fix+Verify) + `verification-before-completion` (cấm claim "fixed" trước khi verify pass) → QE retest → lặp đến **0 open bug** → QE Lead sign-off.
- **Evidence:** screenshot/video/trace là **deliverable** trong `qe/{epic-slug}/evidence/` — **không xóa**, kể cả run pass. Cleanup chỉ áp cho test data/accounts.

### Phase 9 — Security + Principle Engineer · Opus 4.8 (escalate Fable 5 cho hệ thống critical: money/auth/PII)
- **Lớp 1 (realtime, bật từ Phase 7):** `security-guidance` (Anthropic official) — chạy tự động, **three-layer**: (a) regex check mỗi edit (~25 lớp lỗ hổng, zero-cost), (b) LLM diff review cuối turn (Opus 4.7, bắt logic flaw), (c) agentic cross-file review lúc commit. Là tool hỗ trợ best-effort, **không thay** SAST/DAST/pen-test.
- **Lớp 2 (audit chính thức):** Security Agent + PE Agent theo SDLC → `security/{epic-slug}/` + `principle-engineer/{epic-slug}/`.
- **Fix loop:** issue → Dev fix → QE retest → re-audit đến 0 issue → sign-off. *(Đây là lợi thế riêng SDLC — không plugin nào có.)*

### Phase 10 — Deploy · Sonnet 5
- **Gate:** Superpowers `finishing-a-development-branch` (verify tests pass → merge/PR/keep/discard → dọn worktree).
- **Deploy:** template SDLC — `docker-compose` (staging) / `kubectl apply -f k8s/` (prod) → smoke test.

### Phase 11 — Maintenance · Sonnet 5 / Haiku 4.5
- **Engine:** SDLC (monitoring, bug fix, patch, dependency update, perf tuning, runbooks). Không plugin nào có.
- **Output:** `docs/sdlc/maintenance/{epic-slug}/`

### Cross-cutting — Guideline (living docs)
Mọi feature mới/đổi tạo/cập nhật `guideline/{epic-slug}.md` (Definition of Done; Tech Lead enforce ở review). Đừng để rơi như bản tích hợp trước.

---

## 4. Quản lý Git (giải xung đột 4 cơ chế)

Có 4 thứ đụng nhau: SDLC auto-commit-per-phase · TDD micro-commit · feature-dev tự xử git · `finishing-a-development-branch` dọn worktree. Chốt **một mô hình**:

1. **Branch:** SDLC tạo `epic/{slug}` (một branch cho cả epic).
2. **Trong Phase 7 (Dev):** TDD micro-commit sau mỗi RED-GREEN-REFACTOR **trên chính branch đó** — coi như checkpoint nhỏ.
3. **Phase gate:** SDLC commit checkpoint khi mỗi phase **pass** (nếu bật auto-commit-per-phase). Không trùng lặp với TDD vì TDD chỉ trong Dev.
4. **Cuối:** `finishing-a-development-branch` lo merge/PR. **Không auto-push** — người dùng push/tag khi release.
5. Nếu feature-dev đề nghị tự tạo branch/worktree riêng → **để SDLC branch thắng**, feature-dev chạy trong branch đó.

---

## 5. Cập nhật `.claude/CLAUDE.md`

```markdown
## Plugin Integration — SDLC Workflow

Khi chạy SDLC pipeline, mỗi phase nêu rõ ENGINE + MODEL TIER + FALLBACK.
Plugin bổ sung, KHÔNG thay khung SDLC. Thiếu plugin → fallback template SDLC.

| Phase | Engine (verify version) | Model tier | Fallback |
|-------|-------------------------|------------|----------|
| PO | Superpowers: brainstorming | Opus 4.8 | epic-brief template |
| Business BA | SDLC + domain-packs | Opus 4.8 | native |
| Design | SDLC | Opus 4.8/Sonnet 5 | native |
| Architect | feature-dev (architecture) + context7 | Opus 4.8 (Fable 5 nếu hệ thống mới/phức tạp) | ADR template |
| Technical BA | + writing-plans (BỔ SUNG, giữ api-spec + team-breakdown) | Opus 4.8/Sonnet 5 | templates |
| QE (docs) | SDLC (chọn depth tier) | Sonnet 5 | native |
| Dev | feature-dev + TDD + subagent + context7 | Opus 4.8/Sonnet 5/Haiku 4.5 | manual impl |
| QE (testing) | depth tier → requesting-code-review + code-review | theo depth | native QE |
| Bug-fix | systematic-debugging + verification-before-completion | Sonnet 5 | native loop |
| Security + PE | Security Guidance (realtime) + SDLC audit | Opus 4.8 (Fable 5 nếu critical) | SDLC audit |
| Deploy | finishing-a-development-branch → SDLC templates | Sonnet 5 | docker/k8s |
| Maintenance | SDLC | Sonnet 5/Haiku 4.5 | native |

### Quy tắc bắt buộc
- Chọn COMPLEXITY TIER trước khi code (Trivial/Small/Medium/Epic — INTEGRATION.md §2.4) và tuyên bố `🧩 Complexity: <tier> → engines: <list>`. Plugin đã cài + tier đạt ngưỡng → BẮT BUỘC dùng engine; Trivial/Small → KHÔNG ceremony.
- Gắn MODEL TIER cho mỗi phase; offload execution nặng sang SUB-AGENT (không phá cache, không đốt session).
- QE: chọn DEPTH TIER trước (Smoke/Standard/Full) — KHÔNG chạy Full matrix cho feature nhỏ.
- 100% branch coverage (TDD/BDD) trước khi sang QE — KHÔNG hạ 90%.
- KHÔNG viết implementation code trước test (TDD enforce).
- KHÔNG claim "fixed" trước khi verification-before-completion pass.
- KHÔNG deploy trước khi finishing-a-development-branch gate pass.
- KHÔNG bỏ Security + PE audit. KHÔNG bỏ Guideline (DoD).
- Một chủ sở hữu Git (mục 4); không auto-push.
- Thiếu plugin → fallback template SDLC, ghi chú lại; không hard-fail.
```

---

## 6. Verify-first checklist (chạy 1 lần trước khi dùng)

**Trạng thái verify (06/2026)** — re-verify khi version đổi:

| Mục | Trạng thái | Ghi chú |
|-----|-----------|---------|
| `feature-dev@claude-plugins-official` | ✅ verified | 7-phase: Discovery → Codebase Exploration → Clarifying Questions → Architecture Design → Implementation → Quality Review → Summary |
| `code-review@claude-plugins-official` | ✅ verified | **Lưu ý:** Claude Code cũng có skill built-in `/code-review` — chọn 1, ghi vào CLAUDE.md |
| `context7@claude-plugins-official` | ✅ verified | docs lookup framework-accurate |
| `security-guidance@claude-plugins-official` | ✅ verified | ~25 lớp lỗ hổng, three-layer (regex/edit + LLM diff Opus 4.7 + agentic cross-file commit); chạy tự động |
| `superpowers` | ✅ verified | `@claude-plugins-official` **hoặc** `obra/superpowers-marketplace` |
| superpowers skill names (9) | ✅ verified | brainstorming, writing-plans, test-driven-development, subagent-driven-development, requesting-code-review, systematic-debugging, verification-before-completion, finishing-a-development-branch (+using-git-worktrees) |
| TDD "xóa code viết trước test" | ⚠️ chưa verify hành vi | xác nhận trong bản bạn cài trước khi dựa vào |

> Mục nào chưa verify được → coi như **chưa có**, dùng fallback SDLC cho phase đó. Tên/hành vi phụ thuộc version — đây là ảnh chụp 06/2026.

---

## 7. Tóm tắt: ai giữ, ai bổ sung (đã chỉnh)

| Phase | Trạng thái | Engine |
|-------|------------|--------|
| PO | 🔵 Bổ sung | Superpowers `brainstorming` |
| Business BA | ✅ Giữ + domain-packs | SDLC |
| Design | ✅ Giữ nguyên | SDLC |
| Architect | 🔵 Bổ sung | feature-dev + context7 (ADR vẫn của SDLC) |
| Technical BA | 🔵 **Bổ sung** (KHÔNG thay thế) | writing-plans + **giữ api-spec/team-breakdown** |
| QE (docs) | ✅ Giữ + depth tier | SDLC |
| Dev | 🔵 Tăng cường | feature-dev + TDD + subagent + context7 |
| QE (testing) | 🔵 Bổ sung | depth tier → requesting-code-review + code-review |
| Bug-fix | 🔵 Bổ sung (trong loop QE) | systematic-debugging + verification |
| Security + PE | 🔵 Bổ sung | Security Guidance + SDLC audit |
| Deploy | 🔵 Bổ sung | finishing-a-development-branch → SDLC |
| Maintenance | ✅ Giữ nguyên | SDLC |
| Guideline | ✅ Cross-cutting | SDLC (DoD) |

**Sửa quan trọng so với bản cũ:** Technical BA = **bổ sung** (giữ API contract), coverage = **100%**, thêm lớp **model/cost + QE depth + sub-agent offload**, thêm **fallback** + **verify-first**, giữ lại **Guideline**.

---

## 8. Lợi thế riêng của SDLC (không plugin nào thay thế)

1. **Business roles** — PO, Business BA, Design, Architect với templates chuyên biệt.
2. **Security + PE audit phase** — gate bảo mật sau implementation, trước deploy.
3. **Maintenance phase** — monitoring, runbooks, patches.
4. **Deploy templates** — Docker Compose + K8s sinh sẵn.
5. **Domain packs** — checklist compliance theo ngành (fintech/health/e-commerce…).
6. **Model/cost governance** — 4-tier (Fable 5 escalation / Opus 4.8 lead / Sonnet 5 execution / Haiku 4.5 cơ học) + QE depth tier + sub-agent offload + role/model banner mỗi phase.
7. **Guideline (living docs)** — Definition of Done cho mọi feature.

Superpowers và feature-dev là framework thuần kỹ thuật cho developer. SDLC cover toàn bộ vòng đời từ business đến ops, cộng lớp governance model/chi phí — đây là phần plugin không thay thế được.
