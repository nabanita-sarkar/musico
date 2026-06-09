import { useState } from "react";
import { usePlayerDispatch, usePlayerSelector } from "../store/player";
import { formatTime } from "../utils/functions";
import Slider from "./Slider";

function TrackTime() {
  const trackTime = usePlayerSelector((state) => state.trackTime);
  const duration = usePlayerSelector((state) => state.duration);
  const dispatch = usePlayerDispatch();

  const [innerTime, setInnerTime] = useState<null | number>(null);
  const innerTrackTime = innerTime ?? trackTime;

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: "28px auto 28px" }}>
      <span title="Track Time" className="text-sm text-slate-500 w-7">
        {formatTime(innerTrackTime)}
      </span>
      <Slider
        min={0}
        max={duration}
        value={innerTrackTime}
        onChange={(val) => {
          setInnerTime(val);
        }}
        onMouseUp={(val) => {
          dispatch.updateTrackTime(val);
          setInnerTime(null);
        }}
      />
      <span title="Total Time" className="text-sm text-slate-500 w-7">
        {formatTime(duration)}
      </span>
    </div>
  );
}

export default TrackTime;
