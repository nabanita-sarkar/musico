import { useEffect, useState } from "react";
import {
  Pause,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import Slider from "./Slider";
import Play from "./Play";

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

const idGen = (array: typeof tracks) => {
  return array.map((item, id) => ({ ...item, id }));
};

type T_TrackList = ReturnType<typeof idGen>;
type T_Track = T_TrackList[number];
type T_ChangeType = "next" | "prev";

const shuffle = (array: T_TrackList) => {
  const newArray = array.slice();
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const songPicker = (
  prev: T_Track,
  type: T_ChangeType,
  trackList: T_TrackList
) => {
  const id = trackList.findIndex((item) => item.id === prev.id);
  if (type === "next" && id === trackList.length - 1) return trackList[0];
  if (type === "prev" && id === 0) return trackList[trackList.length - 1];
  return trackList.find((_, i) => i === (type === "next" ? id + 1 : id - 1))!;
};

function App() {
  const [trackList, setTrackList] = useState(idGen(tracks));
  const [track, setTrack] = useState(trackList[0]);
  const [trackTime, setTrackTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [loop, setLoop] = useState<"default" | "loop" | "single">("default");
  const [isShuffleOn, setIsShuffleOn] = useState(false);

  const changeSong = (type: T_ChangeType) => {
    setTrack((prev) => songPicker(prev, type, trackList));
    setTrackTime(0);
  };

  useEffect(() => {
    let intervalId: any;
    intervalId = setInterval(() => setTrackTime(trackTime + 1), 1000);
    if (!isPlaying) clearInterval(intervalId);

    return () => clearInterval(intervalId);
  });

  useEffect(() => {
    if (track.time === trackTime) {
      if (loop === "loop") {
        if (!isMouseDown && isPlaying) {
          changeSong("next");
          setTrackTime(0);
        }
      } else if (loop === "default") {
        if (!isMouseDown && isPlaying) {
          changeSong("next");
          setTrackTime(0);
        }
        if (track.id === trackList.length - 1) setIsPlaying(false);
      }
    }
  }, [loop, trackTime, isMouseDown, isPlaying]);

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
      <div className="absolute top- overflow-clip">
        {/* <picture>
          <img
            src="https://tailwindcss.com/_next/static/media/docs@tinypng.61f4d3334a6d245fc2297517c87ae044.png"
            alt="gradient"
            className="-scale-y-100 scale-x-100"
          />
          <img
            src="https://tailwindcss.com/_next/static/media/docs@tinypng.61f4d3334a6d245fc2297517c87ae044.png"
            alt="gradient"
          />
        </picture> */}
      </div>
      <div className="flex flex-col gap-4 border border-slate-200 rounded-xl p-6 bg-white/90 w-96 drop-shadow-2xl backdrop-blur-md">
        <div className="flex gap-4">
          <img
            src={track.album_art}
            alt="Album Art"
            className="rounded-lg w-20 h-20"
          />
          <div>
            <h3
              title="Track"
              className="text-slate-900 text-2xl leading-6 font-bold"
            >
              {track.song}
            </h3>
            <p title="Artist" className="text-slate-500">
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
                <Play />
              )}
            </button>
            <button
              className="bg-slate-200 rounded-full p-2"
              onClick={() => changeSong("next")}
            >
              <SkipForward className="text-slate-400 fill-slate-400" />
            </button>
          </div>
          <button
            title="Shuffle"
            onClick={() => {
              const newShuffle = !isShuffleOn;
              setIsShuffleOn(newShuffle);
              if (newShuffle) setTrackList((prev) => shuffle(prev));
              else setTrackList(idGen(tracks));
            }}
          >
            <Shuffle
              className={isShuffleOn ? "text-slate-800" : "text-slate-400"}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
