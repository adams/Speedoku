import "@testing-library/jest-dom/vitest";

// Polyfill localStorage for jsdom environment
if (typeof globalThis !== "undefined") {
  if (
    !globalThis.localStorage ||
    typeof globalThis.localStorage.setItem !== "function"
  ) {
    const store: Record<string, string> = {};
    const storage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach((key) => {
          delete store[key];
        });
      },
      get length() {
        return Object.keys(store).length;
      },
      key: (index: number) => Object.keys(store)[index] ?? null,
    };

    // Make methods non-enumerable
    Object.defineProperty(storage, "getItem", { enumerable: false });
    Object.defineProperty(storage, "setItem", { enumerable: false });
    Object.defineProperty(storage, "removeItem", { enumerable: false });
    Object.defineProperty(storage, "clear", { enumerable: false });
    Object.defineProperty(storage, "key", { enumerable: false });
    Object.defineProperty(storage, "length", { enumerable: false });

    globalThis.localStorage = storage as unknown as Storage;
  }
}
