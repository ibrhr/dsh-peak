# dsh-peak · DeepSeek API 峰谷时段指示插件

<p align="center">
  <img src="https://img.shields.io/badge/DSH-Plugin-blue?style=for-the-badge&logo=deepseek" alt="DSH Plugin" />
  <img src="https://img.shields.io/badge/Discount-50%25%20OFF-10b981?style=for-the-badge" alt="50% Off Peak Discount" />
  <img src="https://img.shields.io/badge/Cordis-v4-purple?style=for-the-badge" alt="Cordis v4" />
  <img src="https://img.shields.io/badge/License-BSD--3--Clause-green?style=for-the-badge" alt="License" />
</p>

`dsh-peak` 是专为 **DeepSeek Harness (DSH)** 打造的高性能、热插拔 API 峰谷计费状态指示插件。

DeepSeek API 在**优惠时段（Off-Peak）提供高达 50%（半价）的 Token 费率折扣**。`dsh-peak` 为 DSH Web UI 提供实时状态指示徽章、倒计时切换提醒、UTC/北京/本地多时区时钟对照、全模型费率对比卡片，并为后台任务与 Agent 提供一键查询的 Node 服务接口。

---

[English](#english-documentation) · [中文说明](#中文文档)

---

<a name="中文文档"></a>
## 🌟 核心特性

- 🟢 **实时峰谷状态指示**：直观展示当前处于 `🟢 优惠时段 (50% OFF)` 还是 `🔴 高峰时段`，毫秒级精准判定。
- ⏳ **动态倒计时提醒**：实时计算距离下次费率切换（如"距优惠开启 1h 24m"或"距结束 3h 12m"）的剩余时间。
- 🕒 **多时区对照表**：一览 UTC 计费基准时间、北京时间 (CST / UTC+8) 及浏览器本地时间。
- 💰 **全模型价格矩阵**：内置 DeepSeek-V4 Flash / Pro、DeepSeek-V3 / R1 等模型的缓存命中、未命中及输出 Token 费率卡与省钱计算器。
- ⚡ **无缝 Cordis 生命周期**：遵循 Cordis `ctx.effect` 规范，热切换与卸载时 100% 自动还原 DOM，无内存泄漏与孤儿定时器。
- 🤖 **内置 Agent 技能**：随仓附带 `.agents/skills/dsh-peak-install` 技能，让 DSH 内部的 AI 能够一键自动安装、解释费率或规划低成本批量任务。
- 📦 **零构建即装即用**：遵循社区规范预编译发布 `lib/` 产物，安装无需本地编译环境。

---

## ⏰ DeepSeek 官方峰谷计费规则对照

DeepSeek API 计费以 **UTC 标准时间** 为准：

| 时段类型 | UTC 时间 | 北京时间 (UTC+8) | 计费费率 | 状态徽标 |
|---|---|---|---|:---:|
| **早间优惠** | `00:00 – 01:00 UTC` | `08:00 – 09:00 CST` | **50% 半价优惠** | 🟢 优惠时段 |
| **上午高峰** | `01:00 – 04:00 UTC` | `09:00 – 12:00 CST` | 标准费率 (100%) | 🔴 高峰时段 |
| **午间优惠** | `04:00 – 06:00 UTC` | `12:00 – 14:00 CST` | **50% 半价优惠** | 🟢 优惠时段 |
| **下午高峰** | `06:00 – 10:00 UTC` | `14:00 – 18:00 CST` | 标准费率 (100%) | 🔴 高峰时段 |
| **晚间/夜间优惠** | `10:00 – 24:00 UTC` | `18:00 – 08:00 (+1d)` | **50% 半价优惠** | 🟢 优惠时段 |

### 📊 模型价格对比表 (每 100 万 Token / 美元)

| 模型 | Token 类型 | 高峰期原价 | **优惠期特价 (50% OFF)** |
|---|---|---|:---:|
| **DeepSeek-V4 Flash** | 输入 (缓存命中) | $0.014 | **$0.007** |
| | 输入 (缓存未命中) | $0.440 | **$0.220** |
| | 输出 | $1.320 | **$0.660** |
| **DeepSeek-V4 Pro** | 输入 (缓存命中) | $0.044 | **$0.022** |
| | 输入 (缓存未命中) | $1.320 | **$0.660** |
| | 输出 | $3.960 | **$1.980** |
| **DeepSeek Chat (V3)** | 输入 (缓存命中) | $0.014 | **$0.007** |
| | 输入 (缓存未命中) | $0.280 | **$0.140** |
| | 输出 | $1.100 | **$0.550** |
| **DeepSeek Reasoner (R1)** | 输入 (缓存命中) | $0.014 | **$0.007** |
| | 输入 (缓存未命中) | $0.550 | **$0.275** |
| | 输出 | $2.190 | **$1.095** |

---

## 🚀 安装指南

### 方式一：DSH 命令行一键安装（推荐）

在你的 DSH 根目录执行：

```sh
# 本地路径安装
dsh plugin --profile web add /path/to/dsh-peak

# 或通过 GitHub 安装
dsh plugin --profile web add github:dsh-external/dsh-peak
```

> `dsh plugin` 会自动将包声明追加至 profile 的 `dsh.profile.bundles` 中并自动生效。

### 方式二：AI 自动安装

由于本仓库自带 `.agents/skills/dsh-peak-install` 技能，直接对你的 DSH Agent 说：
```
安装一下这个插件：https://github.com/dsh-external/dsh-peak
```
Agent 将自动检测环境、配置 bundle 并挂载插件。

### 方式三：手动配置

1. 在 `~/.dsh/profiles/web/package.json` 的 `dependencies` 中添加：
   ```json
   {
     "dependencies": {
       "@dsh-external/dsh-peak": "file:../dsh-peak"
     }
   }
   ```
2. 在 `dsh.profile.bundles` 中追加端点：
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
3. 在 `~/.dsh/profiles/web` 目录下执行 `pnpm install` 并重启 `dsh web`。

---

## 💻 代码与 API 使用

除了 Web UI 徽章外，`dsh-peak` 提供了完整的 Node/TypeScript API：

```ts
import { isPeak, getPeakStatus, calculateTokenSavings, DEEPSEEK_MODELS } from '@dsh-external/dsh-peak'

// 1. 快速判断当前是否处于高峰期
if (isPeak()) {
  console.log('当前为高峰期，建议将大批量任务延后至优惠期执行以节省 50% 费用')
} else {
  console.log('优惠时段进行中，享半价折扣！')
}

// 2. 获取完整的时段状态与倒计时
const status = getPeakStatus()
console.log(`当前状态: ${status.state}`)                  // 'OFF_PEAK' | 'PEAK'
console.log(`折扣比例: ${status.discountPercent}%`)          // 50 | 0
console.log(`切换倒计时: ${status.formattedCountdown}`)      // '1h 24m'
console.log(`UTC时间: ${status.timeInfo.utcTime}`)
console.log(`北京时间: ${status.timeInfo.beijingTime}`)

// 3. 计算 Token 节省费用
const savings = calculateTokenSavings({
  inputTokens: 1_000_000,
  outputTokens: 500_000,
  cacheHitRatio: 0.8,
  modelId: 'deepseek-v4-flash',
})
console.log(`高峰期费用: $${savings.peakCostUSD.toFixed(4)}`)
console.log(`优惠期费用: $${savings.offPeakCostUSD.toFixed(4)}`)
console.log(`直接节省: $${savings.savingsUSD.toFixed(4)} (节省 ${savings.savingsPercent}%)`)
```

---

<a name="english-documentation"></a>
## 🌐 English Documentation

`dsh-peak` is an official-standard plugin for **DeepSeek Harness (DSH)** that monitors and highlights the real-time **Peak vs. Off-Peak** pricing windows of the DeepSeek API.

### Key Features
- **Real-Time Visual Pill**: Shows live `🟢 OFF-PEAK (50% OFF)` or `🔴 PEAK` state in DSH Web UI.
- **Accurate Countdown**: Dynamic timer showing remaining time until next rate transition.
- **Timezone Clocks**: Live synchronized clocks for UTC, Beijing (CST / UTC+8), and Local time.
- **Full Model Rate Card**: Quick reference matrix for DeepSeek V4 Flash/Pro, V3, and R1.
- **Cordis Lifecycle**: 100% safe cleanup via `ctx.effect(() => () => { ... })` with zero leaks.
- **DSH Agent Skills**: Ready-to-use skill in `.agents/skills/` for AI-assisted workflow optimization.

### CLI Installation
```sh
cd <your-harness-workspace>
dsh plugin --profile web add github:dsh-external/dsh-peak
```

---

## 🛠️ 开发与测试 (Development & Testing)

```sh
# 安装依赖
pnpm install

# 运行全套单元与集成测试 (Vitest)
pnpm test

# 类型检查
pnpm run typecheck

# 编译构建发布产物至 lib/
pnpm run build
```

---

## 📄 许可证与署名 (License & Notice)

本项目基于 [BSD-3-Clause](./LICENSE) 协议开源。
更多信息与规范参见 [NOTICE](./NOTICE) 和 [AGENTS.md](./AGENTS.md)。
