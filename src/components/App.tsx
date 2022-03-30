import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import Slider from "./Slider";

const formatTime = (time: number) => {
  const min = Math.floor(time / 60).toFixed(0);
  const sec = (time % 60).toFixed(0);
  return `${min}:${sec.length === 1 ? `0${sec}` : sec}`;
};

const tracks = [
  {
    song: "Dancing on the moon",
    artist: "Unknown Brain",
    time: 221,
    album_art:
      "https://linkstorage.linkfire.com/medialinks/images/58c79a18-d5ea-4515-8d93-1abc6395dbe1/artwork-440x440.jpg",
  },
  {
    song: "Blackhole",
    artist: "Ava King",
    time: 200,
    album_art:
      "https://i1.sndcdn.com/artworks-ejQtUPXG7aDyLW6w-Vm3zSA-t500x500.jpg",
  },
  {
    song: "Phenomenon",
    artist: "Dax & VinDon",
    time: 207,
    album_art: "https://i.ytimg.com/vi/VpxZBD4iQY4/maxresdefault.jpg",
  },
];

function App() {
  const [trackList, setTrackList] = useState(
    tracks.map((item, id) => ({ ...item, id }))
  );
  const [track, setTrack] = useState(trackList[0]);
  const [trackTime, setTrackTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [loop, setLoop] = useState<"default" | "loop" | "single">("default");

  const changeSong = (type: "next" | "prev") => {
    setTrack((prev) => {
      const id = trackList.findIndex((item) => item.id === prev.id);
      if (type === "next" && id === trackList.length - 1) return trackList[0];
      if (type === "prev" && id === 0) return trackList[trackList.length - 1];
      return trackList.find(
        (_, i) => i === (type === "next" ? id + 1 : id - 1)
      )!;
    });
    setTrackTime(0);
  };

  useEffect(() => {
    let intervalId: any;
    intervalId = setInterval(() => setTrackTime(trackTime + 1), 1000);
    if (!isPlaying) {
      clearInterval(intervalId);
    }
    // if (trackTime === track.time) {
    //   clearInterval(intervalId);

    //   // setIsPlaying(false);
    // }
    return () => {
      clearInterval(intervalId);
    };
  });

  useEffect(() => {
    if (track.time === trackTime) {
      setTrackTime(0);
      if (loop === "loop") {
        if (!isMouseDown) {
          console.log(isMouseDown);

          changeSong("next");
        }
      } else if (loop === "default") {
        if (!isMouseDown) {
          changeSong("next");
        }
        if (track.id === trackList.length - 1) setIsPlaying(false);
      }
    }
  }, [loop, trackTime, isMouseDown]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-slate-50">
      <div className="absolute top-0">
        <picture>
          <img
            src="https://tailwindcss.com/_next/static/media/docs@tinypng.61f4d3334a6d245fc2297517c87ae044.png"
            alt="gradient"
            className="-scale-y-100 scale-x-100"
          />
          <img
            src="https://tailwindcss.com/_next/static/media/docs@tinypng.61f4d3334a6d245fc2297517c87ae044.png"
            alt="gradient"
          />
        </picture>
      </div>
      <div className="flex flex-col gap-4 border border-slate-200 rounded-xl p-6 bg-white/70 w-96 drop-shadow-2xl backdrop-blur-md">
        <div className="flex gap-4">
          <img
            src={track.album_art}
            alt="Album Art"
            className="rounded-lg w-20 h-20"
          />
          <div>
            <h3 title="Track" className="text-slate-900 text-xl font-bold">
              {track.song}
            </h3>
            <p title="Artist" className="text-slate-500 text-sm font-semibold">
              {track.artist}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span title="Track Time" className="text-sm text-slate-500 w-7">
            {formatTime(trackTime)}
          </span>
          <Slider
            min={0}
            max={track.time}
            value={trackTime}
            onChange={setTrackTime}
            onMouseDown={() => setIsMouseDown(true)}
            onMouseUp={() => setIsMouseDown(false)}
          />
          <span title="Total Time" className="text-sm text-slate-500 w-7">
            {formatTime(track.time)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <button
            title={loop}
            onClick={() => {
              if (loop === "default") setLoop("loop");
              if (loop === "loop") setLoop("single");
              if (loop === "single") setLoop("default");
            }}
            className={`p-2 ${
              loop === "loop" ? "text-slate-800" : "text-slate-400"
            }`}
          >
            {loop === "single" ? (
              <Repeat1 className="text-slate-800" />
            ) : (
              <Repeat />
            )}
          </button>
          <div className="flex gap-4">
            <button
              className="bg-slate-200 rounded-full p-2"
              onClick={() => changeSong("prev")}
            >
              <SkipBack className="text-slate-400 fill-slate-400" />
            </button>
            <button
              className="text-2xl w-10 flex justify-center items-center rounded-full bg-slate-200"
              onClick={() => {
                setIsPlaying(!isPlaying);
                clearInterval();
              }}
            >
              {isPlaying ? (
                <Pause className="fill-slate-400 text-slate-400" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    className="fill-slate-200 text-slate-200"
                  ></circle>
                  <polygon
                    points="10 8 16 12 10 16 10 8"
                    className="fill-slate-400 text-slate-400"
                  ></polygon>
                </svg>
              )}
            </button>
            <button
              className="bg-slate-200 rounded-full p-2"
              onClick={() => changeSong("next")}
            >
              <SkipForward className="text-slate-400 fill-slate-400" />
            </button>
          </div>
          <button title="Shuffle" onClick={() => changeSong("prev")}>
            <Shuffle className="text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
