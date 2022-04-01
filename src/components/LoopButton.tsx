import { Repeat, Repeat1 } from "lucide-react";
import React from "react";
import { T_LoopType } from "../utils/types";

export default function LoopButton({
  loop,
  setLoop,
}: {
  loop: T_LoopType;
  setLoop: (val: T_LoopType) => void;
}) {
  return (
    <button
      title={loop}
      onClick={() => {
        if (loop === "default") setLoop("loop");
        if (loop === "loop") setLoop("single");
        if (loop === "single") setLoop("default");
      }}
      className={`p-2 ${loop === "loop" ? "text-slate-800" : "text-slate-400"}`}
    >
      {loop === "single" ? <Repeat1 className="text-slate-800" /> : <Repeat />}
    </button>
  );
}
