window.__ModuleLoader__.load({
	id: "@dsh-external/dsh-peak",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react = require("react");
		react = __toESM(react, 1);
		let react_dom_client = require("react-dom/client");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/core/format.ts
		/**
		* Formatting utilities for time, countdowns, and token pricing.
		*/
		/**
		* Format milliseconds remaining into a concise human-readable countdown.
		* Examples:
		* - "2h 15m" (en) / "2小时15分" (zh)
		* - "45m 20s" (en) / "45分20秒" (zh)
		* - "< 1m" (en) / "< 1分钟" (zh)
		*/
		function formatCountdown(ms, locale = "en", includeSeconds = false) {
			if (ms <= 0) return locale === "zh" ? "即将切换" : "Now";
			const totalSeconds = Math.floor(ms / 1e3);
			const hours = Math.floor(totalSeconds / 3600);
			const minutes = Math.floor(totalSeconds % 3600 / 60);
			const seconds = totalSeconds % 60;
			if (hours > 0) {
				if (includeSeconds) return locale === "zh" ? `${hours}小时${minutes}分${seconds}秒` : `${hours}h ${minutes}m ${seconds}s`;
				return locale === "zh" ? `${hours}小时${minutes}分` : `${hours}h ${minutes}m`;
			}
			if (minutes > 0) {
				if (includeSeconds) return locale === "zh" ? `${minutes}分${seconds}秒` : `${minutes}m ${seconds}s`;
				return locale === "zh" ? `${minutes}分钟` : `${minutes}m`;
			}
			if (includeSeconds && seconds > 0) return locale === "zh" ? `${seconds}秒` : `${seconds}s`;
			return locale === "zh" ? "< 1分钟" : "< 1m";
		}
		/**
		* Format a Date object to "HH:mm:ss" in specified timeZone.
		*/
		function formatClockTime(date, timeZone, includeSeconds = true) {
			try {
				const options = {
					hour: "2-digit",
					minute: "2-digit",
					second: includeSeconds ? "2-digit" : void 0,
					hour12: false,
					timeZone
				};
				return new Intl.DateTimeFormat("en-GB", options).format(date);
			} catch {
				const h = String(date.getUTCHours()).padStart(2, "0");
				const m = String(date.getUTCMinutes()).padStart(2, "0");
				const s = String(date.getUTCSeconds()).padStart(2, "0");
				return includeSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
			}
		}
		//#endregion
		//#region src/core/schedule.ts
		/**
		* Standard DeepSeek Official API Windows (UTC).
		* - Peak 1: 01:00 - 04:00 UTC (09:00 - 12:00 Beijing UTC+8)
		* - Peak 2: 06:00 - 10:00 UTC (14:00 - 18:00 Beijing UTC+8)
		* - Off-Peak: 00:00 - 01:00, 04:00 - 06:00, 10:00 - 24:00 UTC (50% token discount)
		*/
		const OFFICIAL_UTC_WINDOWS = [
			{
				start: "00:00",
				end: "01:00",
				startMinute: 0,
				endMinute: 60,
				state: "OFF_PEAK",
				label: "Early Morning Off-Peak (50% OFF)"
			},
			{
				start: "01:00",
				end: "04:00",
				startMinute: 60,
				endMinute: 240,
				state: "PEAK",
				label: "Morning Peak Window (09:00–12:00 CST)"
			},
			{
				start: "04:00",
				end: "06:00",
				startMinute: 240,
				endMinute: 360,
				state: "OFF_PEAK",
				label: "Midday Off-Peak (50% OFF)"
			},
			{
				start: "06:00",
				end: "10:00",
				startMinute: 360,
				endMinute: 600,
				state: "PEAK",
				label: "Afternoon Peak Window (14:00–18:00 CST)"
			},
			{
				start: "10:00",
				end: "24:00",
				startMinute: 600,
				endMinute: 1440,
				state: "OFF_PEAK",
				label: "Evening & Night Off-Peak (50% OFF)"
			}
		];
		/**
		* Legacy DeepSeek API Windows (Beijing Time UTC+8: 00:30-08:30 Off-Peak).
		* Converted to UTC:
		* - 00:00 - 00:30 UTC: Off-Peak (08:00 - 08:30 CST)
		* - 00:30 - 16:30 UTC: Peak (08:30 - 00:30 CST)
		* - 16:30 - 24:00 UTC: Off-Peak (00:30 - 08:00 CST)
		*/
		const LEGACY_BEIJING_WINDOWS = [
			{
				start: "00:00",
				end: "00:30",
				startMinute: 0,
				endMinute: 30,
				state: "OFF_PEAK",
				label: "Legacy Early Morning Off-Peak"
			},
			{
				start: "00:30",
				end: "16:30",
				startMinute: 30,
				endMinute: 990,
				state: "PEAK",
				label: "Legacy Daytime Peak (08:30–00:30 CST)"
			},
			{
				start: "16:30",
				end: "24:00",
				startMinute: 990,
				endMinute: 1440,
				state: "OFF_PEAK",
				label: "Legacy Overnight Off-Peak (50% OFF)"
			}
		];
		/**
		* Get the windows list for a given schedule type.
		*/
		function getScheduleWindows(scheduleType = "official_utc") {
			return scheduleType === "legacy_beijing" ? LEGACY_BEIJING_WINDOWS : OFFICIAL_UTC_WINDOWS;
		}
		/**
		* Get synchronized time information across UTC, Beijing, and Local timezones.
		*/
		function getTimeInfo(date = /* @__PURE__ */ new Date()) {
			let localTz = "UTC";
			try {
				localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
			} catch {
				localTz = "UTC";
			}
			return {
				timestamp: date,
				iso: date.toISOString(),
				utcTime: formatClockTime(date, "UTC", true),
				beijingTime: formatClockTime(date, "Asia/Shanghai", true),
				localTime: formatClockTime(date, localTz, true),
				timeZone: localTz
			};
		}
		/**
		* Core function: evaluates the Peak / Off-Peak status at any given timestamp.
		*/
		function getPeakStatus(targetDate = /* @__PURE__ */ new Date(), config = {}, locale = "en") {
			const scheduleType = config.scheduleType || "official_utc";
			const windows = getScheduleWindows(scheduleType);
			const utcHours = targetDate.getUTCHours();
			const utcMinutes = targetDate.getUTCMinutes();
			const utcSeconds = targetDate.getUTCSeconds();
			const utcMs = targetDate.getUTCMilliseconds();
			const currentMinuteFloat = utcHours * 60 + utcMinutes + (utcSeconds + utcMs / 1e3) / 60;
			let currentIndex = windows.findIndex((w) => currentMinuteFloat >= w.startMinute && currentMinuteFloat < w.endMinute);
			if (currentIndex === -1) currentIndex = 0;
			const currentWindow = windows[currentIndex];
			const isPeak = currentWindow.state === "PEAK";
			const state = currentWindow.state;
			const discountPercent = state === "OFF_PEAK" ? 50 : 0;
			const nextWindow = windows[(currentIndex + 1) % windows.length];
			const minutesRemaining = currentWindow.endMinute - currentMinuteFloat;
			const timeToNextChangeMs = Math.max(0, Math.floor(minutesRemaining * 60 * 1e3));
			return {
				state,
				isPeak,
				discountPercent,
				currentWindow,
				nextWindow,
				nextTransitionTime: new Date(targetDate.getTime() + timeToNextChangeMs),
				timeToNextChangeMs,
				formattedCountdown: formatCountdown(timeToNextChangeMs, locale),
				scheduleType,
				timeInfo: getTimeInfo(targetDate)
			};
		}
		//#endregion
		//#region src/client/locales.ts
		const en = {
			offPeak: "OFF-PEAK",
			peak: "PEAK",
			discountBadge: "50% OFF",
			normalRate: "Standard Rate",
			nextOffPeakIn: "Off-peak in",
			endsIn: "Ends in",
			utcClock: "UTC",
			beijingClock: "Beijing (CST)",
			localClock: "Local",
			officialSchedule: "Official Schedule (UTC)",
			legacySchedule: "Legacy Schedule (CST)",
			morningPeak: "01:00 - 04:00 UTC (09:00 - 12:00 CST)",
			afternoonPeak: "06:00 - 10:00 UTC (14:00 - 18:00 CST)",
			offPeakAllOther: "All other hours are 50% OFF",
			pricingTitle: "DeepSeek API Token Rates (per 1M tokens)",
			model: "Model",
			cacheHit: "Cache Hit",
			cacheMiss: "Cache Miss",
			output: "Output",
			close: "Close",
			statusTitle: "DeepSeek API Pricing Status",
			tipHeading: "Cost Optimization Tip",
			tipText: "Schedule high-volume batch prompts, dataset generation, and indexing during off-peak hours to reduce API token costs by 50%."
		};
		const zh = {
			offPeak: "优惠时段",
			peak: "高峰时段",
			discountBadge: "半价 50% OFF",
			normalRate: "原价计费",
			nextOffPeakIn: "距优惠开启",
			endsIn: "距结束",
			utcClock: "UTC 标准时间",
			beijingClock: "北京时间 (CST)",
			localClock: "本地时间",
			officialSchedule: "官方规则 (UTC 计费)",
			legacySchedule: "经典规则 (北京时间)",
			morningPeak: "01:00 - 04:00 UTC (09:00 - 12:00 北京时间)",
			afternoonPeak: "06:00 - 10:00 UTC (14:00 - 18:00 北京时间)",
			offPeakAllOther: "其余所有时段享受 50% 半价优惠",
			pricingTitle: "DeepSeek 模型价格表 (每 100 万 Token / 美元)",
			model: "模型",
			cacheHit: "命中缓存",
			cacheMiss: "未命中缓存",
			output: "输出 Token",
			close: "关闭",
			statusTitle: "DeepSeek API 峰谷计费状态",
			tipHeading: "省钱建议",
			tipText: "将批量任务、RAG 知识库构建和高消耗 Agent 运行调度在优惠时段，可直接节省 50% 的 API 费用。"
		};
		//#endregion
		//#region src/core/pricing.ts
		/**
		* Official DeepSeek API Model Rate Cards (USD per 1M tokens).
		* Off-peak hours receive a 50% discount across cache hit, cache miss, and output tokens.
		*/
		const DEEPSEEK_MODELS = {
			"deepseek-v4-flash": {
				modelId: "deepseek-v4-flash",
				name: "DeepSeek-V4 Flash",
				currency: "$",
				discountPercent: 50,
				peak: {
					inputCacheHit: .014,
					inputCacheMiss: .44,
					output: 1.32
				},
				offPeak: {
					inputCacheHit: .007,
					inputCacheMiss: .22,
					output: .66
				}
			},
			"deepseek-v4-pro": {
				modelId: "deepseek-v4-pro",
				name: "DeepSeek-V4 Pro",
				currency: "$",
				discountPercent: 50,
				peak: {
					inputCacheHit: .044,
					inputCacheMiss: 1.32,
					output: 3.96
				},
				offPeak: {
					inputCacheHit: .022,
					inputCacheMiss: .66,
					output: 1.98
				}
			},
			"deepseek-chat": {
				modelId: "deepseek-chat",
				name: "DeepSeek Chat (V3)",
				currency: "$",
				discountPercent: 50,
				peak: {
					inputCacheHit: .014,
					inputCacheMiss: .28,
					output: 1.1
				},
				offPeak: {
					inputCacheHit: .007,
					inputCacheMiss: .14,
					output: .55
				}
			},
			"deepseek-reasoner": {
				modelId: "deepseek-reasoner",
				name: "DeepSeek Reasoner (R1)",
				currency: "$",
				discountPercent: 50,
				peak: {
					inputCacheHit: .014,
					inputCacheMiss: .55,
					output: 2.19
				},
				offPeak: {
					inputCacheHit: .007,
					inputCacheMiss: .275,
					output: 1.095
				}
			}
		};
		//#endregion
		//#region \0dsh-css:/media/ibrahim/Data/Projects/deepseek/dsh-peak/src/client/PeakBadge.module.css.mjs
		const css = ".hOnQKG_badgeContainer{user-select:none;z-index:9999;align-items:center;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;display:inline-flex;position:relative}.hOnQKG_pill{cursor:pointer;-webkit-backdrop-filter:blur(8px);border:1px solid #0000;border-radius:9999px;align-items:center;gap:6px;padding:4px 10px;font-size:12px;font-weight:500;transition:all .2s cubic-bezier(.4,0,.2,1);display:inline-flex;box-shadow:0 2px 6px #00000014}.hOnQKG_pill:hover{transform:translateY(-1px);box-shadow:0 4px 12px #00000024}.hOnQKG_pill:active{transform:translateY(0)}.hOnQKG_offPeak{color:#059669;background:#10b9811f;border-color:#10b98159}[data-ds-dark-theme=true] .hOnQKG_offPeak,.dark .hOnQKG_offPeak,[data-theme=dark] .hOnQKG_offPeak{color:#34d399;background:#10b9812e;border-color:#34d39966}.hOnQKG_peak{color:#dc2626;background:#ef44441a;border-color:#ef44444d}[data-ds-dark-theme=true] .hOnQKG_peak,.dark .hOnQKG_peak,[data-theme=dark] .hOnQKG_peak{color:#f87171;background:#ef44442e;border-color:#f8717159}.hOnQKG_dot{border-radius:50%;width:7px;height:7px;position:relative}.hOnQKG_offPeak .hOnQKG_dot{background-color:#10b981;box-shadow:0 0 8px #10b981}.hOnQKG_peak .hOnQKG_dot{background-color:#ef4444;box-shadow:0 0 8px #ef4444}.hOnQKG_discountTag{color:#fff;letter-spacing:.2px;background:#10b981;border-radius:4px;padding:1px 5px;font-size:10px;font-weight:700}.hOnQKG_countdownText{opacity:.85;font-variant-numeric:tabular-nums}.hOnQKG_popover{color:#1f2937;z-index:10000;background:#fff;border:1px solid #0000001a;border-radius:12px;width:330px;padding:14px;font-size:13px;line-height:1.5;animation:.15s ease-out hOnQKG_fadeIn;position:absolute;top:calc(100% + 8px);right:0;box-shadow:0 12px 30px #00000026}[data-ds-dark-theme=true] .hOnQKG_popover,.dark .hOnQKG_popover,[data-theme=dark] .hOnQKG_popover{color:#e5e7eb;background:#1e222d;border-color:#ffffff1f;box-shadow:0 12px 36px #00000073}@keyframes hOnQKG_fadeIn{0%{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}.hOnQKG_popoverHeader{border-bottom:1px solid #00000014;justify-content:space-between;align-items:center;margin-bottom:10px;padding-bottom:8px;display:flex}[data-ds-dark-theme=true] .hOnQKG_popoverHeader,.dark .hOnQKG_popoverHeader,[data-theme=dark] .hOnQKG_popoverHeader{border-bottom-color:#ffffff14}.hOnQKG_popoverTitle{align-items:center;gap:6px;font-size:14px;font-weight:600;display:flex}.hOnQKG_closeButton{cursor:pointer;color:inherit;opacity:.5;background:0 0;border:none;border-radius:4px;padding:2px 6px;font-size:14px}.hOnQKG_closeButton:hover{opacity:1;background:#0000000d}.hOnQKG_clocksGrid{text-align:center;background:#00000008;border-radius:8px;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px;padding:8px;display:grid}[data-ds-dark-theme=true] .hOnQKG_clocksGrid,.dark .hOnQKG_clocksGrid,[data-theme=dark] .hOnQKG_clocksGrid{background:#ffffff0a}.hOnQKG_clockItem{flex-direction:column;display:flex}.hOnQKG_clockLabel{opacity:.65;text-transform:uppercase;font-size:10px}.hOnQKG_clockValue{font-variant-numeric:tabular-nums;margin-top:2px;font-size:12px;font-weight:600}.hOnQKG_scheduleSection{margin-bottom:10px;font-size:12px}.hOnQKG_scheduleHeading{align-items:center;gap:4px;margin-bottom:4px;font-weight:600;display:flex}.hOnQKG_scheduleRow{opacity:.85;justify-content:space-between;align-items:center;padding:2px 0;display:flex}.hOnQKG_pricingTable{border-collapse:collapse;width:100%;margin-top:8px;margin-bottom:10px;font-size:11px}.hOnQKG_pricingTable th,.hOnQKG_pricingTable td{text-align:left;border-bottom:1px solid #0000000f;padding:4px 6px}[data-ds-dark-theme=true] .hOnQKG_pricingTable th,[data-ds-dark-theme=true] .hOnQKG_pricingTable td,.dark .hOnQKG_pricingTable th,.dark .hOnQKG_pricingTable td{border-bottom-color:#ffffff0f}.hOnQKG_pricingTable th{opacity:.7;font-weight:600}.hOnQKG_discountCol{color:#10b981;font-weight:600}.hOnQKG_tipBox{background:#10b98114;border-left:3px solid #10b981;border-radius:0 6px 6px 0;padding:8px 10px;font-size:11px;line-height:1.4}.hOnQKG_tipBox strong{color:#059669;margin-bottom:2px;display:block}[data-ds-dark-theme=true] .hOnQKG_tipBox strong,.dark .hOnQKG_tipBox strong{color:#34d399}";
		const tagId = "@dsh-external/dsh-peak/PeakBadge.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@dsh-external/dsh-peak";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var PeakBadge_module_css_default = {
			"badgeContainer": "hOnQKG_badgeContainer",
			"clockItem": "hOnQKG_clockItem",
			"clockLabel": "hOnQKG_clockLabel",
			"clockValue": "hOnQKG_clockValue",
			"clocksGrid": "hOnQKG_clocksGrid",
			"closeButton": "hOnQKG_closeButton",
			"countdownText": "hOnQKG_countdownText",
			"discountCol": "hOnQKG_discountCol",
			"discountTag": "hOnQKG_discountTag",
			"dot": "hOnQKG_dot",
			"fadeIn": "hOnQKG_fadeIn",
			"offPeak": "hOnQKG_offPeak",
			"peak": "hOnQKG_peak",
			"pill": "hOnQKG_pill",
			"popover": "hOnQKG_popover",
			"popoverHeader": "hOnQKG_popoverHeader",
			"popoverTitle": "hOnQKG_popoverTitle",
			"pricingTable": "hOnQKG_pricingTable",
			"scheduleHeading": "hOnQKG_scheduleHeading",
			"scheduleRow": "hOnQKG_scheduleRow",
			"scheduleSection": "hOnQKG_scheduleSection",
			"tipBox": "hOnQKG_tipBox"
		};
		//#endregion
		//#region src/client/PeakPopover.tsx
		const PeakPopover = ({ status, onClose, locale = "en" }) => {
			const t = locale === "zh" ? zh : en;
			const isOffPeak = status.state === "OFF_PEAK";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: PeakBadge_module_css_default.popover,
				role: "dialog",
				"aria-label": t.statusTitle,
				onClick: (e) => e.stopPropagation(),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: PeakBadge_module_css_default.popoverHeader,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: PeakBadge_module_css_default.popoverTitle,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: isOffPeak ? "🌙" : "⚡" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t.statusTitle })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: PeakBadge_module_css_default.closeButton,
							onClick: onClose,
							"aria-label": t.close,
							children: "✕"
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: PeakBadge_module_css_default.clocksGrid,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: PeakBadge_module_css_default.clockItem,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: PeakBadge_module_css_default.clockLabel,
									children: t.utcClock
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: PeakBadge_module_css_default.clockValue,
									children: status.timeInfo.utcTime
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: PeakBadge_module_css_default.clockItem,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: PeakBadge_module_css_default.clockLabel,
									children: t.beijingClock
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: PeakBadge_module_css_default.clockValue,
									children: status.timeInfo.beijingTime
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: PeakBadge_module_css_default.clockItem,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: PeakBadge_module_css_default.clockLabel,
									children: t.localClock
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: PeakBadge_module_css_default.clockValue,
									children: status.timeInfo.localTime
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: PeakBadge_module_css_default.scheduleSection,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: PeakBadge_module_css_default.scheduleHeading,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "📅" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t.officialSchedule })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: PeakBadge_module_css_default.scheduleRow,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["• ", t.morningPeak] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: {
										color: "#ef4444",
										fontWeight: 600
									},
									children: t.peak
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: PeakBadge_module_css_default.scheduleRow,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["• ", t.afternoonPeak] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									style: {
										color: "#ef4444",
										fontWeight: 600
									},
									children: t.peak
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: PeakBadge_module_css_default.scheduleRow,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["• ", t.offPeakAllOther] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: PeakBadge_module_css_default.discountCol,
									children: t.discountBadge
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						style: { marginTop: "8px" },
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "11px",
								fontWeight: 600,
								opacity: .8
							},
							children: t.pricingTitle
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
							className: PeakBadge_module_css_default.pricingTable,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: t.model }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: t.cacheHit }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: t.cacheMiss }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: t.output })
							] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: Object.values(DEEPSEEK_MODELS).map((m) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
									style: { fontWeight: 500 },
									children: m.name
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									style: {
										textDecoration: isOffPeak ? "line-through" : "none",
										opacity: isOffPeak ? .6 : 1
									},
									children: ["$", m.peak.inputCacheHit]
								}), isOffPeak && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: PeakBadge_module_css_default.discountCol,
									children: [" $", m.offPeak.inputCacheHit]
								})] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									style: {
										textDecoration: isOffPeak ? "line-through" : "none",
										opacity: isOffPeak ? .6 : 1
									},
									children: ["$", m.peak.inputCacheMiss]
								}), isOffPeak && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: PeakBadge_module_css_default.discountCol,
									children: [" $", m.offPeak.inputCacheMiss]
								})] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									style: {
										textDecoration: isOffPeak ? "line-through" : "none",
										opacity: isOffPeak ? .6 : 1
									},
									children: ["$", m.peak.output]
								}), isOffPeak && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: PeakBadge_module_css_default.discountCol,
									children: [" $", m.offPeak.output]
								})] })
							] }, m.modelId)) })]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: PeakBadge_module_css_default.tipBox,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: ["💡 ", t.tipHeading] }), t.tipText]
					})
				]
			});
		};
		//#endregion
		//#region src/client/PeakBadge.tsx
		const PeakBadge = ({ initialDate, config, locale = "en", compact = false, className = "", style }) => {
			const [status, setStatus] = (0, react.useState)(() => getPeakStatus(initialDate || /* @__PURE__ */ new Date(), config, locale));
			const [isPopoverOpen, setIsPopoverOpen] = (0, react.useState)(false);
			const containerRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				const update = () => {
					setStatus(getPeakStatus(/* @__PURE__ */ new Date(), config, locale));
				};
				const timer = setInterval(update, 1e3);
				return () => clearInterval(timer);
			}, [config, locale]);
			(0, react.useEffect)(() => {
				if (!isPopoverOpen) return;
				const handleClickOutside = (event) => {
					if (containerRef.current && !containerRef.current.contains(event.target)) setIsPopoverOpen(false);
				};
				document.addEventListener("mousedown", handleClickOutside);
				return () => document.removeEventListener("mousedown", handleClickOutside);
			}, [isPopoverOpen]);
			const t = locale === "zh" ? zh : en;
			const isOffPeak = status.state === "OFF_PEAK";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: containerRef,
				className: `${PeakBadge_module_css_default.badgeContainer} ${className}`,
				style,
				"data-dsh-peak-state": status.state.toLowerCase(),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `${PeakBadge_module_css_default.pill} ${isOffPeak ? PeakBadge_module_css_default.offPeak : PeakBadge_module_css_default.peak}`,
					onClick: () => setIsPopoverOpen((prev) => !prev),
					title: `${isOffPeak ? t.offPeak : t.peak} - ${isOffPeak ? t.endsIn : t.nextOffPeakIn} ${status.formattedCountdown}`,
					"aria-expanded": isPopoverOpen,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: PeakBadge_module_css_default.dot }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: isOffPeak ? t.offPeak : t.peak }),
						isOffPeak && !compact && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: PeakBadge_module_css_default.discountTag,
							children: t.discountBadge
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: PeakBadge_module_css_default.countdownText,
							children: [
								isOffPeak ? t.endsIn : t.nextOffPeakIn,
								" ",
								status.formattedCountdown
							]
						})
					]
				}), isPopoverOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PeakPopover, {
					status,
					locale,
					onClose: () => setIsPopoverOpen(false)
				})]
			});
		};
		//#endregion
		//#region src/client/index.ts
		/**
		* dsh-peak client plugin entry for DeepSeek Harness (Browser half).
		*
		* Provides real-time visual indicator of DeepSeek API peak vs off-peak status,
		* transition countdowns, multi-timezone clocks, and token rate cards.
		*/
		/** Dictionary namespace owned by this plugin */
		const NS = "peak";
		/** Required services declared for DSH client runtime */
		const inject = ["slots", "locale"];
		/**
		* Programmatic mounting helper for custom containers or test harnesses.
		*/
		function mountPeakBadge(container, options = {}) {
			const root = (0, react_dom_client.createRoot)(container);
			root.render(react.default.createElement(PeakBadge, options));
			return () => {
				root.unmount();
			};
		}
		/**
		* Main Client Plugin apply() entry for DeepSeek Harness / Cordis client context.
		* Sets up slot injection and fallback DOM mount with strict Cordis lifecycle cleanup.
		*/
		function apply(ctx) {
			const disposers = [];
			if (ctx && ctx.locale && typeof ctx.locale.register === "function") {
				if (typeof ctx.effect === "function") ctx.effect(() => {
					ctx.locale.register(NS, {
						zh,
						en
					});
				}, "dsh-peak: locale registration");
				else ctx.locale.register(NS, {
					zh,
					en
				});
			}
			if (ctx && ctx.slots && typeof ctx.slots.inject === "function") try {
				ctx.slots.inject("conversation.chat.turnStatus", () => ctx.slots.register({
					name: "conversation.chat.turnStatus",
					locale: NS
				}, PeakBadge));
			} catch {}
			if (typeof document !== "undefined" && typeof window !== "undefined") {
				const MOUNT_ID = "dsh-peak-indicator-root";
				const existing = document.getElementById(MOUNT_ID);
				if (existing) existing.remove();
				const mountContainer = document.createElement("div");
				mountContainer.id = MOUNT_ID;
				mountContainer.dataset.dshPlugin = "dsh-peak";
				mountContainer.style.position = "fixed";
				mountContainer.style.top = "12px";
				mountContainer.style.right = "70px";
				mountContainer.style.zIndex = "9998";
				document.body.appendChild(mountContainer);
				const unmount = mountPeakBadge(mountContainer, { locale: typeof navigator !== "undefined" && navigator.language && navigator.language.startsWith("zh") ? "zh" : "en" });
				disposers.push(() => {
					unmount();
					if (mountContainer.parentNode) mountContainer.parentNode.removeChild(mountContainer);
				});
			}
			if (ctx && typeof ctx.effect === "function") ctx.effect(() => () => {
				for (const dispose of disposers) try {
					dispose();
				} catch {}
			});
		}
		//#endregion
		exports.PeakBadge = PeakBadge;
		exports.PeakPopover = PeakPopover;
		exports.apply = apply;
		exports.inject = inject;
		exports.mountPeakBadge = mountPeakBadge;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map