/**
 * useRole — fetches the current user's role from user_roles.
 * Returns "user" | "admin" | "support" | null.
 *
 * Usage:
 *   const { role, isAdmin, isLoading } = useRole();
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "user" | "admin" | "support";

interface UseRoleResult {
  role: AppRole | null;
  isAdmin: boolean;
  isSupport: boolean;
  isLoading: boolean;
  userId: string | null;
}

// Session-scoped cache — cleared on sign-out or new session
let _cache: { userId: string; role: AppRole } | null = null;

export function useRole(): UseRoleResult {
  const [role, setRole] = useState<AppRole | null>(_cache?.role ?? null);
  const [userId, setUserId] = useState<string | null>(_cache?.userId ?? null);
  const [isLoading, setIsLoading] = useState(_cache === null);

  useEffect(() => {
    let cancelled = false;

    const fetchRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (!cancelled) { setRole(null); setUserId(null); setIsLoading(false); }
          return;
        }

        const uid = session.user.id;

        // Use cache if it's for the same user
        if (_cache && _cache.userId === uid) {
          if (!cancelled) { setRole(_cache.role); setUserId(uid); setIsLoading(false); }
          return;
        }

        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", uid)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cancelled) return;

        // Default to "user" if no role row exists
        const resolvedRole: AppRole = (data?.role as AppRole) ?? "user";

        _cache = { userId: uid, role: resolvedRole };
        setRole(resolvedRole);
        setUserId(uid);
      } catch {
        if (!cancelled) setRole("user");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchRole();
    return () => { cancelled = true; };
  }, []);

  // Invalidate cache on auth state change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        _cache = null;
        setRole(null);
        setUserId(null);
        setIsLoading(false);
      } else if (event === "SIGNED_IN" && session?.user) {
        // Re-fetch role on new sign-in (don't rely on stale cache)
        _cache = null;
        setIsLoading(true);
        setRole(null);
        supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
          .then(({ data }) => {
            const resolvedRole: AppRole = (data?.role as AppRole) ?? "user";
            _cache = { userId: session.user.id, role: resolvedRole };
            setRole(resolvedRole);
            setUserId(session.user.id);
            setIsLoading(false);
          });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return {
    role,
    isAdmin: role === "admin",
    isSupport: role === "support" || role === "admin",
    isLoading,
    userId,
  };
}

/** Call after granting/revoking admin to force re-fetch on next render */
export function invalidateRoleCache() {
  _cache = null;
}
