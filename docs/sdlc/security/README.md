# Security Team | [SEC]

**When:** After [QE] quality gate passed (0 open bugs + 100% coverage). Runs **parallel** with [PERF] audit. **Before** Deploy.

**Quality Standard:** Zero tolerance for Critical severity. High must have documented mitigation or accepted-risk doc.

## Detailed Tasks

- [ ] **OWASP Top 10 checklist:** A01 Broken Access Control → A10 SSRF
- [ ] **STRIDE threat model:** Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation of Privilege
- [ ] **SAST findings:** Static analysis (Semgrep, SonarQube, Bandit)
- [ ] **CVE scan:** npm audit / pip audit / trivy
- [ ] **Auth/Authorization review:** JWT, sessions, RBAC
- [ ] **Secrets management:** No hardcoded credentials; verify Vault/SSM
- [ ] **Compliance notes:** GDPR / PCI-DSS / SOC2 / HIPAA (activate per project type)

## Issue Tracking

Issue ID (SEC-001...), Severity (Critical/High/Medium/Low), Status, Owner, Mitigation.

## Merge Gate

Critical → 🔴 BLOCK. High without mitigation → 🔴 BLOCK. High with accepted-risk → ⚠️ CONDITIONAL.

See docs/sdlc/SDLC-WORKFLOW.md for full audit details.
