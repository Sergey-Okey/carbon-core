import { RuntimeConfig as UserRuntimeConfig, PublicRuntimeConfig as UserPublicRuntimeConfig } from 'nuxt/schema'
import { NuxtModule, ModuleDependencyMeta } from '@nuxt/schema'
  interface SharedRuntimeConfig {
   app: {
      buildId: string,

      baseURL: string,

      buildAssetsDir: string,

      cdnURL: string,
   },

   nitro: {
      envPrefix: string,
   },
  }
  interface SharedPublicRuntimeConfig {
   motion: any,
  }
declare module '@nuxt/schema' {
  interface ModuleDependencies {
    ["pinia"]?: ModuleDependencyMeta<typeof import("@pinia/nuxt").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["vueuse"]?: ModuleDependencyMeta<typeof import("@vueuse/nuxt").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@vercel/speed-insights"]?: ModuleDependencyMeta<typeof import("@vercel/speed-insights/nuxt").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@vercel/analytics"]?: ModuleDependencyMeta<typeof import("@vercel/analytics/nuxt").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@vueuse/motion"]?: ModuleDependencyMeta<typeof import("@vueuse/motion/nuxt").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/devtools"]?: ModuleDependencyMeta<typeof import("@nuxt/devtools").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/telemetry"]?: ModuleDependencyMeta<typeof import("@nuxt/telemetry").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
  }
  interface NuxtOptions {
    /**
     * Configuration for `@pinia/nuxt`
     */
    ["pinia"]: typeof import("@pinia/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@vueuse/nuxt`
     */
    ["vueuse"]: typeof import("@vueuse/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@vercel/speed-insights/nuxt`
     */
    ["speedInsights"]: typeof import("@vercel/speed-insights/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@vercel/analytics/nuxt`
     */
    ["analytics"]: typeof import("@vercel/analytics/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@vueuse/motion/nuxt`
     */
    ["motion"]: typeof import("@vueuse/motion/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/devtools`
     */
    ["devtools"]: typeof import("@nuxt/devtools").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     */
    ["telemetry"]: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
  }
  interface NuxtConfig {
    /**
     * Configuration for `@pinia/nuxt`
     */
    ["pinia"]?: typeof import("@pinia/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@vueuse/nuxt`
     */
    ["vueuse"]?: typeof import("@vueuse/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@vercel/speed-insights/nuxt`
     */
    ["speedInsights"]?: typeof import("@vercel/speed-insights/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@vercel/analytics/nuxt`
     */
    ["analytics"]?: typeof import("@vercel/analytics/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@vueuse/motion/nuxt`
     */
    ["motion"]?: typeof import("@vueuse/motion/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/devtools`
     */
    ["devtools"]?: typeof import("@nuxt/devtools").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     */
    ["telemetry"]?: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    modules?: (undefined | null | false | NuxtModule<any> | string | [NuxtModule | string, Record<string, any>] | ["@pinia/nuxt", Exclude<NuxtConfig["pinia"], boolean>] | ["@vueuse/nuxt", Exclude<NuxtConfig["vueuse"], boolean>] | ["@vercel/speed-insights", Exclude<NuxtConfig["speedInsights"], boolean>] | ["@vercel/analytics", Exclude<NuxtConfig["analytics"], boolean>] | ["@vueuse/motion", Exclude<NuxtConfig["motion"], boolean>] | ["@nuxt/devtools", Exclude<NuxtConfig["devtools"], boolean>] | ["@nuxt/telemetry", Exclude<NuxtConfig["telemetry"], boolean>])[],
  }
  interface RuntimeConfig extends UserRuntimeConfig {}
  interface PublicRuntimeConfig extends UserPublicRuntimeConfig {}
}
declare module 'nuxt/schema' {
  interface ModuleDependencies {
    ["pinia"]?: ModuleDependencyMeta<typeof import("@pinia/nuxt").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["vueuse"]?: ModuleDependencyMeta<typeof import("@vueuse/nuxt").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@vercel/speed-insights"]?: ModuleDependencyMeta<typeof import("@vercel/speed-insights/nuxt").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@vercel/analytics"]?: ModuleDependencyMeta<typeof import("@vercel/analytics/nuxt").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@vueuse/motion"]?: ModuleDependencyMeta<typeof import("@vueuse/motion/nuxt").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/devtools"]?: ModuleDependencyMeta<typeof import("@nuxt/devtools").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/telemetry"]?: ModuleDependencyMeta<typeof import("@nuxt/telemetry").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
  }
  interface NuxtOptions {
    /**
     * Configuration for `@pinia/nuxt`
     * @see https://www.npmjs.com/package/@pinia/nuxt
     */
    ["pinia"]: typeof import("@pinia/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@vueuse/nuxt`
     * @see https://www.npmjs.com/package/@vueuse/nuxt
     */
    ["vueuse"]: typeof import("@vueuse/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@vercel/speed-insights/nuxt`
     * @see https://vercel.com/docs/speed-insights/quickstart
     */
    ["speedInsights"]: typeof import("@vercel/speed-insights/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@vercel/analytics/nuxt`
     * @see https://vercel.com/docs/analytics/quickstart
     */
    ["analytics"]: typeof import("@vercel/analytics/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@vueuse/motion/nuxt`
     */
    ["motion"]: typeof import("@vueuse/motion/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/devtools`
     * @see https://www.npmjs.com/package/@nuxt/devtools
     */
    ["devtools"]: typeof import("@nuxt/devtools").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     * @see https://www.npmjs.com/package/@nuxt/telemetry
     */
    ["telemetry"]: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
  }
  interface NuxtConfig {
    /**
     * Configuration for `@pinia/nuxt`
     * @see https://www.npmjs.com/package/@pinia/nuxt
     */
    ["pinia"]?: typeof import("@pinia/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@vueuse/nuxt`
     * @see https://www.npmjs.com/package/@vueuse/nuxt
     */
    ["vueuse"]?: typeof import("@vueuse/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@vercel/speed-insights/nuxt`
     * @see https://vercel.com/docs/speed-insights/quickstart
     */
    ["speedInsights"]?: typeof import("@vercel/speed-insights/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@vercel/analytics/nuxt`
     * @see https://vercel.com/docs/analytics/quickstart
     */
    ["analytics"]?: typeof import("@vercel/analytics/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@vueuse/motion/nuxt`
     */
    ["motion"]?: typeof import("@vueuse/motion/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/devtools`
     * @see https://www.npmjs.com/package/@nuxt/devtools
     */
    ["devtools"]?: typeof import("@nuxt/devtools").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     * @see https://www.npmjs.com/package/@nuxt/telemetry
     */
    ["telemetry"]?: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    modules?: (undefined | null | false | NuxtModule<any> | string | [NuxtModule | string, Record<string, any>] | ["@pinia/nuxt", Exclude<NuxtConfig["pinia"], boolean>] | ["@vueuse/nuxt", Exclude<NuxtConfig["vueuse"], boolean>] | ["@vercel/speed-insights", Exclude<NuxtConfig["speedInsights"], boolean>] | ["@vercel/analytics", Exclude<NuxtConfig["analytics"], boolean>] | ["@vueuse/motion", Exclude<NuxtConfig["motion"], boolean>] | ["@nuxt/devtools", Exclude<NuxtConfig["devtools"], boolean>] | ["@nuxt/telemetry", Exclude<NuxtConfig["telemetry"], boolean>])[],
  }
  interface RuntimeConfig extends SharedRuntimeConfig {}
  interface PublicRuntimeConfig extends SharedPublicRuntimeConfig {}
}
declare module 'vue' {
        interface ComponentCustomProperties {
          $config: UserRuntimeConfig
        }
      }