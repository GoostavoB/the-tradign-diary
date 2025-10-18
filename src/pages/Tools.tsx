import AppLayout from '@/components/layout/AppLayout';
import { TradingJournal } from '@/components/TradingJournal';
import { RiskCalculator } from '@/components/RiskCalculator';
import { ExpenseTracker } from '@/components/ExpenseTracker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Calculator, Receipt } from 'lucide-react';

const Tools = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Trading Tools</h1>
          <p className="text-muted-foreground">
            Journal your trades and calculate risk metrics
          </p>
        </div>

        <Tabs defaultValue="journal" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="journal" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Journal
            </TabsTrigger>
            <TabsTrigger value="calculator" className="gap-2">
              <Calculator className="w-4 h-4" />
              Risk Calculator
            </TabsTrigger>
            <TabsTrigger value="expenses" className="gap-2">
              <Receipt className="w-4 h-4" />
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
      </div>
    </AppLayout>
  );
};

export default Tools;
