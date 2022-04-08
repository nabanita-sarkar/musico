import { Reorder, useDragControls } from "framer-motion";
import { Equal } from "lucide-react";
import React from "react";
import { T_Track } from "utils/types";

export default function QueueItem({ item }: { item: T_Track }) {
  const itemDrag = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={itemDrag}
      dragConstraints={{ bottom: 0, top: 0 }}
      className="flex justify-between gap-2"
    >
      <div>
        <h4 className="text-slate-700 text-lg leading-4">{item.song}</h4>
        <p className="text-slate-500">{item.artist}</p>
      </div>
      <button type="button" className="cursor:pointer text-slate-400" onPointerDown={(e) => itemDrag.start(e)}>
        <Equal />
      </button>
    </Reorder.Item>
  );
}
