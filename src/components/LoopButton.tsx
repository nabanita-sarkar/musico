import { Repeat, Repeat1 } from "lucide-react";
import React from "react";
import { T_LoopType } from "../utils/types";

export default function LoopButton({ loop, onChange }: { loop: T_LoopType; onChange: (loopType: T_LoopType) => void }) {
  return (
    <button
      type="button"
      title={loop}
      onClick={() => {
        if (loop === "default") onChange("loop");
        if (loop === "loop") onChange("single");
        if (loop === "single") onChange("default");
      }}
      className={`p-2 ${loop === "loop" ? "text-slate-800" : "text-slate-400"}`}
    >
      {loop === "single" ? <Repeat1 className="text-slate-800" /> : <Repeat />}
    </button>
  );
}
