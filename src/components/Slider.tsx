import * as RadixSlider from "@radix-ui/react-slider";

export default function Slider({
  min,
  max,
  value,
  onChange,
  onMouseUp,
  onMouseDown,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  onMouseUp: () => void;
  onMouseDown: () => void;
}) {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <RadixSlider.Root
        min={min}
        max={max}
        value={[value]}
        onValueChange={([val]) => onChange(val)}
        className="relative flex items-center h-5"
        style={{ width: 264 }}
      >
        <RadixSlider.Track className="relative bg-slate-200 w-full flex-grow-1 rounded-md h-1">
          <RadixSlider.Range className="absolute bg-slate-400 rounded-md h-full" />
        </RadixSlider.Track>
        <RadixSlider.Thumb asChild>
          <button
            onPointerUp={() => onMouseUp()}
            onPointerDown={() => onMouseDown()}
            className="block w-5 h-5 bg-white border-2 border-slate-300 shadow-sm rounded-xl focus:ring-2 focus:ring-slate-400/40 focus:outline-none"
          />
        </RadixSlider.Thumb>
      </RadixSlider.Root>
    </form>
  );
}
