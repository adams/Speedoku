"use client";

import { useCallback, useEffect, useState } from "react";
import type { Bests, DataService, NewBest } from "@/lib/data/types";
import { EMPTY_BESTS } from "@/lib/data/types";
import type { Mode, RunSummary } from "@/lib/run/types";

export function usePersistence(adapter: DataService, mode: Mode) {
  const [bests, setBests] = useState<Bests>(EMPTY_BESTS);

  useEffect(() => {
    let alive = true;
    adapter.getBests(mode).then((b) => {
      if (alive) setBests(b);
    });
    return () => {
      alive = false;
    };
  }, [adapter, mode]);

  const recordRun = useCallback(
    async (summary: RunSummary): Promise<NewBest> => {
      const { bests: next, isNewBest } = await adapter.saveRun(summary);
      setBests(next);
      return isNewBest;
    },
    [adapter],
  );

  return { bests, recordRun };
}
