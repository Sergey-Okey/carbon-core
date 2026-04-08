import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineNuxtModule } from "@nuxt/kit";
import { metadata } from "@vueuse/metadata";
import { isPackageExists } from "local-pkg";

//#region index.ts
const _dirname = dirname(fileURLToPath(import.meta.url));
const disabledFunctions = [
	"toRefs",
	"toRef",
	"toValue",
	"useFetch",
	"useCookie",
	"useHead",
	"useStorage",
	"useImage"
];
const packages = [
	"core",
	"shared",
	"components",
	"motion",
	"firebase",
	"rxjs",
	"sound",
	"math",
	"router"
];
const fullPackages = packages.map((p) => `@vueuse/${p}`);
/**
* Auto import for VueUse in Nuxt
* Usage:
*
* ```ts
* // nuxt.config.js
* export default {
*   buildModules: [
*     '@vueuse/nuxt'
*   ]
* }
* ```
*/
var nuxt_default = defineNuxtModule({
	meta: {
		name: "vueuse",
		configKey: "vueuse"
	},
	defaults: {
		ssrHandlers: false,
		autoImports: true
	},
	setup(options, nuxt) {
		nuxt.hook("vite:extend", ({ config }) => {
			config.optimizeDeps = config.optimizeDeps || {};
			config.optimizeDeps.exclude = config.optimizeDeps.exclude || [];
			for (const pkg of fullPackages) if (!config.optimizeDeps.exclude.includes(pkg)) config.optimizeDeps.exclude.push(pkg);
		});
		nuxt.options.build = nuxt.options.build || {};
		nuxt.options.build.transpile = nuxt.options.build.transpile || [];
		nuxt.options.build.transpile.push(...fullPackages);
		if (options.ssrHandlers) {
			const pluginPath = resolve(_dirname, "./ssr-plugin.mjs");
			nuxt.options.plugins = nuxt.options.plugins || [];
			nuxt.options.plugins.push(pluginPath);
			nuxt.options.build.transpile.push(pluginPath);
		}
		nuxt.hook("devtools:customTabs", (iframeTabs) => {
			iframeTabs.push({
				name: "vueuse",
				title: "VueUse",
				icon: "i-logos-vueuse",
				view: {
					type: "iframe",
					src: "https://vueuse.org/functions.html"
				}
			});
		});
		if (options.autoImports) nuxt.hook("imports:sources", (sources) => {
			if (sources.find((i) => fullPackages.includes(i.from))) return;
			metadata.functions.forEach((i) => {
				if (i.package === "shared") i.package = "core";
			});
			for (const pkg of packages) {
				if (pkg === "shared") continue;
				if (pkg !== "core" && !isPackageExists(`@vueuse/${pkg}`, { paths: nuxt.options._layers.map((layer) => layer.config.rootDir) })) continue;
				const imports = metadata.functions.filter((i) => i.package === pkg && !i.internal && i.name.length >= 4 && !disabledFunctions.includes(i.name)).flatMap((i) => {
					return [i.name, ...i.alias || []].map((n) => ({
						from: `@vueuse/${i.importPath || i.package}`,
						name: n,
						as: n,
						priority: -1,
						meta: {
							description: i.description,
							docsUrl: i.docs,
							category: i.category
						}
					}));
				});
				sources.push({
					from: "@vueuse/core",
					imports,
					priority: -1
				});
			}
		});
	}
});

//#endregion
export { nuxt_default as default };