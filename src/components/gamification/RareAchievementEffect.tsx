import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrophyAnimation } from './TrophyAnimation';
import { ConfettiEffect } from './ConfettiEffect';

export const RareAchievementEffect = () => {
  const [showEffect, setShowEffect] = useState(false);
  const [showTrophy, setShowTrophy] = useState(false);

  useEffect(() => {
    const handleRareAchievement = () => {
      setShowEffect(true);
      setShowTrophy(true);

      // Screen shake
      const root = document.documentElement;
      root.style.animation = 'screen-shake 0.5s ease-in-out';
      
      setTimeout(() => {
        root.style.animation = '';
        setShowEffect(false);
      }, 3000);
    };

    window.addEventListener('rare-achievement', handleRareAchievement);
    return () => window.removeEventListener('rare-achievement', handleRareAchievement);
  }, []);

  return (
    <>
      <ConfettiEffect trigger={showEffect} />
      <TrophyAnimation show={showTrophy} size="large" onComplete={() => setShowTrophy(false)} />
      
      {showEffect && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-[9998]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 1, times: [0, 0.5, 1] }}
        >
          <div className="absolute inset-0 bg-gradient-radial from-primary/30 via-transparent to-transparent" />
        </motion.div>
      )}

      <style>{`
        @keyframes screen-shake {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-5px, 5px); }
          20%, 40%, 60%, 80% { transform: translate(5px, -5px); }
        }
      `}</style>
    </>
  );
};
