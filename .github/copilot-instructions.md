# 🎟 TicketBazaar Copilot Instructions

## 🧭 Project Stack & Architecture
- Full‑stack TypeScript: React + Vite frontend, Node.js + Express backend.
- Drizzle ORM with PostgreSQL.
- WebSocket real‑time messaging.
- Perplexity API, Google Analytics, Instagram verification.

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

## 🧪 Testing & Quality Assurance
<!-- - Always include visual + integration tests for new modules. -->
- Enforce ESLint and Prettier.
- Flag missing types, tests, or lint errors in PRs.

## 🛡️ Security & Best Practices
- Validate all external input with Zod.
- Sanitize user-uploaded content before storage.
- Do not hardcode secrets—use `process.env`.
- Use `helmet`, `cors`, rate-limiting middleware.

## 💬 Copilot Interaction Guidelines
- Annotate functions/components with intent before prompting.
- Use inline comments or `// TODO:` placeholders for Copilot suggestions.
- Ask Copilot to refactor complex functions into smaller units.
<!-- - Request tests for any generated logic. -->
- Prompt Copilot to explain code it generated if unclear.

---

**End of instructions.**