import { idGen } from "./functions";

export type T_TrackList = ReturnType<typeof idGen>;
export type T_Track = T_TrackList[number];
export type T_ChangeType = "next" | "prev";
export type T_LoopType = "default" | "loop" | "single";
