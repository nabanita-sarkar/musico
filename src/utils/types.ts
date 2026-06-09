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
export type FilterDefinition = {
  id: string; // stable id e.g. 'lowpass', 'reverb'
  label: string;
  defaultParams: Record<string, number>;
};

// An instance in the pipeline — same filter can appear multiple times
export type PipelineFilter = {
  instanceId: string; // uuid — unique per drop
  filterId: string; // points back to FilterDefinition.id
  label: string;
  params: Record<string, number>;
};
