import { Shuffle, SkipBack, SkipForward } from "lucide-react";
import React from "react";

export function ShuffleButton({ isShuffleOn, onClick }: { isShuffleOn: boolean; onClick: () => void }) {
  return (
    <button type="button" title="Shuffle" onClick={() => onClick()}>
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
