import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, X } from "lucide-react";
import { ERROR_TAGS, getTagColor } from "@/constants/tradingTags";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MistakeTagSelectorProps {
  selectedMistakes: string[];
  onChange: (mistakes: string[]) => void;
  sessionMistakes?: Set<string>;
  onNewMistakeCreated?: (mistake: string) => void;
}

export function MistakeTagSelector({ 
  selectedMistakes, 
  onChange,
  sessionMistakes,
  onNewMistakeCreated 
}: MistakeTagSelectorProps) {
  const { user } = useAuth();
  const [newMistake, setNewMistake] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Fetch user's previous custom mistakes
  const { data: userMistakes } = useQuery({
    queryKey: ['user-mistakes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trades')
        .select('error_tags')
        .eq('user_id', user?.id)
        .not('error_tags', 'is', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Flatten all error_tags arrays and get unique values
      const allMistakes = data?.flatMap(t => t.error_tags || []) || [];
      const uniqueMistakes = [...new Set(allMistakes)].filter(Boolean) as string[];
      
      // Filter out predefined ERROR_TAGS to only show custom ones
      const predefinedTags = ERROR_TAGS as readonly string[];
      return uniqueMistakes.filter(m => !predefinedTags.includes(m));
    },
    enabled: !!user?.id,
  });

  // Merge predefined + database custom + session custom mistakes
  const allMistakes = [
    ...ERROR_TAGS,
    ...(userMistakes || []),
    ...(sessionMistakes ? Array.from(sessionMistakes) : [])
  ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates

  const handleAddMistake = () => {
    const trimmed = newMistake.trim();
    if (trimmed && !allMistakes.includes(trimmed)) {
      onChange([...selectedMistakes, trimmed]);
      onNewMistakeCreated?.(trimmed);
      setNewMistake("");
    }
  };

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
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Select
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-[#1A1F28] border-[#2A3038]" align="end">
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-[#A6B1BB] mb-2 block">Add Custom Mistake</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Entered Too Late..."
                    value={newMistake}
                    onChange={(e) => setNewMistake(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMistake()}
                    className="bg-[#12161C] border-[#2A3038] text-[#EAEFF4] text-sm h-9"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-[#A6B1BB] mb-2 block">Select Mistakes</Label>
                <ScrollArea className="h-[200px] rounded border border-[#2A3038] p-2">
                  <div className="flex flex-wrap gap-1.5">
                    {allMistakes.map((mistake) => (
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

              <Button 
                onClick={() => setIsOpen(false)} 
                variant="outline" 
                className="w-full"
              >
                Done
              </Button>
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
