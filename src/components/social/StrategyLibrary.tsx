import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SharedStrategy } from "@/types/social";
import { StrategyCard } from "./StrategyCard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { StrategyEditor } from "./StrategyEditor";

export const StrategyLibrary = () => {
  const [strategies, setStrategies] = useState<SharedStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("shared_strategies")
        .select("*")
        .eq("visibility", "public")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user profiles
      const userIds = data?.map(s => s.user_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      const strategiesWithProfiles = data?.map(strategy => ({
        ...strategy,
        profile: profiles?.find(p => p.id === strategy.user_id) as any
      })) || [];

      setStrategies(strategiesWithProfiles as SharedStrategy[]);
    } catch (error: any) {
      toast.error("Failed to load strategies");
    } finally {
      setLoading(false);
    }
  };

  const filteredStrategies = strategies.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.setup_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search strategies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setShowEditor(true)} className="gap-2 w-full md:w-auto">
            <Plus className="h-4 w-4" />
            Create Strategy
          </Button>
        </div>
      </Card>

      {showEditor && (
        <StrategyEditor
          onClose={() => setShowEditor(false)}
          onSave={() => {
            setShowEditor(false);
            fetchStrategies();
          }}
        />
      )}

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredStrategies.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {searchTerm ? "No strategies found matching your search" : "No strategies shared yet"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStrategies.map((strategy) => (
            <StrategyCard key={strategy.id} strategy={strategy} onUpdate={fetchStrategies} />
          ))}
        </div>
      )}
    </div>
  );
};
