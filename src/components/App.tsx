import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { usePlayerStore } from "../store/player";
import { LoopButton, NextButton, PrevButton, ShuffleButton } from "./Buttons";
import PlayButton from "./PlayButton";
import Queue from "./Queue";
import SongDetails from "./SongDetails";
import TrackTime from "./TrackTime";

function App() {
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  return (
    <div
      className="w-full h-screen flex items-center justify-center bg-slate-50"
      style={{
        fontFamily: "sans-serif",
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
        <SongDetails isQueueOpen={isQueueOpen} setIsQueueOpen={setIsQueueOpen} />
        <TrackTime />
        <ButtonStack />
      </div>
      <AnimatePresence>{isQueueOpen && <Queue setIsQueueOpen={setIsQueueOpen} />}</AnimatePresence>
    </div>
  );
}

function ButtonStack() {
  const { state, dispatch } = usePlayerStore();

  return (
    <div className="flex items-center justify-between gap-4">
      <LoopButton loop={state.repeatMode} onClick={() => dispatch.cycleRepeat()} />
      <div className="flex gap-4">
        <PrevButton onClick={() => dispatch.playPrev()} />
        <PlayButton />
        <NextButton onClick={() => dispatch.playNext()} />
      </div>
      <ShuffleButton isShuffleOn={state.shuffle} onClick={() => dispatch.toggleShuffle()} />
    </div>
  );
}

export default App;
