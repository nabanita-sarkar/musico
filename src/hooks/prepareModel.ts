import FFT from "fft.js";
import type { InferenceSession } from "onnxruntime-web";

export const N_FFT = 4096;
export const HOP_LENGTH = 1024;
export const WIN_LENGTH = N_FFT;

// Hann window — must match what Python used
function hannWindow(size: number): Float32Array {
  const window = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (size - 1)));
  }
  return window;
}

function padAudio(samples: Float32Array): Float32Array {
  const padSize = N_FFT / 2; // 2048
  const padded = new Float32Array(samples.length + padSize * 2);
  padded.set(samples, padSize); // center the signal
  return padded;
}

// STFT for a single channel
// input: Float32Array of samples
// output: Float32Array of shape [2, n_fft/2+1, n_frames, 2] flattened
//         last dim = [real, imag] (complex-as-channels)
function stft(samples: Float32Array): Float32Array {
  const padded = padAudio(samples);
  const fft = new FFT(N_FFT);
  const window = hannWindow(WIN_LENGTH);

  const n_frames = Math.floor((padded.length - N_FFT) / HOP_LENGTH) + 1;
  const n_bins = N_FFT / 2 + 1; // 2049... but model expects 2048, so we drop last bin

  // output: [n_bins-1, n_frames, 2] — real and imag
  const out = new Float32Array((n_bins - 1) * n_frames * 2);

  const frame = new Array(N_FFT * 2); // interleaved complex input for fft.js
  const result = new Array(N_FFT * 2);

  for (let f = 0; f < n_frames; f++) {
    const offset = f * HOP_LENGTH;

    // apply window
    for (let i = 0; i < N_FFT; i++) {
      frame[2 * i] = (samples[offset + i] ?? 0) * window[i]; // real
      frame[2 * i + 1] = 0; // imag
    }

    fft.transform(result, frame);

    // write bins 0..2047 (drop nyquist bin 2048)
    for (let b = 0; b < n_bins - 1; b++) {
      const outIdx = (b * n_frames + f) * 2;
      out[outIdx] = result[2 * b]; // real
      out[outIdx + 1] = result[2 * b + 1]; // imag
    }
  }

  return out;
}

// Full stereo STFT matching demucs export shape [1, 2, 2048, n_frames, 2]
export function computeStereoSTFT(left: Float32Array, right: Float32Array, n_frames: number): Float32Array {
  const N_BINS = 2048;
  const out = new Float32Array(1 * 2 * N_BINS * n_frames * 2);

  const leftSpec = stft(left);
  const rightSpec = stft(right);

  // channel 0 (left)
  out.set(leftSpec, 0);
  // channel 1 (right)
  out.set(rightSpec, N_BINS * n_frames * 2);

  return out;
}

const CHUNK_SAMPLES = 441000;

async function runInference(session: any, audioLeft: Float32Array, audioRight: Float32Array, Tensor: any) {
  const n_frames = Math.floor((CHUNK_SAMPLES - N_FFT) / HOP_LENGTH) + 1; // should be 431

  const mixData = new Float32Array(1 * 2 * CHUNK_SAMPLES);
  mixData.set(audioLeft, 0);
  mixData.set(audioRight, CHUNK_SAMPLES);

  const specData = computeStereoSTFT(audioLeft, audioRight, n_frames);

  const mixTensor = new Tensor("float32", mixData, [1, 2, CHUNK_SAMPLES]);
  const specTensor = new Tensor("float32", specData, [1, 2, 2048, n_frames, 2]);

  const result = await session.run({
    mix: mixTensor,
    spec: specTensor, // check the exact input name from the model
  });

  return result;
}

async function decodeAudio(audioBuffer: AudioBuffer): Promise<{ left: Float32Array; right: Float32Array }> {
  // const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : audioBuffer.getChannelData(0); // mono fallback — duplicate left

  return { left, right };
}

export async function separate(audioBuffer: AudioBuffer, session: any, Tensor: any) {
  const { left, right } = await decodeAudio(audioBuffer);

  // chunk into 10s pieces
  const CHUNK_SAMPLES = 441000;
  const numChunks = Math.ceil(left.length / CHUNK_SAMPLES);
  const results = [];
  console.log("input names ------>", session.inputNames);

  for (let i = 0; i < numChunks; i++) {
    const start = i * CHUNK_SAMPLES;

    const leftChunk = new Float32Array(CHUNK_SAMPLES);
    const rightChunk = new Float32Array(CHUNK_SAMPLES);

    // copy — last chunk is zero-padded automatically since Float32Array initializes to 0
    leftChunk.set(left.subarray(start, start + CHUNK_SAMPLES));
    rightChunk.set(right.subarray(start, start + CHUNK_SAMPLES));

    const result = await runInference(session, leftChunk, rightChunk, Tensor);
    console.log("result num: ", i, "->>>>>", result);

    results.push(result);
  }

  return results;
}

export const STEMS = ["drums", "bass", "other", "vocals"];

export function extractStems(result: InferenceSession.OnnxValueMapType) {
  const output = result["add_77"].data as Float32Array<ArrayBuffer>; // [1, 4, 2, 441000] flattened
  const stems: Record<string, { left: Float32Array<ArrayBuffer>; right: Float32Array<ArrayBuffer> }> = {};

  for (let s = 0; s < 4; s++) {
    const leftStart = s * 2 * CHUNK_SAMPLES;
    const rightStart = leftStart + CHUNK_SAMPLES;

    stems[STEMS[s]] = {
      left: output.slice(leftStart, leftStart + CHUNK_SAMPLES),
      right: output.slice(rightStart, rightStart + CHUNK_SAMPLES),
    };
  }

  return stems;
}

export function stemToWav(
  left: Float32Array<ArrayBuffer>,
  right: Float32Array<ArrayBuffer>,
  sampleRate = 44100
): AudioBuffer {
  const audioCtx = new AudioContext({ sampleRate });
  const buffer = audioCtx.createBuffer(2, left.length, sampleRate);
  buffer.copyToChannel(left, 0);
  buffer.copyToChannel(right, 1);
  return buffer;
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numSamples = buffer.length;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = (numSamples * numChannels * bitsPerSample) / 8;

  const wavBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(wavBuffer);

  // WAV header
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);

  // interleave channels and convert float32 → int16
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(c)[i]));
      view.setInt16(offset, sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([wavBuffer], { type: "audio/wav" });
}

export function createAudioEl(audioBuffer: AudioBuffer) {
  const blob = audioBufferToWav(audioBuffer);

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "audio.wav";
  anchor.click();

  // set on audio element
  const audioEl = new Audio(url);
  audioEl.controls = true;
  audioEl.load();

  // audioEl.addEventListener("canplaythrough", () => {
  //   URL.revokeObjectURL(url);
  // });
  return audioEl;
}
