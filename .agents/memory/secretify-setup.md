---
name: Secretify project setup
description: Vite dev server config, package paths, workflow setup for Secretify app
---

**Setup:** React 18 + Vite 5 + TypeScript + Tailwind + Framer Motion + Zustand (persist) + React Router DOM v6.

**Vite port:** 5000, host 0.0.0.0, allowedHosts: true (required for Replit proxy).

**Package path quirk:** Vite binary is at `/home/runner/workspace/node_modules/.bin/vite` (workspace root), NOT inside `secretify-app/node_modules/.bin/`. Workflow command: `cd secretify-app && node_modules/.bin/vite || npx vite`.

**Why:** Replit installed packages at workspace root during setup, not inside the app subfolder.

**How to apply:** If vite fails to find binary, use `npx vite` as fallback or reference the workspace-root path.
