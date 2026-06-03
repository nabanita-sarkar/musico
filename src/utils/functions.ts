import type { T_ChangeType, T_Track, T_TrackList } from "./types";

export const getShuffledArray = (array: number[]) => {
  const newArray = [...array];

  // Ref: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = newArray[i];
    newArray[i] = newArray[j];
    newArray[j] = temp;
  }

  return newArray;
};

export const songPicker = (prev: T_Track, type: T_ChangeType, trackList: T_TrackList) => {
  const id = trackList.findIndex((item) => item.id === prev.id);
  if (type === "next" && id === trackList.length - 1) return trackList[0];
  if (type === "prev" && id === 0) return trackList[trackList.length - 1];
  return trackList.find((_, i) => i === (type === "next" ? id + 1 : id - 1))!;
};

export const formatTime = (time: number) => {
  const min = Math.floor(time / 60).toFixed(0);
  const sec = (time % 60).toFixed(0);
  return `${min}:${sec.length === 1 ? `0${sec}` : sec}`;
};
