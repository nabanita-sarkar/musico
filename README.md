# Musico

_A music player concept for audio analysation on the web with Web Audio API_

<img src="./public/project.png" alt="project">

## Objective

The goal of this project to test the limits of current browser abilities in terms of audio analysation. The audio part so far has been completely built from scratch with just the Web Audio API. The visualisation is built on Canvas API. So it has been tested on Blink based browsers (Edge, Chrome etc.) and Safari. Firefox testing yet to do.

### Features so far

- [x] Full time-domain & real-time frequency-domain visualisation
- [x] Music player with play next/prev, skip forward/backward, shuffle, repeat features
- [x] Build equaliser

### In-Progress [`dev` branch]

- Trying onnx runtime with demucs v4 with hybrid transformer. My current code works but the pre-processed model I [found](https://github.com/gianlourbano/demucs-onnx/blob/main/public/htdemucs_optimized.onnx), is not giving good result. Probably issue with the training itself or during model export. Will have to think of something.
- Parallelly found [HS-TasNet](https://arxiv.org/abs/2402.17701) [model](https://github.com/lucidrains/HS-TasNet) made for realtime music separation. But so far couldn't find any onnx export for this. However a brief look into the code is telling me that HS-Tasnet also uses stft and istft inside the model, which has to be taken outside for in-browser processing.
- It would be nice to feed the separated stems into some AMT(Automatic Music Transcription) model like MT3 or Basic Pitch. But these models might be overkill considering we are separating stems before anyway, and these models are made for full music. And eventually processing the midi output with LilyPond

### Few Possibilities

- [ ] Allow visualisation from user files and/or provided direct file links
- [ ] Basic trim, cut, move features
- [ ] Multi-track editing support
- [ ] Drum pad
- [ ] Lo-fi mix tape
- [ ] Experiment with applying filters on streamed audio

### Chores

- Better code organisation
- A11y check and fixes
- Find and fix unnecessary re-rendering

## Built with

- Web Music API
- React
- Vite
- Tailwind CSS
- Framer Motion
