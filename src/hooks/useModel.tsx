import wasmUrl from "onnxruntime-web/ort-wasm-simd-threaded.jsep.wasm?url";
import mjsUrl from "onnxruntime-web/ort-wasm-simd-threaded.jsep.mjs?url";
import { computeStereoSTFT, createAudioEl, extractStems, HOP_LENGTH, N_FFT, stemToWav } from "./prepareModel";
import type { InferenceSession } from "onnxruntime-web";

const load = async (webgpu: boolean) => {
  const isWebGPUavailable = "gpu" in navigator;

  if (webgpu && !isWebGPUavailable) {
    console.warn("WebGPU is not available in this browser.");
  }

  const runtime =
    // webgpu && isWebGPUavailable ? await import("onnxruntime-web/webgpu") :
    await import("onnxruntime-web");

  // runtime.env.wasm.numThreads = Math.max(1, navigator.hardwareConcurrency - 2);
  runtime.env.wasm.numThreads = 1;
  runtime.env.wasm.wasmPaths = {
    wasm: wasmUrl,
    mjs: mjsUrl,
  };

  return runtime;
};

export const useModel = () => {
  return {
    run: async (webgpu = true, audioBuffer: AudioBuffer) => {
      const { InferenceSession, Tensor, env } = await load(webgpu);

      const model = "models/htdemucs_optimized.onnx";
      console.log("Using model: ", model, env);

      const model_binary = await fetch(model);
      const model_uint8 = new Uint8Array(await model_binary.arrayBuffer());

      console.time("onnx");
      const startTime = performance.now();

      const session = await InferenceSession.create(model_uint8, {
        // executionProviders: webgpu ? ["webgpu", "wasm"] : ["wasm"],
        executionProviders: ["wasm"],
        //enableProfiling: false,
      });

      // ###################### CODE START
      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : audioBuffer.getChannelData(0); // mono fallback — duplicate left

      // chunk into 10s pieces
      const CHUNK_SAMPLES = 441000;
      const numChunks = Math.ceil(left.length / CHUNK_SAMPLES);
      const results: InferenceSession.OnnxValueMapType[] = [];
      console.log("input names ------>", session.inputNames, session.outputNames);

      // Todo: currently I am doing for only first 30 seconds as full is taking waaaayyyyyyy long
      // for (let i = 0; i < numChunks; i++) {
      for (let i = 0; i < 3; i++) {
        const start = i * CHUNK_SAMPLES;

        const leftChunk = new Float32Array(CHUNK_SAMPLES);
        const rightChunk = new Float32Array(CHUNK_SAMPLES);

        // copy — last chunk is zero-padded automatically since Float32Array initializes to 0
        leftChunk.set(left.subarray(start, start + CHUNK_SAMPLES));
        rightChunk.set(right.subarray(start, start + CHUNK_SAMPLES));

        const padSize = N_FFT / 2; // 2048
        const paddedLength = CHUNK_SAMPLES + padSize * 2; // 441000 + 4096
        const n_frames = Math.floor((paddedLength - N_FFT) / HOP_LENGTH) + 1;

        const mixData = new Float32Array(1 * 2 * CHUNK_SAMPLES);
        mixData.set(leftChunk, 0);
        mixData.set(rightChunk, CHUNK_SAMPLES);

        const specData = computeStereoSTFT(leftChunk, rightChunk, n_frames);

        const mixTensor = new Tensor("float32", mixData, [1, 2, CHUNK_SAMPLES]);
        const specTensor = new Tensor("float32", specData, [1, 2, 2048, n_frames, 2]);

        const result = await session.run({
          mix: mixTensor,
          spec: specTensor, // check the exact input name from the model
        });
        results.push(result);

        console.log("result num: ", i, "->>>>>", result["add_76"].dims, result["add_77"].dims);
      }
      console.log("results prepared");

      const stemsContainer = document.getElementById("stems");

      // after all chunks are processed
      // currently I am doing only for vocals
      // Todo: have to do for other 3 stems
      const allLeft = new Float32Array(numChunks * CHUNK_SAMPLES);
      const allRight = new Float32Array(numChunks * CHUNK_SAMPLES);

      results.forEach((result, i) => {
        const stems = extractStems(result);

        // STEMS.forEach((stemName) => {
        allLeft.set(stems.vocals.left, i * CHUNK_SAMPLES);
        allRight.set(stems.vocals.right, i * CHUNK_SAMPLES);

        // });
      });
      const buffer = stemToWav(allLeft, allRight);
      const stemEl = createAudioEl(buffer);
      stemEl.id = "vocals";
      stemsContainer?.appendChild(stemEl);
      // ###################### CODE END

      await session.release();

      console.timeEnd("onnx");
      const endTime = performance.now();
    },
  };
};
