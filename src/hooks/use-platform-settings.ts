import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PlatformSettings = {
  min_deposit_kes: number;
  max_deposit_kes: number;
  min_withdrawal_kes: number;
  max_withdrawal_kes: number;
  min_bet_kes: number;
  maintenance_mode: boolean;
  auto_approve_deposits: boolean;
};

const DEFAULTS: PlatformSettings = {
  min_deposit_kes:       1,
  max_deposit_kes:       150000,
  min_withdrawal_kes:    10,
  max_withdrawal_kes:    300000,
  min_bet_kes:           10,
  maintenance_mode:      false,
  auto_approve_deposits: true,   // default ON — credit wallet immediately
};

// ── Cache with TTL ─────────────────────────────────────────────────────────────
// Settings are cached for 60 seconds so every page load reflects the latest
// values without hammering the DB, while still picking up admin changes quickly.
const CACHE_TTL_MS = 60_000; // 60 s

let _cache:      PlatformSettings | null = null;
let _cacheAt:    number                  = 0;        // timestamp of last fetch
let _fetching:   boolean                 = false;
let _fetchPromise: Promise<PlatformSettings> | null = null;

// Registered setters from all mounted usePlatformSettings() calls.
// When the admin saves, we call all of them to force a re-render.
const _subscribers = new Set<(s: PlatformSettings) => void>();

function mapRow(data: Record<string, any>): PlatformSettings {
  return {
    min_deposit_kes:       (data.min_deposit_cents    ?? DEFAULTS.min_deposit_kes    * 100) / 100,
    max_deposit_kes:       (data.max_deposit_cents    ?? DEFAULTS.max_deposit_kes    * 100) / 100,
    min_withdrawal_kes:    (data.min_withdrawal_cents ?? DEFAULTS.min_withdrawal_kes * 100) / 100,
    max_withdrawal_kes:    (data.max_withdrawal_cents ?? DEFAULTS.max_withdrawal_kes * 100) / 100,
    min_bet_kes:           (data.min_bet_cents        ?? DEFAULTS.min_bet_kes        * 100) / 100,
    maintenance_mode:      data.maintenance_mode      ?? false,
    auto_approve_deposits: data.auto_approve_deposits ?? true,
  };
}

async function fetchSettings(): Promise<PlatformSettings> {
  // Return cached value if it's still fresh
  if (_cache && Date.now() - _cacheAt < CACHE_TTL_MS) return _cache;

  // Deduplicate concurrent callers — return the in-flight promise
  if (_fetching && _fetchPromise) return _fetchPromise;

  _fetching     = true;
  _fetchPromise = (async () => {
    try {
      const { data, error } = await (supabase.from("platform_settings") as any)
        .select("*").eq("id", "global").single();

      const settings = (error || !data) ? DEFAULTS : mapRow(data as Record<string, any>);
      _cache   = settings;
      _cacheAt = Date.now();
      return settings;
    } catch {
      _cache   = DEFAULTS;
      _cacheAt = Date.now();
      return DEFAULTS;
    } finally {
      _fetching     = false;
      _fetchPromise = null;
    }
  })();

  return _fetchPromise;
}

/**
 * Call this after the admin saves platform settings.
 * Clears the cache AND pushes fresh values to every mounted component immediately.
 */
export async function invalidatePlatformSettings() {
  _cache   = null;
  _cacheAt = 0;
  // Re-fetch and broadcast to all subscribers
  const fresh = await fetchSettings();
  _subscribers.forEach(fn => fn(fresh));
}

export function usePlatformSettings(options?: { fresh?: boolean }) {
  // If fresh=true, always fetch from DB — never use cache.
  // Used on deposit/withdraw pages where stale limits could cause UX issues.
  const bypassCache = options?.fresh === true;

  // Start with the cached value (avoids a flash of DEFAULTS on re-renders)
  const [settings, setSettings] = useState<PlatformSettings>(
    (!bypassCache && _cache) ? _cache : DEFAULTS
  );
  const [loaded, setLoaded] = useState<boolean>(
    !bypassCache && !!(_cache && Date.now() - _cacheAt < CACHE_TTL_MS)
  );

  useEffect(() => {
    let cancelled = false;

    // Register this component as a subscriber so invalidatePlatformSettings()
    // can push fresh values without requiring a page reload
    _subscribers.add(setSettings);

    if (bypassCache) {
      // Force a live DB fetch — skip cache entirely
      _cache   = null;
      _cacheAt = 0;
    }

    fetchSettings().then(s => {
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

  return { settings, loaded };
}
