import { scaleLinear, scaleLog } from "d3-scale";
import { select } from "d3-selection";
import { area, curveMonotoneX, line } from "d3-shape";
import { useEffect, useMemo, useRef, useState } from "react";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "../utils/constants";

export default function FreqVis() {
  return <ChartWithDimensions />;
}

const chartSettings: T_Dimentions = {
  height: 150,
  width: 600,
  marginLeft: 30,
  marginBottom: 25,
  marginRight: 10,
  marginTop: 10,
};
const ChartWithDimensions = () => {
  const [ref, dms] = useChartDimensions(chartSettings);
  const xScale = useMemo(() => scaleLog().domain([20, 22050]).range([0, dms.boundedWidth]), [dms.boundedWidth]);
  const yScale = useMemo(() => scaleLinear().domain([-100, 0]).range([0, dms.boundedHeight]), [dms.boundedHeight]);

  return (
    <div id="freq_viz" ref={ref} style={{}}>
      <svg width={dms.width} height={dms.height}>
        <g transform={`translate(${[dms.marginLeft, dms.marginTop].join(",")})`}>
          <rect width={dms.boundedWidth} height={dms.boundedHeight} className="fill-emerald-950" />
          <Axis
            domain={xScale.domain()}
            range={xScale.range()}
            yDomain={yScale.domain()}
            yRange={yScale.range()}
            boundedHeight={dms.boundedHeight}
          />
        </g>
        <g id="main_chart" transform={`translate(${[dms.marginLeft, dms.marginTop].join(",")})`}></g>
      </svg>
    </div>
  );
};

const Axis = ({
  domain = [0, 100],
  range = [10, 290],
  yDomain = [0, -100],
  yRange = [10, 100],
  boundedHeight = 100,
}) => {
  const xTicks = useMemo(() => {
    const xScale = scaleLog().domain(domain).range(range);

    const width = range[1] - range[0];
    const pixelsPerTick = 120;
    const numberOfTicksTarget = Math.max(1, Math.floor(width / pixelsPerTick));

    return xScale.ticks(numberOfTicksTarget).map((value) => ({
      value,
      xOffset: xScale(value),
    }));
  }, [domain.join("-"), range.join("-")]);

  const yTicks = useMemo(() => {
    const yScale = scaleLinear().domain(yDomain).range(yRange);

    const width = yRange[1] - yRange[0];
    const pixelsPerTick = 20;
    const numberOfTicksTarget = Math.max(1, Math.floor(width / pixelsPerTick));

    return yScale.ticks(numberOfTicksTarget).map((value) => ({
      value,
      xOffset: yScale(value),
    }));
  }, [yDomain.join("-"), yRange.join("-")]);

  return (
    <>
      <g>
        {xTicks.map(({ value, xOffset }) => (
          <g key={value} transform={`translate(${xOffset}, 0)`}>
            <line
              y2={chartSettings.height - chartSettings.marginTop - chartSettings.marginBottom}
              className="stroke-emerald-900"
            />
          </g>
        ))}
        {yTicks.map(({ value, xOffset: yOffset }) => (
          <g key={value} transform={`translate(0, ${yOffset})`}>
            <line
              x2={chartSettings.width - chartSettings.marginLeft - chartSettings.marginRight}
              className="stroke-emerald-900"
            />
          </g>
        ))}
      </g>
      <g transform={`translate(${[0, boundedHeight].join(",")})`} className="text-slate-400">
        <path d={["M", range[0], 6, "v", -6, "H", range[1], "v", 6].join(" ")} fill="none" stroke="currentColor" />
        {xTicks.map(({ value, xOffset }) => {
          const firstDigit = Number(value.toString()[0]);
          const first2Digit = firstDigit === 1 ? Number(value.toString().substring(0, 2)) : firstDigit;

          return (
            <g key={value} transform={`translate(${xOffset}, 0)`}>
              <line y2="6" stroke="currentColor" />
              {firstDigit === 2 || firstDigit === 5 || first2Digit === 10 ? (
                <text
                  key={value}
                  style={{
                    fontSize: "10px",
                    textAnchor: "middle",
                    transform: "translateY(20px)",
                  }}
                >
                  {value >= 1000 ? `${Math.floor(value / 1000)}k` : value}
                </text>
              ) : null}
            </g>
          );
        })}
      </g>

      <g className="text-slate-400">
        <path d={[`M 0 0 L 0 ${yRange[1]}`].join(" ")} fill="none" stroke="currentColor" />
        {yTicks.map(({ value, xOffset: yOffset }) => (
          <g key={value} transform={`translate(0, ${yOffset})`}>
            <line x2="-6" stroke="currentColor" />
            <text
              key={value}
              style={{
                fontSize: "10px",
                textAnchor: "end",
                transform: "translate(-10px, 3px)",
              }}
            >
              {value}
            </text>
          </g>
        ))}
      </g>
    </>
  );
};

interface SpectrumConfig {
  container: HTMLElement;
  analyser: AnalyserNode;
  sampleRate?: number;
  minFreq?: number;
  maxFreq?: number;
  minDb?: number;
  maxDb?: number;
  smoothing?: number;
}

