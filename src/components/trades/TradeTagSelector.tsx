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

interface TradeTagSelectorProps {
  emotionTags: string[];
  errorTags: string[];
  onEmotionTagsChange: (tags: string[]) => void;
  onErrorTagsChange: (tags: string[]) => void;
}

export function TradeTagSelector({
  emotionTags,
  errorTags,
  onEmotionTagsChange,
  onErrorTagsChange,
}: TradeTagSelectorProps) {
  const { user } = useAuth();
  const [newTag, setNewTag] = useState("");
  const [activeTab, setActiveTab] = useState<"emotions" | "errors">("emotions");

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

  const customEmotionTags = customTags?.filter(t => t.tag_type === 'emotion').map(t => t.tag_name) || [];
  const customErrorTags = customTags?.filter(t => t.tag_type === 'error').map(t => t.tag_name) || [];

  const allEmotionTags = [...EMOTION_TAGS, ...customEmotionTags];
  const allErrorTags = [...ERROR_TAGS, ...customErrorTags];

  const handleAddCustomTag = async () => {
    if (!newTag.trim()) return;

    try {
      const { error } = await supabase
        .from('custom_tags')
        .insert({
          user_id: user?.id,
          tag_name: newTag.trim(),
          tag_type: activeTab === 'emotions' ? 'emotion' : 'error',
        });

      if (error) throw error;

      // Add to current selection
      if (activeTab === 'emotions') {
        onEmotionTagsChange([...emotionTags, newTag.trim()]);
      } else {
        onErrorTagsChange([...errorTags, newTag.trim()]);
      }

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

  const toggleTag = (tag: string, type: 'emotion' | 'error') => {
    if (type === 'emotion') {
      if (emotionTags.includes(tag)) {
        onEmotionTagsChange(emotionTags.filter(t => t !== tag));
      } else {
        onEmotionTagsChange([...emotionTags, tag]);
      }
    } else {
      if (errorTags.includes(tag)) {
        onErrorTagsChange(errorTags.filter(t => t !== tag));
      } else {
        onErrorTagsChange([...errorTags, tag]);
      }
    }
  };

  const removeTag = (tag: string, type: 'emotion' | 'error') => {
    if (type === 'emotion') {
      onEmotionTagsChange(emotionTags.filter(t => t !== tag));
    } else {
      onErrorTagsChange(errorTags.filter(t => t !== tag));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Tags</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Tag className="h-4 w-4 mr-2" />
              Add Tags
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="emotions">Emotions</TabsTrigger>
                <TabsTrigger value="errors">Errors</TabsTrigger>
              </TabsList>

              <TabsContent value="emotions" className="space-y-3">
                <ScrollArea className="h-[200px] rounded border p-2">
                  <div className="flex flex-wrap gap-2">
                    {allEmotionTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={emotionTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer ${getTagColor(tag, 'emotion')}`}
                        onClick={() => toggleTag(tag, 'emotion')}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    placeholder="Custom emotion..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag()}
                  />
                  <Button size="sm" onClick={handleAddCustomTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="errors" className="space-y-3">
                <ScrollArea className="h-[200px] rounded border p-2">
                  <div className="flex flex-wrap gap-2">
                    {allErrorTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={errorTags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer ${getTagColor(tag, 'error')}`}
                        onClick={() => toggleTag(tag, 'error')}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    placeholder="Custom error..."
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

      {/* Selected Tags Display */}
      <div className="space-y-2">
        {emotionTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {emotionTags.map((tag) => (
              <Badge
                key={tag}
                className={getTagColor(tag, 'emotion')}
              >
                {tag}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => removeTag(tag, 'emotion')}
                />
              </Badge>
            ))}
          </div>
        )}
        {errorTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {errorTags.map((tag) => (
              <Badge
                key={tag}
                className={getTagColor(tag, 'error')}
              >
                {tag}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => removeTag(tag, 'error')}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
