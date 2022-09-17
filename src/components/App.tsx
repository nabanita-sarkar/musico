import { AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { tracks } from "../utils/constants";
import { idGen, shuffle, songPicker } from "../utils/functions";
import { T_ChangeType, T_LoopType } from "../utils/types";
import { NextButton, PrevButton, ShuffleButton } from "./Buttons";

import LoopButton from "./LoopButton";
import PlayButton from "./PlayButton";
import Queue from "./Queue";
import SongDetails from "./SongDetails";
import TrackTime from "./TrackTime";

function App() {
  const [trackList, setTrackList] = useState(idGen(tracks));
  const [track, setTrack] = useState(trackList[0]);
  const [trackTime, setTrackTime] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [loop, setLoop] = useState<T_LoopType>("default");
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);

  const changeSong = (type: T_ChangeType) => {
    if (audio.current) {
      setTrack((prev) => songPicker(prev, type, trackList));
      setTrackTime(0);
    }
  };

  const shuffleSongs = () => {
    const newShuffle = !isShuffleOn;
    setIsShuffleOn(newShuffle);
    if (newShuffle) setTrackList((prev) => shuffle(prev));
    else setTrackList(idGen(tracks));
  };

  const playPause = () => {
    if (audio.current) {
      if (audio.current.paused) {
        audio.current.play();
        setIsPaused(false);
      } else {
        audio.current.pause();
        setIsPaused(true);
      }
    }
  };

  useEffect(() => {
    if (track.time === trackTime) {
      if (loop === "loop") {
        if (!isMouseDown && !isPaused) {
          changeSong("next");
          setTrackTime(0);
        }
      } else if (loop === "default") {
        if (!isMouseDown && !isPaused) {
          changeSong("next");
          setTrackTime(0);
        }
        if (!isPaused && trackList.indexOf(track) === trackList.length - 1) {
          setIsPaused(true);
        }
      } else if (loop === "single") {
        if (!isMouseDown && !isPaused) {
          setTrackTime(0);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loop, trackTime, isMouseDown, isPaused]);

  useEffect(() => {
    if (audio.current && isPaused !== audio.current.paused) {
      if (isPaused) {
        audio.current.pause();
      } else {
        audio.current.play();
      }
    }
  }, [track.song, isPaused]);

  useEffect(() => {
    const intervalId = setInterval(() => setTrackTime(trackTime + 1), 1000);
    if (isPaused) clearInterval(intervalId);

    return () => clearInterval(intervalId);
  }, [trackTime, isPaused]);

  return (
    <div
      className="w-full h-screen flex items-center justify-center bg-slate-50"
      style={{
        fontFamily: "Poppins",
        backgroundImage: `radial-gradient(at 40% 20%, hsla(28,100%,74%,1) 0px, transparent 50%),
                          radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%),
                          radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%),
                          radial-gradient(at 80% 50%, hsla(340,100%,76%,1) 0px, transparent 50%),
                          radial-gradient(at 0% 100%, hsla(22,100%,77%,1) 0px, transparent 50%),
                          radial-gradient(at 80% 100%, hsla(242,100%,70%,1) 0px, transparent 50%),
                          radial-gradient(at 0% 0%, hsla(343,100%,76%,1) 0px, transparent 50%)`,
      }}
    >
      <div className="flex flex-col gap-4 border border-slate-200 rounded-xl p-6 bg-white/90 w-96 drop-shadow-2xl backdrop-blur-md">
        <SongDetails track={track} isQueueOpen={isQueueOpen} setIsQueueOpen={setIsQueueOpen} />
        <TrackTime
          audio={audio}
          setTrackTime={setTrackTime}
          track={track}
          trackTime={trackTime}
          setIsMouseDown={setIsMouseDown}
        />
        <div className="flex items-center justify-between gap-4">
          <LoopButton loop={loop} onChange={setLoop} />
          <div className="flex gap-4">
            <PrevButton onClick={() => changeSong("prev")} />
            <PlayButton
              isPaused={isPaused}
              onClick={() => {
                if (loop === "single" && track.time === trackTime) setTrackTime(0);
                playPause();
              }}
            />
            <NextButton onClick={() => changeSong("next")} />
          </div>
          <ShuffleButton isShuffleOn={isShuffleOn} onClick={shuffleSongs} />
        </div>
      </div>
      <AnimatePresence>
        {isQueueOpen && <Queue trackList={trackList} setTrackList={setTrackList} setIsQueueOpen={setIsQueueOpen} />}
      </AnimatePresence>
    </div>
  );
}

export default App;
