// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ENTER_MS,
  EXIT_MS,
  useDepthTransition,
} from "@/lib/ui/useDepthTransition";

const g = (fill: number) => new Array(81).fill(fill);

function mockMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: reduce && q.includes("reduce"),
    media: q,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
}

describe("useDepthTransition", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("runs exit then enter on a depth increase, showing prev grid during exit", () => {
    mockMotion(false);
    const { result, rerender } = renderHook(
      ({ depth, grid }) => useDepthTransition(depth, grid),
      { initialProps: { depth: 1, grid: g(1) } },
    );
    expect(result.current.transitioning).toBe(false);

    rerender({ depth: 2, grid: g(2) });
    expect(result.current.transitioning).toBe(true);
    expect(result.current.phase).toBe("exit");
    expect(result.current.displayGrid).toEqual(g(1)); // previous board exiting
    expect(result.current.stampDepth).toBe(2);

    act(() => vi.advanceTimersByTime(EXIT_MS));
    expect(result.current.phase).toBe("enter");
    expect(result.current.displayGrid).toEqual(g(2)); // new board entering

    act(() => vi.advanceTimersByTime(ENTER_MS));
    expect(result.current.transitioning).toBe(false);
    expect(result.current.phase).toBe("idle");
  });

  it("never transitions under prefers-reduced-motion", () => {
    mockMotion(true);
    const { result, rerender } = renderHook(
      ({ depth, grid }) => useDepthTransition(depth, grid),
      { initialProps: { depth: 1, grid: g(1) } },
    );
    rerender({ depth: 2, grid: g(2) });
    expect(result.current.transitioning).toBe(false);
    expect(result.current.displayGrid).toEqual(g(2));
  });
});
