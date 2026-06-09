import { useState } from "react";
import { FREQUENCIES, type T_Freqency } from "../store/equaliser";
import { usePlayerDispatch, usePlayerSelector } from "../store/player";
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
  const storeGain = usePlayerSelector((state) => state.gains[freq]);
  const dispatch = usePlayerDispatch();

  const [innerGain, setInnerGain] = useState<null | number>(null);
  const gain = innerGain ?? storeGain;

  function handleChange(val: number) {
    setInnerGain(val);
  }

  function handleMouseUp(val: number) {
    dispatch.changeFreqGain(freq, val);
    setInnerGain(null);
  }

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <span className="text-sm text-slate-500 w-7 text-center">{gain}</span>
      <Slider
        min={-10}
        max={10}
        value={gain}
        orientation="vertical"
        onChange={handleChange}
        onMouseUp={handleMouseUp}
      />
      <span className="text-sm text-slate-500 w-7 text-center">
        {freq > 999 ? `${Math.floor(freq / 1000)}k` : freq}
      </span>
    </div>
  );
}
