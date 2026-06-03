export type T_Track = {
  id: number;
  song: string;
  artist: string;
  time: number;
  album_art: string;
  audio: string;
};
export type T_TrackList = T_Track[];
export type T_ChangeType = "next" | "prev";
export type T_LoopType = "default" | "loop" | "single";
