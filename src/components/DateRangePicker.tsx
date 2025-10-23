import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CalendarIcon, Calendar as CalendarDays } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
  className?: string;
}

export function DateRangePicker({ startDate, endDate, onDateChange, className }: DateRangePickerProps) {
  const [mode, setMode] = useState<'single' | 'range'>('range');
  const [preset, setPreset] = useState<string>('custom');

  const isSingleDay = startDate && endDate && isSameDay(startDate, endDate);

  const presets = [
    { label: 'Today', value: 'today', getDates: () => {
      const today = startOfDay(new Date());
      return { start: today, end: endOfDay(new Date()) };
    }},
    { label: 'Last 7 Days', value: '7days', getDates: () => ({
      start: subDays(new Date(), 7),
      end: new Date(),
    })},
    { label: 'Last 30 Days', value: '30days', getDates: () => ({
      start: subDays(new Date(), 30),
      end: new Date(),
    })},
    { label: 'Last 90 Days', value: '90days', getDates: () => ({
      start: subDays(new Date(), 90),
      end: new Date(),
    })},
  ];

  const handlePresetChange = (value: string) => {
    setPreset(value);
    if (value === 'custom') return;

    const presetConfig = presets.find(p => p.value === value);
    if (presetConfig) {
      const { start, end } = presetConfig.getDates();
      if (value === 'today') {
        setMode('single');
      }
      onDateChange(start, end);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (mode === 'single') {
      onDateChange(startOfDay(date), endOfDay(date));
      setPreset('custom');
    } else {
      // Range mode
      if (!startDate || (startDate && endDate)) {
        // Start new range
        onDateChange(date, null);
      } else {
        // Complete range
        const start = date < startDate ? date : startDate;
        const end = date < startDate ? startDate : date;
        onDateChange(start, end);
      }
      setPreset('custom');
    }
  };

  const toggleMode = () => {
    const newMode = mode === 'single' ? 'range' : 'single';
    setMode(newMode);
    if (newMode === 'single' && startDate) {
      onDateChange(startOfDay(startDate), endOfDay(startDate));
    }
  };

  const getDisplayText = () => {
    if (!startDate) return 'Pick a date';
    
    if (isSingleDay) {
      const isToday = isSameDay(startDate, new Date());
      return isToday ? 'Today' : format(startDate, 'MMM dd, yyyy');
    }
    
    if (!endDate) return format(startDate, 'MMM dd, yyyy');
    
    return `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`;
  };

  return (
    <div className={cn('flex gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'justify-start text-left font-normal',
              !startDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getDisplayText()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex items-center justify-between">
              <Label>Selection Mode</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMode}
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                {mode === 'single' ? 'Single Day' : 'Date Range'}
              </Button>
            </div>

            {/* Presets */}
            <RadioGroup value={preset} onValueChange={handlePresetChange}>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((p) => (
                  <div key={p.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={p.value} id={p.value} />
                    <Label htmlFor={p.value} className="cursor-pointer">
                      {p.label}
                    </Label>
                  </div>
                ))}
                <div className="flex items-center space-x-2 col-span-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="cursor-pointer">
                    Custom
                  </Label>
                </div>
              </div>
            </RadioGroup>

            {/* Calendar */}
            <Calendar
              mode={mode === 'single' ? 'single' : 'default'}
              selected={mode === 'single' && startDate ? startDate : undefined}
              onSelect={handleDateSelect}
              disabled={(date) => date > new Date()}
              initialFocus
              className="rounded-md border"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}