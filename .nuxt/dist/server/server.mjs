import { shallowReactive, reactive, effectScope, getCurrentScope, hasInjectionContext, getCurrentInstance, inject, toRef, shallowRef, isReadonly, isRef, isShallow, isReactive, toRaw, defineComponent, createElementBlock, provide, cloneVNode, h, defineAsyncComponent, computed, unref, Suspense, nextTick, mergeProps, ref, Fragment, watch, useSSRContext, withAsyncContext, withCtx, createVNode, onErrorCaptured, onServerPrefetch, resolveDynamicComponent, createApp } from "vue";
import { $fetch as $fetch$1 } from "C:/Users/smm/Documents/Programing Dev/carbon-core/node_modules/ofetch/dist/node.mjs";
import { baseURL } from "#internal/nuxt/paths";
import { createHooks } from "C:/Users/smm/Documents/Programing Dev/carbon-core/node_modules/hookable/dist/index.mjs";
import { getContext, executeAsync } from "C:/Users/smm/Documents/Programing Dev/carbon-core/node_modules/unctx/dist/index.mjs";
import { sanitizeStatusCode, createError as createError$1 } from "C:/Users/smm/Documents/Programing Dev/carbon-core/node_modules/h3/dist/index.mjs";
import { shouldHydrate, setActivePinia, createPinia, defineStore } from "pinia";
import { defu } from "C:/Users/smm/Documents/Programing Dev/carbon-core/node_modules/defu/dist/defu.mjs";
import { START_LOCATION, createMemoryHistory, createRouter, useRoute as useRoute$1, RouterView } from "vue-router";
import { hasProtocol, joinURL, withQuery, parseURL, encodePath, decodePath, isScriptProtocol } from "C:/Users/smm/Documents/Programing Dev/carbon-core/node_modules/ufo/dist/index.mjs";
import "C:/Users/smm/Documents/Programing Dev/carbon-core/node_modules/klona/dist/index.mjs";
import { ssrRenderTeleport, ssrInterpolate, ssrRenderComponent, ssrRenderSuspense, ssrRenderVNode } from "vue/server-renderer";
import { v4 } from "uuid";
if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch$1.create({
    baseURL: baseURL()
  });
}
if (!("global" in globalThis)) {
  globalThis.global = globalThis;
}
const appLayoutTransition = false;
const nuxtLinkDefaults = { "componentName": "NuxtLink" };
const appId = "nuxt-app";
function getNuxtAppCtx(id = appId) {
  return getContext(id, {
    asyncContext: false
  });
}
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  let hydratingCount = 0;
  const nuxtApp = {
    _id: options.id || appId || "nuxt-app",
    _scope: effectScope(),
    provide: void 0,
    globalName: "nuxt",
    versions: {
      get nuxt() {
        return "3.21.2";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      ...options.ssrContext?.payload || {},
      data: shallowReactive({}),
      state: reactive({}),
      once: /* @__PURE__ */ new Set(),
      _errors: shallowReactive({})
    }),
    static: {
      data: {}
    },
    runWithContext(fn) {
      if (nuxtApp._scope.active && !getCurrentScope()) {
        return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
      }
      return callWithNuxt(nuxtApp, fn);
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: shallowReactive({}),
    _payloadRevivers: {},
    ...options
  };
  {
    nuxtApp.payload.serverRendered = true;
  }
  if (nuxtApp.ssrContext) {
    nuxtApp.payload.path = nuxtApp.ssrContext.url;
    nuxtApp.ssrContext.nuxt = nuxtApp;
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: nuxtApp.ssrContext.runtimeConfig.public,
      app: nuxtApp.ssrContext.runtimeConfig.app
    };
  }
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, ...args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
function registerPluginHooks(nuxtApp, plugin2) {
  if (plugin2.hooks) {
    nuxtApp.hooks.addHooks(plugin2.hooks);
  }
}
async function applyPlugin(nuxtApp, plugin2) {
  if (typeof plugin2 === "function") {
    const { provide: provide2 } = await nuxtApp.runWithContext(() => plugin2(nuxtApp)) || {};
    if (provide2 && typeof provide2 === "object") {
      for (const key in provide2) {
        nuxtApp.provide(key, provide2[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  const resolvedPlugins = /* @__PURE__ */ new Set();
  const unresolvedPlugins = [];
  const parallels = [];
  let error = void 0;
  let promiseDepth = 0;
  async function executePlugin(plugin2) {
    const unresolvedPluginsForThisPlugin = plugin2.dependsOn?.filter((name) => plugins2.some((p) => p._name === name) && !resolvedPlugins.has(name)) ?? [];
    if (unresolvedPluginsForThisPlugin.length > 0) {
      unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin2]);
    } else {
      const promise = applyPlugin(nuxtApp, plugin2).then(async () => {
        if (plugin2._name) {
          resolvedPlugins.add(plugin2._name);
          await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
            if (dependsOn.has(plugin2._name)) {
              dependsOn.delete(plugin2._name);
              if (dependsOn.size === 0) {
                promiseDepth++;
                await executePlugin(unexecutedPlugin);
              }
            }
          }));
        }
      }).catch((e) => {
        if (!plugin2.parallel && !nuxtApp.payload.error) {
          throw e;
        }
        error ||= e;
      });
      if (plugin2.parallel) {
        parallels.push(promise);
      } else {
        await promise;
      }
    }
  }
  for (const plugin2 of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin2.env?.islands === false) {
      continue;
    }
    registerPluginHooks(nuxtApp, plugin2);
  }
  for (const plugin2 of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin2.env?.islands === false) {
      continue;
    }
    await executePlugin(plugin2);
  }
  await Promise.all(parallels);
  if (promiseDepth) {
    for (let i = 0; i < promiseDepth; i++) {
      await Promise.all(parallels);
    }
  }
  if (error) {
    throw nuxtApp.payload.error || error;
  }
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin2) {
  if (typeof plugin2 === "function") {
    return plugin2;
  }
  const _name = plugin2._name || plugin2.name;
  delete plugin2.name;
  return Object.assign(plugin2.setup || (() => {
  }), plugin2, { [NuxtPluginIndicator]: true, _name });
}
const definePayloadPlugin = defineNuxtPlugin;
function callWithNuxt(nuxt, setup, args) {
  const fn = () => setup();
  const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
function tryUseNuxtApp(id) {
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = getCurrentInstance()?.appContext.app.$nuxt;
  }
  nuxtAppInstance ||= getNuxtAppCtx(id).tryUse();
  return nuxtAppInstance || null;
}
function useNuxtApp(id) {
  const nuxtAppInstance = tryUseNuxtApp(id);
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const LayoutMetaSymbol = /* @__PURE__ */ Symbol("layout-meta");
const PageRouteSymbol = /* @__PURE__ */ Symbol("route");
import.meta.url.replace(/\/app\/.*$/, "/");
const useRouter = () => {
  return useNuxtApp()?.$router;
};
const useRoute = () => {
  if (hasInjectionContext()) {
    return inject(PageRouteSymbol, useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
const URL_QUOTE_RE = /"/g;
const navigateTo = (to, options) => {
  to ||= "/";
  const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
  const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
  const isExternal = options?.external || isExternalHost;
  if (isExternal) {
    if (!options?.external) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const { protocol } = new URL(toPath, "http://localhost");
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
      const redirect = async function(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedLoc = location2.replace(URL_QUOTE_RE, "%22");
        const encodedHeader = encodeURL(location2, isExternalHost);
        nuxtApp.ssrContext["~renderResponse"] = {
          statusCode: sanitizeStatusCode(options?.redirectCode || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: encodedHeader }
        };
        return response;
      };
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options?.replace) {
      (void 0).replace(toPath);
    } else {
      (void 0).href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  const encodedTo = typeof to === "string" ? encodeRoutePath(to) : to;
  return options?.replace ? router.replace(encodedTo) : router.push(encodedTo);
};
function resolveRouteObject(to) {
  return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
function encodeURL(location2, isExternalHost = false) {
  const url = new URL(location2, "http://localhost");
  if (!isExternalHost) {
    return url.pathname + url.search + url.hash;
  }
  if (location2.startsWith("//")) {
    return url.toString().replace(url.protocol, "");
  }
  return url.toString();
}
function encodeRoutePath(url) {
  const parsed = parseURL(url);
  return encodePath(decodePath(parsed.pathname)) + parsed.search + parsed.hash;
}
const NUXT_ERROR_SIGNATURE = "__nuxt_error";
const useError = /* @__NO_SIDE_EFFECTS__ */ () => toRef(useNuxtApp().payload, "error");
const showError = (error) => {
  const nuxtError = createError(error);
  try {
    const error2 = /* @__PURE__ */ useError();
    if (false) ;
    error2.value ||= nuxtError;
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
const isNuxtError = (error) => !!error && typeof error === "object" && NUXT_ERROR_SIGNATURE in error;
const createError = (error) => {
  if (typeof error !== "string" && error.statusText) {
    error.message ??= error.statusText;
  }
  const nuxtError = createError$1(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  Object.defineProperty(nuxtError, "status", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusCode,
    configurable: true
  });
  Object.defineProperty(nuxtError, "statusText", {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    get: () => nuxtError.statusMessage,
    configurable: true
  });
  return nuxtError;
};
const matcher = (m, p) => {
  return [];
};
const _routeRulesMatcher = (path) => defu({}, ...matcher().map((r) => r.data).reverse());
const routeRulesMatcher$1 = _routeRulesMatcher;
function getRouteRules(arg) {
  const path = typeof arg === "string" ? arg : arg.path;
  try {
    return routeRulesMatcher$1(path);
  } catch (e) {
    console.error("[nuxt] Error matching route rules.", e);
    return {};
  }
}
function definePayloadReducer(name, reduce) {
  {
    useNuxtApp().ssrContext["~payloadReducers"][name] = reduce;
  }
}
const payloadPlugin = definePayloadPlugin(() => {
  definePayloadReducer(
    "skipHydrate",
    // We need to return something truthy to be treated as a match
    (data) => !shouldHydrate(data) && 1
  );
});
const unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  enforce: "pre",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    nuxtApp.vueApp.use(head);
  }
});
function toArray$1(value) {
  return Array.isArray(value) ? value : [value];
}
const _routes = [
  {
    name: "index",
    path: "/",
    component: () => import("./_nuxt/index-A0G2byRJ.js")
  },
  {
    name: "onboarding",
    path: "/onboarding",
    component: () => import("./_nuxt/onboarding-DLEXMx50.js")
  }
];
const _wrapInTransition = (props, children) => {
  return { default: () => children.default?.() };
};
const ROUTE_KEY_PARENTHESES_RE = /(:\w+)\([^)]+\)/g;
const ROUTE_KEY_SYMBOLS_RE = /(:\w+)[?+*]/g;
const ROUTE_KEY_NORMAL_RE = /:\w+/g;
function generateRouteKey(route) {
  const source = route?.meta.key ?? route.path.replace(ROUTE_KEY_PARENTHESES_RE, "$1").replace(ROUTE_KEY_SYMBOLS_RE, "$1").replace(ROUTE_KEY_NORMAL_RE, (r) => route.params[r.slice(1)]?.toString() || "");
  return typeof source === "function" ? source(route) : source;
}
function isChangingPage(to, from) {
  if (to === from || from === START_LOCATION) {
    return false;
  }
  if (generateRouteKey(to) !== generateRouteKey(from)) {
    return true;
  }
  const areComponentsSame = to.matched.every(
    (comp, index) => comp.components && comp.components.default === from.matched[index]?.components?.default
  );
  if (areComponentsSame) {
    return false;
  }
  return true;
}
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}
function _mergeTransitionProps(routeProps) {
  const _props = [];
  for (const prop of routeProps) {
    if (!prop) {
      continue;
    }
    _props.push({
      ...prop,
      onAfterLeave: prop.onAfterLeave ? toArray(prop.onAfterLeave) : void 0,
      onBeforeLeave: prop.onBeforeLeave ? toArray(prop.onBeforeLeave) : void 0
    });
  }
  return defu(..._props);
}
const routerOptions0 = {
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp();
    const hashScrollBehaviour = useRouter().options?.scrollBehaviorType ?? "auto";
    if (to.path.replace(/\/$/, "") === from.path.replace(/\/$/, "")) {
      if (from.hash && !to.hash) {
        return { left: 0, top: 0 };
      }
      if (to.hash) {
        return { el: to.hash, top: _getHashElementScrollMarginTop(to.hash), behavior: hashScrollBehaviour };
      }
      return false;
    }
    const routeAllowsScrollToTop = typeof to.meta.scrollToTop === "function" ? to.meta.scrollToTop(to, from) : to.meta.scrollToTop;
    if (routeAllowsScrollToTop === false) {
      return false;
    }
    if (from === START_LOCATION) {
      return _calculatePosition(to, from, savedPosition, hashScrollBehaviour);
    }
    return new Promise((resolve) => {
      const doScroll = () => {
        requestAnimationFrame(() => resolve(_calculatePosition(to, from, savedPosition, hashScrollBehaviour)));
      };
      nuxtApp.hooks.hookOnce("page:loading:end", () => {
        const transitionPromise = nuxtApp["~transitionPromise"];
        if (transitionPromise) {
          transitionPromise.then(doScroll);
        } else {
          doScroll();
        }
      });
    });
  }
};
function _getHashElementScrollMarginTop(selector) {
  try {
    const elem = (void 0).querySelector(selector);
    if (elem) {
      return (Number.parseFloat(getComputedStyle(elem).scrollMarginTop) || 0) + (Number.parseFloat(getComputedStyle((void 0).documentElement).scrollPaddingTop) || 0);
    }
  } catch {
  }
  return 0;
}
function _calculatePosition(to, from, savedPosition, defaultHashScrollBehaviour) {
  if (savedPosition) {
    return savedPosition;
  }
  const isPageNavigation = isChangingPage(to, from);
  if (to.hash) {
    return {
      el: to.hash,
      top: _getHashElementScrollMarginTop(to.hash),
      behavior: isPageNavigation ? defaultHashScrollBehaviour : "instant"
    };
  }
  return {
    left: 0,
    top: 0
  };
}
const configRouterOptions = {
  hashMode: false,
  scrollBehaviorType: "auto"
};
const routerOptions = {
  ...configRouterOptions,
  ...routerOptions0
};
const validate = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to, from) => {
  let __temp, __restore;
  if (!to.meta?.validate) {
    return;
  }
  const result = ([__temp, __restore] = executeAsync(() => Promise.resolve(to.meta.validate(to))), __temp = await __temp, __restore(), __temp);
  if (result === true) {
    return;
  }
  const error = createError({
    fatal: false,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    status: result && (result.status || result.statusCode) || 404,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    statusText: result && (result.statusText || result.statusMessage) || `Page Not Found: ${to.fullPath}`,
    data: {
      path: to.fullPath
    }
  });
  return error;
});
const manifest_45route_45rule = /* @__PURE__ */ defineNuxtRouteMiddleware((to) => {
  {
    return;
  }
});
const globalMiddleware = [
  validate,
  manifest_45route_45rule
];
const namedMiddleware = {};
const plugin$1 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  async setup(nuxtApp) {
    let __temp, __restore;
    let routerBase = (/* @__PURE__ */ useRuntimeConfig()).app.baseURL;
    const history = routerOptions.history?.(routerBase) ?? createMemoryHistory(routerBase);
    const routes = routerOptions.routes ? ([__temp, __restore] = executeAsync(() => routerOptions.routes(_routes)), __temp = await __temp, __restore(), __temp) ?? _routes : _routes;
    let startPosition;
    const router = createRouter({
      ...routerOptions,
      scrollBehavior: (to, from, savedPosition) => {
        if (from === START_LOCATION) {
          startPosition = savedPosition;
          return;
        }
        if (routerOptions.scrollBehavior) {
          router.options.scrollBehavior = routerOptions.scrollBehavior;
          if ("scrollRestoration" in (void 0).history) {
            const unsub = router.beforeEach(() => {
              unsub();
              (void 0).history.scrollRestoration = "manual";
            });
          }
          return routerOptions.scrollBehavior(to, START_LOCATION, startPosition || savedPosition);
        }
      },
      history,
      routes
    });
    nuxtApp.vueApp.use(router);
    const previousRoute = shallowRef(router.currentRoute.value);
    router.afterEach((_to, from) => {
      previousRoute.value = from;
    });
    Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", {
      get: () => previousRoute.value
    });
    const initialURL = nuxtApp.ssrContext.url;
    const _route = shallowRef(router.currentRoute.value);
    const syncCurrentRoute = () => {
      _route.value = router.currentRoute.value;
    };
    router.afterEach((to, from) => {
      if (to.matched.at(-1)?.components?.default === from.matched.at(-1)?.components?.default) {
        syncCurrentRoute();
      }
    });
    const route = { sync: syncCurrentRoute };
    for (const key in _route.value) {
      Object.defineProperty(route, key, {
        get: () => _route.value[key],
        enumerable: true
      });
    }
    nuxtApp._route = shallowReactive(route);
    nuxtApp._middleware ||= {
      global: [],
      named: {}
    };
    const error = /* @__PURE__ */ useError();
    if (!nuxtApp.ssrContext?.islandContext) {
      router.afterEach(async (to, _from, failure) => {
        delete nuxtApp._processingMiddleware;
        if (failure) {
          await nuxtApp.callHook("page:loading:end");
        }
        if (failure?.type === 4) {
          return;
        }
        if (to.redirectedFrom && to.fullPath !== initialURL) {
          await nuxtApp.runWithContext(() => navigateTo(to.fullPath || "/"));
        }
      });
    }
    try {
      if (true) {
        ;
        [__temp, __restore] = executeAsync(() => router.push(initialURL)), await __temp, __restore();
        ;
      }
      ;
      [__temp, __restore] = executeAsync(() => router.isReady()), await __temp, __restore();
      ;
    } catch (error2) {
      [__temp, __restore] = executeAsync(() => nuxtApp.runWithContext(() => showError(error2))), await __temp, __restore();
    }
    const resolvedInitialRoute = router.currentRoute.value;
    const hasDeferredRoute = false;
    syncCurrentRoute();
    if (nuxtApp.ssrContext?.islandContext) {
      return { provide: { router } };
    }
    const initialLayout = nuxtApp.payload.state._layout;
    router.beforeEach(async (to, from) => {
      await nuxtApp.callHook("page:loading:start");
      to.meta = reactive(to.meta);
      if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) {
        to.meta.layout = initialLayout;
      }
      nuxtApp._processingMiddleware = true;
      if (!nuxtApp.ssrContext?.islandContext) {
        const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
        for (const component of to.matched) {
          const componentMiddleware = component.meta.middleware;
          if (!componentMiddleware) {
            continue;
          }
          for (const entry2 of toArray$1(componentMiddleware)) {
            middlewareEntries.add(entry2);
          }
        }
        const routeRules = getRouteRules({ path: to.path });
        if (routeRules.appMiddleware) {
          for (const key in routeRules.appMiddleware) {
            if (routeRules.appMiddleware[key]) {
              middlewareEntries.add(key);
            } else {
              middlewareEntries.delete(key);
            }
          }
        }
        for (const entry2 of middlewareEntries) {
          const middleware = typeof entry2 === "string" ? nuxtApp._middleware.named[entry2] || await namedMiddleware[entry2]?.().then((r) => r.default || r) : entry2;
          if (!middleware) {
            throw new Error(`Unknown route middleware: '${entry2}'.`);
          }
          try {
            if (false) ;
            const result = await nuxtApp.runWithContext(() => middleware(to, from));
            if (true) {
              if (result === false || result instanceof Error) {
                const error2 = result || createError({
                  status: 404,
                  statusText: `Page Not Found: ${initialURL}`
                });
                await nuxtApp.runWithContext(() => showError(error2));
                return false;
              }
            }
            if (result === true) {
              continue;
            }
            if (result === false) {
              return result;
            }
            if (result) {
              if (isNuxtError(result) && result.fatal) {
                await nuxtApp.runWithContext(() => showError(result));
              }
              return result;
            }
          } catch (err) {
            const error2 = createError(err);
            if (error2.fatal) {
              await nuxtApp.runWithContext(() => showError(error2));
            }
            return error2;
          }
        }
      }
    });
    router.onError(async () => {
      delete nuxtApp._processingMiddleware;
      await nuxtApp.callHook("page:loading:end");
    });
    router.afterEach((to) => {
      if (to.matched.length === 0 && !error.value) {
        return nuxtApp.runWithContext(() => showError(createError({
          status: 404,
          fatal: false,
          statusText: `Page not found: ${to.fullPath}`,
          data: {
            path: to.fullPath
          }
        })));
      }
    });
    nuxtApp.hooks.hookOnce("app:created", async () => {
      try {
        if ("name" in resolvedInitialRoute) {
          resolvedInitialRoute.name = void 0;
        }
        if (hasDeferredRoute) ;
        else {
          await router.replace({
            ...resolvedInitialRoute,
            force: true
          });
        }
        router.options.scrollBehavior = routerOptions.scrollBehavior;
      } catch (error2) {
        await nuxtApp.runWithContext(() => showError(error2));
      }
    });
    return { provide: { router } };
  }
});
const reducers = [
  ["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
  ["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
  ["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
  ["Ref", (data) => isRef(data) && data.value],
  ["Reactive", (data) => isReactive(data) && toRaw(data)]
];
const revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const [reducer, fn] of reducers) {
      definePayloadReducer(reducer, fn);
    }
  }
});
defineComponent({
  name: "ServerPlaceholder",
  render() {
    return createElementBlock("div");
  }
});
const clientOnlySymbol = /* @__PURE__ */ Symbol.for("nuxt:client-only");
defineComponent({
  name: "ClientOnly",
  inheritAttrs: false,
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  ...false,
  setup(props, { slots, attrs }) {
    const mounted = shallowRef(false);
    const vm = getCurrentInstance();
    if (vm) {
      vm._nuxtClientOnly = true;
    }
    provide(clientOnlySymbol, true);
    return () => {
      if (mounted.value) {
        const vnodes = slots.default?.();
        if (vnodes && vnodes.length === 1) {
          return [cloneVNode(vnodes[0], attrs)];
        }
        return vnodes;
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return h(slot);
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = props.fallbackTag || props.placeholderTag || "span";
      return createElementBlock(fallbackTag, attrs, fallbackStr);
    };
  }
});
const plugin = /* @__PURE__ */ defineNuxtPlugin({
  name: "pinia",
  setup(nuxtApp) {
    const pinia = createPinia();
    nuxtApp.vueApp.use(pinia);
    setActivePinia(pinia);
    if (nuxtApp.payload && nuxtApp.payload.pinia) {
      pinia.state.value = nuxtApp.payload.pinia;
    }
    return {
      provide: {
        pinia
      }
    };
  },
  hooks: {
    "app:rendered"() {
      const nuxtApp = useNuxtApp();
      nuxtApp.payload.pinia = toRaw(nuxtApp.$pinia).state.value;
      setActivePinia(void 0);
    }
  }
});
const components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
const plugins = [
  payloadPlugin,
  unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU,
  plugin$1,
  revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms,
  plugin,
  components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4
];
const layouts = {
  default: defineAsyncComponent(() => import("./_nuxt/default-BfvXvtJZ.js").then((m) => m.default || m))
};
const routeRulesMatcher = _routeRulesMatcher;
const LayoutLoader = defineComponent({
  name: "LayoutLoader",
  inheritAttrs: false,
  props: {
    name: String,
    layoutProps: Object
  },
  setup(props, context) {
    return () => h(layouts[props.name], props.layoutProps, context.slots);
  }
});
const nuxtLayoutProps = {
  name: {
    type: [String, Boolean, Object],
    default: null
  },
  fallback: {
    type: [String, Object],
    default: null
  }
};
const __nuxt_component_0 = defineComponent({
  name: "NuxtLayout",
  inheritAttrs: false,
  props: nuxtLayoutProps,
  setup(props, context) {
    const nuxtApp = useNuxtApp();
    const injectedRoute = inject(PageRouteSymbol);
    const shouldUseEagerRoute = !injectedRoute || injectedRoute === useRoute();
    const route = shouldUseEagerRoute ? useRoute$1() : injectedRoute;
    const layout = computed(() => {
      let layout2 = unref(props.name) ?? route?.meta.layout ?? routeRulesMatcher(route?.path).appLayout ?? "default";
      if (layout2 && !(layout2 in layouts)) {
        if (props.fallback) {
          layout2 = unref(props.fallback);
        }
      }
      return layout2;
    });
    const layoutRef = shallowRef();
    context.expose({ layoutRef });
    const done = nuxtApp.deferHydration();
    let lastLayout;
    return () => {
      const hasLayout = !!layout.value && layout.value in layouts;
      const hasTransition = hasLayout && !!(route?.meta.layoutTransition ?? appLayoutTransition);
      const transitionProps = hasTransition && _mergeTransitionProps([
        route?.meta.layoutTransition,
        appLayoutTransition,
        {
          onBeforeLeave() {
            nuxtApp["~transitionPromise"] = new Promise((resolve) => {
              nuxtApp["~transitionFinish"] = resolve;
            });
          },
          onAfterLeave() {
            nuxtApp["~transitionFinish"]?.();
            delete nuxtApp["~transitionFinish"];
            delete nuxtApp["~transitionPromise"];
          }
        }
      ]);
      const previouslyRenderedLayout = lastLayout;
      lastLayout = layout.value;
      return _wrapInTransition(transitionProps, {
        default: () => h(
          Suspense,
          {
            suspensible: true,
            onResolve: async () => {
              await nextTick(done);
            }
          },
          {
            default: () => h(
              LayoutProvider,
              {
                layoutProps: mergeProps(context.attrs, route.meta.layoutProps ?? {}, { ref: layoutRef }),
                key: layout.value || void 0,
                name: layout.value,
                shouldProvide: !props.name,
                isRenderingNewLayout: (name) => {
                  return name !== previouslyRenderedLayout && name === layout.value;
                },
                hasTransition
              },
              context.slots
            )
          }
        )
      }).default();
    };
  }
});
const LayoutProvider = defineComponent({
  name: "NuxtLayoutProvider",
  inheritAttrs: false,
  props: {
    name: {
      type: [String, Boolean]
    },
    layoutProps: {
      type: Object
    },
    hasTransition: {
      type: Boolean
    },
    shouldProvide: {
      type: Boolean
    },
    isRenderingNewLayout: {
      type: Function,
      required: true
    }
  },
  setup(props, context) {
    const name = props.name;
    if (props.shouldProvide) {
      provide(LayoutMetaSymbol, {
        // When name=false, always return true so NuxtPage doesn't skip rendering
        isCurrent: (route) => name === false || name === (route.meta.layout ?? routeRulesMatcher(route.path).appLayout ?? "default")
      });
    }
    const injectedRoute = inject(PageRouteSymbol);
    const isNotWithinNuxtPage = injectedRoute && injectedRoute === useRoute();
    if (isNotWithinNuxtPage) {
      const vueRouterRoute = useRoute$1();
      const reactiveChildRoute = {};
      for (const _key in vueRouterRoute) {
        const key = _key;
        Object.defineProperty(reactiveChildRoute, key, {
          enumerable: true,
          get: () => {
            return props.isRenderingNewLayout(props.name) ? vueRouterRoute[key] : injectedRoute[key];
          }
        });
      }
      provide(PageRouteSymbol, shallowReactive(reactiveChildRoute));
    }
    return () => {
      if (!name || typeof name === "string" && !(name in layouts)) {
        return context.slots.default?.();
      }
      return h(
        LayoutLoader,
        { key: name, layoutProps: props.layoutProps, name },
        context.slots
      );
    };
  }
});
const defineRouteProvider = (name = "RouteProvider") => defineComponent({
  name,
  props: {
    route: {
      type: Object,
      required: true
    },
    vnode: Object,
    vnodeRef: Object,
    renderKey: String,
    trackRootNodes: Boolean
  },
  setup(props) {
    const previousKey = props.renderKey;
    const previousRoute = props.route;
    const route = {};
    for (const key in props.route) {
      Object.defineProperty(route, key, {
        get: () => previousKey === props.renderKey ? props.route[key] : previousRoute[key],
        enumerable: true
      });
    }
    provide(PageRouteSymbol, shallowReactive(route));
    return () => {
      if (!props.vnode) {
        return props.vnode;
      }
      return h(props.vnode, { ref: props.vnodeRef });
    };
  }
});
const RouteProvider = defineRouteProvider();
const __nuxt_component_1 = defineComponent({
  name: "NuxtPage",
  inheritAttrs: false,
  props: {
    name: {
      type: String
    },
    transition: {
      type: [Boolean, Object],
      default: void 0
    },
    keepalive: {
      type: [Boolean, Object],
      default: void 0
    },
    route: {
      type: Object
    },
    pageKey: {
      type: [Function, String],
      default: null
    }
  },
  setup(props, { attrs, slots, expose }) {
    const nuxtApp = useNuxtApp();
    const pageRef = ref();
    inject(PageRouteSymbol, null);
    expose({ pageRef });
    inject(LayoutMetaSymbol, null);
    nuxtApp.deferHydration();
    return () => {
      return h(RouterView, { name: props.name, route: props.route, ...attrs }, {
        default: (routeProps) => {
          return h(Suspense, { suspensible: true }, {
            default() {
              return h(RouteProvider, {
                vnode: slots.default ? normalizeSlot(slots.default, routeProps) : routeProps.Component,
                route: routeProps.route,
                vnodeRef: pageRef
              });
            }
          });
        }
      });
    };
  }
});
function normalizeSlot(slot, data) {
  const slotContent = slot(data);
  return slotContent.length === 1 ? h(slotContent[0]) : h(Fragment, void 0, slotContent);
}
function calculateLevel(totalXP) {
  return Math.floor(Math.sqrt(totalXP / 100));
}
function calculateCurrentXP(totalXP, level) {
  const xpForCurrentLevel = Math.pow(level, 2) * 100;
  return totalXP - xpForCurrentLevel;
}
function calculateNeededXPForNextLevel(level) {
  return Math.pow(level + 1, 2) * 100 - Math.pow(level, 2) * 100;
}
const useUserStore = defineStore(
  "user",
  () => {
    const totalXP = ref(0);
    const coins = ref(100);
    const leaguePoints = ref(0);
    const profile = ref({
      name: "",
      bio: "",
      email: "",
      avatar: ""
    });
    const level = computed(() => calculateLevel(totalXP.value));
    const currentXP = computed(
      () => calculateCurrentXP(totalXP.value, level.value)
    );
    const neededXPForNextLevel = computed(
      () => calculateNeededXPForNextLevel(level.value)
    );
    const levelProgressPercent = computed(() => {
      if (neededXPForNextLevel.value === 0) return 100;
      return currentXP.value / neededXPForNextLevel.value * 100;
    });
    const league = computed(() => {
      if (leaguePoints.value < 1e3) return "Бронза";
      if (leaguePoints.value < 3e3) return "Серебро";
      if (leaguePoints.value < 6e3) return "Золото";
      return "Платина";
    });
    function addXP(amount) {
      totalXP.value += amount;
      leaguePoints.value += amount * 0.5;
    }
    function addCoins(amount) {
      coins.value += amount;
    }
    function reduceLeaguePoints(amount) {
      leaguePoints.value = Math.max(0, leaguePoints.value - amount);
    }
    function updateProfile(newProfile) {
      profile.value = { ...profile.value, ...newProfile };
    }
    return {
      totalXP,
      coins,
      leaguePoints,
      profile,
      level,
      currentXP,
      neededXPForNextLevel,
      levelProgressPercent,
      league,
      addXP,
      addCoins,
      reduceLeaguePoints,
      updateProfile
    };
  },
  {
    persist: { key: "carbon-user", storage: localStorage }
  }
);
const useBranchesStore = defineStore(
  "branches",
  () => {
    const branches = ref([
      {
        id: "FIN",
        displayName: "Финансы",
        icon: "trending-up",
        description: "",
        taskIds: [],
        milestones: [
          {
            id: v4(),
            name: "Основы финансов",
            icon: "trending-up",
            description: "",
            requiredXP: 500,
            currentXP: 0,
            status: "pending",
            taskIds: [],
            position: { x: 200, y: 200 }
          }
        ],
        order: 0
      },
      {
        id: "BODY",
        displayName: "Тело",
        icon: "dumbbell",
        description: "",
        taskIds: [],
        milestones: [
          {
            id: v4(),
            name: "Регулярные тренировки",
            icon: "dumbbell",
            description: "",
            requiredXP: 300,
            currentXP: 0,
            status: "pending",
            taskIds: [],
            position: { x: 500, y: 200 }
          }
        ],
        order: 1
      },
      {
        id: "MIND",
        displayName: "Интеллект",
        icon: "brain",
        description: "",
        taskIds: [],
        milestones: [
          {
            id: v4(),
            name: "Ежедневное чтение",
            icon: "brain",
            description: "",
            requiredXP: 400,
            currentXP: 0,
            status: "pending",
            taskIds: [],
            position: { x: 800, y: 200 }
          }
        ],
        order: 2
      },
      {
        id: "LDR",
        displayName: "Лидерство",
        icon: "users",
        description: "",
        taskIds: [],
        milestones: [
          {
            id: v4(),
            name: "Первая публичная речь",
            icon: "users",
            description: "",
            requiredXP: 200,
            currentXP: 0,
            status: "pending",
            taskIds: [],
            position: { x: 1100, y: 200 }
          }
        ],
        order: 3
      }
    ]);
    const edges = ref([]);
    function addXPToBranch(branchId, xp) {
      const branch = branches.value.find((b) => b.id === branchId);
      if (!branch) return;
      const activeMilestone = branch.milestones.find(
        (m) => m.status === "active"
      );
      if (activeMilestone) {
        activeMilestone.currentXP += xp;
        updateMilestoneStatus(activeMilestone);
      } else {
        const pendingMilestone = branch.milestones.find(
          (m) => m.status === "pending"
        );
        if (pendingMilestone) {
          pendingMilestone.currentXP += xp;
          pendingMilestone.status = "active";
          updateMilestoneStatus(pendingMilestone);
        }
      }
    }
    function updateMilestoneStatus(milestone) {
      if (milestone.currentXP >= milestone.requiredXP) {
        milestone.status = "completed";
        const branch = branches.value.find(
          (b) => b.milestones.some((m) => m.id === milestone.id)
        );
        if (branch) {
          const nextXP = Math.floor(milestone.requiredXP * 1.5);
          const newMilestone = {
            id: v4(),
            name: `Новый этап`,
            icon: branch.icon,
            description: "",
            requiredXP: nextXP,
            currentXP: 0,
            status: "pending",
            taskIds: [],
            position: {
              x: milestone.position.x + 250,
              y: milestone.position.y
            }
          };
          branch.milestones.push(newMilestone);
          edges.value.push({
            id: v4(),
            source: milestone.id,
            target: newMilestone.id,
            type: "smoothstep",
            animated: false,
            style: { stroke: "var(--accent)", strokeWidth: 1 }
          });
        }
      } else {
        milestone.status = "active";
      }
    }
    function addBranch(displayName, icon, description = "", taskIds = []) {
      let x = 200;
      let y = 200;
      if (branches.value.length > 0) {
        const lastBranch = branches.value[branches.value.length - 1];
        const lastMilestone = lastBranch.milestones[0];
        if (lastMilestone) {
          x = lastMilestone.position.x + 300;
          y = lastMilestone.position.y;
        }
      }
      const newBranch = {
        id: v4(),
        displayName,
        icon,
        description,
        taskIds,
        milestones: [
          {
            id: v4(),
            name: displayName,
            icon,
            description,
            requiredXP: 500,
            currentXP: 0,
            status: "pending",
            taskIds,
            position: { x, y }
          }
        ],
        order: branches.value.length
      };
      branches.value.push(newBranch);
    }
    function deleteBranch(branchId) {
      const index = branches.value.findIndex((b) => b.id === branchId);
      if (index !== -1) {
        const milestoneIds = branches.value[index].milestones.map((m) => m.id);
        edges.value = edges.value.filter(
          (e) => !milestoneIds.includes(e.source) && !milestoneIds.includes(e.target)
        );
        branches.value.splice(index, 1);
      }
    }
    function addMilestone(branchId, name, description = "", position) {
      const branch = branches.value.find((b) => b.id === branchId);
      if (!branch) return;
      const last = branch.milestones[branch.milestones.length - 1];
      const newMilestone = {
        id: v4(),
        name,
        icon: branch.icon,
        description,
        requiredXP: last ? Math.floor(last.requiredXP * 1.5) : 500,
        currentXP: 0,
        status: "pending",
        taskIds: [],
        position: position || {
          x: (last?.position.x || 200) + 250,
          y: last?.position.y || 200
        }
      };
      branch.milestones.push(newMilestone);
      if (last) {
        edges.value.push({
          id: v4(),
          source: last.id,
          target: newMilestone.id,
          type: "smoothstep",
          animated: false,
          style: { stroke: "var(--accent)", strokeWidth: 1 }
        });
      }
    }
    function updateMilestone(milestoneId, updates) {
      for (const branch of branches.value) {
        const milestone = branch.milestones.find((m) => m.id === milestoneId);
        if (milestone) {
          if (updates.name !== void 0) milestone.name = updates.name;
          if (updates.description !== void 0)
            milestone.description = updates.description;
          if (updates.icon !== void 0) milestone.icon = updates.icon;
          if (updates.taskIds !== void 0) milestone.taskIds = updates.taskIds;
          if (updates.requiredXP !== void 0)
            milestone.requiredXP = updates.requiredXP;
          if (updates.currentXP !== void 0)
            milestone.currentXP = updates.currentXP;
          if (updates.status !== void 0) milestone.status = updates.status;
          if (updates.position !== void 0)
            milestone.position = updates.position;
          break;
        }
      }
    }
    function deleteMilestone(milestoneId) {
      for (const branch of branches.value) {
        const index = branch.milestones.findIndex((m) => m.id === milestoneId);
        if (index !== -1) {
          branch.milestones.splice(index, 1);
          edges.value = edges.value.filter(
            (e) => e.source !== milestoneId && e.target !== milestoneId
          );
          break;
        }
      }
    }
    function addEdge(edge) {
      edges.value.push(edge);
    }
    function removeEdge(edgeId) {
      edges.value = edges.value.filter((e) => e.id !== edgeId);
    }
    function updateEdge(updatedEdge) {
      const index = edges.value.findIndex((e) => e.id === updatedEdge.id);
      if (index !== -1) {
        edges.value[index] = updatedEdge;
      }
    }
    function updateBranch(branchId, updates) {
      const branch = branches.value.find((b) => b.id === branchId);
      if (branch) {
        if (updates.displayName !== void 0)
          branch.displayName = updates.displayName;
        if (updates.icon !== void 0) branch.icon = updates.icon;
        if (updates.description !== void 0)
          branch.description = updates.description;
        if (updates.taskIds !== void 0) branch.taskIds = updates.taskIds;
        const firstMilestone = branch.milestones[0];
        if (firstMilestone) {
          if (updates.displayName) firstMilestone.name = updates.displayName;
          if (updates.icon) firstMilestone.icon = updates.icon;
          if (updates.description)
            firstMilestone.description = updates.description;
          if (updates.taskIds) firstMilestone.taskIds = updates.taskIds;
        }
      }
    }
    return {
      branches,
      edges,
      addXPToBranch,
      addBranch,
      deleteBranch,
      addMilestone,
      updateMilestone,
      deleteMilestone,
      addEdge,
      removeEdge,
      updateEdge,
      updateBranch
    };
  },
  {
    persist: { key: "carbon-branches", storage: localStorage }
  }
);
const DEFAULT_TAGS = [
  { name: "#финансы", branchId: "FIN", order: 1, isSystem: true },
  { name: "#тело", branchId: "BODY", order: 2, isSystem: true },
  { name: "#интеллект", branchId: "MIND", order: 3, isSystem: true },
  { name: "#лидерство", branchId: "LDR", order: 4, isSystem: true },
  { name: "#работа", branchId: "FIN", order: 5, isSystem: true },
  { name: "#спорт", branchId: "BODY", order: 6, isSystem: true },
  { name: "#учёба", branchId: "MIND", order: 7, isSystem: true },
  { name: "#нетворкинг", branchId: "LDR", order: 8, isSystem: true }
];
const useTagsStore = defineStore(
  "tags",
  () => {
    const tags = ref([]);
    async function initTagsAfterHydration() {
      const store = useTagsStore();
      if (store.$persistedState) {
        await store.$persistedState.isReady;
      }
      ensureSystemTags();
    }
    function ensureSystemTags() {
      const systemNames = DEFAULT_TAGS.map((t) => t.name);
      const existingNames = tags.value.map((t) => t.name);
      const missing = systemNames.filter(
        (name) => !existingNames.includes(name)
      );
      if (missing.length > 0) {
        const restored = DEFAULT_TAGS.filter(
          (t) => missing.includes(t.name)
        ).map((t) => ({
          ...t,
          id: v4()
        }));
        tags.value.push(...restored);
      }
    }
    function getTagById(id) {
      return tags.value.find((t) => t.id === id);
    }
    function getTagsByIds(ids) {
      return tags.value.filter((t) => ids.includes(t.id));
    }
    function addTag(tagData) {
      const newTag = { ...tagData, id: v4(), isSystem: false };
      tags.value.push(newTag);
      return newTag;
    }
    function deleteTag(id) {
      const index = tags.value.findIndex((t) => t.id === id);
      if (index === -1) return false;
      if (tags.value[index].isSystem) return false;
      tags.value.splice(index, 1);
      return true;
    }
    watch(
      tags,
      () => {
        ensureSystemTags();
      },
      { deep: true }
    );
    return {
      tags,
      initTagsAfterHydration,
      getTagById,
      getTagsByIds,
      addTag,
      deleteTag
    };
  },
  {
    persist: { key: "carbon-tags", storage: localStorage }
  }
);
const useRewardsStore = defineStore(
  "rewards",
  () => {
    const rewards = ref([]);
    function purchaseReward(id) {
      const userStore = useUserStore();
      const reward = rewards.value.find((r) => r.id === id);
      if (!reward || reward.purchased) return;
      if (userStore.coins < reward.price) return;
      userStore.addCoins(-reward.price);
      reward.purchased = true;
      reward.purchasedAt = Date.now();
    }
    function confirmPurchase(rewardId) {
      const userStore = useUserStore();
      const reward = rewards.value.find((r) => r.id === rewardId);
      if (!reward || reward.completed) return;
      reward.completed = true;
      reward.completedAt = Date.now();
      if (reward.effect) {
        if (reward.effect.xp) userStore.addXP(reward.effect.xp);
        if (reward.effect.coins) userStore.addCoins(reward.effect.coins);
        if (reward.effect.leaguePoints)
          userStore.leaguePoints += reward.effect.leaguePoints;
      }
    }
    return { rewards, purchaseReward, confirmPurchase };
  },
  { persist: { key: "carbon-rewards", storage: localStorage } }
);
const useTasksStore = defineStore(
  "tasks",
  () => {
    const tasks = ref([]);
    function getTodayDateString() {
      return (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    }
    function addTask(taskData) {
      if (taskData.type.startsWith("TASK_")) {
        const activeCount = tasks.value.filter(
          (t) => t.type === taskData.type && !t.done
        ).length;
        if (activeCount >= 3) return null;
      }
      const newTask = {
        id: taskData.id || v4(),
        ...taskData,
        done: false,
        createdAt: taskData.createdAt || Date.now()
      };
      tasks.value.push(newTask);
      return newTask;
    }
    function completeTask(id) {
      const task = tasks.value.find((t) => t.id === id);
      if (!task) return;
      const userStore = useUserStore();
      const branchesStore = useBranchesStore();
      const tagsStore = useTagsStore();
      const rewardsStore = useRewardsStore();
      if (task.type === "HABIT") {
        task.lastCompletedAt = Date.now();
        const tags = tagsStore.getTagsByIds(task.tagIds);
        const xpPerTag = 50;
        tags.forEach((tag) => {
          branchesStore.addXPToBranch(tag.branchId, xpPerTag);
        });
        userStore.addXP(xpPerTag * tags.length);
        return;
      }
      if (!task.done) {
        task.done = true;
        task.completedAt = Date.now();
        const tags = tagsStore.getTagsByIds(task.tagIds);
        const baseXP = task.type === "PURCHASE" ? 500 : 100;
        tags.forEach((tag) => {
          branchesStore.addXPToBranch(tag.branchId, baseXP);
        });
        userStore.addXP(baseXP * tags.length);
        if (task.type === "PURCHASE" && task.purchaseRewardId) {
          rewardsStore.confirmPurchase(task.purchaseRewardId);
        }
      }
    }
    function deleteTask(id) {
      const index = tasks.value.findIndex((t) => t.id === id);
      if (index !== -1) tasks.value.splice(index, 1);
    }
    function updateTask(id, updates) {
      const task = tasks.value.find((t) => t.id === id);
      if (task) Object.assign(task, { ...updates, updatedAt: Date.now() });
    }
    function resetDailyTasks() {
      const today = getTodayDateString();
      const userStore = useUserStore();
      tasks.value.forEach((task) => {
        if (task.type === "TASK_DAY") {
          if (task.targetDate && task.targetDate < today) {
            if (!task.done) userStore.reduceLeaguePoints(50);
            task.done = false;
            task.targetDate = today;
          } else if (!task.targetDate) {
            task.targetDate = today;
          }
        }
      });
    }
    function getTasksByType(type) {
      return tasks.value.filter((t) => t.type === type && !t.done);
    }
    function getHabits() {
      return tasks.value.filter((t) => t.type === "HABIT");
    }
    return {
      tasks,
      addTask,
      completeTask,
      deleteTask,
      updateTask,
      resetDailyTasks,
      getTasksByType,
      getHabits
    };
  },
  {
    persist: { key: "carbon-tasks", storage: localStorage }
  }
);
const ACCENT_COLORS = [
  { name: "Графит", value: "#f0f0f0" },
  { name: "Синий", value: "#3584e4" },
  { name: "Зелёный", value: "#33d17a" },
  { name: "Оранжевый", value: "#ff7800" },
  { name: "Фиолетовый", value: "#9141ac" },
  { name: "Красный", value: "#e01b24" },
  { name: "Бирюзовый", value: "#1c71d8" }
];
const useSettingsStore = defineStore(
  "settings",
  () => {
    const theme = ref("dark");
    const accentColor = ref(ACCENT_COLORS[0].value);
    const animationsEnabled = ref(true);
    const soundEnabled = ref(false);
    const notificationsEnabled = ref(true);
    const autoBackup = ref(true);
    const lastBackupDate = ref(null);
    function setTheme(newTheme) {
      theme.value = newTheme;
    }
    function setAccentColor(color) {
      accentColor.value = color;
    }
    function setAnimationsEnabled(val) {
      animationsEnabled.value = val;
    }
    function setSoundEnabled(val) {
      soundEnabled.value = val;
    }
    function setNotificationsEnabled(val) {
      notificationsEnabled.value = val;
    }
    function setAutoBackup(val) {
      autoBackup.value = val;
    }
    function recordBackup() {
      lastBackupDate.value = (/* @__PURE__ */ new Date()).toISOString();
    }
    async function init() {
      return;
    }
    init();
    return {
      theme,
      accentColor,
      animationsEnabled,
      soundEnabled,
      notificationsEnabled,
      autoBackup,
      lastBackupDate,
      setTheme,
      setAccentColor,
      setAnimationsEnabled,
      setSoundEnabled,
      setNotificationsEnabled,
      setAutoBackup,
      recordBackup
    };
  },
  {
    persist: { key: "carbon-settings", storage: localStorage }
  }
);
const useOnboardingStore = defineStore(
  "onboarding",
  () => {
    const hasSeenOnboarding = ref(false);
    function markAsSeen() {
      hasSeenOnboarding.value = true;
    }
    return {
      hasSeenOnboarding,
      markAsSeen
    };
  },
  {
    persist: { key: "carbon-onboarding", storage: localStorage }
  }
);
const useUIStore = defineStore(
  "ui",
  () => {
    const activeNav = ref("board");
    const sidebarCollapsed = ref(true);
    const sidebarHovered = ref(false);
    function setActiveNav(section) {
      activeNav.value = section;
    }
    function toggleSidebar() {
      sidebarCollapsed.value = !sidebarCollapsed.value;
    }
    function setSidebarHovered(value) {
      sidebarHovered.value = value;
    }
    const showLabels = computed(
      () => !sidebarCollapsed.value || sidebarHovered.value
    );
    return {
      activeNav,
      sidebarCollapsed,
      sidebarHovered,
      showLabels,
      setActiveNav,
      toggleSidebar,
      setSidebarHovered
    };
  },
  { persist: { key: "carbon-ui", storage: localStorage } }
);
const state = ref({
  isOpen: false,
  message: "",
  resolve: null
});
function useConfirm() {
  function confirm(message) {
    if (state.value.isOpen && state.value.resolve) {
      state.value.resolve(false);
    }
    return new Promise((resolve) => {
      state.value = {
        isOpen: true,
        message,
        resolve
      };
    });
  }
  function handleConfirm() {
    if (state.value.resolve) {
      state.value.resolve(true);
    }
    state.value = { isOpen: false, message: "", resolve: null };
  }
  function handleCancel() {
    if (state.value.resolve) {
      state.value.resolve(false);
    }
    state.value = { isOpen: false, message: "", resolve: null };
  }
  return {
    state,
    confirm,
    handleConfirm,
    handleCancel
  };
}
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "ConfirmDialog",
  __ssrInlineRender: true,
  setup(__props) {
    const confirmState = useConfirm();
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(confirmState).state.value.isOpen) {
          _push2(`<div class="confirm-overlay" data-v-c238f9ed><div class="confirm-modal" data-v-c238f9ed><p class="confirm-message" data-v-c238f9ed>${ssrInterpolate(unref(confirmState).state.value.message)}</p><div class="confirm-actions" data-v-c238f9ed><button class="btn-secondary" data-v-c238f9ed> Отмена </button><button class="btn-danger" data-v-c238f9ed> Удалить </button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
    };
  }
});
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/ConfirmDialog.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const ConfirmDialog = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-c238f9ed"]]);
function computeRoute(pathname, pathParams) {
  if (!pathname || !pathParams) {
    return pathname;
  }
  let result = pathname;
  try {
    const entries = Object.entries(pathParams);
    for (const [key, value] of entries) {
      if (!Array.isArray(value)) {
        const matcher2 = turnValueToRegExp(value);
        if (matcher2.test(result)) {
          result = result.replace(matcher2, `/[${key}]`);
        }
      }
    }
    for (const [key, value] of entries) {
      if (Array.isArray(value)) {
        const matcher2 = turnValueToRegExp(value.join("/"));
        if (matcher2.test(result)) {
          result = result.replace(matcher2, `/[...${key}]`);
        }
      }
    }
    return result;
  } catch {
    return pathname;
  }
}
function turnValueToRegExp(value) {
  return new RegExp(`/${escapeRegExp(value)}(?=[/?#]|$)`);
}
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function injectSpeedInsights(props = {}, confString) {
  return null;
}
function getBasePath() {
  try {
    return void 0;
  } catch {
  }
}
function getConfigString() {
  try {
    return void 0;
  } catch {
  }
}
function createComponent(framework = "vue") {
  return defineComponent({
    props: [
      "dsn",
      "sampleRate",
      "beforeSend",
      "debug",
      "scriptSrc",
      "endpoint"
    ],
    setup(props) {
      const route = useRoute$1();
      const configure = injectSpeedInsights(
        {
          ...Object.fromEntries(
            // trim out undefined values to avoid overriding config values
            Object.entries(props).filter(([_, v]) => v !== void 0)
          ),
          basePath: getBasePath()
        },
        getConfigString()
      );
      if (route && configure) {
        const changeRoute = () => {
          configure.setRoute(computeRoute(route.path, route.params));
        };
        changeRoute();
        watch(route, changeRoute);
      }
    },
    // Vue component must have a render function, or a template.
    render() {
      return null;
    }
  });
}
var SpeedInsights = createComponent();
function toValue(r) {
  return typeof r === "function" ? r() : unref(r);
}
typeof WorkerGlobalScope !== "undefined" && globalThis instanceof WorkerGlobalScope;
const noop = () => {
};
function createFilterWrapper(filter, fn) {
  function wrapper(...args) {
    return new Promise((resolve, reject) => {
      Promise.resolve(filter(() => fn.apply(this, args), { fn, thisArg: this, args })).then(resolve).catch(reject);
    });
  }
  return wrapper;
}
function debounceFilter(ms, options = {}) {
  let timer;
  let maxTimer;
  let lastRejector = noop;
  const _clearTimeout = (timer2) => {
    clearTimeout(timer2);
    lastRejector();
    lastRejector = noop;
  };
  const filter = (invoke2) => {
    const duration = toValue(ms);
    const maxDuration = toValue(options.maxWait);
    if (timer)
      _clearTimeout(timer);
    if (duration <= 0 || maxDuration !== void 0 && maxDuration <= 0) {
      if (maxTimer) {
        _clearTimeout(maxTimer);
        maxTimer = null;
      }
      return Promise.resolve(invoke2());
    }
    return new Promise((resolve, reject) => {
      lastRejector = options.rejectOnCancel ? reject : resolve;
      if (maxDuration && !maxTimer) {
        maxTimer = setTimeout(() => {
          if (timer)
            _clearTimeout(timer);
          maxTimer = null;
          resolve(invoke2());
        }, maxDuration);
      }
      timer = setTimeout(() => {
        if (maxTimer)
          _clearTimeout(maxTimer);
        maxTimer = null;
        resolve(invoke2());
      }, duration);
    });
  };
  return filter;
}
function useDebounceFn(fn, ms = 200, options = {}) {
  return createFilterWrapper(
    debounceFilter(ms, options),
    fn
  );
}
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "app",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const tasksStore = useTasksStore();
    const settingsStore = useSettingsStore();
    const onboardingStore = useOnboardingStore();
    const userStore = useUserStore();
    const branchesStore = useBranchesStore();
    const rewardsStore = useRewardsStore();
    const tagsStore = useTagsStore();
    const uiStore = useUIStore();
    [__temp, __restore] = withAsyncContext(() => settingsStore.ready), await __temp, __restore();
    const userId = ref("default-user");
    const syncToCloud = useDebounceFn(async () => {
      try {
        await $fetch("/api/sync", {
          method: "POST",
          body: {
            userId: userId.value,
            user: { ...userStore.$state },
            tasks: tasksStore.tasks,
            branches: branchesStore.branches,
            rewards: rewardsStore.rewards,
            tags: tagsStore.tags,
            ui: { ...uiStore.$state },
            settings: { ...settingsStore.$state }
          }
        });
      } catch (e) {
        console.warn("Ошибка синхронизации с облаком");
      }
    }, 2e3);
    watch(
      [
        () => userStore.$state,
        () => tasksStore.tasks,
        () => branchesStore.branches,
        () => rewardsStore.rewards,
        () => tagsStore.tags,
        () => uiStore.$state,
        () => settingsStore.$state
      ],
      () => syncToCloud(),
      { deep: true }
    );
    if (!onboardingStore.hasSeenOnboarding && false) ;
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLayout = __nuxt_component_0;
      const _component_NuxtPage = __nuxt_component_1;
      _push(`<!--[-->`);
      _push(ssrRenderComponent(_component_NuxtLayout, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtPage, null, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(ConfirmDialog, null, null, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtPage),
              createVNode(ConfirmDialog)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(unref(SpeedInsights), null, null, _parent));
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    const status = Number(_error.statusCode || 500);
    const is404 = status === 404;
    const statusText = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = defineAsyncComponent(() => import("./_nuxt/error-404-CcjCMK4y.js"));
    const _Error = defineAsyncComponent(() => import("./_nuxt/error-500-CxpWrV_x.js"));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ status: unref(status), statusText: unref(statusText), statusCode: unref(status), statusMessage: unref(statusText), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = () => null;
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup");
    const error = /* @__PURE__ */ useError();
    const abortRender = error.value && !nuxtApp.ssrContext.error;
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(abortRender)) {
            _push(`<div></div>`);
          } else if (unref(error)) {
            _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(_sfc_main$2), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(_sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (error) {
      await nuxt.hooks.callHook("app:error", error);
      nuxt.payload.error ||= createError(error);
    }
    if (ssrContext && (ssrContext["~renderResponse"] || ssrContext._renderResponse)) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry_default = ((ssrContext) => entry(ssrContext));
export {
  ACCENT_COLORS as A,
  _export_sfc as _,
  useNuxtApp as a,
  useRuntimeConfig as b,
  nuxtLinkDefaults as c,
  useUserStore as d,
  entry_default as default,
  encodeRoutePath as e,
  useTasksStore as f,
  useBranchesStore as g,
  useConfirm as h,
  useTagsStore as i,
  useRewardsStore as j,
  useSettingsStore as k,
  useUIStore as l,
  useOnboardingStore as m,
  navigateTo as n,
  resolveRouteObject as r,
  tryUseNuxtApp as t,
  useRouter as u
};
//# sourceMappingURL=server.mjs.map
