import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, X } from "lucide-react";
import { EMOTION_TAGS, getTagColor } from "@/constants/tradingTags";

interface EmotionTagSelectorProps {
  selectedEmotions: string[];
  onChange: (emotions: string[]) => void;
}

export function EmotionTagSelector({ selectedEmotions, onChange }: EmotionTagSelectorProps) {
  const toggleEmotion = (emotion: string) => {
    if (selectedEmotions.includes(emotion)) {
      onChange(selectedEmotions.filter(e => e !== emotion));
    } else {
      onChange([...selectedEmotions, emotion]);
    }
  };

  const removeEmotion = (emotion: string) => {
    onChange(selectedEmotions.filter(e => e !== emotion));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-[#A6B1BB]">Emotions</Label>
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              <Heart className="h-3 w-3" />
              Select
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-[#1A1F28] border-[#2A3038]" align="end">
            <div className="space-y-3">
              <Label className="text-xs text-[#A6B1BB]">Emotional State During Trade</Label>
              <ScrollArea className="h-[200px] rounded border border-[#2A3038] p-2">
                <div className="flex flex-wrap gap-1.5">
                  {EMOTION_TAGS.map((emotion) => (
                    <Badge
                      key={emotion}
                      variant={selectedEmotions.includes(emotion) ? "default" : "outline"}
                      className={`cursor-pointer text-xs ${getTagColor(emotion, 'emotion')}`}
                      onClick={() => toggleEmotion(emotion)}
                    >
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected Emotions Display */}
      {selectedEmotions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedEmotions.map((emotion) => (
            <Badge
              key={emotion}
              className={`text-xs ${getTagColor(emotion, 'emotion')}`}
            >
              {emotion}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => removeEmotion(emotion)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
