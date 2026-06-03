import { Heart, List } from "lucide-react";
import type { T_Track } from "../utils/types";
import { usePlayerStore } from "../store/player";

export default function SongDetails({
  isQueueOpen,
  setIsQueueOpen,
}: {
  isQueueOpen: boolean;
  setIsQueueOpen: (val: boolean) => void;
}) {
  const { state } = usePlayerStore();

  const track = state.playlist[state.currentIndex];

  return (
    <div className="flex items-start gap-4">
      <img src={track.album_art} alt="Album Art" className="rounded-lg w-20 h-20" />
      <div>
        <h3 title="Track" className="text-slate-900 text-2xl leading-6 font-bold">
          {track.song}
        </h3>
        <p title="Artist" className="text-slate-500">
          {track.artist}
        </p>
      </div>
      <div className="flex flex-col gap-2 ml-auto">
        <button type="button">
          <Heart className="text-slate-400" />
        </button>
        <button type="button" onClick={() => setIsQueueOpen(!isQueueOpen)}>
          <List className="text-slate-400" />
        </button>
      </div>
    </div>
  );
}
