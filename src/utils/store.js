 // ==============================
// Jet Store (global reactive data)
// ==============================

// Registry: storeName -> { proxy, watchers:Set<componentInstance> }
const __JET_STORES = new Map();

// Internal markers so we can detect "this object is a Jet store proxy"
const __JET_STORE_META = Symbol("JET_STORE_META");

/**
 * Create or get a global store proxy.
 *
 * Usage:
 *   export const ops = store("ops", { current_menu: "pages" });
 *
 * - creates ONE proxy per name
 * - components that use this proxy will be subscribed automatically by Jet core
 */
export function store(name, initialData = {}) {
  // If already exists: return the same proxy
  if (__JET_STORES.has(name)) return __JET_STORES.get(name).proxy;

  const watchers = new Set();

  // Keep real raw data
  const target = initialData;

  // Create ONE proxy for this store
  const proxy = new Proxy(target, {
    set(t, key, value) {
      // Skip if value didn't change (avoids useless rerenders)
      if (t[key] === value) return true;

      t[key] = value;

      // Notify all components using this store
      watchers.forEach((cmp) => {
        // only rerender if component still exists in DOM
        if (cmp?.isConnected) cmp.render?.();
      });

      return true;
    },
  });

  // Attach metadata to proxy so Jet can recognize it later
  Object.defineProperty(proxy, __JET_STORE_META, {
    value: { name, watchers },
    enumerable: false,
  });

  __JET_STORES.set(name, { proxy, watchers });

  return proxy;
}

/**
 * Internal helper: check if object is a Jet store proxy.
 */
export function isStore(obj) {
  return !!obj && !!obj[__JET_STORE_META];
}

/**
 * Internal helper: subscribe a component instance to store changes.
 * Jet will call this automatically when component uses a store as data.
 */
export function subscribeStore(storeProxy, componentInstance) {
  const meta = storeProxy?.[__JET_STORE_META];
  if (!meta) return;

  meta.watchers.add(componentInstance);

  // Return cleanup function so we can unsubscribe on disconnect
  return () => meta.watchers.delete(componentInstance);
}
