import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DateRange } from '@/components/DateRangeFilter';

interface DateRangeContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  clearDateRange: () => void;
  isToday: boolean;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRangeState] = useState<DateRange>(() => {
    const saved = localStorage.getItem('globalDateRange');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        from: parsed.from ? new Date(parsed.from) : undefined,
        to: parsed.to ? new Date(parsed.to) : undefined,
      };
    }
    return undefined;
  });

  const isToday = dateRange?.from 
    ? new Date(dateRange.from).toDateString() === new Date().toDateString() &&
      (!dateRange.to || new Date(dateRange.to).toDateString() === new Date().toDateString())
    : false;

  useEffect(() => {
    if (dateRange?.from) {
      localStorage.setItem('globalDateRange', JSON.stringify({
        from: dateRange.from.toISOString(),
        to: dateRange.to?.toISOString(),
      }));
    } else {
      localStorage.removeItem('globalDateRange');
    }
  }, [dateRange]);

  const setDateRange = (range: DateRange) => {
    setDateRangeState(range);
  };

  const clearDateRange = () => {
    setDateRangeState(undefined);
    localStorage.removeItem('globalDateRange');
  };

  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange, clearDateRange, isToday }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (context === undefined) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
}
