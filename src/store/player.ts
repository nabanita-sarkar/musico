import { useSyncExternalStore } from "react";
import { tracks } from "../utils/constants";
import { getShuffledArray } from "../utils/functions";
import type { T_LoopType, T_Track } from "../utils/types";
import { EqualiserService, INITIAL_GAINS, type T_Freqency } from "./equaliser";

type T_TrackStatus = "idle" | "loading" | "ready" | "error";
type T_PlayerState = {
  playlist: T_Track[];
  shuffleList: number[] | null;
  currentIndex: number;
  trackTime: number;
  duration: number;
  isPlaying: boolean;
  shuffle: boolean;
  repeatMode: T_LoopType;
  status: T_TrackStatus;
  gains: Record<T_Freqency, number>;
};
export enum E_PlayerAction {
  TOGGLE_PLAY = "TOGGLE_PLAY",
  NEXT = "NEXT",
  PREV = "PREV",
  TRACK_FINISEHED = "TRACK_FINISEHED",
  TOGGLE_SHUFFLE = "TOGGLE_SHUFFLE",
  TOGGLE_REPEAT = "TOGGLE_REPEAT",
  UPDATE_TRACK_TIME = "UPDATE_TRACK_TIME",
}

const initialState: T_PlayerState = {
  playlist: tracks,
  shuffleList: null,
  currentIndex: 0,
  trackTime: 0,
  duration: 0,
  isPlaying: false,
  shuffle: false,
  repeatMode: "default",
  status: "idle",
  gains: INITIAL_GAINS,
};

class PlayerStore {
  private _audio: HTMLAudioElement;
  private _audioContext: AudioContext | null;
  private _source: MediaElementAudioSourceNode | null;
  private _snapshot: T_PlayerState;
  private _listeners: Set<() => void>;
  private _equaliser: EqualiserService | null;

