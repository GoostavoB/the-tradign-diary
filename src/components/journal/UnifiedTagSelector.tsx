import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Plus, Tag } from "lucide-react";
import { EMOTION_TAGS, ERROR_TAGS, getTagColor } from "@/constants/tradingTags";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface UnifiedTagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function UnifiedTagSelector({
  selectedTags,
  onTagsChange,
}: UnifiedTagSelectorProps) {
  const { user } = useAuth();
  const [newTag, setNewTag] = useState("");
  const [activeTab, setActiveTab] = useState<"setups" | "emotions" | "errors" | "custom">("setups");

  // Fetch user setups from trades table (unique setups used)
  const { data: userSetups } = useQuery({
    queryKey: ['user-setups', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trades')
        .select('setup')
        .eq('user_id', user?.id)
        .not('setup', 'is', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      // Get unique setups
      const uniqueSetups = [...new Set(data?.map(t => t.setup).filter(Boolean))] as string[];
      return uniqueSetups;
    },
    enabled: !!user?.id,
  });

  // Fetch custom tags
  const { data: customTags, refetch } = useQuery({
    queryKey: ['custom-tags', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_tags')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const customUserTags = customTags?.filter(t => t.tag_type === 'custom').map(t => t.tag_name) || [];
  const allSetups = userSetups || [];

  const handleAddCustomTag = async () => {
    if (!newTag.trim()) return;

    try {
      const { error } = await supabase
        .from('custom_tags')
        .insert({
          user_id: user?.id,
          tag_name: newTag.trim(),
          tag_type: 'custom',
        });

      if (error) throw error;

      // Add to current selection
      onTagsChange([...selectedTags, newTag.trim()]);

      setNewTag("");
      refetch();
      toast.success("Custom tag added");
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error("Tag already exists");
      } else {
        toast.error("Failed to add custom tag");
      }
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    onTagsChange(selectedTags.filter(t => t !== tag));
  };

  const getTagVariant = (tag: string): 'emotion' | 'error' | 'setup' | 'custom' => {
    if ((EMOTION_TAGS as readonly string[]).includes(tag)) return 'emotion';
    if ((ERROR_TAGS as readonly string[]).includes(tag)) return 'error';
    if ((allSetups || []).includes(tag)) return 'setup';
    return 'custom';
  };

  const getTagColorClass = (tag: string, variant: 'emotion' | 'error' | 'setup' | 'custom'): string => {
    if (variant === 'emotion' || variant === 'error') {
      return getTagColor(tag, variant);
    }
    if (variant === 'setup') {
      return 'bg-primary/10 hover:bg-primary/20 border-primary/30';
    }
    return 'bg-muted hover:bg-muted/80';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Tags (Setups, Emotions, Errors)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Tag className="h-4 w-4 mr-2" />
              Add Tags
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96" align="end">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="setups">Setups</TabsTrigger>
                <TabsTrigger value="emotions">Emotions</TabsTrigger>
                <TabsTrigger value="errors">Errors</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>

              <TabsContent value="setups" className="space-y-3">
                <ScrollArea className="h-[200px] rounded border border-border/50 p-3">
                  <div className="flex flex-wrap gap-2">
                    {allSetups.length > 0 ? (
                      allSetups.map((setup) => (
                        <Badge
                          key={setup}
                          variant={selectedTags.includes(setup) ? "default" : "outline"}
                          className="cursor-pointer bg-primary/10 hover:bg-primary/20 border-primary/30"
                          onClick={() => toggleTag(setup)}
                        >
                          {setup}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No setups yet. Create them when adding trades.</p>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="emotions" className="space-y-3">
                <ScrollArea className="h-[200px] rounded border border-border/50 p-3">
                  <div className="flex flex-wrap gap-2">
                    {EMOTION_TAGS.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer ${getTagColor(tag, 'emotion')}`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="errors" className="space-y-3">
                <ScrollArea className="h-[200px] rounded border border-border/50 p-3">
                  <div className="flex flex-wrap gap-2">
                    {ERROR_TAGS.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer ${getTagColor(tag, 'error')}`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="custom" className="space-y-3">
                <ScrollArea className="h-[150px] rounded border border-border/50 p-3">
                  <div className="flex flex-wrap gap-2">
                    {customUserTags.length > 0 ? (
                      customUserTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No custom tags yet.</p>
                    )}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    placeholder="Custom tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag()}
                  />
                  <Button size="sm" onClick={handleAddCustomTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>
      </div>

      {/* Selected Tags Display with Color Categories */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => {
            const variant = getTagVariant(tag);
            const colorClass = getTagColorClass(tag, variant);

            return (
              <Badge
                key={tag}
                className={colorClass}
              >
                {tag}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}