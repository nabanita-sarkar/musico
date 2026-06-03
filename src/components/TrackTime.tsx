import React, { useState, type RefObject } from "react";
import { E_PlayerAction, usePlayerStore } from "../store/player";
import { formatTime } from "../utils/functions";
import type { T_Track } from "../utils/types";
import Slider from "./Slider";

function AudioPlayer({ audio, track }: { track: T_Track; audio: RefObject<HTMLAudioElement | null> }) {
  return (
    <audio
      ref={audio}
      // src={track.audio}
      controls={false}
      // loop={state.repeatMode === "single"}
      onTimeUpdate={() => {
        // dispatch(E_PlayerAction.UPDATE_TRACK_TIME);
      }}
      onEnded={() => {
        // dispatch(E_PlayerAction.TRACK_FINISEHED);
      }}
      onLoad={() => {
        // if (state.isPlaying) {
        //   audio.current?.play();
        // }
      }}
    >
      <track src={track.song} kind="captions" srcLang="en" label="english_captions" />
    </audio>
  );
}

const Audio = React.memo(AudioPlayer);

function TrackTime() {
  const { state, dispatch } = usePlayerStore();
  const [innerTime, setInnerTime] = useState<null | number>(null);
  const innerTrackTime = innerTime ?? state.trackTime;

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: "28px auto 28px" }}>
      <span title="Track Time" className="text-sm text-slate-500 w-7">
        {formatTime(innerTrackTime)}
      </span>
      <Slider
        min={0}
        max={state.duration}
        value={innerTrackTime}
        onChange={(val) => {
          setInnerTime(val);
        }}
        onMouseUp={(val) => {
          dispatch.updateTrackTime(val);
          setInnerTime(null);
          // if (audio.current) {
          //   audio.current.currentTime = val;
          //   dispatch(E_PlayerAction.UPDATE_TRACK_TIME);
          // }
          // setIsMouseDown(false);
        }}
        // onMouseDown={() => setIsMouseDown(true)}
      />
      {/* <Audio audio={audio} track={track} /> */}
      <span title="Total Time" className="text-sm text-slate-500 w-7">
        {formatTime(state.duration)}
      </span>
    </div>
  );
}

export default TrackTime;
