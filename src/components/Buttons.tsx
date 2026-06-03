import { Repeat, Repeat1, Shuffle, SkipBack, SkipForward } from "lucide-react";
import type { T_LoopType } from "../utils/types";

export function LoopButton({ loop, onClick }: { loop: T_LoopType; onClick: () => void }) {
  return (
    <button
      type="button"
      title={loop}
      onClick={() => onClick()}
      className={`p-2 rounded-full ${loop === "loop" ? "text-slate-800" : "text-slate-400"}`}
    >
      {loop === "single" ? <Repeat1 className="text-slate-800" /> : <Repeat />}
    </button>
  );
}

export function ShuffleButton({ isShuffleOn, onClick }: { isShuffleOn: boolean; onClick: () => void }) {
  return (
    <button type="button" className="p-2 rounded-full" title="Shuffle" onClick={() => onClick()}>
      <Shuffle className={isShuffleOn ? "text-slate-800" : "text-slate-400"} />
    </button>
  );
}
export function NextButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="bg-slate-200 rounded-full p-2" onClick={() => onClick()}>
      <SkipForward className="text-slate-400 fill-slate-400" />
    </button>
  );
}

export function PrevButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="bg-slate-200 rounded-full p-2" onClick={() => onClick()}>
      <SkipBack className="text-slate-400 fill-slate-400" />
    </button>
  );
}
