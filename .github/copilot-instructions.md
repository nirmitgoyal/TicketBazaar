# 🎟 TicketBazaar Copilot Instructions

## 🧭 Project Stack & Architecture
- Full‑stack TypeScript: React + Vite frontend, Node.js + Express backend.
- Drizzle ORM with PostgreSQL.
- WebSocket real‑time messaging.
- Perplexity API, Google Analytics, Instagram verification.
- GitHub Actions for CI/CD workflows.

## 📏 Coding Standards & Style
- Use TypeScript types/interfaces everywhere.
- Functional React components, hooks (e.g., `useAuth`, `useSocket`).
- Tailwind CSS with utility-first classes.
- Radix/shadcn/ui components only.
- PascalCase for components, camelCase for vars/functions.
- Double-quotes for strings; 2 spaces indentation.
- Include JSDoc comments for exported functions.

## 🔄 File Organization
- Frontend: `src/{components,pages,hooks,utils}`
- Backend: `server/{routes,controllers,services,middleware,utils}`
- Match naming and folder structure exactly.
- Shared types and validation: `shared/{schema.ts,unified-types.ts,unified-validation.ts}`

## 🧪 Testing & Quality Assurance
- Enforce ESLint and Prettier.
- Flag missing types, tests, or lint errors in PRs.
- Use Playwright for E2E tests (see `playwright.config.ts`).
- GitHub Actions triggers: Push to `main`/`develop`, Pull requests, Daily at 2 AM UTC.
- Automated failure screenshots and regression testing.

## 🛡️ Security & Best Practices
- Validate all external input with Zod.
- Sanitize user-uploaded content before storage.
- Do not hardcode secrets—use `process.env`.
- Use `helmet`, `cors`, rate-limiting middleware.
- Protect `main` and `develop` branches with required status checks.

## 🔧 Developer Workflows
- Build: `npm run build` (see `vite.config.ts`).
- Test: `npm run test` or `npm run test:e2e`.
- Debugging: Use `scripts/diagnose-oauth.ts` and `scripts/validate-deployment.js`.
- Database setup: `scripts/init-db.ts` and `scripts/load-dummy-data.ts`.
- Deployment: `deploy.sh` and `validate-deployment.sh`.

## 💬 Copilot Interaction Guidelines
- If any error or failure occurs, retry yourself.
- Annotate functions/components with intent before prompting.
- Use inline comments or `// TODO:` placeholders for Copilot suggestions.
- Ask Copilot to refactor complex functions into smaller units.
- Prompt Copilot to explain code it generated if unclear.

---

**End of instructions.**