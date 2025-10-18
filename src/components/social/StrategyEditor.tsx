import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StrategyEditorProps {
  onClose: () => void;
  onSave: () => void;
}

export const StrategyEditor = ({ onClose, onSave }: StrategyEditorProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [setupType, setSetupType] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [entryRules, setEntryRules] = useState<string[]>([""]);
  const [exitRules, setExitRules] = useState<string[]>([""]);
  const [riskRules, setRiskRules] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);

  const addRule = (type: "entry" | "exit" | "risk") => {
    if (type === "entry") setEntryRules([...entryRules, ""]);
    if (type === "exit") setExitRules([...exitRules, ""]);
    if (type === "risk") setRiskRules([...riskRules, ""]);
  };

  const removeRule = (type: "entry" | "exit" | "risk", index: number) => {
    if (type === "entry") setEntryRules(entryRules.filter((_, i) => i !== index));
    if (type === "exit") setExitRules(exitRules.filter((_, i) => i !== index));
    if (type === "risk") setRiskRules(riskRules.filter((_, i) => i !== index));
  };

  const updateRule = (type: "entry" | "exit" | "risk", index: number, value: string) => {
    if (type === "entry") {
      const updated = [...entryRules];
      updated[index] = value;
      setEntryRules(updated);
    }
    if (type === "exit") {
      const updated = [...exitRules];
      updated[index] = value;
      setExitRules(updated);
    }
    if (type === "risk") {
      const updated = [...riskRules];
      updated[index] = value;
      setRiskRules(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("shared_strategies").insert({
        user_id: user.id,
        title,
        description,
        setup_type: setupType || null,
        visibility,
        rules: {
          entry: entryRules.filter(r => r.trim()),
          exit: exitRules.filter(r => r.trim()),
          risk_management: riskRules.filter(r => r.trim())
        }
      });

      if (error) throw error;

      toast.success("Strategy created!");
      onSave();
    } catch (error: any) {
      toast.error(error.message || "Failed to create strategy");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Create New Strategy</h3>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Strategy Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Breakout Scalping Strategy"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your strategy..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="setup">Setup Type</Label>
              <Input
                id="setup"
                value={setupType}
                onChange={(e) => setSetupType(e.target.value)}
                placeholder="e.g., Breakout, Reversal"
              />
            </div>
            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <Select value={visibility} onValueChange={(v: any) => setVisibility(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Entry Rules</Label>
              <Button type="button" size="sm" variant="outline" onClick={() => addRule("entry")}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {entryRules.map((rule, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <Input
                  value={rule}
                  onChange={(e) => updateRule("entry", idx, e.target.value)}
                  placeholder="Enter a rule..."
                />
                {entryRules.length > 1 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeRule("entry", idx)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Exit Rules</Label>
              <Button type="button" size="sm" variant="outline" onClick={() => addRule("exit")}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {exitRules.map((rule, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <Input
                  value={rule}
                  onChange={(e) => updateRule("exit", idx, e.target.value)}
                  placeholder="Enter a rule..."
                />
                {exitRules.length > 1 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeRule("exit", idx)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Risk Management Rules</Label>
              <Button type="button" size="sm" variant="outline" onClick={() => addRule("risk")}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {riskRules.map((rule, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <Input
                  value={rule}
                  onChange={(e) => updateRule("risk", idx, e.target.value)}
                  placeholder="Enter a rule..."
                />
                {riskRules.length > 1 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeRule("risk", idx)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting || !title.trim()}>
            Create Strategy
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};
