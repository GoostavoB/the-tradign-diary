import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PricingFAQ = () => {
  const faqs = [
    {
      question: "What happens after the trial?",
      answer: "After your 7-day trial ends, you'll be automatically enrolled in the plan you selected. You can cancel anytime before the trial ends to avoid charges. We'll send you email reminders before your trial expires."
    },
    {
      question: "Can I switch plans anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be charged a prorated amount for the remainder of your billing period. When downgrading, credits will be applied to your next billing cycle."
    },
    {
      question: "Do screenshots work or only CSV?",
      answer: "Both work! Our AI can extract trade data from screenshots (using OCR) and CSV files from any exchange. Screenshot uploads are great for quick logging, while CSV provides the most complete data including fees and funding rates."
    },
    {
      question: "How do you calculate fees and funding?",
      answer: "We extract fee data directly from your CSV exports or calculate them based on your exchange's fee structure. For funding rates on perpetual contracts, we pull historical funding rate data from each exchange's API to give you accurate cost analysis."
    },
    {
      question: "How do refunds and cancellations work?",
      answer: "You can cancel anytime from your account settings. Monthly subscriptions stop at the end of your billing period. For annual plans, if you cancel within the first 14 days, you'll receive a prorated refund for the unused portion. After 14 days, annual subscriptions are non-refundable but remain active until the end of your billing year."
    }
  ];

  return (
    <section className="px-6 mb-16">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-center mb-8">Frequently asked questions</h2>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingFAQ;
