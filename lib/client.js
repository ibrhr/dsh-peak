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
		const css = ".hOnQKG_badgeContainer{user-select:none;z-index:9999;align-items:center;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;display:inline-flex;position:relative}.hOnQKG_pill{cursor:pointer;-webkit-backdrop-filter:blur(12px);border:1px solid #0000;border-radius:9999px;outline:none;align-items:center;gap:7px;padding:5px 12px;font-size:12px;font-weight:600;transition:all .2s cubic-bezier(.4,0,.2,1);display:inline-flex;box-shadow:0 2px 8px #0003}.hOnQKG_pill:hover{transform:translateY(-1px);box-shadow:0 4px 14px #0000004d}.hOnQKG_pill:active{transform:translateY(0)}.hOnQKG_offPeak{color:#34d399;background:#0a1e18d9;border-color:#10b98173;box-shadow:0 0 12px #10b98133}.hOnQKG_offPeak:hover{border-color:#34d399cc;box-shadow:0 0 16px #10b98159}.hOnQKG_peak{color:#f87171;background:#230f0fd9;border-color:#ef444473;box-shadow:0 0 12px #ef44442e}.hOnQKG_peak:hover{border-color:#f87171cc;box-shadow:0 0 16px #ef44444d}[data-theme=light] .hOnQKG_offPeak{color:#047857;background:#ecfdf5f2;border-color:#10b98180;box-shadow:0 2px 8px #10b98126}[data-theme=light] .hOnQKG_peak{color:#b91c1c;background:#fef2f2f2;border-color:#ef444466;box-shadow:0 2px 8px #ef444426}.hOnQKG_dot{border-radius:50%;flex-shrink:0;width:8px;height:8px;position:relative}.hOnQKG_offPeak .hOnQKG_dot{background-color:#10b981;animation:2s cubic-bezier(.4,0,.6,1) infinite hOnQKG_pulseGreen;box-shadow:0 0 8px #10b981}.hOnQKG_peak .hOnQKG_dot{background-color:#ef4444;animation:2s cubic-bezier(.4,0,.6,1) infinite hOnQKG_pulseRed;box-shadow:0 0 8px #ef4444}@keyframes hOnQKG_pulseGreen{0%,to{opacity:1;transform:scale(1);box-shadow:0 0 8px #10b981}50%{opacity:.8;transform:scale(1.18);box-shadow:0 0 14px #34d399}}@keyframes hOnQKG_pulseRed{0%,to{opacity:1;transform:scale(1);box-shadow:0 0 8px #ef4444}50%{opacity:.8;transform:scale(1.18);box-shadow:0 0 14px #f87171}}.hOnQKG_discountTag{letter-spacing:.3px;text-shadow:0 1px 2px #0003;background:linear-gradient(135deg,#10b981 0%,#059669 100%);border-radius:4px;padding:1px 6px;font-size:10px;font-weight:800;color:#fff!important}.hOnQKG_countdownText{opacity:.95;font-variant-numeric:tabular-nums;color:#f1f5f9;font-size:11px}[data-theme=light] .hOnQKG_countdownText{color:#334155}.hOnQKG_popover{color:#f8fafc;-webkit-backdrop-filter:blur(20px);z-index:10000;background:#0b1121f5;border:1px solid #ffffff24;border-radius:14px;width:370px;padding:16px;font-size:13px;line-height:1.5;animation:.18s cubic-bezier(.16,1,.3,1) hOnQKG_popoverFadeIn;position:absolute;top:calc(100% + 10px);right:0;box-shadow:0 20px 45px #0000008c,0 0 1px 1px #ffffff14}[data-theme=light] .hOnQKG_popover{color:#0f172a;background:#fffffffa;border-color:#0000001f;box-shadow:0 20px 45px #0000002e}@keyframes hOnQKG_popoverFadeIn{0%{opacity:0;transform:translateY(-6px)scale(.98)}to{opacity:1;transform:translateY(0)scale(1)}}.hOnQKG_popoverHeader{border-bottom:1px solid #ffffff1a;justify-content:space-between;align-items:center;margin-bottom:12px;padding-bottom:10px;display:flex}[data-theme=light] .hOnQKG_popoverHeader{border-bottom-color:#00000014}.hOnQKG_popoverTitle{color:#f8fafc;align-items:center;gap:7px;font-size:14px;font-weight:700;display:flex}[data-theme=light] .hOnQKG_popoverTitle{color:#0f172a}.hOnQKG_closeButton{cursor:pointer;color:#cbd5e1;background:#ffffff0f;border:1px solid #ffffff1a;border-radius:6px;padding:3px 8px;font-size:13px;transition:all .15s}.hOnQKG_closeButton:hover{color:#fff;background:#ffffff26}[data-theme=light] .hOnQKG_closeButton{color:#64748b;background:#0000000a;border-color:#00000014}[data-theme=light] .hOnQKG_closeButton:hover{color:#0f172a;background:#00000014}.hOnQKG_clocksGrid{text-align:center;background:#ffffff0a;border:1px solid #ffffff14;border-radius:10px;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;padding:10px 8px;display:grid}[data-theme=light] .hOnQKG_clocksGrid{background:#00000008;border-color:#0000000f}.hOnQKG_clockItem{flex-direction:column;align-items:center;display:flex}.hOnQKG_clockLabel{color:#94a3b8;text-transform:uppercase;letter-spacing:.3px;font-size:10px;font-weight:600}[data-theme=light] .hOnQKG_clockLabel{color:#64748b}.hOnQKG_clockValue{font-variant-numeric:tabular-nums;color:#38bdf8;margin-top:3px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;font-weight:700}[data-theme=light] .hOnQKG_clockValue{color:#0284c7}.hOnQKG_scheduleSection{background:#ffffff05;border:1px solid #ffffff0f;border-radius:10px;margin-bottom:12px;padding:10px 12px;font-size:12px}[data-theme=light] .hOnQKG_scheduleSection{background:#00000005;border-color:#0000000d}.hOnQKG_scheduleHeading{color:#e2e8f0;align-items:center;gap:5px;margin-bottom:6px;font-weight:700;display:flex}[data-theme=light] .hOnQKG_scheduleHeading{color:#1e293b}.hOnQKG_scheduleRow{color:#cbd5e1;justify-content:space-between;align-items:center;padding:3px 0;display:flex}[data-theme=light] .hOnQKG_scheduleRow{color:#475569}.hOnQKG_scheduleTagPeak{color:#f87171;background:#ef444426;border-radius:4px;padding:1px 6px;font-size:10px;font-weight:700}.hOnQKG_scheduleTagOffPeak{color:#34d399;background:#10b98126;border-radius:4px;padding:1px 6px;font-size:10px;font-weight:700}.hOnQKG_pricingTableContainer{margin-top:10px;margin-bottom:12px}.hOnQKG_pricingTable{border-collapse:collapse;width:100%;margin-top:6px;font-size:11px}.hOnQKG_pricingTable th,.hOnQKG_pricingTable td{text-align:left;border-bottom:1px solid #ffffff14;padding:5px 6px}[data-theme=light] .hOnQKG_pricingTable th,[data-theme=light] .hOnQKG_pricingTable td{border-bottom-color:#0000000f}.hOnQKG_pricingTable th{color:#94a3b8;text-transform:uppercase;font-size:10px;font-weight:600}[data-theme=light] .hOnQKG_pricingTable th{color:#64748b}.hOnQKG_modelName{color:#f8fafc;font-weight:600}[data-theme=light] .hOnQKG_modelName{color:#0f172a}.hOnQKG_peakPrice{color:#94a3b8;margin-right:4px;font-size:10px;text-decoration:line-through}.hOnQKG_offPeakPrice{color:#34d399;font-weight:700}.hOnQKG_tipBox{color:#d1fae5;background:#10b9811f;border:1px solid #10b9814d;border-radius:8px;padding:9px 12px;font-size:11px;line-height:1.45}[data-theme=light] .hOnQKG_tipBox{color:#065f46;background:#10b98114;border-color:#10b98140}.hOnQKG_tipBox strong{color:#34d399;margin-bottom:2px;font-size:11px;display:block}[data-theme=light] .hOnQKG_tipBox strong{color:#047857}";
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
			"discountTag": "hOnQKG_discountTag",
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
			"pulseGreen": "hOnQKG_pulseGreen",
			"pulseRed": "hOnQKG_pulseRed",
			"scheduleHeading": "hOnQKG_scheduleHeading",
			"scheduleRow": "hOnQKG_scheduleRow",
			"scheduleSection": "hOnQKG_scheduleSection",
			"scheduleTagOffPeak": "hOnQKG_scheduleTagOffPeak",
			"scheduleTagPeak": "hOnQKG_scheduleTagPeak",
			"tipBox": "hOnQKG_tipBox"
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
				const popoverWidth = 370;
				let top = anchorRect.bottom + 8;
				let left = anchorRect.left;
				if (left + popoverWidth > window.innerWidth - 16) left = window.innerWidth - popoverWidth - 16;
				if (left < 16) left = 16;
				if (top + 450 > window.innerHeight && anchorRect.top > 450) top = anchorRect.top - 460;
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
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: isOffPeak ? "🌙" : "⚡" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t.statusTitle }),
								isOffPeak ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: PeakBadge_module_css_default.scheduleTagOffPeak,
									children: "50% OFF"
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: PeakBadge_module_css_default.scheduleTagPeak,
									children: "PEAK"
								})
							]
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
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: PeakBadge_module_css_default.tipBox,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: ["💡 ", t.tipHeading] }), t.tipText]
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
					title: `${isOffPeak ? t.offPeak : t.peak} - ${isOffPeak ? t.endsIn : t.nextOffPeakIn} ${status.formattedCountdown} (Click for details)`,
					"aria-expanded": isPopoverOpen,
					"aria-haspopup": "dialog",
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
		* Locate best placement container in DSH UI (header actions or navbar).
		*/
		function findHeaderMountTarget() {
			const header = document.querySelector("header");
			if (!header) return null;
			const actionContainer = header.querySelector(":is([class*='action'], [class*='trailing'], [class*='toolbar'], [data-slot*='header'], nav)");
			if (actionContainer) return {
				parent: actionContainer,
				insertBeforeNode: actionContainer.firstChild
			};
			if (header.lastElementChild) return {
				parent: header,
				insertBeforeNode: header.lastElementChild
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
				const target = findHeaderMountTarget();
				if (target) {
					mountContainer.style.display = "inline-flex";
					mountContainer.style.alignItems = "center";
					mountContainer.style.marginRight = "12px";
					mountContainer.style.marginLeft = "8px";
					target.parent.insertBefore(mountContainer, target.insertBeforeNode);
				} else {
					mountContainer.style.position = "fixed";
					mountContainer.style.top = "10px";
					mountContainer.style.right = "175px";
					mountContainer.style.zIndex = "9998";
					document.body.appendChild(mountContainer);
				}
				const unmount = mountPeakBadge(mountContainer, { locale: typeof navigator !== "undefined" && navigator.language && navigator.language.startsWith("zh") ? "zh" : "en" });
				let observer = null;
				if (!target && typeof MutationObserver !== "undefined") {
					observer = new MutationObserver(() => {
						const newTarget = findHeaderMountTarget();
						if (newTarget && mountContainer.parentNode !== newTarget.parent) {
							mountContainer.style.position = "";
							mountContainer.style.top = "";
							mountContainer.style.right = "";
							mountContainer.style.zIndex = "";
							mountContainer.style.display = "inline-flex";
							mountContainer.style.alignItems = "center";
							mountContainer.style.marginRight = "12px";
							mountContainer.style.marginLeft = "8px";
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