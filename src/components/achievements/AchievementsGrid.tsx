import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AchievementCard } from './AchievementCard';
import { useAchievementProgress } from '@/hooks/useAchievementProgress';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Award } from 'lucide-react';

export const AchievementsGrid = () => {
  const { progress, categories, loading, getProgressByCategory, getCompletionRate } = useAchievementProgress();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const completionRate = getCompletionRate();
  const allProgress = Object.values(progress);
  const completedCount = allProgress.filter(p => p.completed).length;

  const filteredProgress = selectedCategory === 'all' 
    ? allProgress 
    : getProgressByCategory(selectedCategory);

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="p-6 glass-strong">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold gradient-text">Your Achievements</h2>
            <p className="text-sm text-muted-foreground">
              {completedCount} of {allProgress.length} completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{Math.round(completionRate)}%</div>
            <p className="text-xs text-muted-foreground">Completion</p>
          </div>
        </div>
        <Progress value={completionRate} className="h-3" />
      </Card>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full flex-wrap h-auto">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            All
          </TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
              {category.display_name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredProgress.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No achievements in this category yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProgress.map((prog, index) => (
                <AchievementCard key={prog.achievement_id} progress={prog} index={index} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
