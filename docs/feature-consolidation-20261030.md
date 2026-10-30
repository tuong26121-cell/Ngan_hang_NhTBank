# NhTBank — consolidated feature branch (2026-10-30)

Integration branch: `integration/nhtbank-features-20261030`.

## Source review
- `main` (`14ccdd05e2df66185f63b2c9e869f5ad861ad3b1`) already contains VietQR Studio, QR scanner, bank-app handoff and their supporting tests. These were reviewed against the older `feature/nhtbank-vietqr-studio-20261030` and `feature/qr-scan-bank-handoff-ui-20261030` branches.
- `feature/icon-assets-supplied-no-old-logo-20261030` points to the same commit as `main`; it has no independent commits to integrate.
- `feature/auth-shell-v1-20261030` adds the 500 ms demo splash, local demo account registration/login and password-change UI, plus branding assets. This consolidated branch starts at that feature head.
- `fix/button-interactions-20261030`, `NhTBank`, and `codex/mb-sepay-sandbox-prep-20261029` are older/non-feature branches. Their historical refs are preserved.

This is a **code-content consolidation** on a new branch, not a history-rewriting merge of every old branch. Source branches stay intact for review and recovery.

## Safety and release gates
- **Demo only**: no live bank transaction, MB connection, real transfer or production security claim.
- The existing auth draft PR #23 is not ready to merge. On its head `36f835f70d14dcf7c55d597f0c7d4c15a6fea38f`, the GitHub Actions integration check failed: 69/70 tests passed; `frontend/src/components/flows.test.jsx` still tries PIN-based login, which the new auth UI replaces.
- Android and Windows E2E flows still use the old PIN keypad and need adapting to demo username/password.
- Require unit tests, production build, Android/Windows simulated E2E, viewport review, and a separate device test before release.
- Do not automatically merge this branch into `main` or deploy it while checks fail.
