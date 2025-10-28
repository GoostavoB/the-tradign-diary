import { AchievementsGrid } from '@/components/achievements/AchievementsGrid';
import AppLayout from '@/components/layout/AppLayout';
import { SkipToContent } from '@/components/SkipToContent';

const Achievements = () => {
  return (
    <AppLayout>
      <SkipToContent />
      <main id="main-content" className="container mx-auto py-6">
        <AchievementsGrid />
      </main>
    </AppLayout>
  );
};

export default Achievements;
