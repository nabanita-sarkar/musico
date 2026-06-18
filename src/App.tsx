import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { LoopButton, NextButton, PrevButton, ShuffleButton } from "./components/Buttons";
import Equaliser from "./components/Equaliser";
import PlayButton from "./components/PlayButton";
import Queue from "./components/Queue";
import SongDetails from "./components/SongDetails";
import TrackTime from "./components/TrackTime";
import { usePlayerDispatch, usePlayerSelector } from "./store/player";
import { FilterPipeline } from "./components/FilterPipeline";
import Card from "./components/Card";
import { DISPLAY_HEIGHT } from "./utils/constants";
import FreqVis from "./components/FreqVis";

function App() {
  return (
    <>
      <Main />
      {/* <FilterPipeline /> */}
    </>
  );
}

function Main() {
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  return (
    <div
      className="w-full h-screen flex flex-wrap gap-6 items-center justify-center bg-slate-50"
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
      <Card>
        <FreqVis />
      </Card>
      <Card className="w-96">
        <SongDetails isQueueOpen={isQueueOpen} setIsQueueOpen={setIsQueueOpen} />
        <TimeDomain />
        <Equaliser />
        <TrackTime />
        <ButtonStack />
      </Card>
      <AnimatePresence>{isQueueOpen && <Queue setIsQueueOpen={setIsQueueOpen} />}</AnimatePresence>
    </div>
  );
}

function TimeDomain() {
  return (
    <div
      className="rounded-lg relative overflow-hidden"
      style={{
        width: "100%",
        height: DISPLAY_HEIGHT,
      }}
    >
      <canvas
        id="canvas_time"
        className="bg-slate-200 absolute top-0 left-0 right-0 bottom-0 shadow-inner shadow-slate-800/20"
        style={{
          width: "100%",
          height: DISPLAY_HEIGHT,
        }}
      />
      <TimeDomainPlayer />
    </div>
  );
}

function TimeDomainPlayer() {
  const trackTime = usePlayerSelector((state) => state.trackTime);
  const duration = usePlayerSelector((state) => state.duration);
  const isTrackNotLoaded = isNaN(trackTime / duration);
  return (
    <div
      className="bg-pink-500/20 top-0 left-0 absolute w-full mix-blend-darken transition-transform will-change-transform"
      style={{
        height: DISPLAY_HEIGHT,
        transform: `translateX(-${isTrackNotLoaded ? 100 : 100 - (trackTime / duration) * 100}%)`,
      }}
    />
  );
}

function ButtonStack() {
  const repeatMode = usePlayerSelector((state) => state.repeatMode);
  const shuffle = usePlayerSelector((state) => state.shuffle);
  const dispatch = usePlayerDispatch();

  return (
    <div className="flex items-center justify-between gap-4">
      <LoopButton loop={repeatMode} onClick={() => dispatch.cycleRepeat()} />
      <div className="flex gap-4">
        <PrevButton onClick={() => dispatch.playPrev()} />
        <PlayButton />
        <NextButton onClick={() => dispatch.playNext()} />
      </div>
      <ShuffleButton isShuffleOn={shuffle} onClick={() => dispatch.toggleShuffle()} />
    </div>
  );
}

export default App;
