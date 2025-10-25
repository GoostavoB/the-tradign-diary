import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

const FirstWeekBlock = () => {
  const weekPlans = [
    {
      plan: "Basic",
      activities: [
        "Upload 30 days",
        "Get 3 actions",
        "Set per-trade risk"
      ]
    },
    {
      plan: "Pro",
      activities: [
        "Cut taker fees on 2 pairs",
        "Set weekly DD limit",
        "Tune size by stop"
      ]
    },
    {
      plan: "Elite",
      activities: [
        "Add MFE/MAE to adjust targets",
        "Schedule weekly report to email"
      ]
    }
  ];

  return (
    <section className="px-6 mb-16">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center mb-8">First week on this plan</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {weekPlans.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass backdrop-blur-md rounded-xl p-6 border border-primary/20"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-semibold">{item.plan}</h3>
                </div>
                <ul className="space-y-2">
                  {item.activities.map((activity, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1">→</span>
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FirstWeekBlock;
