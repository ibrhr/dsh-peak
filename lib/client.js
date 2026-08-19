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
		let react_dom = require("react-dom");
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
			offPeak: "Off-peak",
			peak: "Peak",
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
			statusTitle: "DeepSeek API Pricing Status"
		};
		const zh = {
			offPeak: "优惠时段",
			peak: "高峰时段",
			discountBadge: "50% 优惠",
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
			statusTitle: "DeepSeek API 峰谷计费状态"
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
			}
		};
		//#endregion
		//#region \0dsh-css:/media/ibrahim/Data/Projects/deepseek/dsh-peak/src/client/PeakBadge.module.css.mjs
		const css = ".hOnQKG_badgeContainer{font-family:var(--dsw-font-sans,-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);user-select:none;z-index:10;align-items:center;display:inline-flex;position:relative}.hOnQKG_pill{border-radius:var(--dsw-radius-sm,5px);cursor:pointer;background:var(--dsw-color-surface-subtle,#ffffff0d);border:1px solid var(--dsw-color-border-subtle,#ffffff1a);height:22px;color:var(--dsw-color-text-secondary,#ffffffb3);white-space:nowrap;outline:none;align-items:center;gap:5px;padding:0 7px;font-size:11px;font-weight:500;line-height:1;transition:all .15s;display:inline-flex}.hOnQKG_pill:hover{background:var(--dsw-color-surface-hover,#ffffff17);border-color:var(--dsw-color-border-default,#ffffff2e);color:var(--dsw-color-text-primary,#fffffff2)}.hOnQKG_pill:active{background:var(--dsw-color-surface-active,#ffffff1f)}.hOnQKG_dot{border-radius:50%;flex-shrink:0;width:6px;height:6px}.hOnQKG_offPeak .hOnQKG_dot{background-color:var(--dsw-color-success,#10b981)}.hOnQKG_peak .hOnQKG_dot{background-color:var(--dsw-color-warning,#f59e0b)}.hOnQKG_statusText{color:inherit;font-weight:500}.hOnQKG_separator{opacity:.4;margin:0 1px}.hOnQKG_countdownText{opacity:.85;font-variant-numeric:tabular-nums;font-size:10.5px}.hOnQKG_popover{background:var(--dsw-color-popover-bg,var(--dsw-color-surface-elevated,var(--dsw-color-surface,#121826)));border:1px solid var(--dsw-color-border-subtle,var(--dsw-color-border,#ffffff1f));border-radius:var(--dsw-radius-md,8px);width:350px;box-shadow:var(--dsw-shadow-popover,0 10px 30px #00000073);color:var(--dsw-color-text-primary,#f1f5f9);-webkit-backdrop-filter:blur(16px);z-index:100000;padding:12px 14px;font-size:12px;line-height:1.45;animation:.14s ease-out hOnQKG_popoverFadeIn;position:absolute;top:calc(100% + 6px)}@keyframes hOnQKG_popoverFadeIn{0%{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}.hOnQKG_popoverHeader{border-bottom:1px solid var(--dsw-color-border-subtle,#ffffff14);justify-content:space-between;align-items:center;margin-bottom:10px;padding-bottom:8px;display:flex}.hOnQKG_popoverTitle{color:var(--dsw-color-text-primary,#f8fafc);align-items:center;gap:6px;font-size:13px;font-weight:600;display:flex}.hOnQKG_closeButton{cursor:pointer;color:var(--dsw-color-text-tertiary,#94a3b8);background:0 0;border:none;border-radius:4px;padding:2px 4px;font-size:13px;line-height:1;transition:all .15s}.hOnQKG_closeButton:hover{background:var(--dsw-color-surface-hover,#ffffff14);color:var(--dsw-color-text-primary,#fff)}.hOnQKG_clocksGrid{background:var(--dsw-color-surface-subtle,#ffffff08);border:1px solid var(--dsw-color-border-subtle,#ffffff0f);border-radius:var(--dsw-radius-sm,6px);text-align:center;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px;padding:8px 6px;display:grid}.hOnQKG_clockItem{flex-direction:column;align-items:center;display:flex}.hOnQKG_clockLabel{color:var(--dsw-color-text-tertiary,#94a3b8);text-transform:uppercase;letter-spacing:.3px;font-size:9.5px;font-weight:500}.hOnQKG_clockValue{font-variant-numeric:tabular-nums;color:var(--dsw-color-accent,#38bdf8);font-size:12px;font-weight:600;font-family:var(--dsw-font-mono,ui-monospace, SFMono-Regular, monospace);margin-top:2px}.hOnQKG_scheduleSection{background:var(--dsw-color-surface-subtle,#ffffff05);border:1px solid var(--dsw-color-border-subtle,#ffffff0d);border-radius:var(--dsw-radius-sm,6px);margin-bottom:10px;padding:8px 10px;font-size:11.5px}.hOnQKG_scheduleHeading{color:var(--dsw-color-text-secondary,#cbd5e1);align-items:center;gap:4px;margin-bottom:4px;font-weight:600;display:flex}.hOnQKG_scheduleRow{color:var(--dsw-color-text-secondary,#94a3b8);justify-content:space-between;align-items:center;padding:2px 0;display:flex}.hOnQKG_scheduleTagPeak{color:var(--dsw-color-warning,#f59e0b);background:#f59e0b1f;border-radius:3px;padding:1px 5px;font-size:9.5px;font-weight:600}.hOnQKG_scheduleTagOffPeak{color:var(--dsw-color-success,#10b981);background:#10b9811f;border-radius:3px;padding:1px 5px;font-size:9.5px;font-weight:600}.hOnQKG_pricingTableContainer{margin-top:8px}.hOnQKG_pricingTable{border-collapse:collapse;width:100%;margin-top:4px;font-size:11px}.hOnQKG_pricingTable th,.hOnQKG_pricingTable td{text-align:left;border-bottom:1px solid var(--dsw-color-border-subtle,#ffffff0f);padding:4px 6px}.hOnQKG_pricingTable th{color:var(--dsw-color-text-tertiary,#64748b);text-transform:uppercase;font-size:10px;font-weight:500}.hOnQKG_modelName{color:var(--dsw-color-text-primary,#f1f5f9);font-weight:500}.hOnQKG_peakPrice{color:var(--dsw-color-text-tertiary,#64748b);margin-right:4px;font-size:10px;text-decoration:line-through}.hOnQKG_offPeakPrice{color:var(--dsw-color-success,#10b981);font-weight:600}";
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
			"dot": "hOnQKG_dot",
			"modelName": "hOnQKG_modelName",
			"offPeak": "hOnQKG_offPeak",
			"offPeakPrice": "hOnQKG_offPeakPrice",
			"peak": "hOnQKG_peak",
			"peakPrice": "hOnQKG_peakPrice",
			"pill": "hOnQKG_pill",
			"popover": "hOnQKG_popover",
			"popoverFadeIn": "hOnQKG_popoverFadeIn",
			"popoverHeader": "hOnQKG_popoverHeader",
			"popoverTitle": "hOnQKG_popoverTitle",
			"pricingTable": "hOnQKG_pricingTable",
			"pricingTableContainer": "hOnQKG_pricingTableContainer",
			"scheduleHeading": "hOnQKG_scheduleHeading",
			"scheduleRow": "hOnQKG_scheduleRow",
			"scheduleSection": "hOnQKG_scheduleSection",
			"scheduleTagOffPeak": "hOnQKG_scheduleTagOffPeak",
			"scheduleTagPeak": "hOnQKG_scheduleTagPeak",
			"separator": "hOnQKG_separator",
			"statusText": "hOnQKG_statusText"
		};
		//#endregion
		//#region src/client/PeakPopover.tsx
		const PeakPopover = ({ status, anchorRect, onClose, locale = "en" }) => {
			const popoverRef = (0, react.useRef)(null);
			const t = locale === "zh" ? zh : en;
			const isOffPeak = status.state === "OFF_PEAK";
			(0, react.useEffect)(() => {
				const handleKeyDown = (e) => {
					if (e.key === "Escape") onClose();
				};
				document.addEventListener("keydown", handleKeyDown);
				return () => document.removeEventListener("keydown", handleKeyDown);
			}, [onClose]);
			(0, react.useEffect)(() => {
				const handleClickOutside = (e) => {
					if (popoverRef.current && !popoverRef.current.contains(e.target)) onClose();
				};
				const timer = setTimeout(() => {
					document.addEventListener("click", handleClickOutside);
				}, 10);
				return () => {
					clearTimeout(timer);
					document.removeEventListener("click", handleClickOutside);
				};
			}, [onClose]);
			let popoverStyle = {
				position: "fixed",
				top: "56px",
				left: "20px",
				zIndex: 99999
			};
			if (anchorRect && typeof window !== "undefined") {
				const popoverWidth = 360;
				let top = anchorRect.bottom + 8;
				let left = anchorRect.left;
				if (left + popoverWidth > window.innerWidth - 16) left = window.innerWidth - popoverWidth - 16;
				if (left < 16) left = 16;
				if (top + 380 > window.innerHeight && anchorRect.top > 380) top = anchorRect.top - 390;
				popoverStyle = {
					position: "fixed",
					top: `${top}px`,
					left: `${left}px`,
					zIndex: 99999
				};
			}
			const content = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: popoverRef,
				className: PeakBadge_module_css_default.popover,
				style: popoverStyle,
				role: "dialog",
				"aria-label": t.statusTitle,
				onClick: (e) => e.stopPropagation(),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: PeakBadge_module_css_default.popoverHeader,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: PeakBadge_module_css_default.popoverTitle,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t.statusTitle }), isOffPeak ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: PeakBadge_module_css_default.scheduleTagOffPeak,
								children: "50% OFF"
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: PeakBadge_module_css_default.scheduleTagPeak,
								children: "PEAK"
							})]
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
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t.morningPeak }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: PeakBadge_module_css_default.scheduleTagPeak,
									children: t.peak
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: PeakBadge_module_css_default.scheduleRow,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t.afternoonPeak }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: PeakBadge_module_css_default.scheduleTagPeak,
									children: t.peak
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: PeakBadge_module_css_default.scheduleRow,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t.offPeakAllOther }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: PeakBadge_module_css_default.scheduleTagOffPeak,
									children: t.discountBadge
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: PeakBadge_module_css_default.pricingTableContainer,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							style: {
								fontSize: "11px",
								fontWeight: 700,
								opacity: .9,
								letterSpacing: "0.2px"
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
									className: PeakBadge_module_css_default.modelName,
									children: m.name
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: isOffPeak ? PeakBadge_module_css_default.peakPrice : "",
									children: ["$", m.peak.inputCacheHit]
								}), isOffPeak && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: PeakBadge_module_css_default.offPeakPrice,
									children: ["$", m.offPeak.inputCacheHit]
								})] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: isOffPeak ? PeakBadge_module_css_default.peakPrice : "",
									children: ["$", m.peak.inputCacheMiss]
								}), isOffPeak && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: PeakBadge_module_css_default.offPeakPrice,
									children: ["$", m.offPeak.inputCacheMiss]
								})] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: isOffPeak ? PeakBadge_module_css_default.peakPrice : "",
									children: ["$", m.peak.output]
								}), isOffPeak && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: PeakBadge_module_css_default.offPeakPrice,
									children: ["$", m.offPeak.output]
								})] })
							] }, m.modelId)) })]
						})]
					})
				]
			});
			if (typeof document !== "undefined" && document.body) return (0, react_dom.createPortal)(content, document.body);
			return content;
		};
		//#endregion
		//#region src/client/PeakBadge.tsx
		const PeakBadge = ({ initialDate, config, locale = "en", compact = false, className = "", style }) => {
			const [status, setStatus] = (0, react.useState)(() => getPeakStatus(initialDate || /* @__PURE__ */ new Date(), config, locale));
			const [isPopoverOpen, setIsPopoverOpen] = (0, react.useState)(false);
			const [anchorRect, setAnchorRect] = (0, react.useState)(null);
			const buttonRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				const update = () => {
					setStatus(getPeakStatus(/* @__PURE__ */ new Date(), config, locale));
				};
				const timer = setInterval(update, 1e3);
				return () => clearInterval(timer);
			}, [config, locale]);
			const handleToggle = (e) => {
				e.stopPropagation();
				if (!isPopoverOpen && buttonRef.current) {
					setAnchorRect(buttonRef.current.getBoundingClientRect());
					setIsPopoverOpen(true);
				} else setIsPopoverOpen(false);
			};
			const t = locale === "zh" ? zh : en;
			const isOffPeak = status.state === "OFF_PEAK";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: `${PeakBadge_module_css_default.badgeContainer} ${className}`,
				style,
				"data-dsh-peak-state": status.state.toLowerCase(),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					ref: buttonRef,
					type: "button",
					className: `${PeakBadge_module_css_default.pill} ${isOffPeak ? PeakBadge_module_css_default.offPeak : PeakBadge_module_css_default.peak}`,
					onClick: handleToggle,
					title: `${isOffPeak ? t.offPeak : t.peak} - ${isOffPeak ? t.endsIn : t.nextOffPeakIn} ${status.formattedCountdown}`,
					"aria-expanded": isPopoverOpen,
					"aria-haspopup": "dialog",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: PeakBadge_module_css_default.dot }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: PeakBadge_module_css_default.statusText,
							children: isOffPeak ? t.offPeak : t.peak
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: PeakBadge_module_css_default.separator,
							children: "·"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: PeakBadge_module_css_default.countdownText,
							children: status.formattedCountdown
						})
					]
				}), isPopoverOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PeakPopover, {
					status,
					anchorRect,
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
		* Locate best placement in DSH UI (to the RIGHT of session title and mode tag).
		*/
		function findHeaderMountTarget() {
			const header = document.querySelector("header");
			if (!header) return null;
			const modeEl = header.querySelector(":is([class*=\"mode\"], [data-slot*=\"mode\"], [class*=\"badge\"])");
			if (modeEl && modeEl.parentElement) return {
				parent: modeEl.parentElement,
				insertBeforeNode: modeEl.nextSibling
			};
			const titleEl = header.querySelector(":is([class*=\"title\"], [class*=\"session\"], [class*=\"breadcrumb\"], h1, h2, [data-slot*=\"title\"])");
			if (titleEl && titleEl.parentElement) return {
				parent: titleEl.parentElement,
				insertBeforeNode: titleEl.nextSibling
			};
			const leadingGroup = header.querySelector(":is([class*=\"leading\"], [class*=\"left\"], [class*=\"start\"])");
			if (leadingGroup) return {
				parent: leadingGroup,
				insertBeforeNode: null
			};
			if (header.firstElementChild && header.firstElementChild !== header.lastElementChild) return {
				parent: header.firstElementChild,
				insertBeforeNode: null
			};
			return {
				parent: header,
				insertBeforeNode: null
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
				mountContainer.style.display = "inline-flex";
				mountContainer.style.alignItems = "center";
				mountContainer.style.marginLeft = "8px";
				mountContainer.style.marginRight = "8px";
				const target = findHeaderMountTarget();
				if (target) target.parent.insertBefore(mountContainer, target.insertBeforeNode);
				else {
					mountContainer.style.position = "fixed";
					mountContainer.style.top = "10px";
					mountContainer.style.left = "320px";
					mountContainer.style.zIndex = "9998";
					document.body.appendChild(mountContainer);
				}
				const unmount = mountPeakBadge(mountContainer, { locale: typeof navigator !== "undefined" && navigator.language && navigator.language.startsWith("zh") ? "zh" : "en" });
				let observer = null;
				if (typeof MutationObserver !== "undefined") {
					observer = new MutationObserver(() => {
						const newTarget = findHeaderMountTarget();
						if (newTarget && mountContainer.parentNode !== newTarget.parent) {
							mountContainer.style.position = "";
							mountContainer.style.top = "";
							mountContainer.style.left = "";
							mountContainer.style.zIndex = "";
							mountContainer.style.display = "inline-flex";
							mountContainer.style.alignItems = "center";
							mountContainer.style.marginLeft = "8px";
							mountContainer.style.marginRight = "8px";
							newTarget.parent.insertBefore(mountContainer, newTarget.insertBeforeNode);
						}
					});
					observer.observe(document.body, {
						childList: true,
						subtree: true
					});
				}
				disposers.push(() => {
					if (observer) observer.disconnect();
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