import { useState, useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { PipelineFilter } from "../utils/types";

export function usePipelineStore() {
  const [pipeline, setPipeline] = useState<PipelineFilter[]>([]);

  const addFilter = useCallback((filter: Omit<PipelineFilter, "instanceId">) => {
    const instanceId = crypto.randomUUID();
    setPipeline((prev) => [...prev, { ...filter, instanceId }]);
  }, []);

  const removeFilter = useCallback((instanceId: string) => {
    setPipeline((prev) => prev.filter((f) => f.instanceId !== instanceId));
  }, []);

  const reorderFilters = useCallback((oldIndex: number, newIndex: number) => {
    setPipeline((prev) => arrayMove(prev, oldIndex, newIndex));
  }, []);

  const updateParam = useCallback((instanceId: string, key: string, value: number) => {
    setPipeline((prev) =>
      prev.map((f) => (f.instanceId === instanceId ? { ...f, params: { ...f.params, [key]: value } } : f))
    );
  }, []);

  return { pipeline, addFilter, removeFilter, reorderFilters, updateParam };
}
