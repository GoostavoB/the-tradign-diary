import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { AlertTriangle, Plus, X, Edit2, Check } from "lucide-react";
import { toast } from "sonner";

interface TradeError {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
}

interface TradeErrorTrackingProps {
  tradeId?: string;
  errors?: TradeError[];
  onErrorsUpdate?: (errors: TradeError[]) => void;
}

const ERROR_TYPES = [
  { value: "fomo", label: "FOMO Entry", color: "bg-red-500/10 text-red-600" },
  { value: "revenge", label: "Revenge Trading", color: "bg-orange-500/10 text-orange-600" },
  { value: "oversized", label: "Position Too Large", color: "bg-yellow-500/10 text-yellow-600" },
  { value: "no_stop", label: "No Stop Loss", color: "bg-purple-500/10 text-purple-600" },
  { value: "ignored_rules", label: "Ignored Trading Rules", color: "bg-pink-500/10 text-pink-600" },
  { value: "emotional", label: "Emotional Decision", color: "bg-blue-500/10 text-blue-600" },
  { value: "chasing", label: "Chasing Price", color: "bg-indigo-500/10 text-indigo-600" },
  { value: "overtrading", label: "Overtrading", color: "bg-cyan-500/10 text-cyan-600" },
  { value: "analysis_paralysis", label: "Analysis Paralysis", color: "bg-teal-500/10 text-teal-600" },
  { value: "other", label: "Other", color: "bg-gray-500/10 text-gray-600" }
];

export const TradeErrorTracking = ({ 
  tradeId, 
  errors: initialErrors = [], 
  onErrorsUpdate 
}: TradeErrorTrackingProps) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<TradeError[]>(initialErrors);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [errorDescription, setErrorDescription] = useState("");

  const handleAddError = () => {
    if (!selectedType) {
      toast.error(t('errors.selectType'));
      return;
    }

    const newError: TradeError = {
      id: Date.now().toString(),
      type: selectedType,
      description: errorDescription,
      timestamp: new Date()
    };

    const updatedErrors = [...errors, newError];
    setErrors(updatedErrors);
    onErrorsUpdate?.(updatedErrors);

    // Reset form
    setSelectedType("");
    setErrorDescription("");
    setIsAdding(false);

    toast.success(t('errors.added'));
  };

  const handleRemoveError = (errorId: string) => {
    const updatedErrors = errors.filter(e => e.id !== errorId);
    setErrors(updatedErrors);
    onErrorsUpdate?.(updatedErrors);
    toast.success(t('errors.removed'));
  };

  const getErrorTypeLabel = (type: string) => {
    return ERROR_TYPES.find(t => t.value === type)?.label || type;
  };

  const getErrorTypeColor = (type: string) => {
    return ERROR_TYPES.find(t => t.value === type)?.color || "bg-gray-500/10 text-gray-600";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <CardTitle>{t('errors.title')}</CardTitle>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAdding(!isAdding)}
            className="gap-2"
          >
            {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isAdding ? t('common.cancel') : t('errors.addError')}
          </Button>
        </div>
        <CardDescription>
          {t('errors.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Error Form */}
        {isAdding && (
          <div className="space-y-4 p-4 rounded-lg bg-muted/50 border">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('errors.errorType')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ERROR_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    variant={selectedType === type.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(type.value)}
                    className="justify-start text-xs"
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('errors.notes')} {t('common.optional')}
              </label>
              <Textarea
                value={errorDescription}
                onChange={(e) => setErrorDescription(e.target.value)}
                placeholder={t('errors.notesPlaceholder')}
                className="resize-none"
                rows={3}
              />
            </div>

            <Button
              onClick={handleAddError}
              disabled={!selectedType}
              className="w-full gap-2"
            >
              <Check className="h-4 w-4" />
              {t('errors.save')}
            </Button>
          </div>
        )}

        {/* Errors List */}
        <div className="space-y-2">
          {errors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {t('errors.noErrors')}
            </div>
          ) : (
            errors.map((error) => (
              <div
                key={error.id}
                className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/30 border"
              >
                <div className="flex-1 space-y-1">
                  <Badge className={getErrorTypeColor(error.type)} variant="outline">
                    {getErrorTypeLabel(error.type)}
                  </Badge>
                  {error.description && (
                    <p className="text-sm text-muted-foreground">
                      {error.description}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveError(error.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Error Summary */}
        {errors.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="font-medium">
                {t('errors.totalErrors', { count: errors.length })}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
