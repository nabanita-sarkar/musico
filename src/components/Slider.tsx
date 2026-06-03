import * as RadixSlider from "@radix-ui/react-slider";

export default function Slider({
  min,
  max,
  value,
  onChange,
  onMouseUp,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  onMouseUp: (val: number) => void;
}) {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <RadixSlider.Root
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
        className="relative flex items-center h-5 w-full select-none touch-none"
      >
        <RadixSlider.Track className="relative bg-slate-200 w-full flex-grow-1 rounded-md h-1">
          <RadixSlider.Range className="absolute bg-slate-400 rounded-md h-full" />
        </RadixSlider.Track>
        <RadixSlider.Thumb className="block w-5 h-5 bg-white border-2 border-slate-300 shadow-sm rounded-xl focus:ring-2 focus:ring-slate-400/40 focus:outline-none" />
      </RadixSlider.Root>
    </form>
  );
}
