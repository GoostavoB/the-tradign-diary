import { AchievementsGrid } from '@/components/achievements/AchievementsGrid';
import { SkipToContent } from '@/components/SkipToContent';

const Achievements = () => {
  return (
    <>
      <SkipToContent />
      <main id="main-content" className="container mx-auto py-6">
        <AchievementsGrid />
      </main>
    </>
  );
};

export default Achievements;
