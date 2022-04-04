import { Heart, List } from "lucide-react";
import { T_Track } from "../utils/types";

export default function SongDetails({
  track,
  isQueueOpen,
  setIsQueueOpen,
}: {
  track: T_Track;
  isQueueOpen: boolean;
  setIsQueueOpen: (val: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-4">
      <img
        src={track.album_art}
        alt="Album Art"
        className="rounded-lg w-20 h-20"
      />
      <div>
        <h3
          title="Track"
          className="text-slate-900 text-2xl leading-6 font-bold"
        >
          {track.song}
        </h3>
        <p title="Artist" className="text-slate-500">
          {track.artist}
        </p>
      </div>
      <div className="flex flex-col gap-2 ml-auto">
        <button>
          <Heart className="text-slate-400" />
        </button>
        <button onClick={() => setIsQueueOpen(!isQueueOpen)}>
          <List className="text-slate-400" />
        </button>
      </div>
    </div>
  );
}
