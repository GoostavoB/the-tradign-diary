import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfitLossHighlightProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ProfitLossHighlight = ({
  value,
  prefix = "$",
  suffix = "",
  className,
  showIcon = true,
  size = "md"
}: ProfitLossHighlightProps) => {
  const isProfit = value > 0;
  const isLoss = value < 0;
  const isBreakeven = value === 0;

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg font-semibold"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  const baseClasses = cn(
    "inline-flex items-center gap-1 font-medium transition-colors",
    sizeClasses[size],
    {
      "text-green-600 dark:text-green-400": isProfit,
      "text-red-600 dark:text-red-400": isLoss,
      "text-muted-foreground": isBreakeven
    },
    className
  );

  const formattedValue = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <span className={baseClasses}>
      {showIcon && isProfit && <TrendingUp className={iconSizes[size]} />}
      {showIcon && isLoss && <TrendingDown className={iconSizes[size]} />}
      <span>
        {isLoss && "-"}
        {prefix}
        {formattedValue}
        {suffix}
      </span>
    </span>
  );
};

interface ProfitLossCardProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const ProfitLossCard = ({
  value,
  label,
  prefix = "$",
  suffix = "",
  className
}: ProfitLossCardProps) => {
  const isProfit = value > 0;
  const isLoss = value < 0;

  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-all",
        {
          "bg-green-500/5 border-green-500/20 hover:bg-green-500/10": isProfit,
          "bg-red-500/5 border-red-500/20 hover:bg-red-500/10": isLoss,
          "bg-muted/30 border-border": value === 0
        },
        className
      )}
    >
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <ProfitLossHighlight value={value} prefix={prefix} suffix={suffix} size="lg" />
    </div>
  );
};
