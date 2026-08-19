---
name: dsh-peak-install
description: Install, configure, or query the dsh-peak plugin for DeepSeek Harness (DSH). Tells whether DeepSeek API is currently on-peak or off-peak (50% discount), displays transition countdowns, and automates plugin registration for DSH Web.
---

# dsh-peak: DeepSeek API Peak Status & Discount Guide

This skill guides DeepSeek Harness (DSH) agents to monitor, query, and install the `dsh-peak` status indicator plugin.

---

## 1. DeepSeek API Peak / Off-Peak Schedule Rules

DeepSeek's API utilizes a dynamic pricing structure where **Off-Peak hours receive a 50% discount** across all token types (Cache Hit, Cache Miss, and Output).

### Official UTC Schedule (Standard)
- **Morning Peak**: `01:00 – 04:00 UTC` (Beijing Time: `09:00 – 12:00 CST`)
- **Afternoon Peak**: `06:00 – 10:00 UTC` (Beijing Time: `14:00 – 18:00 CST`)
- **Off-Peak (50% OFF)**: All other hours (`00:00–01:00`, `04:00–06:00`, `10:00–24:00` UTC)

### DeepSeek-V4 Rate Reference (USD per 1M tokens)

| Model | Token Type | Peak Rate | Off-Peak Rate (50% OFF) |
|---|---|---|---|
| **DeepSeek-V4 Flash** | Input (Cache Hit) | $0.014 | **$0.007** |
| | Input (Cache Miss) | $0.440 | **$0.220** |
| | Output | $1.320 | **$0.660** |
| **DeepSeek-V4 Pro** | Input (Cache Hit) | $0.044 | **$0.022** |
| | Input (Cache Miss) | $1.320 | **$0.660** |
| | Output | $3.960 | **$1.980** |

---

## 2. How to Install `dsh-peak` into DSH Web

### Quick Installation via DSH CLI

Run the following command inside your DSH environment:

```sh
pnpm dsh plugin --profile web add github:ibrhr/dsh-peak
```

### Manual Configuration via Profile Bundles

1. Add `@dsh-external/dsh-peak` to `~/.dsh/profiles/web/package.json`:
   ```json
   {
     "dependencies": {
       "@dsh-external/dsh-peak": "github:ibrhr/dsh-peak"
     }
   }
   ```
2. Include in profile bundles:
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
