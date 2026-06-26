# Domain packs — industry analysis & compliance

Self-contained reference for **PO** (intake/feasibility) and **Business BA** (requirements/compliance). When an epic touches one of these domains, **apply the matching pack**: pull its must-have requirements into the FRS/NFR, map its regulations in the compliance matrix, and add its risks to the assumptions/risk log. No external plugin or skill is required — this is the checklist.

> **How to use:** 1) PO classifies the domain(s) at intake and flags obligations early. 2) BA turns each applicable row into concrete FR/NFR + Gherkin AC + a compliance-matrix entry (regulation ↔ requirement ↔ test). 3) If a domain is not listed, reuse the closest pack and note the gap in the assumptions log.

## Quick domain classifier
Pick all that apply by what the system **does with data/money/people**:
- Moves or stores **money / cardholder data** → Fintech / Payments
- Handles **patient / health** data → Healthcare
- Sells goods, **cart + checkout + fulfilment** → E-commerce / Retail
- **Multi-tenant subscription** software → SaaS / B2B
- **Children / students** as users → EdTech (+ minors)
- **Citizen services / records** → Government / Public sector
- **Devices / firmware / telemetry** → IoT / Embedded
- **Ad targeting / tracking** → AdTech

## Packs

### Fintech / Payments
- **Regulations**: PCI-DSS (card data), PSD2/SCA (EU strong customer auth), KYC/AML, SOX (if listed), local e-money licensing.
- **Must-have requirements**: never store full PAN/CVV (tokenize/vault); **idempotency keys** on every money-moving call; **double-entry ledger** + immutable audit trail; reconciliation job; transaction state machine (pending→authorized→captured→settled→refunded/failed); per-currency rounding rules; limits/velocity checks; fraud-risk hooks.
- **NFR**: strong consistency on balances; p99 latency budget on auth; RPO≈0 for ledger; segregation of duties.
- **Risks to log**: double-spend / race on debit; partial failure between payment provider and ledger; chargeback handling.

### Healthcare
- **Regulations**: HIPAA (US), GDPR special-category data (EU), HL7/FHIR interop, HITECH, local medical-device rules if clinical.
- **Must-have requirements**: PHI access control (role + purpose); **break-glass** access with audit; consent management; de-identification for analytics; audit log of every PHI read/write; data retention + legal hold.
- **NFR**: encryption at rest/in transit; availability for clinical workflows; auditability.
- **Risks**: over-broad PHI access; analytics leaking re-identifiable data; consent not enforced downstream.

### E-commerce / Retail
- **Regulations**: PCI-DSS (payments), consumer-protection / distance-selling, tax (VAT/GST) by jurisdiction, GDPR/CCPA for accounts.
- **Must-have requirements**: cart + **inventory reservation** (oversell prevention); checkout state machine; pricing/promo/coupon rules with precedence; tax + shipping calculation; **refund / return / cancellation** flows; order-status notifications; idempotent order placement.
- **NFR**: peak-load (sale events) scaling; cart availability; eventual consistency where safe, strong on stock decrement.
- **Risks**: oversell on concurrent checkout; promo stacking abuse; tax miscalculation by region.

### SaaS / B2B (multi-tenant)
- **Regulations**: SOC2, GDPR/CCPA (DPA, sub-processors), data residency, ISO 27001.
- **Must-have requirements**: **tenant isolation** (row/schema/DB) stated explicitly; RBAC + org/role model; SSO/SCIM provisioning; per-tenant config & limits; usage metering/billing; audit log per tenant; data export + **right-to-erasure**.
- **NFR**: noisy-neighbor isolation; per-tenant rate limits; backup/restore per tenant.
- **Risks**: cross-tenant data leak; tenant-scoped queries missing a filter; billing drift.

### EdTech (+ minors)
- **Regulations**: COPPA (US, under-13), FERPA (US student records), GDPR-K (EU minors), local age-of-consent.
- **Must-have requirements**: age gate + verifiable parental consent; minimized data collection; no behavioral ad targeting to minors; guardian/teacher roles; content-safety controls.
- **Risks**: collecting PII from minors without consent; third-party SDKs tracking minors.

### Government / Public sector
- **Regulations**: accessibility mandates (WCAG 2.1 AA / Section 508 / EN 301 549), records-retention law, FOIA/transparency, data-sovereignty.
- **Must-have requirements**: full accessibility; audit & records retention; identity assurance levels; multilingual where mandated; open-data/export.
- **Risks**: accessibility non-compliance; records not retained per schedule.

### IoT / Embedded
- **Regulations**: device-security baselines (e.g. ETSI EN 303 645), radio/safety certs, data-protection for telemetry.
- **Must-have requirements**: secure boot + signed OTA updates; device identity/provisioning; offline/degraded operation; telemetry schema + backpressure; remote revocation.
- **NFR**: power/memory budgets; OTA rollback; connectivity-loss resilience.
- **Risks**: unsigned firmware; fleet-wide bad update; telemetry flooding.

### AdTech
- **Regulations**: GDPR/ePrivacy consent (TCF), CCPA opt-out, platform tracking policies (ATT).
- **Must-have requirements**: consent capture + propagation; opt-out honoring end-to-end; data-minimization; frequency capping; auditability of targeting.
- **Risks**: tracking without consent; opt-out not enforced in downstream pipelines.

---
**Cross-domain baseline (always apply):** data classification (PII/sensitive) + retention; encryption in transit/at rest; authn/authz model; audit logging of sensitive actions; GDPR/CCPA data-subject rights (access, erasure, portability) if any personal data is processed.
