# Repository Guidelines

## Project Structure & Module Organization
This project is a Vite + React + TypeScript app for clinical workflows.

- `src/`: Main application code.
- `src/features/`: Feature-first modules (`patients`, `notes`, `image-analysis`, `dashboard`, etc.).
- `src/components/ui/`: Shared shadcn/ui primitives.
- `src/db/`: Database client, schema, and service layer.
- `src/services/`: AI, speech, image, risk, and utility services.
- `public/`: Static assets (images, icons, frame sequences).
- `supabase/migrations/` and `drizzle/`: SQL and Drizzle migration artifacts.
- `server/email-server.js`: Local Node email service.

## Build, Test, and Development Commands
- `npm run dev`: Start local Vite dev server (`http://localhost:5173`).
- `npm run build`: Production build to `dist/`.
- `npm run build:dev`: Development-mode build.
- `npm run preview`: Preview built output locally.
- `npm run lint`: Run ESLint across the repo.
- `npm run email-server`: Start local email backend.
- `npm run db:generate | db:migrate | db:push | db:studio`: Drizzle schema/migration workflows.

## Coding Style & Naming Conventions
- Language: TypeScript (`.ts/.tsx`), React function components.
- Indentation: 2 spaces; keep imports grouped and unused code removed.
- Components/pages: `PascalCase` file names (e.g., `PatientDetailPage.tsx`).
- Hooks: `camelCase` with `use` prefix (e.g., `usePatientChat.ts`).
- Utilities/services: `camelCase` files by domain (e.g., `riskAssessment.ts`).
- Run `npm run lint` before opening a PR.

## Testing Guidelines
There is currently no automated test runner configured in `package.json` and no `*.test`/`*.spec` files yet. For now:

- Treat `npm run lint` and a successful `npm run build` as required checks.
- Manually verify affected flows (auth, dashboard, recording, notes, patient detail, image analysis).
- If adding tests, colocate them with source files using `*.test.ts(x)` naming.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commit style:
- `feat: ...`
- `fix: ...`
- `refactor: ...`
- `chore: ...`

PRs should include:
- Clear scope and summary of user-visible behavior changes.
- Linked issue/task when available.
- Screenshots or short recordings for UI changes.
- Notes on env, schema, or migration impacts (`supabase/migrations`, `drizzle/`).
