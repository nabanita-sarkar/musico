# Musico

_A music player concept for audio analysation on the web_

<img src="./public/project.png" alt="project">

## Objective

The goal of this project to test the limits of current browser abilities in terms of audio analysation. The audio part so far has been completely built from scratch with just the Web Audio API. The visualisation is built on Canvas API. So it has been tested on Blink based browsers (Edge, Chrome etc.) and Safari. Firefox testing yet to do.

### Features so far

- [x] Full time-domain & real-time frequency-domain visualisation
- [x] Music player with play next/prev, skip forward/backward, shuffle, repeat features
- [x] Build equaliser

### Few Possibilities

- [ ] Allow visualisation from user files and/or provided direct file links
- [ ] Drum pad
- [ ] Lo-fi mix tape
- [ ] Experiment with applying filters on streamed audio
- [-] **In Progress** in `dev` branch, trying onnx runtime with demucs v4 with hybrid transformer. My current code works but the pre-processed model I [found](https://github.com/gianlourbano/demucs-onnx/blob/main/public/htdemucs_optimized.onnx), is not giving good result. Probably issue with the training itself or during model export. Will have to think of something

## Built with

- Web Music API
- React
- Vite
- Tailwind CSS
- Framer Motion
