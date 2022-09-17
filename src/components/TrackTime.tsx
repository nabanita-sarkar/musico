import React, { RefObject } from "react";
import { formatTime } from "../utils/functions";
import { T_Track } from "../utils/types";
import Slider from "./Slider";

function AudioPlayer({ audio, track }: { track: T_Track; audio: RefObject<HTMLAudioElement> }) {
  return (
    <audio ref={audio} src={track.audio} controls={false}>
      <track src={track.song} kind="captions" srcLang="en" label="english_captions" />
    </audio>
  );
}

const Audio = React.memo(AudioPlayer);

function TrackTime({
  trackTime,
  track,
  setTrackTime,
  audio,
  setIsMouseDown,
}: {
  trackTime: number;
  track: T_Track;
  setTrackTime: (val: number) => void;
  audio: RefObject<HTMLAudioElement>;
  setIsMouseDown: (val: boolean) => void;
}) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: "28px auto 28px" }}>
      <span title="Track Time" className="text-sm text-slate-500 w-7">
        {formatTime(trackTime)}
      </span>
      <Slider
        min={0}
        max={track.time}
        value={trackTime}
        onChange={setTrackTime}
        onMouseUp={() => {
          if (audio.current) {
            audio.current.currentTime = trackTime;
          }
          setIsMouseDown(false);
        }}
        onMouseDown={() => setIsMouseDown(true)}
      />
      <Audio audio={audio} track={track} />
      <span title="Total Time" className="text-sm text-slate-500 w-7">
        {formatTime(track.time)}
      </span>
    </div>
  );
}

export default TrackTime;
