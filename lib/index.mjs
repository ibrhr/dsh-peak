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
/**
* Format USD price per 1M tokens.
* Example: 0.014 -> "$0.014 / 1M"
*/
function formatPrice(amount, currency = "$") {
	return `${currency}${amount.toFixed(amount < .1 ? 3 : 2)}`;
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
/**
* Convenient shorthand boolean check.
*/
function isPeak(targetDate = /* @__PURE__ */ new Date(), config = {}) {
	return getPeakStatus(targetDate, config).isPeak;
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
/**
* Calculate token costs and estimated savings between Peak and Off-Peak.
*/
function calculateTokenSavings(params) {
	const model = DEEPSEEK_MODELS[params.modelId || "deepseek-v4-flash"] || DEEPSEEK_MODELS["deepseek-v4-flash"];
	const hitRatio = Math.max(0, Math.min(1, params.cacheHitRatio ?? .5));
	const cacheHitTokens = params.inputTokens * hitRatio;
	const cacheMissTokens = params.inputTokens * (1 - hitRatio);
	const outputTokens = params.outputTokens;
	const factor = 1 / 1e6;
	const peakCostUSD = cacheHitTokens * factor * model.peak.inputCacheHit + cacheMissTokens * factor * model.peak.inputCacheMiss + outputTokens * factor * model.peak.output;
	const offPeakCostUSD = cacheHitTokens * factor * model.offPeak.inputCacheHit + cacheMissTokens * factor * model.offPeak.inputCacheMiss + outputTokens * factor * model.offPeak.output;
	const savingsUSD = peakCostUSD - offPeakCostUSD;
	const savingsPercent = peakCostUSD > 0 ? savingsUSD / peakCostUSD * 100 : 0;
	return {
		modelName: model.name,
		peakCostUSD,
		offPeakCostUSD,
		savingsUSD,
		savingsPercent
	};
}
//#endregion
//#region src/index.ts
/**
* dsh-peak host plugin entry for DeepSeek Harness (Cordis node half).
*
* Provides the host-side 'peak' service for background jobs, agents,
* batch dispatchers, and external integrations to query real-time
* DeepSeek API peak pricing status and transition schedules.
*/
/**
* Creates an instance of the PeakService API.
*/
function createPeakService() {
	return {
		isPeak: (targetDate, config) => isPeak(targetDate, config),
		getStatus: (targetDate, config, locale) => getPeakStatus(targetDate, config, locale),
		calculateSavings: (params) => calculateTokenSavings(params),
		getWindows: (scheduleType) => getScheduleWindows(scheduleType),
		getTimeInfo: (date) => getTimeInfo(date),
		models: DEEPSEEK_MODELS
	};
}
/**
* Cordis Host Plugin Lifecycle:
* Registers the 'peak' service into the host context when loaded.
*/
function apply(ctx) {
	const peakService = createPeakService();
	if (ctx && typeof ctx.provide === "function") {
		ctx.provide("peak");
		ctx.peak = peakService;
	} else if (ctx && typeof ctx.set === "function") ctx.set("peak", peakService);
	if (ctx && typeof ctx.effect === "function") ctx.effect(() => () => {
		if (ctx.peak === peakService) delete ctx.peak;
	});
}
//#endregion
export { DEEPSEEK_MODELS, LEGACY_BEIJING_WINDOWS, OFFICIAL_UTC_WINDOWS, apply, calculateTokenSavings, createPeakService, formatClockTime, formatCountdown, formatPrice, getPeakStatus, getScheduleWindows, getTimeInfo, isPeak };

//# sourceMappingURL=index.mjs.map