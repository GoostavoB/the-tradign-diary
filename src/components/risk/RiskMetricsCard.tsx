import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, Shield, AlertCircle } from "lucide-react";

interface RiskMetricsCardProps {
  title: string;
  value: number;
  maxValue: number;
  status: "safe" | "warning" | "danger";
  description: string;
  unit?: string;
}

export function RiskMetricsCard({ title, value, maxValue, status, description, unit = '' }: RiskMetricsCardProps) {
  const percentage = (value / maxValue) * 100;
  
  const getStatusColor = () => {
    switch (status) {
      case "safe": return "text-green-600";
      case "warning": return "text-yellow-600";
      case "danger": return "text-red-600";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "safe": return <Shield className="h-5 w-5 text-green-600" />;
      case "warning": return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "danger": return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case "safe": return "bg-green-50 dark:bg-green-950/20";
      case "warning": return "bg-yellow-50 dark:bg-yellow-950/20";
      case "danger": return "bg-red-50 dark:bg-red-950/20";
    }
  };

  return (
    <Card className={`p-4 border-l-4 ${
      status === 'safe' ? 'border-l-green-500' : 
      status === 'warning' ? 'border-l-yellow-500' : 
      'border-l-red-500'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground mb-1">{title}</h3>
          <div className={`text-3xl font-bold ${getStatusColor()}`}>
            {value.toFixed(2)}{unit}
          </div>
        </div>
        {getStatusIcon()}
      </div>
      
      <Progress 
        value={Math.min(percentage, 100)} 
        className="h-2 mb-2"
      />
      
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-muted-foreground">Limit: {maxValue}{unit}</span>
        <Badge variant="outline" className={getStatusBg()}>
          {percentage.toFixed(0)}%
        </Badge>
      </div>
      
      <p className="text-xs text-muted-foreground">{description}</p>
    </Card>
  );
}
