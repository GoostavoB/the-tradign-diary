import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const PricingFAQ = () => {
  const { t } = useTranslation();

  const faqs = [
    {
      question: t('pricing.faq.q1.question', 'Do you connect to exchanges'),
      answer: t('pricing.faq.q1.answer', 'No. We do not use APIs.'),
    },
    {
      question: t('pricing.faq.q2.question', 'Does this work with my exchange'),
      answer: t('pricing.faq.q2.answer', 'Yes. You can upload trades from any platform.'),
    },
    {
      question: t('pricing.faq.q3.question', 'How do I upload my trades'),
      answer: t('pricing.faq.q3.answer', 'Upload screenshots or enter trades manually.'),
    },
    {
      question: t('pricing.faq.q4.question', 'Can I cancel anytime'),
      answer: t('pricing.faq.q4.answer', 'Yes.'),
    },
    {
      question: t('pricing.faq.q5.question', 'How is my data stored'),
      answer: t('pricing.faq.q5.answer', 'Encrypted and private.'),
    },
  ];

  return (
    <section className="py-16 px-6" aria-labelledby="faq-heading">
      <div className="container mx-auto max-w-3xl">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold mb-4">
            {t('pricing.faq.title', 'Frequently Asked Questions')}
          </h2>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-black/20 backdrop-blur-sm border border-primary/10 rounded-lg px-6 hover:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground pb-5">
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
