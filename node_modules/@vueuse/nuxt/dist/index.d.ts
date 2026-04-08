import * as _nuxt_schema0 from "@nuxt/schema";

//#region index.d.ts
interface VueUseNuxtOptions {
  /**
   * @default true
   */
  autoImports?: boolean;
  /**
   * @experimental
   * @default false
   */
  ssrHandlers?: boolean;
}
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
declare const _default: _nuxt_schema0.NuxtModule<VueUseNuxtOptions, VueUseNuxtOptions, false>;
declare module '@nuxt/schema' {
  interface NuxtConfig {
    vueuse?: VueUseNuxtOptions;
  }
  interface NuxtOptions {
    vueuse?: VueUseNuxtOptions;
  }
}
//#endregion
export { VueUseNuxtOptions, _default as default };