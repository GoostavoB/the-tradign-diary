import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

// Get today's date in local timezone as YYYY-MM-DD
const getTodayLocal = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(Date.now() - offset).toISOString().slice(0, 10);
};

// Normalize numeric input (handle "5,000" or "5.000" formats)
const normalizeNumericInput = (value: string): number => {
  if (!value) return 0;
  // Remove thousand separators (comma or period) and parse
  const normalized = value.replace(/[,\s]/g, '');
  const parsed = parseFloat(normalized);
  if (isNaN(parsed)) throw new Error('Invalid number');
  return parsed;
};

const formSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  goal_type: z.enum(['profit', 'win_rate', 'trades', 'streak', 'roi'], {
    required_error: 'Please select a goal type',
  }),
  target_value: z.string()
    .min(1, 'Target value is required')
    .refine((val) => {
      try {
        const num = normalizeNumericInput(val);
        return num > 0;
      } catch {
        return false;
      }
    }, 'Target value must be greater than 0'),
  target_date: z.string()
    .min(1, 'Target date is required')
  .refine((date) => {
    const selected = new Date(date + 'T00:00:00Z');
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return selected >= today;
  }, 'Target date must be today or in the future'),
});

interface CreateGoalDialogProps {
  onGoalCreated: () => void;
  editingGoal?: any;
  onClose?: () => void;
}

export function CreateGoalDialog({ onGoalCreated, editingGoal, onClose }: CreateGoalDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(!!editingGoal);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: editingGoal?.title || "",
      description: editingGoal?.description || "",
      goal_type: editingGoal?.goal_type || "profit",
      target_value: editingGoal?.target_value?.toString() || "",
      target_date: editingGoal?.deadline ? format(new Date(editingGoal.deadline), 'yyyy-MM-dd') : getTodayLocal(),
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSaving(true);

      // 1) Session guard - verify access token exists
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        toast.error('Session expired. Please sign in again.');
        setIsSaving(false);
        return;
      }

      // 2) User guard
      if (!user) {
        toast.error('You must be signed in to create a goal.');
        setIsSaving(false);
        return;
      }

      // 3) Normalize numeric input
      const normalizedValue = normalizeNumericInput(values.target_value);
      
      // 4) Convert date to end-of-day UTC for consistency with DB trigger
      const deadlineISO = `${values.target_date}T23:59:59.999Z`;

      console.info('[CreateGoal] Submitting goal:', { 
        title: values.title, 
        type: values.goal_type, 
        target: normalizedValue,
        deadline: deadlineISO,
        userId: user.id
      });

      // 5) Build payload with user_id
      const goalData = {
        title: values.title.trim(),
        description: values.description?.trim() || '',
        goal_type: values.goal_type,
        target_value: normalizedValue,
        deadline: deadlineISO,
        current_value: editingGoal?.current_value || 0,
        period: editingGoal?.period || 'monthly',
      };

      // 6) Execute insert/update with .select().single() for definitive result
      let result;
      if (editingGoal) {
        result = await supabase
          .from('trading_goals')
          .update(goalData)
          .eq('id', editingGoal.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('trading_goals')
          .insert([{ ...goalData, user_id: user.id }])
          .select()
          .single();
      }

      // 7) Handle errors with specific mapping
      if (result.error) {
        const msg = result.error.message || 'Failed to save goal.';
        const code = result.error.code || '';
        
        console.error('[CreateGoal] DB Error:', { code, msg, details: result.error });
        
        if (code === '42501' || msg.toLowerCase().includes('row-level security')) {
          toast.error('Permission denied. Please sign in again.');
        } else if (msg.includes('Target date cannot be in the past')) {
          toast.error('Target date must be today or later.');
        } else if (msg.includes('JWT') || msg.toLowerCase().includes('expired')) {
          toast.error('Session expired. Please sign in again.');
        } else {
          toast.error(editingGoal ? 'Failed to update goal' : 'Failed to create goal', {
            description: msg
          });
        }
        setIsSaving(false);
        return;
      }

      // 8) Success - refresh and close
      toast.success(editingGoal ? 'Goal updated!' : 'Goal created!');
      queryClient.invalidateQueries({ queryKey: ['trading-goals', user.id] });
      setOpen(false);
      form.reset();
      if (onGoalCreated) onGoalCreated();
      if (onClose) onClose();
      
    } catch (error: any) {
      console.error('[CreateGoal] Unexpected error:', error);
      const msg = error?.message || 'An unexpected error occurred.';
      
      if (msg.includes('AbortError')) {
        toast.error('Request timed out. Please try again.');
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const goalTypes = [
    { value: 'profit', label: 'Profit Target', unit: '$' },
    { value: 'win_rate', label: 'Win Rate', unit: '%' },
    { value: 'trades', label: 'Number of Trades', unit: 'trades' },
    { value: 'streak', label: 'Winning Streak', unit: 'days' },
    { value: 'roi', label: 'ROI Percentage', unit: '%' },
  ];

  const todayLocal = getTodayLocal();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {!editingGoal && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Reach $10,000 profit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add more details about your goal..." 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goal_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {goalTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Target Value * 
                    ({goalTypes.find(t => t.value === form.watch('goal_type'))?.unit})
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="text"
                      placeholder="Enter target value"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Date *</FormLabel>
                  <FormControl>
                    <Input 
                      type="date"
                      min={todayLocal}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)} 
                className="flex-1"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !user} className="flex-1">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
