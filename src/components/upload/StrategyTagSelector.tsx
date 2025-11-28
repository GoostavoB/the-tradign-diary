import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tag, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StrategyTagSelectorProps {
  selectedStrategies: string[];
  onChange: (strategies: string[]) => void;
  sessionStrategies?: Set<string>;
  onNewStrategyCreated?: (strategy: string) => void;
}

export function StrategyTagSelector({ 
  selectedStrategies, 
  onChange, 
  sessionStrategies,
  onNewStrategyCreated 
}: StrategyTagSelectorProps) {
  const { user } = useAuth();
  const [newStrategy, setNewStrategy] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Fetch user's previous strategies
  const { data: userStrategies } = useQuery({
    queryKey: ['user-strategies', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trades')
        .select('setup')
        .eq('user_id', user?.id)
        .not('setup', 'is', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      const uniqueStrategies = [...new Set(data?.map(t => t.setup).filter(Boolean))] as string[];
      return uniqueStrategies;
    },
    enabled: !!user?.id,
  });

  // Merge database strategies with session strategies
  const allStrategies = [
    ...(userStrategies || []),
    ...(sessionStrategies ? Array.from(sessionStrategies) : [])
  ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates

  const handleAddStrategy = () => {
    const trimmed = newStrategy.trim();
    if (trimmed) {
      onChange([trimmed]);
      onNewStrategyCreated?.(trimmed);
      setNewStrategy("");
      setIsOpen(false);
    }
  };

  const selectStrategy = (strategy: string) => {
    onChange([strategy]);
    setIsOpen(false);
  };

  const removeStrategy = () => {
    onChange([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-[#A6B1BB]">Strategy</Label>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Select
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-[#1A1F28] border-[#2A3038]" align="end">
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-[#A6B1BB] mb-2 block">Add New Strategy</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Breakout, Scalping..."
                    value={newStrategy}
                    onChange={(e) => setNewStrategy(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddStrategy()}
                    className="bg-[#12161C] border-[#2A3038] text-[#EAEFF4] text-sm h-9"
                  />
                </div>
              </div>

              {allStrategies && allStrategies.length > 0 && (
                <div>
                  <Label className="text-xs text-[#A6B1BB] mb-2 block">Previous Strategies (Select One)</Label>
                  <ScrollArea className="h-[120px] rounded border border-[#2A3038] p-2">
                    <div className="flex flex-wrap gap-1.5">
                      {allStrategies.map((strategy) => (
                        <Badge
                          key={strategy}
                          variant={selectedStrategies.includes(strategy) ? "default" : "outline"}
                          className="cursor-pointer bg-primary/10 hover:bg-primary/20 border-primary/30 text-xs"
                          onClick={() => selectStrategy(strategy)}
                        >
                          {strategy}
                        </Badge>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <Button 
                onClick={() => setIsOpen(false)} 
                variant="outline" 
                className="w-full mt-2"
              >
                Done
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected Strategy Display */}
      {selectedStrategies.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 text-xs">
            {selectedStrategies[0]}
            <X
              className="h-3 w-3 ml-1 cursor-pointer"
              onClick={removeStrategy}
            />
          </Badge>
        </div>
      )}
    </div>
  );
}
