import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-platform-settings-DHp5bHM-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var DEFAULTS = {
	min_deposit_kes: 1,
	max_deposit_kes: 15e4,
	min_withdrawal_kes: 10,
	max_withdrawal_kes: 3e5,
	min_bet_kes: 10,
	maintenance_mode: false,
	auto_approve_deposits: true
};
var CACHE_TTL_MS = 6e4;
var _cache = null;
var _cacheAt = 0;
var _fetching = false;
var _fetchPromise = null;
var _subscribers = /* @__PURE__ */ new Set();
function mapRow(data) {
	return {
		min_deposit_kes: (data.min_deposit_cents ?? DEFAULTS.min_deposit_kes * 100) / 100,
		max_deposit_kes: (data.max_deposit_cents ?? DEFAULTS.max_deposit_kes * 100) / 100,
		min_withdrawal_kes: (data.min_withdrawal_cents ?? DEFAULTS.min_withdrawal_kes * 100) / 100,
		max_withdrawal_kes: (data.max_withdrawal_cents ?? DEFAULTS.max_withdrawal_kes * 100) / 100,
		min_bet_kes: (data.min_bet_cents ?? DEFAULTS.min_bet_kes * 100) / 100,
		maintenance_mode: data.maintenance_mode ?? false,
		auto_approve_deposits: data.auto_approve_deposits ?? true
	};
}
async function fetchSettings() {
	if (_cache && Date.now() - _cacheAt < CACHE_TTL_MS) return _cache;
	if (_fetching && _fetchPromise) return _fetchPromise;
	_fetching = true;
	_fetchPromise = (async () => {
		try {
			const { data, error } = await supabase.from("platform_settings").select("*").eq("id", "global").single();
			const settings = error || !data ? DEFAULTS : mapRow(data);
			_cache = settings;
			_cacheAt = Date.now();
			return settings;
		} catch {
			_cache = DEFAULTS;
			_cacheAt = Date.now();
			return DEFAULTS;
		} finally {
			_fetching = false;
			_fetchPromise = null;
		}
	})();
	return _fetchPromise;
}
/**
* Call this after the admin saves platform settings.
* Clears the cache AND pushes fresh values to every mounted component immediately.
*/
async function invalidatePlatformSettings() {
	_cache = null;
	_cacheAt = 0;
	const fresh = await fetchSettings();
	_subscribers.forEach((fn) => fn(fresh));
}
function usePlatformSettings(options) {
	const bypassCache = options?.fresh === true;
	const [settings, setSettings] = (0, import_react.useState)(!bypassCache && _cache ? _cache : DEFAULTS);
	const [loaded, setLoaded] = (0, import_react.useState)(!bypassCache && !!(_cache && Date.now() - _cacheAt < CACHE_TTL_MS));
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		_subscribers.add(setSettings);
		if (bypassCache) {
			_cache = null;
			_cacheAt = 0;
		}
		fetchSettings().then((s) => {
			if (!cancelled) {
				setSettings(s);
				setLoaded(true);
			}
		});
		return () => {
			cancelled = true;
			_subscribers.delete(setSettings);
		};
	}, []);
	return {
		settings,
		loaded
	};
}
//#endregion
export { usePlatformSettings as n, invalidatePlatformSettings as t };
