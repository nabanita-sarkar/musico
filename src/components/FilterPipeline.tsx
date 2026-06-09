import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import { FILTER_COLLECTION, PIPELINE_DROPPABLE_ID } from "../utils/constants";
import { usePipelineStore } from "../store/pipeline";
import { FilterCollection } from "./FilterCollection";
import { Pipeline, PipelineFilterCard } from "./Pipeline";
import type { FilterDefinition, PipelineFilter } from "../utils/types";

export function FilterPipeline() {
  const { pipeline, addFilter, removeFilter, reorderFilters, updateParam } = usePipelineStore();
  const [dragging, setDragging] = useState<FilterDefinition | PipelineFilter | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // prevents accidental drags
    })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    // Dragging from collection — active.id is FilterDefinition.id
    const fromCollection = FILTER_COLLECTION.find((f) => f.id === active.id);
    if (fromCollection) {
      setDragging(fromCollection);
      return;
    }

    // Dragging within pipeline — active.id is PipelineFilter.instanceId
    const fromPipeline = pipeline.find((f) => f.instanceId === active.id);
    if (fromPipeline) setDragging(fromPipeline);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setDragging(null);
    if (!over) return;

    const isFromCollection = FILTER_COLLECTION.some((f) => f.id === active.id);
    const isOverPipeline = over.id === PIPELINE_DROPPABLE_ID;
    const isOverPipelineItem = pipeline.some((f) => f.instanceId === over.id);

    // ── Drop from collection into pipeline ──
    if (isFromCollection && (isOverPipeline || isOverPipelineItem)) {
      const def = FILTER_COLLECTION.find((f) => f.id === active.id)!;
      addFilter({ filterId: def.id, label: def.label, params: { ...def.defaultParams } });
      return;
    }

    // ── Reorder within pipeline ──
    if (!isFromCollection && isOverPipelineItem) {
      const oldIndex = pipeline.findIndex((f) => f.instanceId === active.id);
      const newIndex = pipeline.findIndex((f) => f.instanceId === over.id);
      if (oldIndex !== newIndex) reorderFilters(oldIndex, newIndex);
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <FilterCollection filters={FILTER_COLLECTION} />
        <Pipeline pipeline={pipeline} onRemove={removeFilter} onUpdateParam={updateParam} />
      </div>

      {/* Drag overlay — renders the ghost while dragging */}
      <DragOverlay dropAnimation={null}>
        {dragging && "instanceId" in dragging ? (
          <PipelineFilterCard filter={dragging} onRemove={() => {}} onUpdateParam={() => {}} isDragging />
        ) : dragging ? (
          <div className="text-sm text-slate-600 border border-slate-300 bg-white shadow-md p-2 rounded-md aspect-square w-full text-center cursor-grabbing">
            {dragging.label}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
