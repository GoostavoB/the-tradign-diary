import AppLayout from '@/components/layout/AppLayout';
import { TradingJournal } from '@/components/TradingJournal';
import { RiskCalculator } from '@/components/RiskCalculator';
import { ExpenseTracker } from '@/components/ExpenseTracker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Calculator, Receipt } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { pageMeta } from '@/utils/seoHelpers';
import { SkipToContent } from '@/components/SkipToContent';

const Tools = () => {
  return (
    <AppLayout>
      <SEO
        title={pageMeta.tools.title}
        description={pageMeta.tools.description}
        keywords={pageMeta.tools.keywords}
        canonical={pageMeta.tools.canonical}
      />
      <SkipToContent />
      <main id="main-content" className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold" id="tools-heading">Trading Tools</h1>
          <p className="text-muted-foreground mt-1">
            Journal your trades and calculate risk metrics
          </p>
        </header>

        <Tabs defaultValue="journal" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3 glass">
            <TabsTrigger value="journal" className="gap-2">
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              Journal
            </TabsTrigger>
            <TabsTrigger value="calculator" className="gap-2">
              <Calculator className="w-4 h-4" aria-hidden="true" />
              Risk Calculator
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-2">
              <Receipt className="w-4 h-4" aria-hidden="true" />
              Expenses
            </TabsTrigger>
          </TabsList>

          <TabsContent value="journal">
            <TradingJournal />
          </TabsContent>

          <TabsContent value="calculator">
            <RiskCalculator />
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseTracker />
          </TabsContent>
        </Tabs>
      </main>
    </AppLayout>
  );
};

export default Tools;
