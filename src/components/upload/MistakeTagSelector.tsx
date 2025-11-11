import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, X } from "lucide-react";
import { ERROR_TAGS, getTagColor } from "@/constants/tradingTags";

interface MistakeTagSelectorProps {
  selectedMistakes: string[];
  onChange: (mistakes: string[]) => void;
}

export function MistakeTagSelector({ selectedMistakes, onChange }: MistakeTagSelectorProps) {
  const toggleMistake = (mistake: string) => {
    if (selectedMistakes.includes(mistake)) {
      onChange(selectedMistakes.filter(m => m !== mistake));
    } else {
      onChange([...selectedMistakes, mistake]);
    }
  };

  const removeMistake = (mistake: string) => {
    onChange(selectedMistakes.filter(m => m !== mistake));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-[#A6B1BB]">Mistakes</Label>
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Select
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-[#1A1F28] border-[#2A3038]" align="end">
            <div className="space-y-3">
              <Label className="text-xs text-[#A6B1BB]">Common Trading Mistakes</Label>
              <ScrollArea className="h-[200px] rounded border border-[#2A3038] p-2">
                <div className="flex flex-wrap gap-1.5">
                  {ERROR_TAGS.map((mistake) => (
                    <Badge
                      key={mistake}
                      variant={selectedMistakes.includes(mistake) ? "default" : "outline"}
                      className={`cursor-pointer text-xs ${getTagColor(mistake, 'error')}`}
                      onClick={() => toggleMistake(mistake)}
                    >
                      {mistake}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected Mistakes Display */}
      {selectedMistakes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedMistakes.map((mistake) => (
            <Badge
              key={mistake}
              className={`text-xs ${getTagColor(mistake, 'error')}`}
            >
              {mistake}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => removeMistake(mistake)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
