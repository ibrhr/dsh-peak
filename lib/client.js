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
		const css = ".hOnQKG_badgeContainer{font-family:var(--dsw-font-sans,-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif);user-select:none;vertical-align:middle;align-self:center;align-items:center;line-height:1;display:inline-flex;position:relative}.hOnQKG_pill{border-radius:var(--dsw-radius-sm,4px);cursor:pointer;background:var(--dsw-color-surface-subtle,#ffffff0a);border:1px solid var(--dsw-color-border-subtle,#ffffff14);height:20px;color:var(--dsw-color-text-secondary,#ffffffa6);white-space:nowrap;outline:none;align-items:center;gap:5px;padding:0 6px;font-size:11px;font-weight:400;transition:background .15s,border-color .15s,color .15s;display:inline-flex}.hOnQKG_pill:hover{background:var(--dsw-color-surface-hover,#ffffff14);border-color:var(--dsw-color-border-default,#ffffff26);color:var(--dsw-color-text-primary,#fff)}.hOnQKG_dot{border-radius:50%;flex-shrink:0;width:5px;height:5px}.hOnQKG_offPeak .hOnQKG_dot{background-color:var(--dsw-color-success,#10b981)}.hOnQKG_peak .hOnQKG_dot{background-color:var(--dsw-color-warning,#f59e0b)}.hOnQKG_countdown{opacity:.75;font-variant-numeric:tabular-nums;margin-left:1px;font-size:10px}.hOnQKG_popover{background:var(--dsw-color-popover-bg,var(--dsw-color-surface-elevated,var(--dsw-color-surface,#11151f)));border:1px solid var(--dsw-color-border-subtle,var(--dsw-color-border,#ffffff1a));border-radius:var(--dsw-radius-md,8px);width:300px;box-shadow:var(--dsw-shadow-popover,0 8px 24px #00000059);color:var(--dsw-color-text-primary,#f1f5f9);-webkit-backdrop-filter:blur(12px);z-index:100000;padding:12px 14px;font-size:11.5px;line-height:1.4;animation:.12s ease-out hOnQKG_popoverFade;position:fixed}@keyframes hOnQKG_popoverFade{0%{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:translateY(0)}}.hOnQKG_popoverHeader{justify-content:space-between;align-items:center;margin-bottom:8px;display:flex}.hOnQKG_popoverTitle{color:var(--dsw-color-text-primary,#f8fafc);font-size:12px;font-weight:600}.hOnQKG_closeButton{cursor:pointer;color:var(--dsw-color-text-tertiary,#64748b);background:0 0;border:none;border-radius:3px;padding:0 3px;font-size:13px;line-height:1}.hOnQKG_closeButton:hover{color:var(--dsw-color-text-primary,#fff)}.hOnQKG_statusLine{border-bottom:1px solid var(--dsw-color-border-subtle,#ffffff0f);justify-content:space-between;align-items:center;margin-bottom:8px;padding-bottom:8px;font-size:11px;display:flex}.hOnQKG_statusLabel{color:var(--dsw-color-text-primary,#f1f5f9);align-items:center;gap:5px;display:inline-flex}.hOnQKG_statusDuration{color:var(--dsw-color-text-secondary,#94a3b8);font-variant-numeric:tabular-nums;font-size:10.5px}.hOnQKG_scheduleBlock{margin-bottom:10px}.hOnQKG_sectionLabel{text-transform:uppercase;letter-spacing:.4px;color:var(--dsw-color-text-tertiary,#64748b);margin-bottom:4px;font-size:9.5px;font-weight:600}.hOnQKG_scheduleList{color:var(--dsw-color-text-secondary,#94a3b8);flex-direction:column;gap:2px;font-size:11px;display:flex}.hOnQKG_scheduleItem{justify-content:space-between;display:flex}.hOnQKG_ratesBlock{margin-bottom:10px}.hOnQKG_ratesTable{border-collapse:collapse;width:100%;margin-top:3px;font-size:11px}.hOnQKG_ratesTable th{text-align:right;text-transform:uppercase;color:var(--dsw-color-text-tertiary,#64748b);padding:2px 4px;font-size:9.5px;font-weight:500}.hOnQKG_ratesTable th:first-child{text-align:left;padding-left:0}.hOnQKG_ratesTable td{text-align:right;font-variant-numeric:tabular-nums;color:var(--dsw-color-text-secondary,#94a3b8);padding:3px 4px}.hOnQKG_ratesTable td:first-child{text-align:left;color:var(--dsw-color-text-primary,#f1f5f9);padding-left:0;font-weight:500}.hOnQKG_discountedRate{color:var(--dsw-color-success,#10b981)}.hOnQKG_clocksFooter{border-top:1px solid var(--dsw-color-border-subtle,#ffffff0f);color:var(--dsw-color-text-tertiary,#64748b);font-size:10px;font-family:var(--dsw-font-mono,ui-monospace, SFMono-Regular, monospace);justify-content:space-between;padding-top:8px;display:flex}";
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
			"clocksFooter": "hOnQKG_clocksFooter",
			"closeButton": "hOnQKG_closeButton",
			"countdown": "hOnQKG_countdown",
			"discountedRate": "hOnQKG_discountedRate",
			"dot": "hOnQKG_dot",
			"offPeak": "hOnQKG_offPeak",
			"peak": "hOnQKG_peak",
			"pill": "hOnQKG_pill",
			"popover": "hOnQKG_popover",
			"popoverFade": "hOnQKG_popoverFade",
			"popoverHeader": "hOnQKG_popoverHeader",
			"popoverTitle": "hOnQKG_popoverTitle",
			"ratesBlock": "hOnQKG_ratesBlock",
			"ratesTable": "hOnQKG_ratesTable",
			"scheduleBlock": "hOnQKG_scheduleBlock",
			"scheduleItem": "hOnQKG_scheduleItem",
			"scheduleList": "hOnQKG_scheduleList",
			"sectionLabel": "hOnQKG_sectionLabel",
			"statusDuration": "hOnQKG_statusDuration",
			"statusLabel": "hOnQKG_statusLabel",
			"statusLine": "hOnQKG_statusLine"
		};
		//#endregion
		//#region src/client/PeakPopover.tsx
		const PeakPopover = ({ status, anchorRect, onClose }) => {
			const popoverRef = (0, react.useRef)(null);
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
				top: "48px",
				right: "20px"
			};
			if (anchorRect && typeof window !== "undefined") {
				const popoverWidth = 290;
				let top = anchorRect.bottom + 6;
				let left = anchorRect.right - popoverWidth;
				if (left + popoverWidth > window.innerWidth - 12) left = window.innerWidth - popoverWidth - 12;
				if (left < 12) left = 12;
				popoverStyle = {
					top: `${top}px`,
					left: `${left}px`
				};
			}
			const content = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: popoverRef,
				className: PeakBadge_module_css_default.popover,
				style: popoverStyle,
				role: "dialog",
				"aria-label": "DeepSeek Pricing",
				onClick: (e) => e.stopPropagation(),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: PeakBadge_module_css_default.popoverHeader,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: PeakBadge_module_css_default.popoverTitle,
							children: "DeepSeek Pricing"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: PeakBadge_module_css_default.closeButton,
							onClick: onClose,
							"aria-label": "Close",
							children: "×"
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: PeakBadge_module_css_default.statusLine,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: PeakBadge_module_css_default.statusLabel,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `${PeakBadge_module_css_default.dot} ${isOffPeak ? PeakBadge_module_css_default.offPeak : PeakBadge_module_css_default.peak}` }), isOffPeak ? "50% discount active" : "Peak hours"]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: PeakBadge_module_css_default.statusDuration,
							children: isOffPeak ? `Ends in ${status.formattedCountdown}` : `Off-peak in ${status.formattedCountdown}`
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: PeakBadge_module_css_default.scheduleBlock,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: PeakBadge_module_css_default.sectionLabel,
							children: "Peak Windows (UTC)"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: PeakBadge_module_css_default.scheduleList,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: PeakBadge_module_css_default.scheduleItem,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "01:00 – 04:00" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "09:00 – 12:00 CST" })]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: PeakBadge_module_css_default.scheduleItem,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "06:00 – 10:00" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "14:00 – 18:00 CST" })]
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: PeakBadge_module_css_default.ratesBlock,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: PeakBadge_module_css_default.sectionLabel,
							children: ["Rate per 1M tokens ", isOffPeak ? "(50% off)" : "(standard)"]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", {
							className: PeakBadge_module_css_default.ratesTable,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "Model" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "Hit" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "Miss" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: "Out" })
							] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: Object.values(DEEPSEEK_MODELS).map((m) => {
								const rates = isOffPeak ? m.offPeak : m.peak;
								return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: m.name.replace("DeepSeek-", "") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", {
										className: isOffPeak ? PeakBadge_module_css_default.discountedRate : "",
										children: ["$", rates.inputCacheHit]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", {
										className: isOffPeak ? PeakBadge_module_css_default.discountedRate : "",
										children: ["$", rates.inputCacheMiss]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", {
										className: isOffPeak ? PeakBadge_module_css_default.discountedRate : "",
										children: ["$", rates.output]
									})
								] }, m.modelId);
							}) })]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: PeakBadge_module_css_default.clocksFooter,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["UTC ", status.timeInfo.utcTime.slice(0, 5)] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["CST ", status.timeInfo.beijingTime.slice(0, 5)] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["Local ", status.timeInfo.localTime.slice(0, 5)] })
						]
					})
				]
			});
			if (typeof document !== "undefined" && document.body) return (0, react_dom.createPortal)(content, document.body);
			return content;
		};
		//#endregion
		//#region src/client/PeakBadge.tsx
		const PeakBadge = ({ initialDate, config, locale = "en", className = "", style }) => {
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
					title: isOffPeak ? `Off-peak (50% off) · Ends in ${status.formattedCountdown}` : `Peak hours · Off-peak in ${status.formattedCountdown}`,
					"aria-expanded": isPopoverOpen,
					"aria-haspopup": "dialog",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: PeakBadge_module_css_default.dot }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: isOffPeak ? "Off-peak" : "Peak" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							style: { opacity: .35 },
							children: "·"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: PeakBadge_module_css_default.countdown,
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
		//#region src/client/index.ts
		/**
		* dsh-peak client plugin entry for DeepSeek Harness (Browser half).
		*
		* Places a minimal, lowkey status indicator in the top-right header actions bar (left of Session log).
		*/
		/** Dictionary namespace owned by this plugin */
		const NS = "peak";
		/** Required services declared for DSH client runtime */
		const inject = ["slots", "locale"];
		/**
		* Programmatic mounting helper.
		*/
		function mountPeakBadge(container, options = {}) {
			const root = (0, react_dom_client.createRoot)(container);
			root.render(react.default.createElement(PeakBadge, options));
			return () => {
				root.unmount();
			};
		}
		/**
		* Locate placement target: Top-Right header actions, immediately to the LEFT of "Session log".
		*/
		function findHeaderMountTarget() {
			const header = document.querySelector("header");
			if (!header) return null;
			const headerElements = header.querySelectorAll("*");
			for (const el of headerElements) if (el.children.length === 0 && el.textContent && el.textContent.toLowerCase().includes("session log")) {
				const sessionLogBtn = el.closest("button, a, [class*=\"action\"], [class*=\"button\"]") || el;
				if (sessionLogBtn.parentElement) return {
					parent: sessionLogBtn.parentElement,
					insertBeforeNode: sessionLogBtn
				};
			}
			const trailingActions = header.querySelector(":is([class*=\"action\"], [class*=\"trailing\"], [class*=\"right\"], [class*=\"end\"], [data-slot*=\"action\"])");
			if (trailingActions && trailingActions !== header) return {
				parent: trailingActions,
				insertBeforeNode: trailingActions.firstChild
			};
			return {
				parent: header,
				insertBeforeNode: null
			};
		}
		/**
		* Main Client Plugin apply() entry for DeepSeek Harness / Cordis client context.
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
				mountContainer.style.alignSelf = "center";
				mountContainer.style.marginRight = "8px";
				mountContainer.style.verticalAlign = "middle";
				mountContainer.style.flexShrink = "0";
				let unmount = null;
				const attach = () => {
					const target = findHeaderMountTarget();
					if (target) {
						try {
							if (mountContainer.parentElement !== target.parent || mountContainer.nextSibling !== target.insertBeforeNode) {
								if (target.insertBeforeNode && target.insertBeforeNode.parentNode === target.parent) target.parent.insertBefore(mountContainer, target.insertBeforeNode);
								else target.parent.appendChild(mountContainer);
							}
						} catch {}
						if (!unmount) unmount = mountPeakBadge(mountContainer, { locale: typeof navigator !== "undefined" && navigator.language && navigator.language.startsWith("zh") ? "zh" : "en" });
					}
				};
				attach();
				let observer = null;
				if (typeof MutationObserver !== "undefined") {
					observer = new MutationObserver(() => {
						attach();
					});
					observer.observe(document.body, {
						childList: true,
						subtree: true
					});
				}
				disposers.push(() => {
					if (observer) observer.disconnect();
					if (unmount) unmount();
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