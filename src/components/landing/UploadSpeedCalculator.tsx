import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

export const UploadSpeedCalculator = () => {
  const { t } = useTranslation();
  const [selectedTrades, setSelectedTrades] = useState(10);

  const calculateTimeSaved = (trades: number) => {
    // Manual entry: ~2 minutes per trade
    // AI Upload: ~3 seconds per trade
    const manualTime = trades * 2; // minutes
    const aiTime = (trades * 3) / 60; // convert seconds to minutes
    const timeSaved = manualTime - aiTime;
    return Math.round(timeSaved);
  };

  const tradeOptions = [1, 10, 100];

  return (
    <section id="upload-speed" className="py-16 md:py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">
              {t('landing.uploadSpeed.title', 'Trade upload speed. Reward results.')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('landing.uploadSpeed.subtitle', 'Upload your trades and instantly measure how much faster your workflow becomes.')}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 py-6">
            {tradeOptions.map((trades) => (
              <Button
                key={trades}
                onClick={() => setSelectedTrades(trades)}
                variant={selectedTrades === trades ? "default" : "outline"}
                size="lg"
                className={`rounded-full px-8 transition-all ${
                  selectedTrades === trades 
                    ? "bg-[#FFC300] text-black hover:bg-[#FFC300]/90 shadow-lg shadow-[#FFC300]/20" 
                    : ""
                }`}
              >
                {trades === 1 ? "1 Trade" : `${trades} Trades`}
              </Button>
            ))}
          </div>

          <motion.div
            key={selectedTrades}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8 max-w-2xl mx-auto"
          >
            <div className="text-center space-y-4">
              <p className="text-5xl md:text-6xl font-bold text-primary">
                {calculateTimeSaved(selectedTrades)} {t('landing.uploadSpeed.minutes', 'minutes')}
              </p>
              <p className="text-xl text-muted-foreground">
                {t('landing.uploadSpeed.result', 'You save {{minutes}} minutes compared to manual entry.', { minutes: calculateTimeSaved(selectedTrades) })}
              </p>
            </div>
          </motion.div>

          <Button size="lg" className="rounded-full px-8">
            {t('landing.uploadSpeed.cta', 'Calculate your time savings')}
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
