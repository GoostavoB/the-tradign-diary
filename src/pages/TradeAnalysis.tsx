import AppLayout from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradeComparator } from "@/components/analysis/TradeComparator";
import { GitCompare, BookTemplate } from "lucide-react";

export default function TradeAnalysis() {
  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <h1 className="text-3xl font-bold mb-6">Trade Analysis</h1>

        <Tabs defaultValue="compare" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="compare" className="gap-2">
              <GitCompare className="h-4 w-4" />
              Compare Trades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compare">
            <TradeComparator />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
