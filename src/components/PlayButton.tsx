import { Pause, Play } from "lucide-react";
import { motion } from "motion/react";
import { usePlayerStore } from "../store/player";

export default function PlayButton() {
  const { state, dispatch } = usePlayerStore();

  return (
    <motion.button
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      className="text-2xl w-10 flex justify-center items-center rounded-full bg-slate-200 text-slate-400 disabled:text-yellow-500 disabled:bg-yellow-200 disabled:cursor-not-allowed"
      onClick={() => {
        dispatch.togglePlay();
      }}
      disabled={state.status !== "ready"}
    >
      {state.isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current" />}
    </motion.button>
  );
}
