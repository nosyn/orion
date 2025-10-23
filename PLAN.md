"""# Jetson Control – Tauri App Project Plan (Context for VS Code Agent)

> **Goal:** Build a cross-platform Tauri desktop app (React + TypeScript frontend, Rust backend) to remotely manage a headless NVIDIA Jetson Nano primarily over SSH.

---

## 1. Product Scope & Outcomes

### 1.1 Primary Outcomes

- One-click connection to a headless Jetson Nano via SSH (password or key).
- Real-time dashboard: RAM, CPU, GPU (if available), temperature, uptime, power mode.
- Integrated terminal/PTY session.
- Power controls: reboot / shutdown; power-mode switch (nvpmodel).
- Wi-Fi management: scan, connect, status, basic speed test.
- System info pane: OS, kernel, CUDA, JetPack, uptime.
- File tree & basic file operations via SFTP; simple code editor.
- Docker management: list images/containers, start/stop/remove, run with args.
- Package/library wizard: basic apt + pip list/install/remove.
- Splash screen → connection wizard → main layout (sidebar, sticky header).

### 1.2 Out of Scope (Initial MVP)

- Multi-host fleet management / parallel commands.
- Complex container orchestration (compose, k8s).
- GPU metrics beyond what `tegrastats` provides.
- Full-blown VS Code remote server management (we provide a lightweight editor only).

### 1.3 Non-Goals

- Running unbounded privileged commands. Only controlled, whitelisted ops.

---

## 2. High-Level Architecture

### 2.1 App Structure

- **Frontend**: React + TypeScript + Tailwind + shadcn/ui (sidebar-16 layout).
- **Backend** (Tauri Core): Rust commands exposed via `invoke` (IPC). Uses `ssh2` for SSH/SFTP and emits events for streaming (terminal, `tegrastats`).

### 2.2 Connection Modes

- **Remote (default):** SSH to Jetson Nano (exec, SFTP, PTY).
- **Local agent (later):** Optional transport abstraction to run commands locally if the app runs on the Jetson.

### 2.3 Data Flow

- UI → `invoke(command, payload)` → Rust command → (SSH/SFTP/CLI) → JSON result.
- Streams (terminal, tegrastats) → Rust emits events → UI subscribes and renders.

### 2.4 Security Model

- Prefer SSH key auth; support password auth.
- Store secrets in Tauri plugin store (encrypted); never log secrets.
- Use `sudo -n` with limited NOPASSWD rules for specific binaries on the Jetson (nvpmodel, tegrastats, shutdown, reboot, apt).

---

## 3. UX & Navigation

### 3.1 Global

- **Splash Screen**: branded loader → configuration wizard.
- **Main Layout**: sidebar (shadcn `sidebar-16`) + sticky header (host, status, quick actions).

### 3.2 Pages (first-level nav)

1. **Dashboard** (default after connect)
   - Cards: CPU, RAM, GPU, Temp, Uptime, Power Mode.
   - Action row: Reboot, Shutdown, Power Mode select.
2. **Terminal**
   - PTY with xterm; copy/paste, clear, font size, color scheme.
3. **Files**
   - Tree view via SFTP; operations: open, rename, delete, mkdir, upload/download\*.
   - \*Download/Upload can be deferred if complex; MVP can do open/write/rename/mkdir/delete.
4. **Editor**
   - Monaco-based simple editor; syntax highlighting; save via SFTP.
5. **Wi-Fi**
   - Scan networks, connect (with password), status (SSID, IP), quick diagnostics, speed test.
6. **Docker**
   - Images list; Containers list; run/stop/remove; run dialog with args.
7. **System**
   - OS, kernel, CUDA, JetPack, hostname, uptime.
8. **Libraries**
   - Wizard: apt & pip list/install/remove.
9. **Settings**
   - Connection profiles (host, port, username, auth type, key path), security notes, logs.

---

## 4. Minimum Viable Functionality by Area (No Implementation Detail)

### 4.1 Connection & State

- Persist multiple connection profiles.
- Validate reachability & authentication.
- Handle lost connection (banner + retry button).

### 4.2 Stats Pipeline

- Start/stop `tegrastats` stream after connect.
- Parse essential metrics and push at 1s cadence.
- Keep a rolling window of N=120 data points on the UI.

### 4.3 Terminal

- Create a terminal session on demand; 1..n sessions with unique IDs.
- Support write, resize, and close. Subscribe to output event stream.

### 4.4 Files & Editor

- List directory entries with type & size; lazy-load subfolders.
- Read/write text files from/to the Jetson via SFTP.
- Basic conflict/overwrite confirmation.

### 4.5 Power Controls

- Read and set power mode (nvpmodel).
- Buttons for reboot/shutdown with confirm dialogs.

### 4.6 Wi-Fi

- Scan, show signal & security, connect to selected SSID.
- Show connection status (SSID, IP).
- Trigger simple speed test; show result textually.

### 4.7 Docker

- List images & containers.
- Run container (image + optional args).
- Stop/remove containers; remove images (with confirm).

### 4.8 Libraries Wizard

- Query apt and pip installed packages; search by filter.
- Install/remove selected packages with progress text.

---

## 5. API Surface (Frontend ↔ Backend)

> **Note:** Names and payloads only. Keep types simple (strings, numbers, bools, arrays, objects). Do not include code.

- `connect(SshConfig)` → `void | error`
- `disconnect()` → `void`
- `get_sys_info()` → `SysInfo`
- `get_power_mode()` → `string`
- `set_power_mode(mode: number)` → `void`
- `start_tegrastats_stream()` → `void` (emits `tegrastats://point` with `{ ts, cpu, ram_used_mb, ram_total_mb, gpu_util?, temp_c?, power_mode? }`)
- `stop_tegrastats_stream()` → `void`
- `terminal_open(id: string, cols: number, rows: number)` → `void` (emits `terminal://{id}` with chunk strings)
- `terminal_write(id: string, data: string)` → `void`
- `terminal_resize(id: string, cols: number, rows: number)` → `void`
- `terminal_close(id: string)` → `void`
- `list_dir(path: string)` → `[ { name, path, is_dir, size } ]`
- `read_file(path: string)` → `string`
- `write_file(path: string, content: string)` → `void`
- `rename(from: string, to: string)` → `void`
- `remove(path: string)` → `void`
- `mk_dir(path: string)` → `void`
- `docker_list_images()` → `[ { id, repo, tag, size } ]`
- `docker_list_containers()` → `[ { id, image, name, status } ]`
- `docker_run(image: string, args?: string)` → `string` (container id or output)
- `docker_stop(id: string)` → `string`
- `docker_remove(id: string)` → `string`
- `wifi_scan()` → `[ { ssid, signal, security, active } ]`
- `wifi_connect(ssid: string, password?: string)` → `string` (result text)
- `wifi_status()` → `{ connected, ssid?, ip? }`
- `net_speedtest()` → `string` (result text)
- `packages_list(kind: "apt" | "pip", query?: string)` → `string` (table text)
- `packages_install(kind: "apt" | "pip", pkg: string)` → `string` (result text)
- `packages_remove(kind: "apt" | "pip", pkg: string)` → `string` (result text)
- `shutdown()` → `void`
- `reboot()` → `void`

### 5.1 Data Models (Conceptual)

- `SshConfig`: `{ host, port, username, authType: "key" | "password", privateKeyPath?, password? }`
- `SysInfo`: `{ hostname, os, kernel, cuda?, jetpack?, uptimeSec }`
- `StatPoint`: `{ ts, cpu, ram_used_mb, ram_total_mb, gpu_util?, temp_c?, power_mode? }`

---

## 6. Milestones & Deliverables

### M1 — Scaffolding & Navigation (1–2 days)

- Tauri project; React + TS; Tailwind + shadcn/ui; `sidebar-16` layout.
- Splash screen + Connection Wizard (form only; no networking).
- Pages routed and empty states.

**Exit Criteria:** App boots; navigable UI; forms validate shape.

### M2 — SSH Core + Basic Info (1–2 days)

- Establish SSH connection; store profile securely; `get_sys_info` working.
- System page renders OS/kernel/CUDA/JetPack.

**Exit Criteria:** Connect → fetch & display system info.

### M3 — Dashboard & Streaming Stats (1–2 days)

- `tegrastats` stream; parse minimal metrics; render simple charts and cards.
- Power mode read; reboot/shutdown buttons (confirm dialog).

**Exit Criteria:** Live metrics at 1 Hz; power actions confirmed.

### M4 — Terminal (1–2 days)

- Open/close PTY; event-driven output; input handling; resize.

**Exit Criteria:** Interactive shell in-app; reasonable latency.

### M5 — Files & Editor (2 days)

- SFTP list/read/rename/mkdir/delete; Monaco editor; save works.

**Exit Criteria:** Edit a file on Jetson and confirm changes on disk.

### M6 — Wi-Fi & Networking (1–2 days)

- Scan/connect/status; simple speed test result.

**Exit Criteria:** Join a network and see active SSID/IP.

### M7 — Docker & Libraries (2 days)

- Lists for images/containers; run/stop/remove; apt/pip list/install/remove.

**Exit Criteria:** Pull & run a container; install/remove a sample package.

### M8 — Polish, Persistence, and Profiles (1 day)

- Connection profiles CRUD; logout/disconnect flow; error banners; toasts.
- Minimal logging; safe error messages; telemetry opt-in (text log files only).

**Exit Criteria:** Demo-ready MVP; documented known gaps.

---

## 7. Acceptance Criteria (per feature)

- **Connection**: Can add a profile, connect with key or password; failure shows actionable error.
- **Dashboard**: Cards update every second; charts retain last 2 minutes; power mode reflects reality after change.
- **Terminal**: Input echo; Ctrl+C works; window resize updates cols/rows.
- **Files**: Navigating large folders keeps UI responsive; rename/delete confirmations; save debounces.
- **Editor**: Language mode auto by extension; shows dirty state; save success toast or error.
- **Wi-Fi**: Scan lists SSID, signal, security; connect prompts password when needed; status shows SSID + IP.
- **Docker**: Images and containers appear with consistent columns; actions provide result text; errors surfaced.
- **Libraries**: Filtering works; install/remove show progress and final result text.
- **Settings**: Profiles persist across restarts; secrets not printed in logs.

---

## 8. Operational Assumptions (Jetson Side)

- Ubuntu with NetworkManager (`nmcli` available).
- `tegrastats`, `nvpmodel`, `shutdown`, `reboot`, `apt-get` present.
- Optional: set NOPASSWD for controlled commands in `/etc/sudoers.d/jetson-control`:
  - `nvpmodel`, `tegrastats`, `shutdown`, `reboot`, `apt-get` (install/remove), and possibly `systemctl restart NetworkManager`.
- `docker` installed for Docker features; `speedtest-cli` for speed test (optional fallback: ping).

---

## 9. Risks & Mitigations

- **Sudo prompts block non-interactive commands** → Use `sudo -n` + NOPASSWD rules; detect and show guidance if denied.
- **Different JetPack/CUDA/OS** → Feature-detect commands; fail gracefully.
- **SSH session drops** → Heartbeat + auto-retry with backoff; show reconnect banner.
- **Parsing `tegrastats` variability** → Keep regex tolerant; fallback to partial metrics.
- **SFTP large files** → Defer upload/download in MVP; add chunked transfer later.
- **Wi-Fi tools mismatch** → Prefer `nmcli`; if absent, hide Wi-Fi tab.

---

## 10. Testing Strategy

- **Unit (Rust)**: Command handlers with mocked transport.
- **Contract Tests**: Ensure each `invoke` shape and event payload matches this plan.
- **Manual E2E**: Happy path connect → dashboard → terminal → edit → docker → wifi.
- **Error Paths**: Wrong host/port/key; no sudo; absent docker/nmcli.
- **Performance**: Terminal latency subjective check; dashboard update jitter < 200ms.

---

## 11. Telemetry, Logging, and Privacy

- Local-only log file (rotating) with timestamps and anonymized error codes.
- No persistence of command outputs containing secrets.
- Explicit user toggle for logs; default minimal.

---

## 12. Future Enhancements (Post-MVP)

- Multiple Jetson hosts + quick switcher.
- File upload/download with progress, drag & drop.
- GPU utilization graphs per engine; thermal throttling indicators.
- Container build/pull UI, compose support.
- SSH jump host / bastion support.
- Role-based actions (read-only mode).

---

## 13. VS Code Agent Context Hints

### 13.1 Agent System Prompt (drop-in)

- _You are a coding agent for the “Jetson Control” Tauri app. Follow the Product Plan (this document). Do not introduce new features without updating the plan. Expose Rust commands exactly as defined under “API Surface”. Keep secrets out of logs. Provide concise commit messages per milestone. Ask for the plan when in doubt._

### 13.2 Files to Keep Open/Indexed

- `tauri.conf.json`
- `src-tauri/src/**` (commands, ssh client, models, error types)
- `src/components/layout/AppShell.tsx`
- `src/pages/**` (each tab/page)
- `src/lib/ipc.ts`, `src/lib/store.ts`, `src/lib/eventBus.ts`

### 13.3 Tasks for Autonomy

- Scaffold pages and navigation per **M1**.
- Implement commands and wire UI per milestone order.
- Maintain parity with **API Surface** contracts.
- Add toasts and error banners per **Acceptance Criteria**.

---

## 14. Definition of Done (MVP)

- All tabs functional as defined in **Minimum Viable Functionality**.
- Connection profile persists; reconnection flow exists.
- Logs are minimal, no secrets leaked.
- Readme includes: prerequisites, Jetson NOPASSWD setup, feature matrix.

---

## 15. Implementation Plan (Actionable)

### 15.1 Tooling & Versions

- Tauri: v1 (stable)
- Node: 20.x; Package manager: pnpm
- Rust: stable (latest)
- React + TS; Tailwind v3; shadcn/ui

### 15.2 Bootstrap Commands (local dev)

- Prereqs: rustup, pnpm, Xcode CLT (macOS) / MSVC (Windows), libgtk (Linux).
- Commands:
  - pnpm create tauri-app jetson-control --template react-ts
  - cd jetson-control
  - pnpm add -D tailwindcss postcss autoprefixer
  - npx tailwindcss init -p
  - pnpm add class-variance-authority clsx tailwind-merge lucide-react zustand zod sonner
  - pnpm dlx shadcn@latest init -d
  - pnpm dlx shadcn@latest add sidebar button card dialog input table textarea select tabs progress tooltip toast skeleton
  - In src-tauri/Cargo.toml add deps (see 17)
- Tailwind config content: content globs include ./index.html, ./src/\*_/_.{ts,tsx}, and shadcn paths.
- Set base font + dark theme; import Tailwind in src/index.css.

### 15.3 Repo Layout (to create)

- tauri.conf.json
- src-tauri/
  - src/main.rs
  - src/commands/mod.rs
  - src/ssh/{mod.rs, client.rs, sftp.rs, terminal.rs}
  - src/models/{mod.rs, api.rs}
  - src/errors.rs
  - src/events.rs
  - src/state.rs
  - src/utils/{parse.rs, sudo.rs, docker.rs, wifi.rs, packages.rs, sys.rs}
- src/
  - lib/{ipc.ts, eventBus.ts, store.ts, types.ts}
  - components/layout/AppShell.tsx
  - pages/{Dashboard.tsx, Terminal.tsx, Files.tsx, Editor.tsx, Wifi.tsx, Docker.tsx, System.tsx, Libraries.tsx, Settings.tsx}
  - features/{connection, dashboard, terminal, files, editor, wifi, docker, libraries, settings}/...
  - app.tsx, main.tsx, index.css

### 15.4 Ownership Map: API → Backend Modules

- connect, disconnect → ssh::client (manages ssh2::Session + SFTP + PTYs), state::AppState
- get_sys_info → utils::sys
- get_power_mode, set_power_mode → utils::sys (nvpmodel via sudo -n)
- start_tegrastats_stream, stop_tegrastats_stream → utils::sys + events
- terminal\_\* → ssh::terminal (+ events)
- list_dir/read/write/rename/remove/mk_dir → ssh::sftp
- docker\_\* → utils::docker
- wifi\_\* and net_speedtest → utils::wifi
- packages\_\* → utils::packages
- shutdown/reboot → utils::sys

### 15.5 Frontend Contracts (no change to API Surface)

- Wrap each command in lib/ipc.ts via @tauri-apps/api/tauri invoke.
- Event names per plan:
  - tegrastats://point with payload StatPoint
  - terminal://{id} with payload string chunk
- State: lib/store.ts via zustand for connection status, profile, and rolling stats buffer (N=120).
- eventBus.ts: subscribe/unsubscribe helpers with type guards.

### 15.6 Connection + Security

- Secrets stored via tauri-plugin-store with encryption key in OS keystore (if available); never log passwords/keys.
- Use sudo -n; detect exit code 1 with "a password is required" → show guidance banner for NOPASSWD rules.
- SSH keys: support key path + optional passphrase; password auth fallback.

### 15.7 Streaming & Performance

- tegrastats cadence: 1 Hz; spawn blocking reader thread; parse tolerant regex; emit events.
- Terminal: one thread per PTY; backpressure through bounded channel; trim carriage noise; handle resize.

### 15.8 Tests

- Unit (Rust): command handlers with mocked transport traits.
- Contract tests: ensure invoke shapes + event payloads match 5. API Surface.
- Manual E2E per 10. Testing Strategy; include failure paths (no sudo, absent docker/nmcli).

---

## 16. Dependencies

### 16.1 Cargo (src-tauri)

- tauri = "1"
- anyhow = "1", thiserror = "1"
- serde = { version = "1", features = ["derive"] }, serde_json = "1"
- ssh2 = "0.9"
- once_cell = "1"
- regex = "1"
- base64 = "0.22"
- tauri-plugin-store = "0.3"
- parking_lot = "0.12"
- crossbeam-channel = "0.5"
- sysinfo = "0.30"

### 16.2 Frontend (pnpm)

- react, react-dom, @tauri-apps/api
- zustand, zod
- tailwindcss, postcss, autoprefixer
- shadcn/ui deps: class-variance-authority, clsx, tailwind-merge, lucide-react
- monaco-editor, @monaco-editor/react, xterm, xterm-addon-fit
- sonner (toasts)
- date-fns (timestamps)

---

## 17. State & Events (Backend)

- state::AppState
  - ssh: Mutex<Option<SshContext>> containing Session, Sftp, map<id, TerminalSession>
  - streams: tegrastats handle, event emitters
- events:
  - "tegrastats://point" → StatPoint as defined
  - "terminal://{id}" → string chunks
- Errors: map internal errors to user-safe messages; never include secrets.

---

## 18. Persistence

- Store file (plugin-store): profiles.json
  - profiles: Array<SshConfig> with id, name, host, port, username, authType, keyPath?
  - secrets: separate store bucket keyed by profile id (password or key passphrase)
- UI: CRUD in Settings; active profile saved; last connected host persisted.

---

## 19. Milestone Checklists & Commit Messages

- M1: Scaffold + Navigation

  - Deliverables: Tauri app boots; sidebar-16 layout; pages routed with placeholders; Connection Wizard form validates shape.
  - Commit: feat(scaffold): init tauri app, tailwind, shadcn, sidebar layout and routed pages

- M2: SSH Core + Sys Info

  - Deliverables: connect/disconnect; secure profile store; get_sys_info wired to System page.
  - Commit: feat(ssh): connect/disconnect, secure profiles, system info command

- M3: Dashboard & Stats

  - Deliverables: tegrastats stream 1 Hz; power mode read/set; reboot/shutdown with confirms; 120-point rolling charts.
  - Commit: feat(dashboard): tegrastats stream + power controls; rolling metrics

- M4: Terminal

  - Deliverables: PTY open/write/resize/close; event-driven output; multi-session.
  - Commit: feat(terminal): xterm integration with SSH PTY and events

- M5: Files & Editor

  - Deliverables: SFTP list/read/rename/mkdir/delete; Monaco editor save.
  - Commit: feat(files): sftp ops and editor save flow

- M6: Wi-Fi & Networking

  - Deliverables: nmcli scan/connect/status; speed test text.
  - Commit: feat(wifi): scan/connect/status and speed test

- M7: Docker & Libraries

  - Deliverables: docker list/run/stop/remove; apt/pip list/install/remove.
  - Commit: feat(infra): docker and packages management

- M8: Polish & Persistence
  - Deliverables: profiles CRUD; disconnect flow; error banners; toasts; minimal logs.
  - Commit: chore(polish): profiles persistence, error UX, minimal logging

---

## 20. UX Notes (per Page)

- Dashboard: simple cards; sparkline charts with last 120 points; action row for power.
- Terminal: xterm with font/size controls; clear; copy/paste; theme toggle.
- Files: virtualized lists; lazy subfolder loading; confirm rename/delete.
- Editor: dirty state; save debounce; detect external change on save (SFTP stat).
- Wi-Fi: SSID/security/signal; prompt password; show IP.
- Docker: two tabs Images/Containers; consistent columns; actions render result text.
- Libraries: filter input; table text results; progress in text area.

---

## 21. Operational Safety

- All shell executions via ssh2 channel; prepend sudo -n where required; handle denial gracefully.
- Feature-detect binaries (which/command -v). If missing, hide feature tab or show disabled state.

---

## 22. Next Actions (Day 0–1)

1. Run bootstrap commands (15.2). Check app boots.
2. Add repo layout scaffolding files and minimal routes.
3. Implement src/lib/ipc.ts with no-op stubs returning Promise.reject("Not implemented") to unblock UI wiring.
4. Implement connect/disconnect + get_sys_info in Rust; wire to System page.
5. Set up basic logger (local file, rotating) with secrets scrubbed.