export function createFrequencySpectrum({
  container,
  analyser,
  sampleRate = 44100,
  minFreq = 20,
  maxFreq = 22050,
  minDb = -100,
  maxDb = -10,
  smoothing = 0.82,
}: SpectrumConfig) {
  const W = container.clientWidth || DISPLAY_WIDTH;
  const H = container.clientHeight || DISPLAY_HEIGHT;
  const iW = W - chartSettings.marginLeft - chartSettings.marginRight;
  const iH = H - chartSettings.marginTop - chartSettings.marginBottom;

  const bufLen = analyser.frequencyBinCount;
  const floatData = new Float32Array(bufLen);
  const smoothed = new Float32Array(bufLen).fill(minDb);

  function freqBinToHz(i: number) {
    return (i / bufLen) * (sampleRate / 2);
  }

  const xScale = scaleLog().domain([minFreq, maxFreq]).range([0, iW]).clamp(true);
  const yScale = scaleLinear().domain([analyser.minDecibels, analyser.maxDecibels]).range([iH, 0]).clamp(true);

  // const svg = select(container.children[0]);

  const g = select(document.getElementById("main_chart"));
  g.selectAll("*").remove();
  // const isDark = matchMedia("(prefers-color-scheme: dark)").matches;
  // const textColor = isDark ? "#b4b2a9" : "#5f5e5a";
  // const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const lineColor = "#34d399";
  // const fillTop = isDark ? "rgba(127,119,221,0.35)" : "rgba(127,119,221,0.18)";
  // const fillBot = "rgba(127,119,221,0)";

  // const defs = svg.append("defs");
  // const grad = defs
  //   .append("linearGradient")
  //   .attr("id", "specGrad")
  //   .attr("gradientUnits", "userSpaceOnUse")
  //   .attr("x1", 0)
  //   .attr("y1", chartSettings.marginTop)
  //   .attr("x2", 0)
  //   .attr("y2", H - chartSettings.marginBottom);
  // grad.append("stop").attr("offset", "0%").attr("stop-color", fillTop);
  // grad.append("stop").attr("offset", "100%").attr("stop-color", fillBot);

  // defs.append("clipPath").attr("id", "specClip").append("rect").attr("width", iW).attr("height", iH);

  // const areaPath = g.append("path").attr("clip-path", "url(#specClip)").attr("fill", "url(#specGrad)");

  const linePath = g
    .append("path")
    // .attr("clip-path", "url(#specClip)")
    .attr("fill", "none")
    .attr("stroke", lineColor)
    .attr("stroke-width", 2)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round");

  type Pt = { x: number; y: number };
  const lineGen = line<Pt>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(curveMonotoneX);
  // const areaGen = area<Pt>()
  //   .x((d) => d.x)
  //   .y0(iH)
  //   .y1((d) => d.y)
  //   .curve(curveMonotoneX);

  let raf: number | null = null;

  function draw() {
    // console.log("here");
    analyser.getFloatFrequencyData(floatData);

    const pts: Pt[] = [];
    for (let i = 1; i < bufLen; i++) {
      const hz = freqBinToHz(i);
      if (hz < minFreq || hz > maxFreq) continue;
      // smoothed[i] = smoothing * smoothed[i] + (1 - smoothing) * byteToDb(floatData[i]);
      pts.push({ x: xScale(hz), y: yScale(floatData[i]) });
    }

    linePath.attr("d", lineGen(pts));
    // areaPath.attr("d", areaGen(pts));

    raf = requestAnimationFrame(draw);
  }

  function start() {
    // console.log("yo", raf);

    if (raf !== null) return;

    draw();
  }

  function stop() {
    if (raf !== null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  return { start, stop };
}

const useChartDimensions = (passedSettings: T_Dimentions) => {
  const ref = useRef<HTMLDivElement>(null);
  const dimensions = combineChartDimensions(passedSettings);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (dimensions.width && dimensions.height) return;
    // [ref, dimensions];
    const element = ref.current;
    let resizeObserver: ResizeObserver | null = null;
    if (element) {
      resizeObserver = new ResizeObserver((entries) => {
        if (!Array.isArray(entries)) return;
        if (!entries.length) return;
        const entry = entries[0];
        if (width != entry.contentRect.width) setWidth(entry.contentRect.width);
        if (height != entry.contentRect.height) setHeight(entry.contentRect.height);
      });
      resizeObserver.observe(element);
    }
    return () => {
      if (resizeObserver && element) {
        resizeObserver.unobserve(element);
      }
    };
  }, []);

  const newSettings = combineChartDimensions({
    ...dimensions,
    width: dimensions.width || width,
    height: dimensions.height || height,
  });
  return [ref, newSettings] as const;
};
type T_Dimentions = {
  height: number;
  width: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
};
const combineChartDimensions = (dimensions: T_Dimentions) => {
  const parsedDimensions = {
    ...dimensions,
    marginTop: dimensions.marginTop || 10,
    marginRight: dimensions.marginRight || 10,
    marginBottom: dimensions.marginBottom || 40,
    marginLeft: dimensions.marginLeft || 75,
  };
  return {
    ...parsedDimensions,
    boundedHeight: Math.max(parsedDimensions.height - parsedDimensions.marginTop - parsedDimensions.marginBottom, 0),
    boundedWidth: Math.max(parsedDimensions.width - parsedDimensions.marginLeft - parsedDimensions.marginRight, 0),
  };
};
