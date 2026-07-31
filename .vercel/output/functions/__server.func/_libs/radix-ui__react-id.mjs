import { i as __toESM } from "../_runtime.mjs";
import { r as require_react } from "./@hookform/resolvers+[...].mjs";
import { s as useLayoutEffect2 } from "./@radix-ui/react-checkbox+[...].mjs";
//#region node_modules/@radix-ui/react-id/dist/index.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var useReactId = import_react[" useId ".trim().toString()] || (() => void 0);
var count = 0;
function useId(deterministicId) {
	const [id, setId] = import_react.useState(useReactId());
	useLayoutEffect2(() => {
		if (!deterministicId) setId((reactId) => reactId ?? String(count++));
	}, [deterministicId]);
	return deterministicId || (id ? `radix-${id}` : "");
}
//#endregion
export { useId as t };
