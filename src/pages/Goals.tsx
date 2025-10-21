import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoalCard } from "@/components/goals/GoalCard";
import { CreateGoalDialog } from "@/components/goals/CreateGoalDialog";
import { Target, TrendingUp, Award, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Goals() {
  const { user } = useAuth();
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  const { data: goals, refetch } = useQuery({
    queryKey: ['trading-goals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trading_goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleDelete = async () => {
    if (!deletingGoalId) return;

    try {
      const { error } = await supabase
        .from('trading_goals')
        .delete()
        .eq('id', deletingGoalId);
      
      if (error) throw error;
      toast.success("Goal deleted successfully");
      refetch();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error("Failed to delete goal");
    } finally {
      setDeletingGoalId(null);
    }
  };

  const activeGoals = goals?.filter(g => (g.current_value / g.target_value) < 1) || [];
  const completedGoals = goals?.filter(g => (g.current_value / g.target_value) >= 1) || [];
  const overdueGoals = activeGoals.filter(g => new Date(g.deadline) < new Date());

  const stats = [
    {
      label: "Active Goals",
      value: activeGoals.length,
      icon: Target,
      color: "text-blue-600"
    },
    {
      label: "Completed",
      value: completedGoals.length,
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      label: "Overdue",
      value: overdueGoals.length,
      icon: Award,
      color: "text-red-600"
    },
    {
      label: "Total Progress",
      value: activeGoals.length > 0 
        ? `${(activeGoals.reduce((sum, g) => sum + (g.current_value / g.target_value * 100), 0) / activeGoals.length).toFixed(0)}%`
        : "0%",
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ];

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="h-8 w-8" />
              Goals & Milestones
            </h1>
            <p className="text-muted-foreground mt-1">
              Set and track your trading objectives
            </p>
          </div>
          <CreateGoalDialog 
            onGoalCreated={refetch}
            editingGoal={editingGoal}
            onClose={() => setEditingGoal(null)}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        {/* Goals Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">
              Active ({activeGoals.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedGoals.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All Goals ({goals?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeGoals.length === 0 ? (
              <Card className="p-12 text-center">
                <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Active Goals</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first goal to start tracking your progress
                </p>
                <CreateGoalDialog onGoalCreated={refetch} />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={setEditingGoal}
                    onDelete={setDeletingGoalId}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedGoals.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Completed Goals Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Keep working towards your active goals!
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={setEditingGoal}
                    onDelete={setDeletingGoalId}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {!goals || goals.length === 0 ? (
              <Card className="p-12 text-center">
                <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Goals Created</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start setting goals to track your trading progress
                </p>
                <CreateGoalDialog onGoalCreated={refetch} />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={setEditingGoal}
                    onDelete={setDeletingGoalId}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingGoalId} onOpenChange={() => setDeletingGoalId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Goal</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this goal? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
