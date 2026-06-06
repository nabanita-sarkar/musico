import { useState } from "react";
import { FREQUENCIES, type T_Freqency } from "../store/equaliser";
import { usePlayerStore } from "../store/player";
import Slider from "./Slider";

export default function Equaliser() {
  return (
    <div className="flex gap-4 justify-between h-40">
      {FREQUENCIES.map((freq) => {
        return <FreqSlider key={freq} freq={freq} />;
      })}
    </div>
  );
}

function FreqSlider({ freq }: { freq: T_Freqency }) {
  const { state, dispatch } = usePlayerStore();
  const [innerGain, setInnerGain] = useState<null | number>(null);
  const gain = innerGain ?? state.gains[freq];

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <span className="text-sm text-slate-500 w-7 text-center">{gain}</span>
      <Slider
        min={-10}
        max={10}
        value={gain}
        orientation="vertical"
        onChange={(val) => {
          setInnerGain(val);
        }}
        onMouseUp={(val) => {
          dispatch.changeFreqGain(freq, val);
          setInnerGain(null);
        }}
      />
      <span className="text-sm text-slate-500 w-7 text-center">
        {freq > 999 ? `${Math.floor(freq / 1000)}k` : freq}
      </span>
    </div>
  );
}
