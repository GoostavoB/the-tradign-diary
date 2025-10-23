import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/useTranslation";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface FearGreedData {
  value: string;
  value_classification: string;
  timestamp: string;
  time_until_update?: string;
}

export const FearGreedIndex = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchFearGreedIndex();
  }, []);

  const fetchFearGreedIndex = async () => {
    try {
      const response = await fetch('https://api.alternative.me/fng/?limit=1');
      const result = await response.json();
      
      if (result.data && result.data[0]) {
        setData(result.data[0]);
        setError(false);
      }
    } catch (err) {
      console.error('Error fetching Fear & Greed Index:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const getColorByValue = (value: number) => {
    if (value <= 25) return "text-red-600 dark:text-red-400";
    if (value <= 45) return "text-orange-600 dark:text-orange-400";
    if (value <= 55) return "text-yellow-600 dark:text-yellow-400";
    if (value <= 75) return "text-green-600 dark:text-green-400";
    return "text-emerald-600 dark:text-emerald-400";
  };

  const getBgColorByValue = (value: number) => {
    if (value <= 25) return "bg-red-500/10 border-red-500/20";
    if (value <= 45) return "bg-orange-500/10 border-orange-500/20";
    if (value <= 55) return "bg-yellow-500/10 border-yellow-500/20";
    if (value <= 75) return "bg-green-500/10 border-green-500/20";
    return "bg-emerald-500/10 border-emerald-500/20";
  };

  const getSentimentIcon = (value: number) => {
    if (value <= 45) return <TrendingDown className="h-5 w-5" />;
    if (value <= 55) return <Activity className="h-5 w-5" />;
    return <TrendingUp className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t('fearGreed.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t('fearGreed.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground text-sm">
            {t('fearGreed.error')}
          </div>
        </CardContent>
      </Card>
    );
  }

  const value = parseInt(data.value);
  const classification = data.value_classification;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t('fearGreed.title')}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {t('fearGreed.crypto')}
          </Badge>
        </div>
        <CardDescription>
          {t('fearGreed.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "p-6 rounded-lg border transition-all",
          getBgColorByValue(value)
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className={cn("flex items-center gap-2", getColorByValue(value))}>
              {getSentimentIcon(value)}
              <span className="text-2xl font-bold">{value}</span>
            </div>
            <Badge 
              variant="outline" 
              className={cn("text-sm font-semibold", getColorByValue(value))}
            >
              {classification}
            </Badge>
          </div>

          {/* Visual Bar */}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "absolute top-0 left-0 h-full rounded-full transition-all duration-500",
                {
                  "bg-red-500": value <= 25,
                  "bg-orange-500": value > 25 && value <= 45,
                  "bg-yellow-500": value > 45 && value <= 55,
                  "bg-green-500": value > 55 && value <= 75,
                  "bg-emerald-500": value > 75
                }
              )}
              style={{ width: `${value}%` }}
            />
          </div>

          {/* Scale Labels */}
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{t('fearGreed.extremeFear')}</span>
            <span>{t('fearGreed.neutral')}</span>
            <span>{t('fearGreed.extremeGreed')}</span>
          </div>
        </div>

        <div className="mt-4 text-xs text-center text-muted-foreground">
          {t('fearGreed.lastUpdate')}: {new Date(parseInt(data.timestamp) * 1000).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};
