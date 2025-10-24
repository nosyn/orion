## Copilot instructions for contributors and AI agents

Purpose: Give an AI coding agent the precise, repo-specific context it needs to be productive quickly.

- Canonical design & API surface: `.github/instructions/goal.md` — treat this as the single source of truth for high-level architecture, IPC shapes, and milestone commit messages.

Quick start (verified from this repo):

- Install dependencies: use your preferred package manager (pnpm is suggested in the plan):
  - `pnpm install` (or `npm install` / `yarn`)
- Start the frontend dev server: `npm run dev` (runs Vite; script found in `package.json`).
- Run the Tauri app (dev): use the Tauri CLI — either `npx tauri dev` or `npm run tauri -- dev` (package.json defines a `tauri` script that forwards to the CLI).
- Build for production: `npm run build`.

Where to look first (authors and agents):

- Frontend entry and layout

  - `src/main.tsx`, `src/app.tsx`
  - layout and navigation: `src/components/layout/app-shell.tsx`, `src/components/app-sidebar.tsx`, `src/components/site-header.tsx`
  - pages: `src/pages/*` (dashboard, terminal, files, editor, wifi, docker, system, libraries, settings)

- Frontend infra and helpers

  - IPC and wiring: `src/lib/ipc.ts` (wraps Tauri invoke)
  - event helpers & subscriptions: `src/lib/event-bus.ts`
  - app state: `src/lib/store.ts` (zustand pattern used in the plan)

- Backend (Tauri / Rust)
  - `src-tauri/src` — primary Rust code. Look for `main.rs`, `commands/mod.rs`, and modules under `src-tauri/src/ssh` and `src-tauri/src/utils`.
  - `src-tauri/Cargo.toml` — cargo dependencies such as `ssh2`, `tauri`, `serde`, `sysinfo` are declared here.

Key, discoverable conventions (do not deviate without updating `goal.md`):

- Frontend filenames use lowercase with dash separators (e.g., `app-sidebar.tsx`, `nav-main.tsx`).
- Frontend function names and React exports use camelCase (e.g., `openTerminal`, `startTegraStats`).
- IPC surface and events are defined in the plan (`.github/instructions/goal.md`) and must be respected. Notable event names:
  - `tegrastats://point` — streaming stat points
  - `terminal://{id}` — PTY output chunks for session `id`

Backend integration patterns to follow:

- SSH/SFTP/PTYS are encapsulated on the Rust side (see `src-tauri/src/ssh/*`). Changes to transport or serialization must preserve the invoke shapes and emitted events in the plan.
- Emit streaming events from Rust via Tauri events; frontend subscribes using `@tauri-apps/api` event listeners (see `src/lib/ipc.ts` and `src/lib/event-bus.ts`).

Security and logging guidance (explicit and enforced):

- Secrets (passwords, private key passphrases) are stored with `tauri-plugin-store` under an encrypted bucket — do NOT print or commit secrets into logs.
- Use `sudo -n` on the Jetson for whitelisted commands; detect and surface a helpful guidance banner when sudo requests a password (see `goal.md` for exact behavior).

Developer workflow notes (specific to this repo):

- Milestone-style commit messages are used in `goal.md` (M1..M8); prefer those scopes for feature commits (e.g., `feat(ssh): connect/disconnect, secure profiles`).
- Frontend-first edits: when adding an invoke call, add a no-op stub in `src/lib/ipc.ts` returning `Promise.reject('Not implemented')` before wiring backend — this keeps UI wiring testable.

Quick examples (where to change behavior):

- To add a new backend command:

  1. Add Rust command in `src-tauri/src/commands/mod.rs` and implement in an appropriate module (e.g., `ssh`, `utils`).
  2. Export it to Tauri in `main.rs` so the frontend can call it via `invoke`.
  3. Add a matching wrapper in `src/lib/ipc.ts` for typed calls and update frontend usage.

- To add a new UI page: add the route file in `src/pages/` and wire it into the sidebar in `src/components/app-sidebar.tsx` and `src/components/layout/app-shell.tsx`.

If you are an AI agent: focus on maintainable, minimal edits that preserve public APIs and follow the plan in `.github/instructions/goal.md`. When in doubt about global design, open `goal.md` and follow the section "API Surface" and "Implementation Plan".

Questions or unclear spots: after reading this file and `goal.md`, tell me which specific area you want expanded (examples: IPC types in `src/lib/ipc.ts`, event emission in Rust, or the exact `tauri` dev command that should be used on your machine).
