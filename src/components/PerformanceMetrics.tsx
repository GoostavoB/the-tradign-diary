import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { TrendingUp, Clock, AlertCircle, Target } from "lucide-react";

const PerformanceMetrics = () => {
  const metrics = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Upload Trades 40 Times Faster",
      description: "Batch upload screenshots and process trades in seconds.",
      metric: "40x",
      color: "text-blue-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Save Up to 97 Percent of Your Time",
      description: "Focus on analysis instead of manual work.",
      metric: "97%",
      color: "text-green-500"
    },
    {
      icon: <AlertCircle className="w-8 h-8" />,
      title: "Catch More Errors",
      description: "Daily review helps you detect mistakes early.",
      metric: "More Errors Caught",
      color: "text-orange-500"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Improve Decision Accuracy",
      description: "Structured logs and clear analytics support better choices.",
      metric: "Improved Accuracy",
      color: "text-purple-500"
    }
  ];

  return (
    <section className="py-16 md:py-20 px-6" aria-labelledby="metrics-heading">
      <div className="container mx-auto max-w-6xl">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 id="metrics-heading" className="text-2xl md:text-3xl font-bold mb-2">
            Your Real Performance Insights
          </h2>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-6 h-full hover:shadow-lg transition-all duration-300 hover:border-primary/30" hover>
                <div className={`mb-4 ${metric.color}`} aria-hidden="true">
                  {metric.icon}
                </div>
                <div className={`text-3xl font-bold mb-3 ${metric.color}`}>
                  {metric.metric}
                </div>
                <h3 className="text-lg font-semibold mb-2 leading-tight">
                  {metric.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {metric.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PerformanceMetrics;
