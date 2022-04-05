import { Reorder, useDragControls, motion } from "framer-motion";
import React from "react";
import { T_TrackList } from "../utils/types";
import QueueItem from "./QueueItem";

const variants = {
  initial: { y: "100%" },
  animate: { y: 24 },
  exit: { y: "100%" },
};

export default function Queue({
  trackList,
  setTrackList,
  setIsQueueOpen,
}: {
  trackList: T_TrackList;
  setTrackList: (val: T_TrackList) => void;
  setIsQueueOpen: (val: boolean) => void;
}) {
  const modalDrag = useDragControls();

  return (
    <motion.div
      dragListener={false}
      drag="y"
      dragConstraints={{ bottom: 24, top: 24 }}
      dragElastic={{ top: 0.02, bottom: 0.2 }}
      dragControls={modalDrag}
      variants={variants}
      onDragEnd={(e, info) => {
        if (info.offset.y > 100) setIsQueueOpen(false);
      }}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-white/80 rounded-t-lg shadow-2xl px-6 pb-12 fixed bottom-0"
    >
      <div className="flex justify-center pb-4">
        <button
          className="p-2 hover:cursor-grab focus:cursor-grabbing"
          onPointerDown={(e) => modalDrag.start(e)}
        >
          <div className="h-1 w-8 bg-slate-300 rounded-full" />
        </button>
      </div>
      <Reorder.Group
        axis="y"
        values={trackList}
        onReorder={setTrackList}
        className="flex flex-col gap-2 overflow-clip"
      >
        {trackList.map((item) => (
          <QueueItem item={item} key={item.id} />
        ))}
      </Reorder.Group>
    </motion.div>
  );
}
