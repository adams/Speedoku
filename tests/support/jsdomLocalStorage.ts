// jsdom (v29) ships only a PARTIAL localStorage — `setItem`/`getItem`/`clear`
// are missing/non-functional. Tests that use localStorage import this module
// (side-effect) to install a complete in-memory implementation. Native browsers
// and any environment that already has a working localStorage are left untouched.
if (
  typeof window !== "undefined" &&
  (!window.localStorage || typeof window.localStorage.setItem !== "function")
) {
  const store = new Map<string, string>();
  const shim: Storage = {
    getItem: (k) => (store.has(k) ? (store.get(k) as string) : null),
    setItem: (k, v) => {
      store.set(k, String(v));
    },
    removeItem: (k) => {
      store.delete(k);
    },
    clear: () => {
      store.clear();
    },
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
  Object.defineProperty(window, "localStorage", {
    value: shim,
    configurable: true,
  });
}
