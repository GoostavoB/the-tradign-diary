import { Card } from '@/components/ui/card';
import AppLayout from '@/components/layout/AppLayout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTranslation } from '@/hooks/useTranslation';

const FAQ = () => {
  const { t } = useTranslation();
  
  const faqs = [
    {
      question: t('faq.questions.whatIsJournal.question'),
      answer: t('faq.questions.whatIsJournal.answer')
    },
    {
      question: t('faq.questions.howHelps.question'),
      answer: t('faq.questions.howHelps.answer')
    },
    {
      question: t('faq.questions.assetTypes.question'),
      answer: t('faq.questions.assetTypes.answer')
    },
    {
      question: t('faq.questions.security.question'),
      answer: t('faq.questions.security.answer')
    },
    {
      question: t('faq.questions.metrics.question'),
      answer: t('faq.questions.metrics.answer')
    }
  ];

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t('faq.title')}</h1>
          <p className="text-muted-foreground">{t('faq.subtitle')}</p>
        </div>

        <Card className="p-6 bg-card border-border">
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
        </Card>
      </div>
    </AppLayout>
  );
};

export default FAQ;
