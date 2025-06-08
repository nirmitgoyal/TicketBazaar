# 🎟 TicketBazaar Copilot Instructions

## 🧭 Project Stack & Architecture
- ^[Full‑stack TypeScript: React + Vite frontend, Node.js + Express backend.]({"attribution":{"attributableIndex":"0-1"}})
- ^[Drizzle ORM with PostgreSQL.]({"attribution":{"attributableIndex":"0-2"}})
- ^[WebSocket real‑time messaging.]({"attribution":{"attributableIndex":"0-3"}})
- ^[Google Maps, Firebase Analytics, Instagram verification.]({"attribution":{"attributableIndex":"0-4"}})

## 📏 Coding Standards & Style
- ^[Use TypeScript types/interfaces everywhere.]({"attribution":{"attributableIndex":"0-5"}})
- ^[Functional React components, hooks (e.g., `useAuth`, `useSocket`).]({"attribution":{"attributableIndex":"0-6"}})
- ^[Tailwind CSS with utility-first classes.]({"attribution":{"attributableIndex":"0-7"}})
- ^[Radix/shadcn/ui components only.]({"attribution":{"attributableIndex":"0-8"}})
- ^[PascalCase for components, camelCase for vars/functions.]({"attribution":{"attributableIndex":"0-9"}})
- ^[Double-quotes for strings; 2 spaces indentation.]({"attribution":{"attributableIndex":"0-10"}})
- ^[Include JSDoc comments for exported functions.]({"attribution":{"attributableIndex":"0-11"}})

## 🔄 File Organization
- ^[Frontend: `src/{components,pages,hooks,utils}`]({"attribution":{"attributableIndex":"0-12"}})
- ^[Backend: `server/{routes,controllers,services,middleware,utils}`]({"attribution":{"attributableIndex":"0-13"}})
- ^[Match naming and folder structure exactly.]({"attribution":{"attributableIndex":"0-14"}})

## 🧪 Testing & Quality Assurance
- ^[Use Jest + React Testing Library for front; supertest for backend.]({"attribution":{"attributableIndex":"0-15"}})
- ^[Always include unit + integration tests for new modules.]({"attribution":{"attributableIndex":"0-16"}})
- ^[Enforce ESLint and Prettier.]({"attribution":{"attributableIndex":"0-17"}})
- ^[Flag missing types, tests, or lint errors in PRs.]({"attribution":{"attributableIndex":"0-18"}})

## 🛡️ Security & Best Practices
- ^[Validate all external input with Zod.]({"attribution":{"attributableIndex":"0-19"}})
- ^[Sanitize user-uploaded content before storage.]({"attribution":{"attributableIndex":"0-20"}})
- ^[Do not hardcode secrets—use `process.env`.]({"attribution":{"attributableIndex":"0-21"}})
- ^[Use `helmet`, `cors`, rate-limiting middleware.]({"attribution":{"attributableIndex":"0-22"}})

## 💬 Copilot Interaction Guidelines
- ^[Annotate functions/components with intent before prompting.]({"attribution":{"attributableIndex":"0-23"}})
- ^[Use inline comments or `// TODO:` placeholders for Copilot suggestions.]({"attribution":{"attributableIndex":"0-24"}})
- ^[Ask Copilot to refactor complex functions into smaller units.]({"attribution":{"attributableIndex":"0-25"}})
- ^[Request tests for any generated logic.]({"attribution":{"attributableIndex":"0-26"}})
- ^[Prompt Copilot to explain code it generated if unclear.]({"attribution":{"attributableIndex":"0-27"}})

---

**End of instructions.**