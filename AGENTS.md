# Repository Guidance for Agents

## Code Review & Architecture Rules

### 1. Cordis Plugin Lifecycle Hygiene
- Every DOM node, observer, interval timer, style mutation, event listener, and slot injection registered by `dsh-peak` must be strictly skin/plugin-owned state.
- In `apply(ctx)`, every side effect must be wrapped in `ctx.effect(() => () => { ... })` or returned as an uninstaller disposer.
- When the plugin is deactivated or hot-reloaded, it must completely restore previous state, remove all injected DOM elements, and clear all active timers. No orphan intervals or memory leaks are permitted.

### 2. Product Compatibility & Safety
- `dsh-peak` is a presentation, metrics, and helper service plugin.
- It must never alter native DeepSeek Harness model requests, block native overlays, intercept user input, or break layout across narrow/wide sidebars, mobile/desktop viewports, and light/dark theme modes.
- Fallbacks must exist for DOM slot injection: if a designated slot is not found, it must degrade gracefully without throwing uncaught exceptions.

### 3. Distribution & Build Standards
- `lib/index.js`, `lib/client.js`, and `lib/types/` are committed distribution artifacts to ensure consumers can install and use the plugin without requiring sibling monorepo dependencies or local build tools.
- When changing files in `src/`, always run `pnpm test`, `pnpm run typecheck`, and `pnpm run build` to keep committed bundles synchronized.
