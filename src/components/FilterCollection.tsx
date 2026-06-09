import { useDraggable } from "@dnd-kit/core";
import type { FilterDefinition } from "../utils/types";
import Card from "./Card";

export function FilterCollection({ filters }: { filters: FilterDefinition[] }) {
  return (
    <div className="absolute right-0 top-0 bottom-[250px] w-[250px] p-4">
      <Card className="h-full w-full">
        <h3 className="font-semibold uppercase tracking-wider text-sm text-slate-500">Filters</h3>
        <div className="grid grid-cols-2 gap-2">
          {filters.map((f) => (
            <DraggableFilter key={f.id} filter={f} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function DraggableFilter({ filter }: { filter: FilterDefinition }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: filter.id, // stable — same id every drag from collection
  });

  return (
    <div ref={setNodeRef} {...listeners} {...attributes}>
      <div
        className={`text-sm text-slate-600 border border-slate-300 bg-white shadow-sm p-2 rounded-md aspect-square w-full text-center cursor-grab ${
          isDragging ? "opacity-60" : ""
        }`}
      >
        <span>{filter.label}</span>
      </div>
    </div>
  );
}
