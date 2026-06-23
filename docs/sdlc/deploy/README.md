# [OPS] — Infrastructure & Deployment

**When:** After [SEC] + [PERF] + [PE] sign-off (all Critical/High = 0). **Before** Maintenance.

**Quality Standard:** All secrets in Vault/SSM. No hardcoded credentials. IaC must pass tfsec/checkov.

## Deployment

```bash
docker compose up -d            # local / staging
kubectl apply -f k8s/          # production
```

## Deliverables

- **Docker Compose + Kubernetes:** docker-compose.yml, k8s/deployment.yaml, service.yaml, ingress.yaml
- **Terraform (optional):** VPC, ECS/EKS, RDS, IAM, SSL, remote state backend
- **Ansible (optional):** Inventory, roles, playbooks, zero-downtime rolling deploy
- **CI/CD:** lint → test (100% coverage gate) → build → scan → deploy → smoke-test
- **IaC security:** tfsec / checkov — block if HIGH severity

## Gate

tfsec/checkov HIGH → 🔴 BLOCK. Secrets in source → 🔴 BLOCK. [SEC]/[PERF] unresolved → 🔴 BLOCK.

See docs/sdlc/SDLC-WORKFLOW.md for full details.
