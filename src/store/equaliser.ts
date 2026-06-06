export const FREQUENCIES = [250, 500, 1000, 2000, 4000, 8000, 16000] as const;
export type T_Freqency = typeof FREQUENCIES[number];

export const INITIAL_GAINS: Record<T_Freqency, number> = {} as any;
for (const freq of FREQUENCIES) {
  INITIAL_GAINS[freq] = 0;
}

export class EqualiserService {
  private _frequencies: typeof FREQUENCIES;
  public gains: Record<T_Freqency, number>;
  public maxFilter: BiquadFilterNode;
  private _filters: Record<T_Freqency, BiquadFilterNode>;
  private _audioContext: AudioContext;

  constructor(audioContext: AudioContext, inputNode: AudioNode) {
    this._frequencies = FREQUENCIES;
    this.gains = INITIAL_GAINS;
    this._filters = {} as any;
    this._audioContext = audioContext;

    let minFreq: T_Freqency = this._frequencies[0];
    const midFreqs = this._frequencies.slice(1, this._frequencies.length - 2);
    const maxFreq = this._frequencies[this._frequencies.length - 1];

    const filterMin = new BiquadFilterNode(audioContext, { type: "lowshelf", frequency: minFreq });
    this._filters[minFreq] = filterMin;
    inputNode.connect(filterMin);

    let prevFilter = filterMin;
    midFreqs.forEach((currFreq) => {
      const filter = new BiquadFilterNode(audioContext, {
        type: "peaking",
        frequency: currFreq,
        Q: 0.5,
      });
      this._filters[currFreq] = filter;
      minFreq = currFreq;
      prevFilter.connect(filter);
      prevFilter = filter;
    });

    const filterMax = new BiquadFilterNode(audioContext, { type: "highshelf", frequency: maxFreq });
    prevFilter.connect(filterMax);
    this.maxFilter = filterMax;
    this._filters[maxFreq] = filterMax;
  }

  public setGain(freq: T_Freqency, gain: number) {
    this.gains[freq] = gain;
    this._filters[freq].gain.setValueAtTime(gain, this._audioContext.currentTime);
  }
}
