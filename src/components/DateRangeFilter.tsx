import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, X, Sparkles } from 'lucide-react';
import { format, isToday as checkIsToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { Badge } from '@/components/ui/badge';

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
} | undefined;

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export const DateRangeFilter = ({ dateRange, onDateRangeChange }: DateRangeFilterProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>(dateRange);

  const presetRanges = [
    {
      label: t('dateRange.presets.today'),
      getValue: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return {
          from: today,
          to: today,
        };
      },
    },
    {
      label: t('dateRange.presets.last7Days'),
      getValue: () => ({
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: new Date(),
      }),
    },
    {
      label: t('dateRange.presets.last30Days'),
      getValue: () => ({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(),
      }),
    },
    {
      label: t('dateRange.presets.last90Days'),
      getValue: () => ({
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        to: new Date(),
      }),
    },
    {
      label: t('dateRange.presets.thisMonth'),
      getValue: () => {
        const now = new Date();
        return {
          from: new Date(now.getFullYear(), now.getMonth(), 1),
          to: new Date(),
        };
      },
    },
  ];

  const handleClear = () => {
    setTempRange(undefined);
    onDateRangeChange(undefined);
    setIsOpen(false);
  };

  const handleApply = () => {
    // If only 'from' is selected, treat it as a single-day range
    const finalRange = tempRange?.from && !tempRange?.to 
      ? { from: tempRange.from, to: tempRange.from }
      : tempRange;
    
    onDateRangeChange(finalRange);
    setIsOpen(false);
    
    if (finalRange?.from) {
      const isSingleDay = !finalRange.to || finalRange.from.toDateString() === finalRange.to.toDateString();
      const isToday = checkIsToday(finalRange.from) && isSingleDay;
      
      if (isToday) {
        toast.success("Showing today's data", {
          icon: <Sparkles className="h-4 w-4 text-primary" />,
        });
      } else if (isSingleDay) {
        toast.success(`Showing data for ${format(finalRange.from, "PPP")}`);
      } else if (finalRange.to) {
        const message = `${t('dateRange.showingData')} ${format(finalRange.from, 'MMM dd')} - ${format(finalRange.to, 'MMM dd, yyyy')}`;
        toast.success(message);
      }
    }
  };

  const handleCancel = () => {
    setTempRange(dateRange);
    setIsOpen(false);
  };

  const handlePresetSelect = (range: DateRange) => {
    setTempRange(range);
  };

  // Check if selected date is today
  const isTodaySelected = dateRange?.from 
    ? checkIsToday(dateRange.from) && 
      (!dateRange.to || checkIsToday(dateRange.to))
    : false;

  const isSingleDay = dateRange?.from && dateRange?.to
    ? dateRange.from.toDateString() === dateRange.to.toDateString()
    : !!dateRange?.from && !dateRange?.to;

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'justify-start text-left font-normal relative',
              !dateRange && 'text-muted-foreground',
              isTodaySelected && 'border-primary shadow-sm shadow-primary/20'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              <div className="flex items-center gap-2 flex-1">
                <span>
                  {dateRange.to && !isSingleDay ? (
                    <>
                      {format(dateRange.from, 'LLL dd, y')} -{' '}
                      {format(dateRange.to, 'LLL dd, y')}
                    </>
                  ) : (
                    <>
                      {format(dateRange.from, 'LLL dd, y')}
                      {isSingleDay && <span className="text-muted-foreground text-xs">(Single Day)</span>}
                    </>
                  )}
                </span>
                {isTodaySelected && (
                  <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary border-primary/20">
                    <Sparkles className="h-3 w-3 mr-0.5" />
                    Today
                  </Badge>
                )}
              </div>
            ) : (
              <span>{t('dateRange.pickDateRange')}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 glass rounded-3xl shadow-xl" align="start">
          <div className="flex flex-col lg:flex-row">
            <div className="border-r border-border/50 p-4 space-y-2 min-w-[140px]">
              <div className="text-sm font-semibold mb-3 text-foreground">{t('dateRange.quickSelect')}</div>
              {presetRanges.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-colors"
                  onClick={() => handlePresetSelect(preset.getValue())}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="p-4">
              <Calendar
                mode="range"
                selected={tempRange}
                onSelect={(range) => setTempRange(range as DateRange)}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
              <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  {t('dateRange.cancel')}
                </Button>
                <Button
                  size="sm"
                  onClick={handleApply}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={!tempRange?.from}
                >
                  {t('dateRange.apply')}
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {dateRange && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="h-9 w-9"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
