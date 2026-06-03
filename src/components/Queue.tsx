import { Reorder, useDragControls, motion } from "motion/react";
import QueueItem from "./QueueItem";
import { usePlayerStore } from "../store/player";

const variants = {
  initial: { y: "100%" },
  animate: { y: 24 },
  exit: { y: "100%" },
};

export default function Queue({ setIsQueueOpen }: { setIsQueueOpen: (val: boolean) => void }) {
  const modalDrag = useDragControls();
  const { state, dispatch } = usePlayerStore();
  const trackList = state.playlist.map((_, i) => (state.shuffleList ? state.shuffleList[i] : i));

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
          type="button"
          className="p-2 hover:cursor-grab focus:cursor-grabbing"
          onPointerDown={(e) => modalDrag.start(e)}
        >
          <div className="h-1 w-8 bg-slate-300 rounded-full" />
        </button>
      </div>
      <Reorder.Group
        axis="y"
        values={trackList}
        onReorder={(newOrder) => dispatch.reorderPlaylist(newOrder)}
        className="flex flex-col gap-2 overflow-clip"
      >
        {trackList.map((index) => {
          const track = state.playlist[index];
          return <QueueItem item={track} key={index} index={index} />;
        })}
      </Reorder.Group>
    </motion.div>
  );
}
