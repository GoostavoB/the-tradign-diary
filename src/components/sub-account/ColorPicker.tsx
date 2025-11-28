import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const COLORS = [
  { name: 'Blue', value: 'hsl(221, 83%, 53%)' },
  { name: 'Green', value: 'hsl(142, 76%, 36%)' },
  { name: 'Red', value: 'hsl(0, 84%, 60%)' },
  { name: 'Purple', value: 'hsl(271, 81%, 56%)' },
  { name: 'Orange', value: 'hsl(25, 95%, 53%)' },
  { name: 'Pink', value: 'hsl(330, 81%, 60%)' },
  { name: 'Yellow', value: 'hsl(48, 96%, 53%)' },
  { name: 'Cyan', value: 'hsl(189, 85%, 46%)' },
  { name: 'Indigo', value: 'hsl(239, 84%, 67%)' },
  { name: 'Teal', value: 'hsl(173, 80%, 40%)' },
  { name: 'Lime', value: 'hsl(84, 81%, 44%)' },
  { name: 'Amber', value: 'hsl(38, 92%, 50%)' },
];

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export const ColorPicker = ({ selectedColor, onSelectColor }: ColorPickerProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Color</label>
      <div className="grid grid-cols-6 gap-2">
        {COLORS.map(({ name, value }) => (
          <button
            key={name}
            type="button"
            onClick={() => onSelectColor(value)}
            className={cn(
              "w-10 h-10 rounded-md border-2 transition-all hover:scale-110 flex items-center justify-center",
              selectedColor === value
                ? "border-foreground ring-2 ring-offset-2 ring-foreground/20"
                : "border-transparent hover:border-foreground/30"
            )}
            style={{ backgroundColor: value }}
            title={name}
          >
            {selectedColor === value && (
              <Check className="w-5 h-5 text-white drop-shadow-md" strokeWidth={3} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
