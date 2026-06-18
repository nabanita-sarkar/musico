import type { FilterDefinition } from "./types";

export const tracks = [
  {
    id: 0,
    song: "Dancing on the moon",
    artist: "Unknown Brain",
    time: 221,
    album_art:
      "https://linkstorage.linkfire.com/medialinks/images/58c79a18-d5ea-4515-8d93-1abc6395dbe1/artwork-440x440.jpg",
    audio: "/music/Dancing-On-The-Moon.mp3",
  },
  {
    id: 1,
    song: "Blackhole",
    artist: "Unknown Brain (ft. Ava King)",
    time: 200,
    album_art: "https://i1.sndcdn.com/artworks-ejQtUPXG7aDyLW6w-Vm3zSA-t500x500.jpg",
    audio: "/music/Blackhole-Ava-King.mp3",
  },
  {
    id: 2,
    song: "Phenomenon",
    artist: "Unknown Brain & Hoober (ft. Dax & VinDon)",
    time: 207,
    album_art: "https://i.ytimg.com/vi/VpxZBD4iQY4/maxresdefault.jpg",
    audio: "/music/Phenomenon.mp3",
  },
];

export const NUM_OF_TRACKS = tracks.length;

export const FILTER_COLLECTION: FilterDefinition[] = [
  { id: "lowpass", label: "Low Pass", defaultParams: { frequency: 1000, q: 1 } },
  { id: "highpass", label: "High Pass", defaultParams: { frequency: 500, q: 1 } },
  { id: "reverb", label: "Reverb", defaultParams: { decay: 2, wet: 0.5 } },
  { id: "delay", label: "Delay", defaultParams: { time: 0.3, feedback: 0.4 } },
];

export const PIPELINE_DROPPABLE_ID = "pipeline";

export const DISPLAY_WIDTH = 334;
export const DISPLAY_HEIGHT = 70;
