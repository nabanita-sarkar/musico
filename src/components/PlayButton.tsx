import { Pause } from "lucide-react";
import { motion } from "framer-motion";
import Play from "./Play";
import { T_LoopType } from "../utils/types";

export default function PlayButton({
  isPlaying,
  onClick,
}: {
  isPlaying: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 1.2 }}
      className="text-2xl w-10 flex justify-center items-center rounded-full bg-slate-200"
      onClick={() => onClick()}
    >
      {isPlaying ? (
        <Pause className="fill-slate-400 text-slate-400" />
      ) : (
        <Play />
      )}
    </motion.button>
  );
}