  private _handleLoading = () => {
    this.emit({ status: "loading", trackTime: 0, duration: 0 });
  };
  private _handleReady = (e: Event) => {
    const el = e.target as HTMLAudioElement;
    this.emit({ status: "ready", duration: el.duration });
    if (this._snapshot.isPlaying && el.paused) {
      this.play();
    }
  };
  private _handleError = () => {
    this.emit({ status: "error" });
  };
  private _handleTrackEnded = () => {
    if (this._snapshot.repeatMode === "single") {
      this.updateTrackTime(0);
      return;
    }
    this.playNext();
  };
  private _handleTrackTimeUpdate = (e: Event) => {
    const el = e.target as HTMLAudioElement;
    let floored = Math.floor(el.currentTime);
    if (floored === Math.floor(this._snapshot.trackTime)) {
      return;
    }
    this.emit({ trackTime: el.currentTime });
  };
  constructor() {
    this._audio = new Audio();
    this._snapshot = initialState;
    this._listeners = new Set();
    this.loadTrack(0);
    this._source = null;
    this._audioContext = null;
    this._equaliser = null;

    this._audio.addEventListener("loadstart", this._handleLoading);
    this._audio.addEventListener("canplay", this._handleReady);
    this._audio.addEventListener("error", this._handleError);
    this._audio.addEventListener("ended", this._handleTrackEnded);
    this._audio.addEventListener("timeupdate", this._handleTrackTimeUpdate);
  }
  /* For housekeeping */
  public destroy() {
    this._audio.removeEventListener("loadstart", this._handleLoading);
    this._audio.removeEventListener("canplay", this._handleReady);
    this._audio.removeEventListener("error", this._handleError);
    this._audio.removeEventListener("ended", this._handleTrackEnded);
    this._audio.removeEventListener("timeupdate", this._handleTrackTimeUpdate);

    this._listeners.clear();
  }
  private emit(update: Partial<T_PlayerState>) {
    const newSnapshot = { ...this._snapshot, ...update };
    const isAllSame = Object.entries(this._snapshot).every(([key, val]) => {
      return (newSnapshot as Record<string, any>)[key] === val;
    });
    if (isAllSame) return;
    this._snapshot = newSnapshot;
    this._listeners.forEach((l) => l());
  }
  private play() {
    if (this._snapshot.status !== "ready") {
      return;
    }
    this._audio.play();
    if (!this._source) {
      const { source, audioContext, equaliser } = visualizeFreq(this._audio);
      this._source = source;
      this._audioContext = audioContext;
      this._equaliser = equaliser;
    }

    this.emit({ isPlaying: true });
  }
  private pause() {
    if (this._snapshot.status !== "ready") {
      return;
    }
    this._audio.pause();
    this.emit({ isPlaying: false });
  }
  private loadTrack(newIndex: number) {
    const track = this._snapshot.playlist[newIndex].audio;
    this._audio.src = track;
    this._audio.load();
    getAudioContext(track);

    this.emit({ currentIndex: newIndex, status: "loading", trackTime: 0, duration: 0 });
  }
  /* For React useSyncExternalStore orchestration  */
  public getSnapshot = () => {
    return this._snapshot;
  };
  public subscribe = (cb: () => void) => {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  };
  /* For user actions */
  public togglePlay = () => {
    if (this._snapshot.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  };
  public toggleShuffle = () => {
    if (this._snapshot.shuffle) {
      this.emit({ shuffle: false, shuffleList: null });
    } else {
      const shuffleList = getShuffledArray(
        this._snapshot.playlist.filter((_, i) => i !== this._snapshot.currentIndex).map((el) => el.id)
      );
      this.emit({ shuffle: true, shuffleList: [this._snapshot.currentIndex, ...shuffleList] });
    }
  };
  public cycleRepeat = () => {
    let newMode: T_PlayerState["repeatMode"] = "default";
    if (this._snapshot.repeatMode === "default") {
      newMode = "loop";
    } else if (this._snapshot.repeatMode === "loop") {
      newMode = "single";
    } else {
      newMode = "default";
    }
    this.emit({ repeatMode: newMode });
  };
  public playNext = () => {
    const shuffleIndex = this._snapshot.shuffleList?.findIndex((el) => el === this._snapshot.currentIndex)!;
    const newIndex = this._snapshot.shuffleList
      ? this._snapshot.shuffleList?.[shuffleIndex + 1]
      : this._snapshot.currentIndex + 1;
    const isLast = typeof newIndex === "undefined" || newIndex >= this._snapshot.playlist.length;
    if (!isLast) {
      this.loadTrack(newIndex);
    } else if (this._snapshot.repeatMode === "default") {
      this.pause();
      this.loadTrack(0);
    } else if (this._snapshot.repeatMode === "loop" || this._snapshot.repeatMode === "single") {
      this.loadTrack(0);
    }
  };
  public playPrev = () => {
    if (this._snapshot.trackTime > 3) {
      this.updateTrackTime(0);
      return;
    }
    const shuffleIndex = this._snapshot.shuffleList?.findIndex((el) => el === this._snapshot.currentIndex)!;
    const newIndex = this._snapshot.shuffleList
      ? this._snapshot.shuffleList?.[shuffleIndex - 1]
      : this._snapshot.currentIndex - 1;
    const isImpossible = typeof newIndex === "undefined" || newIndex < 0;
    if (!isImpossible) {
      this.loadTrack(newIndex);
    } else {
      this.updateTrackTime(0);
    }
  };
  public updateTrackTime = (val: number) => {
    this._audio.currentTime = val;
    this.emit({ trackTime: val });
  };
  public reorderPlaylist = (newOrder: number[]) => {
    const isAllSame = this._snapshot.shuffleList?.every((el, i) => el === newOrder[i]);
    if (isAllSame) return;
    this.emit({ shuffleList: [...newOrder] });
  };
  public changeFreqGain = (freq: T_Freqency, gain: number) => {
    this._equaliser?.setGain(freq, gain);
    const newGains = { ...this._snapshot.gains, [freq]: gain };
    this.emit({ gains: newGains });
  };
}

export const playerInstance = new PlayerStore();

export function usePlayerStore() {
  const state = useSyncExternalStore(playerInstance.subscribe, playerInstance.getSnapshot);
  const dispatch = {
    togglePlay: playerInstance.togglePlay,
    toggleShuffle: playerInstance.toggleShuffle,
    cycleRepeat: playerInstance.cycleRepeat,
    playNext: playerInstance.playNext,
    playPrev: playerInstance.playPrev,
    updateTrackTime: playerInstance.updateTrackTime,
    reorderPlaylist: playerInstance.reorderPlaylist,
    changeFreqGain: playerInstance.changeFreqGain,
  };
  return {
    state,
    dispatch,
  };
}

function visualizeFreq(audioElement: HTMLAudioElement) {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 128;

  const frequencyBufferLength = analyser.frequencyBinCount;
  const frequencyData = new Uint8Array(frequencyBufferLength);
  const source = audioContext.createMediaElementSource(audioElement);
  source.connect(analyser);
  const equaliser = new EqualiserService(audioContext, analyser);
  equaliser.maxFilter.connect(audioContext.destination);

  /* Canvas related stuff */
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  canvas.width = canvas.clientWidth * 5;
  canvas.height = canvas.clientHeight * 5;

  const canvasContext = canvas.getContext("2d")!;

  canvasContext.fillStyle = "#5271FF";
  const barWidth = canvas.width / frequencyBufferLength;

  function draw() {
    requestAnimationFrame(draw);
    canvasContext?.clearRect(0, 0, canvas.width, canvas.height);
    analyser.getByteFrequencyData(frequencyData);

    for (let i = 0; i < frequencyBufferLength; i++) {
      canvasContext.fillStyle = `rgba(107, 102, 255, ${frequencyData[i] / 255})`;
      canvasContext?.roundRect(
        i * barWidth,
        canvas.height - frequencyData[i],
        barWidth - 2,
        frequencyData[i],
        [50, 50, 0, 0]
      );
      canvasContext.fill();
      canvasContext.beginPath();
    }
  }

  draw();
  return { source, audioContext, equaliser };
}

function visualizeTime(audioBuffer: AudioBuffer) {
  const canvas = document.getElementById("canvas_time") as HTMLCanvasElement;

  const dpr = window?.devicePixelRatio || 1;

  const DISPLAY_WIDTH = canvas.clientWidth;
  const DISPLAY_HEIGHT = canvas.clientHeight;

  canvas.width = DISPLAY_WIDTH * dpr;
  canvas.height = DISPLAY_HEIGHT * dpr;

  canvas.style.width = `${DISPLAY_WIDTH}px`;
  canvas.style.height = `${DISPLAY_HEIGHT}px`;

  const canvasContext = canvas.getContext("2d")!;
  canvasContext.scale(dpr, dpr);

  const channelData = audioBuffer.getChannelData(0);

  const numberOfChunks = 128;
  const chunkSize = Math.ceil(channelData.length / numberOfChunks);

  canvasContext.fillStyle = "rgba(255, 133, 173, 0.5)";
  const center = DISPLAY_HEIGHT / 2;
  const amplitude = center - 10;

  const barWidth = DISPLAY_WIDTH / numberOfChunks;

  for (let i = 0; i < numberOfChunks; i++) {
    let min = Infinity;
    let max = -Infinity;
    for (let j = i * chunkSize; j < Math.min((i + 1) * chunkSize, channelData.length); j++) {
      min = Math.min(min, channelData[j]);
      max = Math.max(max, channelData[j]);
    }
    min = min * amplitude;
    max = max * amplitude;

    canvasContext?.roundRect(i * barWidth, center - max, barWidth - 1, max + Math.abs(min), 6);
  }
  canvasContext.fill();
}

async function getAudioContext(src: string) {
  try {
    const response = await fetch(src);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new AudioContext({ sinkId: { type: "none" } } as any);

    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    visualizeTime(audioBuffer);
  } catch (error) {
    console.error(error);
  }
}
