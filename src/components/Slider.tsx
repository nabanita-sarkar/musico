import * as RadixSlider from "@radix-ui/react-slider";

export default function Slider({
  min,
  max,
  value,
  orientation = "horizontal",
  onChange,
  onMouseUp,
}: {
  min: number;
  max: number;
  value: number;
  orientation?: RadixSlider.SliderProps["orientation"];
  onChange: (val: number) => void;
  onMouseUp: (val: number) => void;
}) {
  return (
    <RadixSlider.Root
      orientation={orientation}
      min={min}
      max={max}
      step={1}
      value={[value]}
      onValueChange={([val]) => {
        onChange(val);
      }}
      onValueCommit={([val]) => {
        onMouseUp(val);
      }}
      className="relative flex data-[orientation=vertical]:flex-col data-[orientation=vertical]:w-5 data-[orientation=vertical]:h-full items-center h-5 w-full select-none touch-none"
    >
      <RadixSlider.Track className="relative data-[orientation=vertical]:w-1 data-[orientation=vertical]:h-full bg-slate-200 data-[orientation=horizontal]:w-full flex-grow-1 rounded-md data-[orientation=horizontal]:h-1">
        <RadixSlider.Range className="absolute bg-slate-400 rounded-md data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full" />
      </RadixSlider.Track>
      <RadixSlider.Thumb className="block w-5 h-5 bg-white border-2 border-slate-300 shadow-sm rounded-xl focus:ring-2 focus:ring-slate-400/40 focus:outline-none" />
    </RadixSlider.Root>
  );
}
