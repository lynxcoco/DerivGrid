/**
 * useRole — fetches the current user's highest-priority role from user_roles.
 *
 * A user can have multiple role rows (e.g. both 'user' and 'admin').
 * We always resolve the highest-privilege role: admin > marketer > support > user.
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "user" | "admin" | "support" | "marketer";

const ROLE_PRIORITY: Record<AppRole, number> = {
  admin: 4, marketer: 3, support: 2, user: 1,
};

function resolveHighestRole(rows: { role: string }[]): AppRole {
  if (!rows || rows.length === 0) return "user";
  return rows.reduce<AppRole>((best, r) => {
    const role = r.role as AppRole;
    return (ROLE_PRIORITY[role] ?? 0) > (ROLE_PRIORITY[best] ?? 0) ? role : best;
  }, "user");
}

interface UseRoleResult {
  role: AppRole | null;
  isAdmin: boolean;
  isSupport: boolean;
  isMarketer: boolean;
  isLoading: boolean;
  userId: string | null;
}

// Session-scoped cache
let _cache: { userId: string; role: AppRole } | null = null;

export function useRole(): UseRoleResult {
  const [role, setRole]       = useState<AppRole | null>(_cache?.role ?? null);
  const [userId, setUserId]   = useState<string | null>(_cache?.userId ?? null);
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
        if (_cache && _cache.userId === uid) {
          if (!cancelled) { setRole(_cache.role); setUserId(uid); setIsLoading(false); }
          return;
        }
        // Fetch ALL role rows — handle multi-row users (e.g. admin also has 'user' row)
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", uid);

        if (cancelled) return;
        const resolvedRole = resolveHighestRole(data ?? []);
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        _cache = null; setRole(null); setUserId(null); setIsLoading(false);
      } else if (event === "SIGNED_IN" && session?.user) {
        _cache = null; setIsLoading(true); setRole(null);
        supabase.from("user_roles").select("role").eq("user_id", session.user.id)
          .then(({ data }) => {
            const resolvedRole = resolveHighestRole(data ?? []);
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
    isAdmin:    role === "admin",
    isSupport:  role === "support" || role === "admin",
    isMarketer: role === "marketer",
    isLoading,
    userId,
  };
}

export function invalidateRoleCache() {
  _cache = null;
}
