import { tracks } from "./constants";
import { T_ChangeType, T_Track, T_TrackList } from "./types";

export const idGen = (array: typeof tracks) => array.map((item, id) => ({ ...item, id }));

export const shuffle = (array: T_TrackList) => {
  const newArray = array.slice();
  for (let i = newArray.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const songPicker = (prev: T_Track, type: T_ChangeType, trackList: T_TrackList) => {
  const id = trackList.findIndex((item) => item.id === prev.id);
  if (type === "next" && id === trackList.length - 1) return trackList[0];
  if (type === "prev" && id === 0) return trackList[trackList.length - 1];
  return trackList.find((_, i) => i === (type === "next" ? id + 1 : id - 1))!;
};
