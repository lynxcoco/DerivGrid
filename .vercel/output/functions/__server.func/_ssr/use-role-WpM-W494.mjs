import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CMPLK8OQ.mjs";
import { r as require_react } from "../_libs/@hookform/resolvers+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-role-WpM-W494.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* useRole — fetches the current user's role from user_roles.
* Returns "user" | "admin" | "support" | null.
*
* Usage:
*   const { role, isAdmin, isLoading } = useRole();
*/
var _cache = null;
function useRole() {
	const [role, setRole] = (0, import_react.useState)(_cache?.role ?? null);
	const [userId, setUserId] = (0, import_react.useState)(_cache?.userId ?? null);
	const [isLoading, setIsLoading] = (0, import_react.useState)(_cache === null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const fetchRole = async () => {
			try {
				const { data: { session } } = await supabase.auth.getSession();
				if (!session?.user) {
					if (!cancelled) {
						setRole(null);
						setUserId(null);
						setIsLoading(false);
					}
					return;
				}
				const uid = session.user.id;
				if (_cache && _cache.userId === uid) {
					if (!cancelled) {
						setRole(_cache.role);
						setUserId(uid);
						setIsLoading(false);
					}
					return;
				}
				const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", uid).order("created_at", { ascending: false }).limit(1).maybeSingle();
				if (cancelled) return;
				const resolvedRole = data?.role ?? "user";
				_cache = {
					userId: uid,
					role: resolvedRole
				};
				setRole(resolvedRole);
				setUserId(uid);
			} catch {
				if (!cancelled) setRole("user");
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		};
		fetchRole();
		return () => {
			cancelled = true;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
			if (event === "SIGNED_OUT") {
				_cache = null;
				setRole(null);
				setUserId(null);
				setIsLoading(false);
			} else if (event === "SIGNED_IN" && session?.user) {
				_cache = null;
				setIsLoading(true);
				setRole(null);
				supabase.from("user_roles").select("role").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(1).maybeSingle().then(({ data }) => {
					const resolvedRole = data?.role ?? "user";
					_cache = {
						userId: session.user.id,
						role: resolvedRole
					};
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
		userId
	};
}
//#endregion
export { useRole as t };
