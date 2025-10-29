import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AchievementCard } from './AchievementCard';
import { useAchievementProgress } from '@/hooks/useAchievementProgress';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '@/utils/animations';
import { layout, spacing } from '@/utils/designTokens';

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
    <motion.div 
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Overall Progress */}
      <motion.div variants={fadeInUp}>
        <Card className="p-4 sm:p-6 glass-strong">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold gradient-text">Your Achievements</h2>
              <p className="text-sm text-muted-foreground">
                {completedCount} of {allProgress.length} completed
              </p>
            </div>
            <div className="text-right sm:ml-auto">
              <div className="text-2xl sm:text-3xl font-bold text-primary">{Math.round(completionRate)}%</div>
              <p className="text-xs text-muted-foreground">Completion</p>
            </div>
          </div>
          <Progress 
            value={completionRate} 
            className="h-3 transition-all duration-500" 
            aria-label={`Achievement completion: ${Math.round(completionRate)}%`}
          />
        </Card>
      </motion.div>

      {/* Category Tabs */}
      <motion.div variants={fadeInUp}>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="w-full flex-wrap h-auto gap-2 p-2 bg-muted/50">
            <TabsTrigger 
              value="all" 
              className="flex items-center gap-2 min-h-[44px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">All</span>
            </TabsTrigger>
            {categories.map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id} 
                className="flex items-center gap-2 min-h-[44px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="truncate">{category.display_name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            {filteredProgress.length === 0 ? (
              <motion.div variants={fadeInUp}>
                <Card className="p-8 text-center glass-subtle">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground text-lg font-medium">No achievements yet</p>
                  <p className="text-sm text-muted-foreground/70 mt-2">Complete activities to unlock achievements!</p>
                </Card>
              </motion.div>
            ) : (
              <motion.div 
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {filteredProgress.map((prog, index) => (
                  <AchievementCard key={prog.achievement_id} progress={prog} index={index} />
                ))}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};
