import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as stringType, n as enumType, r as objectType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-DCkRAm4_.js
var $$splitComponentImporter = () => import("./auth-2Yc-b30H.mjs");
var authSearchSchema = objectType({
	tab: enumType(["login", "register"]).optional().catch("login"),
	redirect: stringType().optional()
});
var Route = createFileRoute("/auth")({
	validateSearch: authSearchSchema,
	head: () => ({ meta: [{ title: "Sign in or create account · DerivGrid" }, {
		name: "description",
		content: "Sign in to your DerivGrid trading account or open a new one in minutes."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
