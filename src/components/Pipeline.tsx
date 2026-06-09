import { useDroppable } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { PIPELINE_DROPPABLE_ID } from "../utils/constants";
import type { PipelineFilter } from "../utils/types";
import Card from "./Card";
import { CSS } from "@dnd-kit/utilities";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

export function Pipeline({
  pipeline,
  onRemove,
  onUpdateParam,
}: {
  pipeline: PipelineFilter[];
  onRemove: (instanceId: string) => void;
  onUpdateParam: (instanceId: string, key: string, value: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: PIPELINE_DROPPABLE_ID });

  return (
    <div
      ref={setNodeRef}
      className={` absolute bottom-0 left-0 right-0 m-4 h-[150px] ${isOver ? "pipeline--over" : ""}`}
    >
      <Card className="w-full h-full">
        <h3>Pipeline</h3>
        <div style={{ display: "flex", gap: 12, minHeight: 80, alignItems: "center" }}>
          <SortableContext
            items={pipeline.map((f) => f.instanceId)} // ids must match useSortable id
            strategy={horizontalListSortingStrategy}
          >
            {pipeline.map((f) => (
              <SortableFilterCard key={f.instanceId} filter={f} onRemove={onRemove} onUpdateParam={onUpdateParam} />
            ))}
          </SortableContext>
          {pipeline.length === 0 && <span style={{ color: "#999" }}>Drop filters here</span>}
        </div>
      </Card>
    </div>
  );
}

function SortableFilterCard({
  filter,
  onRemove,
  onUpdateParam,
}: {
  filter: PipelineFilter;
  onRemove: (instanceId: string) => void;
  onUpdateParam: (instanceId: string, key: string, value: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: filter.instanceId, // must be unique per instance
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1, // hide original while DragOverlay renders ghost
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <PipelineFilterCard
        filter={filter}
        onRemove={onRemove}
        onUpdateParam={onUpdateParam}
        dragHandleListeners={listeners} // pass listeners to handle only, not whole card
      />
    </div>
  );
}

export function PipelineFilterCard({
  filter,
  onRemove,
  onUpdateParam,
  dragHandleListeners,
  isDragging,
}: {
  filter: PipelineFilter;
  onRemove: (instanceId: string) => void;
  onUpdateParam: (instanceId: string, key: string, value: number) => void;
  dragHandleListeners?: SyntheticListenerMap;
  isDragging?: boolean;
}) {
  return (
    <div
      className={`text-sm text-slate-600 border border-slate-200 shadow-sm rounded-md flex w-full text-center ${
        isDragging ? "opacity-60" : ""
      }`}
    >
      <div className="flex flex-col justify-between ">
        <button className={`p-2 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`} {...dragHandleListeners}>
          ⠿
        </button>
        <button className="p-2" onClick={() => onRemove(filter.instanceId)}>
          ✕
        </button>
      </div>

      <div className="outline-emerald-400 outline bg-emerald-200 flex-1 p-2 rounded-sm">{filter.label}</div>

      {/* <div className="pipeline-card__params">
        {Object.entries(filter.params).map(([key, val]) => (
          <label key={key}>
            {key}
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={val}
              onChange={(e) => onUpdateParam(filter.instanceId, key, Number(e.target.value))}
            />
            <span>{val.toFixed(2)}</span>
          </label>
        ))}
      </div> */}
    </div>
  );
}
