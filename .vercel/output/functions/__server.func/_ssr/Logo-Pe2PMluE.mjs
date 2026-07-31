import { m as require_jsx_runtime } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Logo-Pe2PMluE.js
var import_jsx_runtime = require_jsx_runtime();
function Logo({ size = "md", withText = true, to = "/" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: "inline-flex items-center gap-2 group",
		"aria-label": "DerivGrid home",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `relative inline-flex ${size === "sm" ? "size-6" : size === "lg" ? "size-9" : "size-7"} items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground font-bold shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shrink-0`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 24 24",
				fill: "none",
				className: "size-3/5",
				"aria-hidden": true,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M3 17l4-4 3 3 5-6 4 5",
					stroke: "currentColor",
					strokeWidth: "2.5",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M16 7l3 0 0 3",
					stroke: "currentColor",
					strokeWidth: "2.5",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})]
			})
		}), withText && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: `${size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg"} font-bold tracking-tight text-foreground`,
			children: ["Deriv", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-primary",
				children: "Grid"
			})]
		})]
	});
}
//#endregion
export { Logo as t };
