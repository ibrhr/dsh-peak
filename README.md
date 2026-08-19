# dsh-peak

<p align="center">
  <img src="https://img.shields.io/badge/DSH-Plugin-blue?style=for-the-badge&logo=deepseek" alt="DSH Plugin" />
  <img src="https://img.shields.io/badge/Discount-50%25%20OFF-10b981?style=for-the-badge" alt="50% Off Peak Discount" />
  <img src="https://img.shields.io/badge/Cordis-v4-purple?style=for-the-badge" alt="Cordis v4" />
  <img src="https://img.shields.io/badge/License-BSD--3--Clause-green?style=for-the-badge" alt="License" />
</p>

`dsh-peak` is a lightweight, theme-adaptive status indicator and rate-monitoring plugin for **DeepSeek Harness (DSH)**.

DeepSeek API offers a **50% discount** on token pricing during off-peak hours. `dsh-peak` seamlessly integrates into the DSH Web UI header right beside your session mode tag, showing real-time discount status, dynamic transition countdowns, multi-timezone clocks, and DeepSeek-V4 model rate cards. It also exposes a Node service API for host agents and automated batch dispatchers.

---

## Features

- **Understated & Native Design**: Built using DSH design tokens (`--dsw-*`), allowing it to automatically blend with any active skin or theme (including dark, light, and custom monorepo skins like `maid-atelier`).
- **Seamless Header Integration**: Placed directly to the right of the session title and mode tag, participating in normal header flex flow without overlapping action buttons.
- **Accurate Real-Time Status**: Millisecond-accurate evaluation of DeepSeek's official UTC peak/off-peak windows with live countdown timers (`● Off-peak · 10h 32m` / `● Peak · 1h 14m`).
- **Interactive Details Popover**: Click the badge to open a floating panel with synchronized UTC (billing standard), Beijing (CST / UTC+8), and Local browser clocks.
- **DeepSeek-V4 Rate Matrix**: Reference pricing for DeepSeek-V4 Flash and DeepSeek-V4 Pro across Cache Hit, Cache Miss, and Output tokens.
- **Strict Cordis Lifecycle Hygiene**: Zero orphan timers or DOM leaks on hot-reload or plugin disposal via `ctx.effect(() => () => { ... })`.
- **Integrated AI Agent Skill**: Includes `.agents/skills/dsh-peak-install` for automated AI installation and scheduling.
- **Zero-Build Distribution**: Ships pre-compiled in `lib/` for instant installation without local compiler requirements.

---

## DeepSeek API Peak & Off-Peak Schedule

DeepSeek API pricing is evaluated against **UTC Standard Time**:

| Window | UTC Time | Beijing Time (CST / UTC+8) | Pricing Rate | Status |
|---|---|---|---|:---:|
| **Morning Off-Peak** | `00:00 – 01:00 UTC` | `08:00 – 09:00 CST` | **50% Discount** | `Off-peak` |
| **Morning Peak** | `01:00 – 04:00 UTC` | `09:00 – 12:00 CST` | Standard (100%) | `Peak` |
| **Midday Off-Peak** | `04:00 – 06:00 UTC` | `12:00 – 14:00 CST` | **50% Discount** | `Off-peak` |
| **Afternoon Peak** | `06:00 – 10:00 UTC` | `14:00 – 18:00 CST` | Standard (100%) | `Peak` |
| **Evening / Night Off-Peak** | `10:00 – 24:00 UTC` | `18:00 – 08:00 (+1d)` | **50% Discount** | `Off-peak` |

---

## DeepSeek-V4 Token Pricing Reference

*Rates per 1 Million tokens in USD:*

| Model | Token Type | Peak Rate | Off-Peak Rate (50% OFF) |
|---|---|---|:---:|
| **DeepSeek-V4 Flash** | Input (Cache Hit) | $0.014 | **$0.007** |
| | Input (Cache Miss) | $0.440 | **$0.220** |
| | Output | $1.320 | **$0.660** |
| **DeepSeek-V4 Pro** | Input (Cache Hit) | $0.044 | **$0.022** |
| | Input (Cache Miss) | $1.320 | **$0.660** |
| | Output | $3.960 | **$1.980** |

---

## Installation

### Method 1: DSH CLI (Recommended)

In your `deepseek-harness` root directory, run:

```sh
pnpm dsh plugin --profile web add github:ibrhr/dsh-peak
```

> The DSH CLI will automatically register `@dsh-external/dsh-peak` into your profile's `dsh.profile.bundles`.

### Method 2: AI Agent Automation

Since this repository ships with an agent skill, prompt your DSH Agent:
> *"Install this plugin: https://github.com/ibrhr/dsh-peak"*

### Method 3: Manual Profile Setup

1. Add `@dsh-external/dsh-peak` to `~/.dsh/profiles/web/package.json`:
   ```json
   {
     "dependencies": {
       "@dsh-external/dsh-peak": "github:ibrhr/dsh-peak"
     }
   }
   ```
2. Add the bundle entry into `dsh.profile.bundles`:
   ```json
   {
     "dsh": {
       "profile": {
         "bundles": [
           "@deepseek-ai/dsh-base",
           "@deepseek-ai/dsh-web-app",
           "@dsh-external/dsh-peak"
         ]
       }
     }
   }
   ```
3. Run `pnpm install` in `~/.dsh/profiles/web` and restart `dsh web`.

---

## Programmatic API (Host / Node / Agents)

`dsh-peak` exposes a comprehensive Node and TypeScript API for batch processors, automation scripts, and custom agent workflows:

```ts
import { isPeak, getPeakStatus, calculateTokenSavings, DEEPSEEK_MODELS } from '@dsh-external/dsh-peak'

// 1. Quick boolean check
if (isPeak()) {
  console.log('Peak pricing is active. Consider delaying heavy batch tasks to off-peak hours.')
} else {
  console.log('50% Off-peak discount is active!')
}

// 2. Full status inspection
const status = getPeakStatus()
console.log(`Current state: ${status.state}`)                  // 'OFF_PEAK' | 'PEAK'
console.log(`Discount: ${status.discountPercent}%`)            // 50 | 0
console.log(`Time to next transition: ${status.formattedCountdown}`) // e.g. "1h 24m"
console.log(`UTC Time: ${status.timeInfo.utcTime}`)
console.log(`Beijing Time: ${status.timeInfo.beijingTime}`)
console.log(`Local Time: ${status.timeInfo.localTime}`)

// 3. Token cost and savings estimation
const savings = calculateTokenSavings({
  inputTokens: 1_000_000,
  outputTokens: 500_000,
  cacheHitRatio: 0.8,
  modelId: 'deepseek-v4-flash',
})

console.log(`Peak cost: $${savings.peakCostUSD.toFixed(4)}`)
console.log(`Off-peak cost: $${savings.offPeakCostUSD.toFixed(4)}`)
console.log(`Estimated savings: $${savings.savingsUSD.toFixed(4)} (${savings.savingsPercent}% off)`)
```

---

## Development & Testing

```sh
# Install dependencies
pnpm install

# Run Vitest test suites
pnpm test

# Type check
pnpm run typecheck

# Build pre-compiled bundles to lib/
pnpm run build
```

---

## License & Attribution

This project is licensed under the [BSD-3-Clause License](./LICENSE).  
For architectural invariants and Cordis effect lifecycle rules, see [AGENTS.md](./AGENTS.md).
